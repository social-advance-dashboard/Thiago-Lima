import { Card, CardContent } from "@/components/ui/card";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { NovoAgendamentoForm } from "@/components/agendamentos/novo-agendamento-form";

export default function NovoAgendamentoPage() {
  return (
    <div className="p-8 max-w-lg">
      <Link
        href="/agendamentos"
        className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground mb-6"
      >
        <ArrowLeft size={15} />
        Voltar para Agendamentos
      </Link>

      <h1 className="text-2xl font-semibold mb-6">Novo agendamento</h1>

      <Card>
        <CardContent className="pt-6">
          <NovoAgendamentoForm />
        </CardContent>
      </Card>
    </div>
  );
}
