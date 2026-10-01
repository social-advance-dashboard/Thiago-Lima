"use server";

import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";

export async function criarTarefa(
  _: { erro: string },
  formData: FormData
): Promise<{ erro: string }> {
  const supabase = await createClient();

  const titulo = (formData.get("titulo") as string)?.trim();
  const empresa_id = (formData.get("empresa_id") as string) || null;
  const descricao = (formData.get("descricao") as string)?.trim() || null;
  const prioridade = (formData.get("prioridade") as string) || "media";
  const data_prazo = (formData.get("data_prazo") as string) || null;
  const responsavel = (formData.get("responsavel") as string)?.trim() || null;

  if (!titulo) return { erro: "Título é obrigatório." };

  const { error } = await supabase.from("tarefas").insert({
    titulo,
    empresa_id,
    descricao,
    prioridade,
    data_prazo,
    responsavel,
  });

  if (error) return { erro: error.message };

  revalidatePath("/tarefas");
  redirect("/tarefas");
}

export async function moverStatusTarefa(id: string, status: string): Promise<void> {
  const supabase = await createClient();
  await supabase.from("tarefas").update({ status }).eq("id", id);
  revalidatePath("/tarefas");
}

export async function deletarTarefa(id: string): Promise<void> {
  const supabase = await createClient();
  await supabase.from("tarefas").delete().eq("id", id);
  revalidatePath("/tarefas");
}
