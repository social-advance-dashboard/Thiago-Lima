import { NextRequest } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";

export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl;
  const code = searchParams.get("code");
  const empresaId = searchParams.get("state");
  const appUrl = process.env.NEXT_PUBLIC_APP_URL!;

  if (!code || !empresaId) {
    return Response.redirect(`${appUrl}/empresas?erro=google_oauth_falhou`);
  }

  const redirectUri = `${appUrl}/api/integracoes/google/callback`;

  const tokenRes = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      code,
      client_id: process.env.GOOGLE_CLIENT_ID!,
      client_secret: process.env.GOOGLE_CLIENT_SECRET!,
      redirect_uri: redirectUri,
      grant_type: "authorization_code",
    }),
  });

  const tokens = await tokenRes.json();
  if (!tokens.access_token) {
    return Response.redirect(
      `${appUrl}/empresas/${empresaId}?erro_google=${encodeURIComponent(
        tokens.error_description ?? tokens.error ?? "token_falhou"
      )}`
    );
  }

  const userRes = await fetch("https://www.googleapis.com/oauth2/v2/userinfo", {
    headers: { Authorization: `Bearer ${tokens.access_token}` },
  });
  const userInfo = await userRes.json();
  const accountName = userInfo.email ?? userInfo.name ?? "Google Analytics";

  const expiresAt = tokens.expires_in
    ? new Date(Date.now() + tokens.expires_in * 1000).toISOString()
    : null;

  const supabase = createAdminClient();

  // Verifica se já existe integração para esta empresa+provider
  const { data: existing } = await supabase
    .from("integracoes_ads")
    .select("id")
    .eq("empresa_id", empresaId)
    .eq("provider", "google_analytics")
    .maybeSingle();

  let saveError: string | null = null;

  if (existing) {
    const { error } = await supabase
      .from("integracoes_ads")
      .update({
        status: "ativo",
        access_token: tokens.access_token,
        refresh_token: tokens.refresh_token ?? null,
        token_expires_at: expiresAt,
        account_name: accountName,
      })
      .eq("id", existing.id);
    if (error) saveError = error.message;
  } else {
    const { error } = await supabase.from("integracoes_ads").insert({
      empresa_id: empresaId,
      provider: "google_analytics",
      status: "ativo",
      access_token: tokens.access_token,
      refresh_token: tokens.refresh_token ?? null,
      token_expires_at: expiresAt,
      account_name: accountName,
    });
    if (error) saveError = error.message;
  }

  if (saveError) {
    return Response.redirect(
      `${appUrl}/empresas/${empresaId}?erro_google=${encodeURIComponent(saveError)}`
    );
  }

  return Response.redirect(`${appUrl}/empresas/${empresaId}?google_conectado=1`);
}
