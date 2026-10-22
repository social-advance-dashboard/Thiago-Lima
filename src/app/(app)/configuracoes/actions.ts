"use server";

import { createAdminClient } from "@/lib/supabase/admin";

export async function criarUsuarioEmpresa(
  _estado: { erro: string; sucesso: boolean },
  formData: FormData
): Promise<{ erro: string; sucesso: boolean }> {
  const email = formData.get("email") as string;
  const senha = formData.get("senha") as string;
  const empresaId = formData.get("empresa_id") as string;
  const nome = (formData.get("nome") as string)?.trim();

  if (!email || !senha || !empresaId || !nome) {
    return { erro: "Nome, email, senha e empresa são obrigatórios.", sucesso: false };
  }

  if (senha.length < 6) {
    return { erro: "A senha deve ter pelo menos 6 caracteres.", sucesso: false };
  }

  try {
    const admin = createAdminClient();

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
        usuario_nome: nome,
      },
    });

    if (error) {
      const msg = error.message.includes("already been registered")
        ? "Este email já está em uso. Use 'Redefinir acesso' para atualizar a senha."
        : error.message;
      return { erro: msg, sucesso: false };
    }

    return { erro: "", sucesso: true };
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Erro interno ao criar usuário.";
    return { erro: msg, sucesso: false };
  }
}

export async function redefinirAcessoEmpresa(
  _estado: { erro: string; sucesso: boolean },
  formData: FormData
): Promise<{ erro: string; sucesso: boolean }> {
  const email = formData.get("email") as string;
  const novaSenha = formData.get("nova_senha") as string;

  if (!email || !novaSenha) {
    return { erro: "Email e nova senha são obrigatórios.", sucesso: false };
  }

  if (novaSenha.length < 6) {
    return { erro: "A senha deve ter pelo menos 6 caracteres.", sucesso: false };
  }

  try {
    const admin = createAdminClient();

    // Lista usuários para encontrar o ID pelo email
    let userId: string | null = null;
    let page = 1;
    while (true) {
      const { data, error } = await admin.auth.admin.listUsers({ page, perPage: 50 });
      if (error) return { erro: error.message, sucesso: false };
      const found = data.users.find((u) => u.email === email);
      if (found) { userId = found.id; break; }
      if (!data.nextPage) break;
      page++;
    }

    if (!userId) {
      return { erro: "Nenhum usuário encontrado com esse email.", sucesso: false };
    }

    const { error } = await admin.auth.admin.updateUserById(userId, {
      password: novaSenha,
    });

    if (error) return { erro: error.message, sucesso: false };

    return { erro: "", sucesso: true };
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Erro interno.";
    return { erro: msg, sucesso: false };
  }
}
