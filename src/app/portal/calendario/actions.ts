"use server";

import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { revalidatePath } from "next/cache";

export async function criarPostPortal(
  _: { erro: string; sucesso: boolean },
  formData: FormData
): Promise<{ erro: string; sucesso: boolean }> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  const empresaId = user?.app_metadata?.empresa_id as string | undefined;

  if (!empresaId) return { erro: "Não autorizado.", sucesso: false };

  const titulo = (formData.get("titulo") as string)?.trim();
  const rede_social = formData.get("rede_social") as string;
  const formato = (formData.get("formato") as string) || "post";
  const data_publicacao = formData.get("data_publicacao") as string;
  const descricao = (formData.get("descricao") as string)?.trim() || null;

  if (!titulo || !rede_social || !data_publicacao) {
    return { erro: "Preencha todos os campos obrigatórios.", sucesso: false };
  }

  const admin = createAdminClient();
  const { error } = await admin.from("calendario_editorial").insert({
    titulo,
    rede_social,
    formato,
    data_publicacao,
    descricao,
    empresa_id: empresaId,
    status: "planejado",
  });

  if (error) return { erro: error.message, sucesso: false };

  revalidatePath("/portal/calendario");
  return { erro: "", sucesso: true };
}
