"use server";

import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";

export async function criarAgendamento(
  _estado: { erro: string },
  formData: FormData
): Promise<{ erro: string }> {
  const supabase = await createClient();

  const titulo = (formData.get("titulo") as string)?.trim();
  if (!titulo) return { erro: "O título é obrigatório." };

  const tipo = (formData.get("tipo") as string) || "reuniao";
  const data_hora = formData.get("data_hora") as string;
  if (!data_hora) return { erro: "A data e hora são obrigatórias." };

  const descricao = (formData.get("descricao") as string)?.trim() || null;

  const { error } = await supabase
    .from("agendamentos")
    .insert({ titulo, tipo, data_hora, descricao, status: "pendente" });

  if (error) return { erro: error.message };

  revalidatePath("/agendamentos");
  redirect("/agendamentos");
}

export async function atualizarStatusAgendamento(
  id: string,
  status: string
): Promise<void> {
  const supabase = await createClient();
  await supabase.from("agendamentos").update({ status }).eq("id", id);
  revalidatePath("/agendamentos");
}

export async function editarAgendamento(
  id: string,
  _estado: { erro: string },
  formData: FormData
): Promise<{ erro: string }> {
  const supabase = await createClient();

  const titulo = (formData.get("titulo") as string)?.trim();
  if (!titulo) return { erro: "O título é obrigatório." };

  const tipo = (formData.get("tipo") as string) || "reuniao";
  const data_hora = formData.get("data_hora") as string;
  if (!data_hora) return { erro: "A data e hora são obrigatórias." };

  const descricao = (formData.get("descricao") as string)?.trim() || null;

  const { error } = await supabase
    .from("agendamentos")
    .update({ titulo, tipo, data_hora, descricao })
    .eq("id", id);

  if (error) return { erro: error.message };

  revalidatePath("/agendamentos");
  redirect("/agendamentos");
}

export async function deletarAgendamento(id: string): Promise<void> {
  const supabase = await createClient();
  await supabase.from("agendamentos").delete().eq("id", id);
  revalidatePath("/agendamentos");
}
