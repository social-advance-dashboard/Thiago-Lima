import { createClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";
import { Card, CardContent } from "@/components/ui/card";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { EditarAgendamentoForm } from "@/components/agendamentos/editar-agendamento-form";

export default async function EditarAgendamentoPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();

  const { data: agendamento } = await supabase
    .from("agendamentos")
    .select("id, titulo, tipo, data_hora, descricao")
    .eq("id", id)
    .single();

  if (!agendamento) notFound();

  return (
    <div className="p-8 max-w-lg">
      <Link
        href="/agendamentos"
        className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground mb-6"
      >
        <ArrowLeft size={15} />
        Voltar para Agendamentos
      </Link>

      <h1 className="text-2xl font-semibold mb-6">Editar agendamento</h1>

      <Card>
        <CardContent className="pt-6">
          <EditarAgendamentoForm agendamento={agendamento} />
        </CardContent>
      </Card>
    </div>
  );
}
