"use server";

import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";

export async function criarLead(
  _: { erro: string },
  formData: FormData
): Promise<{ erro: string }> {
  const supabase = await createClient();

  const nome = (formData.get("nome") as string)?.trim();
  const empresa = (formData.get("empresa") as string)?.trim() || null;
  const email = (formData.get("email") as string)?.trim() || null;
  const telefone = (formData.get("telefone") as string)?.trim() || null;
  const valor_estimado = formData.get("valor_estimado")
    ? Number(formData.get("valor_estimado"))
    : null;
  const observacoes = (formData.get("observacoes") as string)?.trim() || null;

  if (!nome) return { erro: "Nome é obrigatório." };

  const { error } = await supabase.from("leads").insert({
    nome,
    empresa,
    email,
    telefone,
    valor_estimado,
    observacoes,
  });

  if (error) return { erro: error.message };

  revalidatePath("/pipeline");
  redirect("/pipeline");
}

export async function moverEstagioLead(id: string, estagio: string): Promise<void> {
  const supabase = await createClient();
  await supabase.from("leads").update({ estagio }).eq("id", id);
  revalidatePath("/pipeline");
}

export async function deletarLead(id: string): Promise<void> {
  const supabase = await createClient();
  await supabase.from("leads").delete().eq("id", id);
  revalidatePath("/pipeline");
}
