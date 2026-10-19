"use server";

import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";

export async function criarLancamentoEmpresa(
  _estado: { erro: string },
  formData: FormData
): Promise<{ erro: string }> {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const empresaId = user?.app_metadata?.empresa_id as string | undefined;
  if (!empresaId) return { erro: "Empresa não identificada." };

  const tipo = formData.get("tipo") as string;
  const categoria = formData.get("categoria") as string;
  const valor = Number(formData.get("valor"));
  const data = formData.get("data") as string;
  const descricao = (formData.get("descricao") as string)?.trim() || null;

  if (!tipo || !categoria || !valor || !data) {
    return { erro: "Tipo, categoria, valor e data são obrigatórios." };
  }

  const { error } = await supabase
    .from("financeiro_empresa")
    .insert({ empresa_id: empresaId, tipo, categoria, valor, data, descricao });

  if (error) return { erro: error.message };

  revalidatePath("/portal/financeiro");
  const mes = data.slice(0, 7);
  redirect(`/portal/financeiro?mes=${mes}`);
}

export async function deletarLancamentoEmpresa(id: string): Promise<void> {
  const supabase = await createClient();
  await supabase.from("financeiro_empresa").delete().eq("id", id);
  revalidatePath("/portal/financeiro");
}
