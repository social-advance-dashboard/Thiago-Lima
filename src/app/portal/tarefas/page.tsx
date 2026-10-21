import { createClient } from "@/lib/supabase/server";
import { formatData } from "@/lib/formatters";
import { cn } from "@/lib/utils";
import { NovaTarefaForm } from "@/components/portal/nova-tarefa-form";

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

export default async function PortalTarefasPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  const empresaId = user?.app_metadata?.empresa_id as string | undefined;

  const { data } = await supabase
    .from("tarefas")
    .select("id, titulo, descricao, status, prioridade, data_prazo, responsavel")
    .eq("empresa_id", empresaId ?? "")
    .order("created_at", { ascending: false });

  const tarefas = data ?? [];

  return (
    <div className="space-y-4">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold">Tarefas</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Acompanhe o andamento dos seus projetos
          </p>
        </div>
        <NovaTarefaForm />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 overflow-x-auto">
        {COLUNAS.map((col) => {
          const items = tarefas.filter((t) => t.status === col.key);
          return (
            <div key={col.key} className="flex flex-col gap-2 min-w-[200px]">
              <div className="flex items-center justify-between px-1">
                <span className="text-sm font-semibold">{col.label}</span>
                <span className="text-xs text-muted-foreground bg-muted rounded-full px-2 py-0.5">
                  {items.length}
                </span>
              </div>
              <div className="flex flex-col gap-2">
                {items.map((t) => {
                  const atrasada =
                    t.data_prazo &&
                    new Date(t.data_prazo) < new Date() &&
                    t.status !== "concluida";
                  return (
                    <div
                      key={t.id}
                      className="rounded-lg border bg-card p-3 space-y-2 shadow-sm"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <p className="text-sm font-medium leading-tight">
                          {t.titulo}
                        </p>
                        <span
                          className={cn(
                            "text-xs px-1.5 py-0.5 rounded font-medium shrink-0",
                            PRIORIDADE_COR[t.prioridade] ?? ""
                          )}
                        >
                          {t.prioridade}
                        </span>
                      </div>
                      {t.descricao && (
                        <p className="text-xs text-muted-foreground line-clamp-2">
                          {t.descricao}
                        </p>
                      )}
                      {t.responsavel && (
                        <p className="text-xs text-muted-foreground">
                          👤 {t.responsavel}
                        </p>
                      )}
                      {t.data_prazo && (
                        <p
                          className={cn(
                            "text-xs",
                            atrasada
                              ? "text-destructive font-medium"
                              : "text-muted-foreground"
                          )}
                        >
                          {atrasada ? "⚠ " : ""}Prazo:{" "}
                          {formatData(t.data_prazo)}
                        </p>
                      )}
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
