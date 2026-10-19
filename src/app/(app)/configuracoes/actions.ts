"use server";

import { createAdminClient } from "@/lib/supabase/admin";

export async function criarUsuarioEmpresa(
  _estado: { erro: string; sucesso: boolean },
  formData: FormData
): Promise<{ erro: string; sucesso: boolean }> {
  const email = formData.get("email") as string;
  const senha = formData.get("senha") as string;
  const empresaId = formData.get("empresa_id") as string;

  if (!email || !senha || !empresaId) {
    return { erro: "Email, senha e empresa são obrigatórios.", sucesso: false };
  }

  if (senha.length < 6) {
    return { erro: "A senha deve ter pelo menos 6 caracteres.", sucesso: false };
  }

  const admin = createAdminClient();

  // Busca o nome da empresa para salvar no metadata
  const { data: empresa, error: errEmpresa } = await admin
    .from("empresas")
    .select("nome")
    .eq("id", empresaId)
    .single();

  if (errEmpresa || !empresa) {
    return { erro: "Empresa não encontrada.", sucesso: false };
  }

  const { error } = await admin.auth.admin.createUser({
    email,
    password: senha,
    email_confirm: true,
    app_metadata: {
      role: "empresa",
      empresa_id: empresaId,
      empresa_nome: empresa.nome,
    },
  });

  if (error) {
    const msg =
      error.message.includes("already been registered")
        ? "Este email já está em uso."
        : error.message;
    return { erro: msg, sucesso: false };
  }

  return { erro: "", sucesso: true };
}
