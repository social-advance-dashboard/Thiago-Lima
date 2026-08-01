"use server";

import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";

export async function criarEmpresa(
  _estado: { erro: string },
  formData: FormData
): Promise<{ erro: string }> {
  const supabase = await createClient();

  const nome = (formData.get("nome") as string).trim();
  if (!nome) return { erro: "O nome da empresa é obrigatório." };

  const status = formData.get("status") as string;
  const plano = (formData.get("plano") as string).trim() || null;
  const segmento = (formData.get("segmento") as string).trim() || null;
  const logo_url = (formData.get("logo_url") as string).trim() || null;
  const data_entrada = (formData.get("data_entrada") as string) || null;
  const meta_engajamento = Number(formData.get("meta_engajamento")) || 0;
  const meta_gasto = Number(formData.get("meta_gasto")) || 0;
  const status_pagamento = (formData.get("status_pagamento") as string) || "em_dia";
  const observacoes = (formData.get("observacoes") as string)?.trim() || null;

  const { data, error } = await supabase
    .from("empresas")
    .insert({
      nome,
      status,
      plano,
      segmento,
      logo_url,
      data_entrada,
      meta_engajamento,
      meta_gasto,
      status_pagamento,
      observacoes,
    })
    .select("id")
    .single();

  if (error || !data) {
    return { erro: error?.message ?? "Erro ao cadastrar empresa." };
  }

  redirect(`/empresas/${data.id}`);
}

export async function editarEmpresa(
  id: string,
  _estado: { erro: string },
  formData: FormData
): Promise<{ erro: string }> {
  const supabase = await createClient();

  const nome = (formData.get("nome") as string).trim();
  if (!nome) return { erro: "O nome da empresa é obrigatório." };

  const status = formData.get("status") as string;
  const plano = (formData.get("plano") as string).trim() || null;
  const segmento = (formData.get("segmento") as string).trim() || null;
  const logo_url = (formData.get("logo_url") as string).trim() || null;
  const data_entrada = (formData.get("data_entrada") as string) || null;
  const meta_engajamento = Number(formData.get("meta_engajamento")) || 0;
  const meta_gasto = Number(formData.get("meta_gasto")) || 0;
  const status_pagamento = (formData.get("status_pagamento") as string) || "em_dia";
  const observacoes = (formData.get("observacoes") as string)?.trim() || null;

  const { data: atual } = await supabase
    .from("empresas")
    .select(
      "nome, status, plano, segmento, logo_url, data_entrada, meta_engajamento, meta_gasto, status_pagamento, observacoes"
    )
    .eq("id", id)
    .single();

  const { error } = await supabase
    .from("empresas")
    .update({
      nome,
      status,
      plano,
      segmento,
      logo_url,
      data_entrada,
      meta_engajamento,
      meta_gasto,
      status_pagamento,
      observacoes,
    })
    .eq("id", id);

  if (error) return { erro: error.message };

  if (atual) {
    const campos: Record<string, string> = {
      nome: "Nome",
      status: "Status",
      plano: "Plano",
      segmento: "Segmento",
      logo_url: "URL da logo",
      data_entrada: "Data de entrada",
      meta_engajamento: "Meta de engajamento",
      meta_gasto: "Meta de gasto",
      status_pagamento: "Status de pagamento",
      observacoes: "Observações",
    };
    const novoValores: Record<string, string | null> = {
      nome,
      status,
      plano,
      segmento,
      logo_url,
      data_entrada,
      meta_engajamento: String(meta_engajamento),
      meta_gasto: String(meta_gasto),
      status_pagamento,
      observacoes,
    };

    const registros = Object.entries(novoValores)
      .filter(([campo, valorNovo]) => {
        const valorAtual = String(
          (atual as Record<string, unknown>)[campo] ?? ""
        );
        return valorAtual !== String(valorNovo ?? "");
      })
      .map(([campo, valorNovo]) => ({
        empresa_id: id,
        campo: campos[campo] ?? campo,
        valor_anterior: String(
          (atual as Record<string, unknown>)[campo] ?? ""
        ),
        valor_novo: String(valorNovo ?? ""),
      }));

    if (registros.length > 0) {
      await supabase.from("historico_alteracoes").insert(registros);
    }
  }

  revalidatePath(`/empresas/${id}`);
  revalidatePath("/empresas");
  redirect(`/empresas/${id}`);
}

export async function deletarEmpresa(id: string): Promise<void> {
  const supabase = await createClient();

  await supabase.from("empresas").delete().eq("id", id);

  revalidatePath("/empresas");
  redirect("/empresas");
}

export async function adicionarDesempenho(
  empresaId: string,
  _estado: { erro: string },
  formData: FormData
): Promise<{ erro: string }> {
  const supabase = await createClient();

  const data = formData.get("data") as string;
  if (!data) return { erro: "A data é obrigatória." };

  const engajamento = Number(formData.get("engajamento")) || 0;
  const gasto_ads = Number(formData.get("gasto_ads")) || 0;
  const seguidores_novos = Number(formData.get("seguidores_novos")) || 0;

  const { error } = await supabase.from("desempenho_diario").upsert(
    { empresa_id: empresaId, data, engajamento, gasto_ads, seguidores_novos },
    { onConflict: "empresa_id,data" }
  );

  if (error) return { erro: error.message };

  revalidatePath(`/empresas/${empresaId}`);
  redirect(`/empresas/${empresaId}`);
}

export async function adicionarIntegracao(
  empresaId: string,
  _estado: { erro: string },
  formData: FormData
): Promise<{ erro: string }> {
  const supabase = await createClient();

  const provider = formData.get("provider") as string;
  if (!provider) return { erro: "Selecione uma integração." };

  const { error } = await supabase
    .from("integracoes_ads")
    .insert({ empresa_id: empresaId, provider, status: "ativo" });

  if (error) return { erro: error.message };

  revalidatePath(`/empresas/${empresaId}`);
  return { erro: "" };
}

export async function deletarDesempenho(
  registroId: string,
  empresaId: string
): Promise<void> {
  const supabase = await createClient();
  await supabase.from("desempenho_diario").delete().eq("id", registroId);
  revalidatePath(`/empresas/${empresaId}`);
  revalidatePath(`/empresas/${empresaId}/desempenho`);
}

export async function removerIntegracao(
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
