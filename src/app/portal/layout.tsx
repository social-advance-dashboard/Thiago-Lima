import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { LogoutPortalButton } from "@/components/portal/logout-portal-button";
import { PortalNav } from "@/components/portal/portal-nav";

export default async function PortalLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const nomeEmpresa =
    (user.app_metadata?.empresa_nome as string) ?? "Portal";
  const nomeUsuario =
    (user.app_metadata?.usuario_nome as string) ?? null;

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border px-6 py-3 flex items-center justify-between">
        <div>
          <p className="text-xs text-muted-foreground">Portal do cliente · {nomeEmpresa}</p>
          <p className="text-sm font-semibold">{nomeUsuario ?? nomeEmpresa}</p>
        </div>
        <LogoutPortalButton />
      </header>
      <PortalNav />
      <main className="max-w-4xl mx-auto p-6">{children}</main>
    </div>
  );
}
