import { createClient } from "@/lib/supabase/server";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

function formatMoeda(valor: number) {
  return valor.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

function labelMes(yyyyMm: string) {
  const [a, m] = yyyyMm.split("-").map(Number);
  return new Date(a, m - 1, 1).toLocaleDateString("pt-BR", {
    month: "short",
    year: "2-digit",
  });
}

export default async function PortalRelatoriosPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  const empresaId = user?.app_metadata?.empresa_id as string | undefined;

  const seisAtras = new Date();
  seisAtras.setMonth(seisAtras.getMonth() - 5);
  const dataInicio = `${seisAtras.getFullYear()}-${String(seisAtras.getMonth() + 1).padStart(2, "0")}-01`;

  const [{ data: finData }, { data: tarefasData }] = await Promise.all([
    supabase
      .from("financeiro_empresa")
      .select("tipo, valor, data")
      .gte("data", dataInicio)
      .order("data", { ascending: true }),
    supabase
      .from("tarefas")
      .select("status")
      .eq("empresa_id", empresaId ?? ""),
  ]);

  const registros = finData ?? [];
  const tarefas = tarefasData ?? [];

  // Agrupar financeiro por mês
  const porMes = new Map<string, { receitas: number; despesas: number }>();
  registros.forEach((r) => {
    const mes = r.data.slice(0, 7);
    if (!porMes.has(mes)) porMes.set(mes, { receitas: 0, despesas: 0 });
    const entry = porMes.get(mes)!;
    if (r.tipo === "receita") entry.receitas += Number(r.valor);
    else entry.despesas += Number(r.valor);
  });

  const meses = Array.from(porMes.entries()).sort(([a], [b]) =>
    a.localeCompare(b)
  );

  // Totais gerais
  const totalReceitas = registros
    .filter((r) => r.tipo === "receita")
    .reduce((s, r) => s + Number(r.valor), 0);
  const totalDespesas = registros
    .filter((r) => r.tipo === "despesa")
    .reduce((s, r) => s + Number(r.valor), 0);
  const lucro = totalReceitas - totalDespesas;

  // Stats tarefas
  const statusCount: Record<string, number> = {};
  tarefas.forEach((t) => {
    statusCount[t.status] = (statusCount[t.status] ?? 0) + 1;
  });

  // Bar chart dimensions
  const maxValor = Math.max(
    ...meses.flatMap(([, v]) => [v.receitas, v.despesas]),
    1
  );
  const BAR_H = 120;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">Relatórios</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Visão geral dos últimos 6 meses
        </p>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card>
          <CardContent className="pt-5">
            <p className="text-xs text-muted-foreground mb-1">Receitas totais</p>
            <p className="text-xl font-semibold text-green-600">
              {formatMoeda(totalReceitas)}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-5">
            <p className="text-xs text-muted-foreground mb-1">Despesas totais</p>
            <p className="text-xl font-semibold text-red-600">
              {formatMoeda(totalDespesas)}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-5">
            <p className="text-xs text-muted-foreground mb-1">Lucro líquido</p>
            <p
              className={`text-xl font-semibold ${lucro >= 0 ? "text-green-600" : "text-red-600"}`}
            >
              {formatMoeda(lucro)}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Bar chart — receitas vs despesas */}
      {meses.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-semibold">
              Receitas × Despesas por mês
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-end gap-3 overflow-x-auto pb-1">
              {meses.map(([mes, vals]) => {
                const rH = Math.round((vals.receitas / maxValor) * BAR_H);
                const dH = Math.round((vals.despesas / maxValor) * BAR_H);
                return (
                  <div key={mes} className="flex flex-col items-center gap-1 min-w-[48px]">
                    <div
                      className="flex items-end gap-0.5"
                      style={{ height: BAR_H }}
                    >
                      <div
                        className="w-4 rounded-t bg-green-500/70"
                        style={{ height: rH || 2 }}
                        title={`Receitas: ${formatMoeda(vals.receitas)}`}
                      />
                      <div
                        className="w-4 rounded-t bg-red-400/70"
                        style={{ height: dH || 2 }}
                        title={`Despesas: ${formatMoeda(vals.despesas)}`}
                      />
                    </div>
                    <span className="text-[10px] text-muted-foreground capitalize">
                      {labelMes(mes)}
                    </span>
                  </div>
                );
              })}
            </div>
            <div className="flex gap-4 mt-3">
              <span className="flex items-center gap-1 text-xs text-muted-foreground">
                <span className="w-3 h-3 rounded-sm bg-green-500/70 inline-block" />
                Receitas
              </span>
              <span className="flex items-center gap-1 text-xs text-muted-foreground">
                <span className="w-3 h-3 rounded-sm bg-red-400/70 inline-block" />
                Despesas
              </span>
            </div>
          </CardContent>
        </Card>
      )}

      {meses.length === 0 && (
        <p className="text-sm text-muted-foreground py-4 text-center">
          Nenhum registro financeiro nos últimos 6 meses.
        </p>
      )}

      {/* Tarefas stats */}
      <Card>
        <CardHeader>
          <CardTitle className="text-sm font-semibold">
            Status das tarefas
          </CardTitle>
        </CardHeader>
        <CardContent>
          {tarefas.length === 0 ? (
            <p className="text-sm text-muted-foreground">Nenhuma tarefa encontrada.</p>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              {[
                { key: "pendente", label: "Pendente" },
                { key: "em_andamento", label: "Em andamento" },
                { key: "revisao", label: "Revisão" },
                { key: "concluida", label: "Concluída" },
              ].map(({ key, label }) => (
                <div key={key} className="text-center">
                  <p className="text-2xl font-bold">
                    {statusCount[key] ?? 0}
                  </p>
                  <p className="text-xs text-muted-foreground mt-0.5">{label}</p>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Monthly breakdown table */}
      {meses.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-semibold">
              Detalhamento mensal
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b">
                    <th className="text-left px-4 py-2 text-xs font-medium text-muted-foreground">
                      Mês
                    </th>
                    <th className="text-right px-4 py-2 text-xs font-medium text-muted-foreground">
                      Receitas
                    </th>
                    <th className="text-right px-4 py-2 text-xs font-medium text-muted-foreground">
                      Despesas
                    </th>
                    <th className="text-right px-4 py-2 text-xs font-medium text-muted-foreground">
                      Lucro
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {meses.map(([mes, vals]) => {
                    const lucroMes = vals.receitas - vals.despesas;
                    return (
                      <tr key={mes} className="border-b last:border-0">
                        <td className="px-4 py-2 capitalize text-xs">
                          {labelMes(mes)}
                        </td>
                        <td className="px-4 py-2 text-right text-xs text-green-600">
                          {formatMoeda(vals.receitas)}
                        </td>
                        <td className="px-4 py-2 text-right text-xs text-red-600">
                          {formatMoeda(vals.despesas)}
                        </td>
                        <td
                          className={`px-4 py-2 text-right text-xs font-medium ${lucroMes >= 0 ? "text-green-600" : "text-red-600"}`}
                        >
                          {formatMoeda(lucroMes)}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
