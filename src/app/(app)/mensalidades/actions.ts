"use server";

import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";

export async function criarMensalidade(
  _: { erro: string },
  formData: FormData
): Promise<{ erro: string }> {
  const supabase = await createClient();

  const empresa_id = formData.get("empresa_id") as string;
  const valor = Number(formData.get("valor"));
  const mes_referencia = formData.get("mes_referencia") as string;
  const data_vencimento = formData.get("data_vencimento") as string;
  const observacoes = (formData.get("observacoes") as string)?.trim() || null;

  if (!empresa_id || !valor || !mes_referencia || !data_vencimento) {
    return { erro: "Preencha todos os campos obrigatórios." };
  }

  const { error } = await supabase.from("mensalidades").insert({
    empresa_id,
    valor,
    mes_referencia,
    data_vencimento,
    observacoes,
  });

  if (error) return { erro: error.message };

  revalidatePath("/mensalidades");
  redirect("/mensalidades");
}

export async function marcarPago(id: string): Promise<void> {
  const supabase = await createClient();
  await supabase
    .from("mensalidades")
    .update({ status: "pago", data_pagamento: new Date().toISOString().split("T")[0] })
    .eq("id", id);
  revalidatePath("/mensalidades");
}

export async function marcarAtrasado(id: string): Promise<void> {
  const supabase = await createClient();
  await supabase.from("mensalidades").update({ status: "atrasado" }).eq("id", id);
  revalidatePath("/mensalidades");
}

export async function deletarMensalidade(id: string): Promise<void> {
  const supabase = await createClient();
  await supabase.from("mensalidades").delete().eq("id", id);
  revalidatePath("/mensalidades");
}
