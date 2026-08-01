"use server";

import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";

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
