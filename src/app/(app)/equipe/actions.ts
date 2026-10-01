"use server";

import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";

export async function criarMembro(
  _: { erro: string },
  formData: FormData
): Promise<{ erro: string }> {
  const supabase = await createClient();

  const nome = (formData.get("nome") as string)?.trim();
  const email = (formData.get("email") as string)?.trim() || null;
  const cargo = (formData.get("cargo") as string)?.trim() || null;

  if (!nome) return { erro: "Nome é obrigatório." };

  const { error } = await supabase.from("equipe").insert({ nome, email, cargo });

  if (error) return { erro: error.message };

  revalidatePath("/equipe");
  redirect("/equipe");
}

export async function alterarStatusMembro(id: string, status: string): Promise<void> {
  const supabase = await createClient();
  await supabase.from("equipe").update({ status }).eq("id", id);
  revalidatePath("/equipe");
}

export async function deletarMembro(id: string): Promise<void> {
  const supabase = await createClient();
  await supabase.from("equipe").delete().eq("id", id);
  revalidatePath("/equipe");
}
