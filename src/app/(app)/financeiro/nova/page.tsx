import { Card, CardContent } from "@/components/ui/card";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { NovoLancamentoForm } from "@/components/financeiro/novo-lancamento-form";

export default function NovoLancamentoPage() {
  return (
    <div className="p-8 max-w-lg">
      <Link
        href="/financeiro"
        className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground mb-6"
      >
        <ArrowLeft size={15} />
        Voltar para Financeiro
      </Link>

      <h1 className="text-2xl font-semibold mb-6">Novo lançamento</h1>

      <Card>
        <CardContent className="pt-6">
          <NovoLancamentoForm />
        </CardContent>
      </Card>
    </div>
  );
}
