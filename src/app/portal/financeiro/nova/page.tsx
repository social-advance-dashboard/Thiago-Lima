import { Card, CardContent } from "@/components/ui/card";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { NovoLancamentoPortalForm } from "@/components/portal/novo-lancamento-portal-form";

export default function NovoLancamentoPortalPage() {
  return (
    <div className="max-w-lg">
      <Link
        href="/portal/financeiro"
        className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground mb-6"
      >
        <ArrowLeft size={15} />
        Voltar para Financeiro
      </Link>

      <h1 className="text-2xl font-semibold mb-6">Novo lançamento</h1>

      <Card>
        <CardContent className="pt-6">
          <NovoLancamentoPortalForm />
        </CardContent>
      </Card>
    </div>
  );
}
