"use server";

import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";

export async function criarLancamento(
  _estado: { erro: string },
  formData: FormData
): Promise<{ erro: string }> {
  const supabase = await createClient();

  const tipo = formData.get("tipo") as string;
  const valor = Number(formData.get("valor"));
  const data = formData.get("data") as string;
  const descricao = (formData.get("descricao") as string)?.trim() || null;

  if (!tipo || !valor || !data) {
    return { erro: "Tipo, valor e data são obrigatórios." };
  }

  const { error } = await supabase
    .from("financeiro_agencia")
    .insert({ tipo, valor, data, descricao });

  if (error) return { erro: error.message };

  revalidatePath("/financeiro");
  redirect("/financeiro");
}

export async function deletarLancamento(id: string): Promise<void> {
  const supabase = await createClient();
  await supabase.from("financeiro_agencia").delete().eq("id", id);
  revalidatePath("/financeiro");
}
