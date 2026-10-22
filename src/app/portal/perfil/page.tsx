import { createClient } from "@/lib/supabase/server";
import { AlterarSenhaPortalForm } from "@/components/portal/alterar-senha-portal-form";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default async function PortalPerfilPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  const nome = user?.app_metadata?.usuario_nome as string | undefined;
  const empresa = user?.app_metadata?.empresa_nome as string | undefined;

  return (
    <div className="space-y-6 max-w-sm">
      <div>
        <h1 className="text-2xl font-semibold">Meu perfil</h1>
        <p className="text-sm text-muted-foreground mt-1">Dados da sua conta</p>
      </div>

      <Card>
        <CardContent className="pt-5 space-y-3">
          {nome && (
            <div>
              <p className="text-xs text-muted-foreground">Nome</p>
              <p className="text-sm font-medium">{nome}</p>
            </div>
          )}
          <div>
            <p className="text-xs text-muted-foreground">Email</p>
            <p className="text-sm font-medium">{user?.email}</p>
          </div>
          {empresa && (
            <div>
              <p className="text-xs text-muted-foreground">Empresa</p>
              <p className="text-sm font-medium">{empresa}</p>
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Alterar senha</CardTitle>
        </CardHeader>
        <CardContent>
          <AlterarSenhaPortalForm />
        </CardContent>
      </Card>
    </div>
  );
}
