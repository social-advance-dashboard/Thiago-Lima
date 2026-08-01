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

  const { data, error } = await supabase
    .from("empresas")
    .insert({ nome, status, plano, segmento, logo_url, data_entrada })
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

  const { error } = await supabase
    .from("empresas")
    .update({ nome, status, plano, segmento, logo_url, data_entrada })
    .eq("id", id);

  if (error) return { erro: error.message };

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
