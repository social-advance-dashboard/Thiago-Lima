import { createClient } from "@/lib/supabase/server";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatMoeda } from "@/lib/formatters";
import { BarChartSimples } from "@/components/charts/bar-chart-simples";
import { DonutChartSimples } from "@/components/charts/donut-chart-simples";

const CORES_STATUS_TAREFA: Record<string, string> = {
  pendente: "#f59e0b",
  em_andamento: "#3b82f6",
  revisao: "#8b5cf6",
  concluida: "#22c55e",
};

const CORES_ESTAGIO_PIPELINE: Record<string, string> = {
  lead: "#94a3b8",
  contato: "#60a5fa",
  proposta: "#a78bfa",
  negociacao: "#f59e0b",
  fechado: "#22c55e",
  perdido: "#ef4444",
};

const CORES_STATUS_MENS: Record<string, string> = {
  pendente: "#f59e0b",
  pago: "#22c55e",
  atrasado: "#ef4444",
};

function labelMes(yyyyMm: string) {
  const [a, m] = yyyyMm.split("-").map(Number);
  return new Date(a, m - 1, 1).toLocaleDateString("pt-BR", { month: "short" });
}

export default async function RelatoriosPage() {
  const supabase = await createClient();

  const hoje = new Date();

  // ── Faturamento últimos 6 meses ───────────────────────────────────
  const seisMesesAtras = new Date(hoje.getFullYear(), hoje.getMonth() - 5, 1);
  const { data: lancamentos } = await supabase
    .from("financeiro_agencia")
    .select("tipo, valor, data")
    .gte("data", seisMesesAtras.toISOString().split("T")[0])
    .order("data");

  const faturamentoMes = new Map<string, { receita: number; despesa: number }>();
  for (let i = 5; i >= 0; i--) {
    const d = new Date(hoje.getFullYear(), hoje.getMonth() - i, 1);
    const key = d.toISOString().slice(0, 7);
    faturamentoMes.set(key, { receita: 0, despesa: 0 });
  }
  (lancamentos ?? []).forEach((l) => {
    const key = l.data.slice(0, 7);
    const atual = faturamentoMes.get(key);
    if (!atual) return;
    if (l.tipo === "receita") atual.receita += Number(l.valor);
    else atual.despesa += Number(l.valor);
    faturamentoMes.set(key, atual);
  });

  const dadosReceita = Array.from(faturamentoMes.entries()).map(([mes, v]) => ({
    label: labelMes(mes),
    valor: v.receita,
    cor: "#22c55e",
  }));
  const dadosDespesa = Array.from(faturamentoMes.entries()).map(([mes, v]) => ({
    label: labelMes(mes),
    valor: v.despesa,
    cor: "#ef4444",
  }));
  const dadosLucro = Array.from(faturamentoMes.entries()).map(([mes, v]) => ({
    label: labelMes(mes),
    valor: v.receita - v.despesa,
    cor: v.receita - v.despesa >= 0 ? "#378ADD" : "#ef4444",
  }));

  const totalReceita6m = dadosReceita.reduce((acc, d) => acc + d.valor, 0);
  const totalDespesa6m = dadosDespesa.reduce((acc, d) => acc + d.valor, 0);
  const totalLucro6m = totalReceita6m - totalDespesa6m;

  // ── Mensalidades por status ────────────────────────────────────────
  const { data: mensalidades } = await supabase
    .from("mensalidades")
    .select("status, valor");

  const mensGrupo = new Map<string, { count: number; total: number }>();
  (mensalidades ?? []).forEach((m) => {
    const g = mensGrupo.get(m.status) ?? { count: 0, total: 0 };
    mensGrupo.set(m.status, { count: g.count + 1, total: g.total + Number(m.valor) });
  });

  const dadosMensDonut = Array.from(mensGrupo.entries()).map(([status, g]) => ({
    label: status === "pago" ? "Pago" : status === "pendente" ? "Pendente" : "Atrasado",
    valor: g.count,
    cor: CORES_STATUS_MENS[status] ?? "#94a3b8",
  }));

  const totalMens = (mensalidades ?? []).reduce((acc, m) => acc + Number(m.valor), 0);
  const recebido = Array.from(mensGrupo.entries())
    .filter(([s]) => s === "pago")
    .reduce((acc, [, g]) => acc + g.total, 0);

  // ── Pipeline por estágio ──────────────────────────────────────────
  const { data: leads } = await supabase
    .from("leads")
    .select("estagio, valor_estimado");

  const pipelineGrupo = new Map<string, { count: number; valor: number }>();
  const ORDEM_PIPELINE = ["lead", "contato", "proposta", "negociacao", "fechado", "perdido"];
  ORDEM_PIPELINE.forEach((e) => pipelineGrupo.set(e, { count: 0, valor: 0 }));
  (leads ?? []).forEach((l) => {
    const g = pipelineGrupo.get(l.estagio) ?? { count: 0, valor: 0 };
    pipelineGrupo.set(l.estagio, {
      count: g.count + 1,
      valor: g.valor + Number(l.valor_estimado ?? 0),
    });
  });

  const dadosPipelineContagem = ORDEM_PIPELINE.map((e) => ({
    label: e.charAt(0).toUpperCase() + e.slice(1),
    valor: pipelineGrupo.get(e)?.count ?? 0,
    cor: CORES_ESTAGIO_PIPELINE[e],
  }));

  const taxaFechamento =
    (leads ?? []).length > 0
      ? Math.round(
          ((pipelineGrupo.get("fechado")?.count ?? 0) / (leads ?? []).length) * 100
        )
      : 0;

  // ── Tarefas por status ────────────────────────────────────────────
  const { data: tarefas } = await supabase
    .from("tarefas")
    .select("status, prioridade");

  const tarefasGrupo = new Map<string, number>();
  const ORDEM_TAREFAS = ["pendente", "em_andamento", "revisao", "concluida"];
  ORDEM_TAREFAS.forEach((s) => tarefasGrupo.set(s, 0));
  (tarefas ?? []).forEach((t) => {
    tarefasGrupo.set(t.status, (tarefasGrupo.get(t.status) ?? 0) + 1);
  });

  const dadosTarefasDonut = ORDEM_TAREFAS.map((s) => ({
    label:
      s === "pendente"
        ? "Pendente"
        : s === "em_andamento"
        ? "Em andamento"
        : s === "revisao"
        ? "Revisão"
        : "Concluída",
    valor: tarefasGrupo.get(s) ?? 0,
    cor: CORES_STATUS_TAREFA[s],
  })).filter((d) => d.valor > 0);

  const concluidas = tarefasGrupo.get("concluida") ?? 0;
  const totalTarefas = (tarefas ?? []).length;
  const taxaConclusao = totalTarefas > 0 ? Math.round((concluidas / totalTarefas) * 100) : 0;

  return (
    <div className="p-4 md:p-8 space-y-8">
      <div>
        <h1 className="text-2xl font-semibold">Relatórios</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Visão consolidada da operação
        </p>
      </div>

      {/* ── Faturamento últimos 6 meses ── */}
      <div>
        <h2 className="text-base font-semibold mb-4">Faturamento — últimos 6 meses</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-xs text-muted-foreground">Total receitas</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-xl font-semibold text-green-600">{formatMoeda(totalReceita6m)}</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-xs text-muted-foreground">Total despesas</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-xl font-semibold text-red-500">{formatMoeda(totalDespesa6m)}</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-xs text-muted-foreground">Lucro acumulado</CardTitle>
            </CardHeader>
            <CardContent>
              <p className={`text-xl font-semibold ${totalLucro6m >= 0 ? "text-blue-600" : "text-red-500"}`}>
                {formatMoeda(totalLucro6m)}
              </p>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm">Receitas por mês</CardTitle>
            </CardHeader>
            <CardContent>
              <BarChartSimples dados={dadosReceita} cor="#22c55e" formatter={formatMoeda} />
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm">Despesas por mês</CardTitle>
            </CardHeader>
            <CardContent>
              <BarChartSimples dados={dadosDespesa} cor="#ef4444" formatter={formatMoeda} />
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm">Lucro por mês</CardTitle>
            </CardHeader>
            <CardContent>
              <BarChartSimples dados={dadosLucro} formatter={formatMoeda} />
            </CardContent>
          </Card>
        </div>
      </div>

      {/* ── Mensalidades ── */}
      <div>
        <h2 className="text-base font-semibold mb-4">Mensalidades</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm">Status das mensalidades</CardTitle>
            </CardHeader>
            <CardContent>
              {dadosMensDonut.length > 0 ? (
                <DonutChartSimples dados={dadosMensDonut} />
              ) : (
                <p className="text-sm text-muted-foreground py-8 text-center">Nenhuma mensalidade cadastrada.</p>
              )}
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm">Resumo financeiro</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 pt-2">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Total em mensalidades</span>
                <span className="font-medium">{formatMoeda(totalMens)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Já recebido</span>
                <span className="font-medium text-green-600">{formatMoeda(recebido)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">A receber</span>
                <span className="font-medium text-yellow-600">
                  {formatMoeda(totalMens - recebido)}
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Mensalidades cadastradas</span>
                <span className="font-medium">{mensalidades?.length ?? 0}</span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* ── Pipeline ── */}
      <div>
        <h2 className="text-base font-semibold mb-4">Pipeline comercial</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm">Leads por estágio</CardTitle>
            </CardHeader>
            <CardContent>
              <BarChartSimples dados={dadosPipelineContagem} height={200} />
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm">Resumo do pipeline</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 pt-2">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Total de leads</span>
                <span className="font-medium">{leads?.length ?? 0}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Leads ativos</span>
                <span className="font-medium">
                  {(leads ?? []).filter((l) => !["fechado", "perdido"].includes(l.estagio)).length}
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Fechados</span>
                <span className="font-medium text-green-600">
                  {pipelineGrupo.get("fechado")?.count ?? 0}
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Taxa de fechamento</span>
                <span className="font-medium">{taxaFechamento}%</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Valor total fechado</span>
                <span className="font-medium text-green-600">
                  {formatMoeda(pipelineGrupo.get("fechado")?.valor ?? 0)}
                </span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* ── Tarefas ── */}
      <div>
        <h2 className="text-base font-semibold mb-4">Tarefas</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm">Distribuição por status</CardTitle>
            </CardHeader>
            <CardContent>
              {dadosTarefasDonut.length > 0 ? (
                <DonutChartSimples dados={dadosTarefasDonut} />
              ) : (
                <p className="text-sm text-muted-foreground py-8 text-center">Nenhuma tarefa cadastrada.</p>
              )}
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm">Resumo de tarefas</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 pt-2">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Total de tarefas</span>
                <span className="font-medium">{totalTarefas}</span>
              </div>
              {ORDEM_TAREFAS.map((s) => (
                <div key={s} className="flex justify-between text-sm">
                  <span className="text-muted-foreground capitalize">
                    {s === "em_andamento" ? "Em andamento" : s === "revisao" ? "Revisão" : s.charAt(0).toUpperCase() + s.slice(1)}
                  </span>
                  <span className="font-medium">{tarefasGrupo.get(s) ?? 0}</span>
                </div>
              ))}
              <div className="flex justify-between text-sm border-t pt-2">
                <span className="text-muted-foreground">Taxa de conclusão</span>
                <span className="font-medium text-green-600">{taxaConclusao}%</span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
