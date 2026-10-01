import { createClient } from "@/lib/supabase/server";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { LeadAcoes } from "@/components/pipeline/lead-acoes";
import { formatMoeda } from "@/lib/formatters";
import { cn } from "@/lib/utils";

const COLUNAS = [
  { key: "lead", label: "Lead", cor: "border-t-blue-400" },
  { key: "contato", label: "Contato", cor: "border-t-yellow-400" },
  { key: "proposta", label: "Proposta", cor: "border-t-orange-400" },
  { key: "negociacao", label: "Negociação", cor: "border-t-purple-400" },
  { key: "fechado", label: "Fechado ✓", cor: "border-t-green-500" },
  { key: "perdido", label: "Perdido", cor: "border-t-red-400" },
];

type Lead = {
  id: string;
  nome: string;
  empresa: string | null;
  email: string | null;
  telefone: string | null;
  estagio: string;
  valor_estimado: number | null;
  observacoes: string | null;
};

export default async function PipelinePage() {
  const supabase = await createClient();
  const { data } = await supabase
    .from("leads")
    .select("id, nome, empresa, email, telefone, estagio, valor_estimado, observacoes")
    .order("created_at", { ascending: false });

  const leads = (data ?? []) as Lead[];

  const totalEstimado = leads
    .filter((l) => l.estagio === "fechado")
    .reduce((a, l) => a + Number(l.valor_estimado ?? 0), 0);

  return (
    <div className="p-6 space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Pipeline</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Funil comercial · {totalEstimado > 0 && <span className="text-green-600 font-medium">{formatMoeda(totalEstimado)}/mês fechados</span>}
          </p>
        </div>
        <Link href="/pipeline/novo">
          <Button><Plus size={14} /> Novo lead</Button>
        </Link>
      </div>

      <div className="flex gap-3 overflow-x-auto pb-2">
        {COLUNAS.map((col) => {
          const items = leads.filter((l) => l.estagio === col.key);
          const totalCol = items.reduce((a, l) => a + Number(l.valor_estimado ?? 0), 0);
          return (
            <div key={col.key} className={cn("flex flex-col gap-2 min-w-[200px] w-[200px] shrink-0 rounded-lg border-t-2 bg-muted/30 p-2", col.cor)}>
              <div className="flex items-center justify-between px-1 py-0.5">
                <span className="text-xs font-semibold">{col.label}</span>
                <span className="text-xs text-muted-foreground">{items.length}</span>
              </div>
              {totalCol > 0 && (
                <p className="text-xs text-muted-foreground px-1 -mt-1">{formatMoeda(totalCol)}/mês</p>
              )}
              <div className="flex flex-col gap-1.5">
                {items.map((l) => (
                  <div key={l.id} className="rounded-md border bg-card p-2.5 space-y-1 shadow-sm">
                    <p className="text-sm font-medium leading-tight">{l.nome}</p>
                    {l.empresa && <p className="text-xs text-muted-foreground">{l.empresa}</p>}
                    {l.valor_estimado && (
                      <p className="text-xs font-medium text-green-700 dark:text-green-400">
                        {formatMoeda(Number(l.valor_estimado))}/mês
                      </p>
                    )}
                    {l.telefone && <p className="text-xs text-muted-foreground">{l.telefone}</p>}
                    {l.observacoes && (
                      <p className="text-xs text-muted-foreground line-clamp-2">{l.observacoes}</p>
                    )}
                    <LeadAcoes id={l.id} estagio={l.estagio} />
                  </div>
                ))}
                {items.length === 0 && (
                  <div className="rounded border border-dashed p-3 text-center text-xs text-muted-foreground">
                    Vazio
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
