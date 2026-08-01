import { NovaEmpresaForm } from "@/components/empresas/nova-empresa-form";
import { Card, CardContent } from "@/components/ui/card";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";

export default function NovaEmpresaPage() {
  return (
    <div className="p-8 max-w-2xl">
      <Link
        href="/empresas"
        className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground mb-6"
      >
        <ArrowLeft size={15} />
        Voltar para Empresas
      </Link>

      <h1 className="text-2xl font-semibold mb-6">Nova Empresa</h1>

      <Card>
        <CardContent className="pt-6">
          <NovaEmpresaForm />
        </CardContent>
      </Card>
    </div>
  );
}
