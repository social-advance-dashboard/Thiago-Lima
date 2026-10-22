"use server";

import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { revalidatePath } from "next/cache";

export async function criarTarefaPortal(
  _: { erro: string; sucesso: boolean },
  formData: FormData
): Promise<{ erro: string; sucesso: boolean }> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  const empresaId = user?.app_metadata?.empresa_id as string | undefined;

  if (!empresaId) return { erro: "Não autorizado.", sucesso: false };

  const titulo = (formData.get("titulo") as string)?.trim();
  const descricao = (formData.get("descricao") as string)?.trim() || null;
  const prioridade = (formData.get("prioridade") as string) || "media";
  const data_prazo = (formData.get("data_prazo") as string) || null;

  if (!titulo) return { erro: "Título é obrigatório.", sucesso: false };

  const usuarioNome = user?.app_metadata?.usuario_nome as string | undefined;

  const admin = createAdminClient();
  const { error } = await admin.from("tarefas").insert({
    titulo,
    descricao,
    prioridade,
    data_prazo: data_prazo || null,
    empresa_id: empresaId,
    status: "pendente",
    responsavel: usuarioNome ?? null,
  });

  if (error) return { erro: error.message, sucesso: false };

  revalidatePath("/portal/tarefas");
  return { erro: "", sucesso: true };
}
