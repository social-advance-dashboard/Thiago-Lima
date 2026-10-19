import { createClient } from "@/lib/supabase/server";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { TrocarSenhaForm } from "@/components/configuracoes/trocar-senha-form";
import { CriarUsuarioEmpresaForm } from "@/components/configuracoes/criar-usuario-empresa-form";
import { Building2 } from "lucide-react";

export default async function ConfiguracoesPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  const { data: empresas } = await supabase
    .from("empresas")
    .select("id, nome")
    .eq("status", "ativo")
    .order("nome");

  return (
    <div className="p-8 max-w-2xl space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">Configurações</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Gerencie sua conta e preferências
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Perfil</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <div>
            <p className="text-xs text-muted-foreground">Email</p>
            <p className="text-sm font-medium">{user?.email}</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Conta criada em</p>
            <p className="text-sm font-medium">
              {user?.created_at
                ? new Date(user.created_at).toLocaleDateString("pt-BR")
                : "—"}
            </p>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Alterar senha</CardTitle>
        </CardHeader>
        <CardContent>
          <TrocarSenhaForm />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Building2 size={16} className="text-muted-foreground" />
            <CardTitle className="text-base">Portal das empresas</CardTitle>
          </div>
          <CardDescription>
            Crie um login para cada empresa cliente. Elas acessam{" "}
            <strong>sa-dashboard.store/login</strong> com o email e senha que
            você definir aqui, e são direcionadas automaticamente para o portal
            delas com o próprio financeiro.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <CriarUsuarioEmpresaForm empresas={empresas ?? []} />
        </CardContent>
      </Card>
    </div>
  );
}
