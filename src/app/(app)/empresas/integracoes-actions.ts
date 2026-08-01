"use server";

import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { revalidatePath } from "next/cache";

async function refreshGoogleToken(refreshToken: string) {
  const res = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      refresh_token: refreshToken,
      client_id: process.env.GOOGLE_CLIENT_ID!,
      client_secret: process.env.GOOGLE_CLIENT_SECRET!,
      grant_type: "refresh_token",
    }),
  });
  return res.json() as Promise<{ access_token?: string; expires_in?: number }>;
}

export async function salvarPropertyId(
  empresaId: string,
  provider: string,
  externalId: string
): Promise<{ erro: string }> {
  const supabase = await createClient();
  const { error } = await supabase
    .from("integracoes_ads")
    .update({ external_account_id: externalId.trim() })
    .eq("empresa_id", empresaId)
    .eq("provider", provider);

  if (error) return { erro: error.message };

  revalidatePath(`/empresas/${empresaId}`);
  return { erro: "" };
}

export async function sincronizarGoogle(
  empresaId: string
): Promise<{ erro: string; sincronizados?: number }> {
  const supabase = await createClient();
  const admin = createAdminClient();

  const { data: integracao } = await supabase
    .from("integracoes_ads")
    .select("access_token, refresh_token, token_expires_at, external_account_id")
    .eq("empresa_id", empresaId)
    .eq("provider", "google_analytics")
    .single();

  if (!integracao?.access_token) {
    return { erro: "Google Analytics não conectado." };
  }
  if (!integracao.external_account_id) {
    return { erro: "Informe o ID da propriedade GA4 antes de sincronizar." };
  }

  // Refresh token se expirado
  let token = integracao.access_token;
  if (
    integracao.token_expires_at &&
    new Date(integracao.token_expires_at) < new Date()
  ) {
    if (!integracao.refresh_token) return { erro: "Token expirado, reconecte o Google." };
    const refreshed = await refreshGoogleToken(integracao.refresh_token);
    if (!refreshed.access_token) return { erro: "Falha ao renovar token Google." };
    token = refreshed.access_token;
    await admin
      .from("integracoes_ads")
      .update({
        access_token: token,
        token_expires_at: refreshed.expires_in
          ? new Date(Date.now() + refreshed.expires_in * 1000).toISOString()
          : null,
      })
      .eq("empresa_id", empresaId)
      .eq("provider", "google_analytics");
  }

  const propertyId = integracao.external_account_id.startsWith("properties/")
    ? integracao.external_account_id
    : `properties/${integracao.external_account_id}`;

  // Chama GA4 Data API
  const reportRes = await fetch(
    `https://analyticsdata.googleapis.com/v1beta/${propertyId}:runReport`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        dateRanges: [{ startDate: "30daysAgo", endDate: "yesterday" }],
        dimensions: [{ name: "date" }],
        metrics: [{ name: "engagedSessions" }, { name: "newUsers" }],
      }),
    }
  );

  const report = await reportRes.json();
  if (report.error) return { erro: report.error.message };

  const rows: { data: string; engajamento: number; seguidores_novos: number }[] =
    (report.rows ?? []).map(
      (row: { dimensionValues: { value: string }[]; metricValues: { value: string }[] }) => {
        const raw = row.dimensionValues[0].value; // "20240101"
        const data = `${raw.slice(0, 4)}-${raw.slice(4, 6)}-${raw.slice(6, 8)}`;
        return {
          data,
          engajamento: Number(row.metricValues[0].value),
          seguidores_novos: Number(row.metricValues[1].value),
        };
      }
    );

  for (const row of rows) {
    await admin.from("desempenho_diario").upsert(
      { empresa_id: empresaId, ...row },
      { onConflict: "empresa_id,data" }
    );
  }

  await admin
    .from("integracoes_ads")
    .update({ last_synced_at: new Date().toISOString() })
    .eq("empresa_id", empresaId)
    .eq("provider", "google_analytics");

  revalidatePath(`/empresas/${empresaId}`);
  return { erro: "", sincronizados: rows.length };
}

export async function sincronizarMeta(
  empresaId: string
): Promise<{ erro: string; sincronizados?: number }> {
  const supabase = await createClient();
  const admin = createAdminClient();

  const { data: integracao } = await supabase
    .from("integracoes_ads")
    .select("access_token, external_account_id")
    .eq("empresa_id", empresaId)
    .eq("provider", "meta_ads")
    .single();

  if (!integracao?.access_token) {
    return { erro: "Meta não conectado." };
  }
  if (!integracao.external_account_id) {
    return { erro: "Informe o ID da página do Facebook antes de sincronizar." };
  }

  const since = Math.floor((Date.now() - 30 * 86400 * 1000) / 1000);
  const until = Math.floor(Date.now() / 1000);

  const insightsRes = await fetch(
    `https://graph.facebook.com/v19.0/${integracao.external_account_id}/insights?` +
      new URLSearchParams({
        metric: "page_engaged_users,page_fan_adds",
        period: "day",
        since: String(since),
        until: String(until),
        access_token: integracao.access_token,
      })
  );
  const insights = await insightsRes.json();

  if (insights.error) return { erro: insights.error.message };

  // Agrupa métricas por data
  const porData = new Map<string, { engajamento: number; seguidores_novos: number }>();

  for (const metric of insights.data ?? []) {
    for (const entry of metric.values ?? []) {
      const data = entry.end_time?.slice(0, 10);
      if (!data) continue;
      const atual = porData.get(data) ?? { engajamento: 0, seguidores_novos: 0 };
      if (metric.name === "page_engaged_users") atual.engajamento = Number(entry.value);
      if (metric.name === "page_fan_adds") atual.seguidores_novos = Number(entry.value);
      porData.set(data, atual);
    }
  }

  for (const [data, valores] of porData) {
    await admin.from("desempenho_diario").upsert(
      { empresa_id: empresaId, data, ...valores },
      { onConflict: "empresa_id,data" }
    );
  }

  await admin
    .from("integracoes_ads")
    .update({ last_synced_at: new Date().toISOString() })
    .eq("empresa_id", empresaId)
    .eq("provider", "meta_ads");

  revalidatePath(`/empresas/${empresaId}`);
  return { erro: "", sincronizados: porData.size };
}

export async function desconectarIntegracao(
  empresaId: string,
  provider: string
): Promise<void> {
  const supabase = await createClient();
  await supabase
    .from("integracoes_ads")
    .delete()
    .eq("empresa_id", empresaId)
    .eq("provider", provider);
  revalidatePath(`/empresas/${empresaId}`);
}
