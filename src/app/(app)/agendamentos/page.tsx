import { createClient } from "@/lib/supabase/server";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Plus, CalendarDays } from "lucide-react";
import { AgendamentoAcoes } from "@/components/agendamentos/agendamento-acoes";

const TIPO_LABEL: Record<string, string> = {
  reuniao: "Reunião",
  ligacao: "Ligação",
  entrega: "Entrega",
  visita: "Visita",
  prazo: "Prazo",
  outros: "Outros",
};

const STATUS_VARIANT: Record<
  string,
  "default" | "secondary" | "destructive" | "outline"
> = {
  pendente: "default",
  concluido: "secondary",
  cancelado: "outline",
};

const STATUS_LABEL: Record<string, string> = {
  pendente: "Pendente",
  concluido: "Concluído",
  cancelado: "Cancelado",
};

function formatDataHora(iso: string) {
  return new Date(iso).toLocaleString("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function isPassado(iso: string) {
  return new Date(iso) < new Date();
}

export default async function AgendamentosPage() {
  const supabase = await createClient();

  const { data: proximos } = await supabase
    .from("agendamentos")
    .select("id, titulo, tipo, data_hora, status, descricao")
    .eq("status", "pendente")
    .gte("data_hora", new Date().toISOString())
    .order("data_hora", { ascending: true })
    .limit(20);

  const { data: recentes } = await supabase
    .from("agendamentos")
    .select("id, titulo, tipo, data_hora, status, descricao")
    .or("status.eq.concluido,status.eq.cancelado,and(status.eq.pendente,data_hora.lt." + new Date().toISOString() + ")")
    .order("data_hora", { ascending: false })
    .limit(20);

  return (
    <div className="p-8 space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Agendamentos</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Reuniões, prazos e compromissos da agência
          </p>
        </div>
        <Link href="/agendamentos/novo">
          <Button>
            <Plus size={14} />
            Novo agendamento
          </Button>
        </Link>
      </div>

      {/* Próximos */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-base">
            <CalendarDays size={16} />
            Próximos
          </CardTitle>
        </CardHeader>
        <CardContent>
          {proximos && proximos.length > 0 ? (
            <ul className="divide-y">
              {proximos.map((a) => (
                <li
                  key={a.id}
                  className="flex flex-col gap-1 py-3 sm:flex-row sm:items-center sm:justify-between"
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-medium">{a.titulo}</span>
                      <Badge variant="outline" className="text-xs capitalize">
                        {TIPO_LABEL[a.tipo] ?? a.tipo}
                      </Badge>
                    </div>
                    {a.descricao && (
                      <p className="text-xs text-muted-foreground mt-0.5 truncate">
                        {a.descricao}
                      </p>
                    )}
                  </div>
                  <div className="flex items-center gap-3 shrink-0">
                    <span className="text-sm text-muted-foreground whitespace-nowrap">
                      {formatDataHora(a.data_hora)}
                    </span>
                    <AgendamentoAcoes id={a.id} status={a.status} />
                  </div>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-sm text-muted-foreground py-2">
              Nenhum compromisso pendente.
            </p>
          )}
        </CardContent>
      </Card>

      {/* Recentes / histórico */}
      {recentes && recentes.length > 0 && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base text-muted-foreground">
              Histórico
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="divide-y">
              {recentes.map((a) => (
                <li
                  key={a.id}
                  className="flex flex-col gap-1 py-3 sm:flex-row sm:items-center sm:justify-between opacity-70"
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-medium">{a.titulo}</span>
                      <Badge
                        variant={STATUS_VARIANT[a.status] ?? "secondary"}
                        className="text-xs"
                      >
                        {STATUS_LABEL[a.status] ?? a.status}
                      </Badge>
                      {isPassado(a.data_hora) && a.status === "pendente" && (
                        <Badge variant="destructive" className="text-xs">
                          Atrasado
                        </Badge>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-3 shrink-0">
                    <span className="text-sm text-muted-foreground whitespace-nowrap">
                      {formatDataHora(a.data_hora)}
                    </span>
                    <AgendamentoAcoes id={a.id} status={a.status} />
                  </div>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
