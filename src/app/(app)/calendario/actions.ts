"use server";

import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";

export async function criarPost(
  _: { erro: string },
  formData: FormData
): Promise<{ erro: string }> {
  const supabase = await createClient();

  const titulo = (formData.get("titulo") as string)?.trim();
  const empresa_id = formData.get("empresa_id") as string;
  const rede_social = formData.get("rede_social") as string;
  const formato = (formData.get("formato") as string) || "post";
  const data_publicacao = formData.get("data_publicacao") as string;
  const descricao = (formData.get("descricao") as string)?.trim() || null;

  if (!titulo || !empresa_id || !rede_social || !data_publicacao) {
    return { erro: "Preencha todos os campos obrigatórios." };
  }

  const { error } = await supabase.from("calendario_editorial").insert({
    titulo,
    empresa_id,
    rede_social,
    formato,
    data_publicacao,
    descricao,
  });

  if (error) return { erro: error.message };

  revalidatePath("/calendario");
  redirect("/calendario");
}

export async function atualizarStatusPost(id: string, status: string): Promise<void> {
  const supabase = await createClient();
  await supabase.from("calendario_editorial").update({ status }).eq("id", id);
  revalidatePath("/calendario");
}

export async function deletarPost(id: string): Promise<void> {
  const supabase = await createClient();
  await supabase.from("calendario_editorial").delete().eq("id", id);
  revalidatePath("/calendario");
}
