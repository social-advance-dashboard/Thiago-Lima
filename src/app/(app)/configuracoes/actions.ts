"use server";

import { createAdminClient } from "@/lib/supabase/admin";
import { randomBytes } from "crypto";

export async function criarUsuarioEmpresa(
  _estado: { erro: string; sucesso: boolean; link: string },
  formData: FormData
): Promise<{ erro: string; sucesso: boolean; link: string }> {
  const email = formData.get("email") as string;
  const empresaId = formData.get("empresa_id") as string;
  const nome = (formData.get("nome") as string)?.trim();

  if (!email || !empresaId || !nome) {
    return { erro: "Nome, email e empresa são obrigatórios.", sucesso: false, link: "" };
  }

  try {
    const admin = createAdminClient();

    const { data: empresa, error: errEmpresa } = await admin
      .from("empresas")
      .select("nome")
      .eq("id", empresaId)
      .single();

    if (errEmpresa || !empresa) {
      return { erro: "Empresa não encontrada.", sucesso: false, link: "" };
    }

    // Cria usuário com senha aleatória (nunca exposta ao admin)
    const senhaTemp = randomBytes(32).toString("hex");

    const { error: errCreate } = await admin.auth.admin.createUser({
      email,
      password: senhaTemp,
      email_confirm: true,
      app_metadata: {
        role: "empresa",
        empresa_id: empresaId,
        empresa_nome: empresa.nome,
        usuario_nome: nome,
      },
    });

    if (errCreate) {
      const msg = errCreate.message.includes("already been registered")
        ? "Este email já está em uso. Use 'Gerar novo link' abaixo para reenviar o acesso."
        : errCreate.message;
      return { erro: msg, sucesso: false, link: "" };
    }

    // Gera link de primeiro acesso (expira em 1h) para o usuário definir a própria senha
    const { data: linkData, error: errLink } = await admin.auth.admin.generateLink({
      type: "recovery",
      email,
      options: {
        redirectTo: "https://sa-dashboard.store/login/nova-senha",
      },
    });

    if (errLink || !linkData?.properties?.action_link) {
      return {
        erro: "",
        sucesso: true,
        link: "", // criou, mas não gerou link — admin pode usar "Gerar novo link"
      };
    }

    return { erro: "", sucesso: true, link: linkData.properties.action_link };
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Erro interno ao criar usuário.";
    return { erro: msg, sucesso: false, link: "" };
  }
}

export async function gerarLinkAcesso(
  _estado: { erro: string; link: string },
  formData: FormData
): Promise<{ erro: string; link: string }> {
  const email = formData.get("email") as string;

  if (!email) return { erro: "Email é obrigatório.", link: "" };

  try {
    const admin = createAdminClient();

    const { data, error } = await admin.auth.admin.generateLink({
      type: "recovery",
      email,
      options: { redirectTo: "https://sa-dashboard.store/login/nova-senha" },
    });

    if (error) return { erro: error.message, link: "" };

    return { erro: "", link: data?.properties?.action_link ?? "" };
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Erro interno.";
    return { erro: msg, link: "" };
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
