import { createClient } from "@/lib/supabase/server";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Plus } from "lucide-react";
import { TarefaAcoes } from "@/components/tarefas/tarefa-acoes";
import { formatData } from "@/lib/formatters";
import { cn } from "@/lib/utils";

const COLUNAS = [
  { key: "pendente", label: "Pendente" },
  { key: "em_andamento", label: "Em andamento" },
  { key: "revisao", label: "Revisão" },
  { key: "concluida", label: "Concluída" },
];

const PRIORIDADE_COR: Record<string, string> = {
  alta: "text-red-600 bg-red-50 dark:bg-red-950/40",
  media: "text-yellow-600 bg-yellow-50 dark:bg-yellow-950/40",
  baixa: "text-green-600 bg-green-50 dark:bg-green-950/40",
};

type Tarefa = {
  id: string;
  titulo: string;
  descricao: string | null;
  status: string;
  prioridade: string;
  data_prazo: string | null;
  responsavel: string | null;
  empresa_id: string | null;
  empresas: { nome: string } | { nome: string }[] | null;
};

export default async function TarefasPage() {
  const supabase = await createClient();
  const { data } = await supabase
    .from("tarefas")
    .select("id, titulo, descricao, status, prioridade, data_prazo, responsavel, empresa_id, empresas(nome)")
    .order("created_at", { ascending: false });

  const tarefas = (data ?? []) as Tarefa[];

  function getEmpresa(t: Tarefa) {
    if (!t.empresas) return null;
    const raw = t.empresas;
    return (Array.isArray(raw) ? raw[0] : raw) as { nome: string } | null;
  }

  return (
    <div className="p-6 space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Tarefas</h1>
          <p className="text-sm text-muted-foreground mt-1">Kanban da produção</p>
        </div>
        <Link href="/tarefas/nova">
          <Button><Plus size={14} /> Nova tarefa</Button>
        </Link>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 overflow-x-auto">
        {COLUNAS.map((col) => {
          const items = tarefas.filter((t) => t.status === col.key);
          return (
            <div key={col.key} className="flex flex-col gap-2 min-w-[220px]">
              <div className="flex items-center justify-between px-1">
                <span className="text-sm font-semibold">{col.label}</span>
                <span className="text-xs text-muted-foreground bg-muted rounded-full px-2 py-0.5">{items.length}</span>
              </div>
              <div className="flex flex-col gap-2">
                {items.map((t) => {
                  const empresa = getEmpresa(t);
                  const atrasada = t.data_prazo && new Date(t.data_prazo) < new Date() && t.status !== "concluida";
                  return (
                    <div key={t.id} className="rounded-lg border bg-card p-3 space-y-2 shadow-sm">
                      <div className="flex items-start justify-between gap-2">
                        <p className="text-sm font-medium leading-tight">{t.titulo}</p>
                        <span className={cn("text-xs px-1.5 py-0.5 rounded font-medium shrink-0", PRIORIDADE_COR[t.prioridade] ?? "")}>
                          {t.prioridade}
                        </span>
                      </div>
                      {empresa && (
                        <Link href={`/empresas/${t.empresa_id}`} className="text-xs text-muted-foreground hover:underline block">
                          {empresa.nome}
                        </Link>
                      )}
                      {t.responsavel && (
                        <p className="text-xs text-muted-foreground">👤 {t.responsavel}</p>
                      )}
                      {t.data_prazo && (
                        <p className={cn("text-xs", atrasada ? "text-destructive font-medium" : "text-muted-foreground")}>
                          {atrasada ? "⚠ " : ""}Prazo: {formatData(t.data_prazo)}
                        </p>
                      )}
                      <TarefaAcoes id={t.id} status={t.status} />
                    </div>
                  );
                })}
                {items.length === 0 && (
                  <div className="rounded-lg border border-dashed p-4 text-center text-xs text-muted-foreground">
                    Nenhuma tarefa
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
