import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { TrendingUp, TrendingDown, Calendar, AlertTriangle, Target } from "lucide-react";
import { DesempenhoEvolucao } from "@/components/charts/desempenho-evolucao";
import { construirSerieDiaria } from "@/lib/desempenho";
import { formatNumero, formatMoeda } from "@/lib/formatters";
import Link from "next/link";

export default async function DashboardPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const hoje = new Date();
  const inicioMes = new Date(hoje.getFullYear(), hoje.getMonth(), 1)
    .toISOString()
    .split("T")[0];

  // Lucro e gastos do mês (financeiro da agência)
  const { data: financeiro } = await supabase
    .from("financeiro_agencia")
    .select("tipo, valor")
    .gte("data", inicioMes);

  const receitas =
    financeiro
      ?.filter((f) => f.tipo === "receita")
      .reduce((acc, f) => acc + Number(f.valor), 0) ?? 0;

  const despesas =
    financeiro
      ?.filter((f) => f.tipo === "despesa")
      .reduce((acc, f) => acc + Number(f.valor), 0) ?? 0;

  const lucro = receitas - despesas;

  // Próximos agendamentos
  const { data: agendamentos } = await supabase
    .from("agendamentos")
    .select("id, titulo, data_hora, tipo")
    .eq("status", "pendente")
    .gte("data_hora", new Date().toISOString())
    .order("data_hora", { ascending: true })
    .limit(5);

  // Evolução de engajamento e gasto (últimos 30 dias, agência inteira)
  const trintaDiasAtras = new Date();
  trintaDiasAtras.setDate(trintaDiasAtras.getDate() - 29);
  const dataInicioEvolucao = trintaDiasAtras.toISOString().split("T")[0];

  const { data: desempenhoEvolucao } = await supabase
    .from("desempenho_diario")
    .select("data, engajamento, gasto_ads")
    .gte("data", dataInicioEvolucao);

  const serieEvolucao = construirSerieDiaria(desempenhoEvolucao ?? [], 30);

  // Notificações: empresas sem dados nos últimos 7 dias
  const seteDiasAtras = new Date();
  seteDiasAtras.setDate(seteDiasAtras.getDate() - 7);
  const dataAlerta = seteDiasAtras.toISOString().split("T")[0];

  const { data: todasEmpresas } = await supabase
    .from("empresas")
    .select("id, nome")
    .eq("status", "ativo");

  const { data: empresasComDados } = await supabase
    .from("desempenho_diario")
    .select("empresa_id")
    .gte("data", dataAlerta);

  const idsComDados = new Set((empresasComDados ?? []).map((d) => d.empresa_id));
  const empresasSemDados = (todasEmpresas ?? []).filter((e) => !idsComDados.has(e.id));

  // Metas do mês — empresas com meta definida
  const { data: empresasComMeta } = await supabase
    .from("empresas")
    .select("id, nome, meta_engajamento, meta_gasto")
    .eq("status", "ativo")
    .or("meta_engajamento.gt.0,meta_gasto.gt.0");

  const { data: desempenhoMetas } = await supabase
    .from("desempenho_diario")
    .select("empresa_id, engajamento, gasto_ads")
    .gte("data", inicioMes);

  const metasPorEmpresa = new Map<string, { engajamento: number; gasto: number }>();
  (desempenhoMetas ?? []).forEach((d) => {
    const atual = metasPorEmpresa.get(d.empresa_id) ?? { engajamento: 0, gasto: 0 };
    metasPorEmpresa.set(d.empresa_id, {
      engajamento: atual.engajamento + (d.engajamento ?? 0),
      gasto: atual.gasto + Number(d.gasto_ads ?? 0),
    });
  });

  return (
    <div className="p-8 space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">Dashboard</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Visão geral da Social Advance
        </p>
      </div>

      {/* Cards de métricas */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Lucro do mês
            </CardTitle>
            <TrendingUp size={18} className="text-blue-600" />
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-semibold">{formatMoeda(lucro)}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Receitas do mês
            </CardTitle>
            <TrendingUp size={18} className="text-green-600" />
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-semibold">{formatMoeda(receitas)}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Gastos do mês
            </CardTitle>
            <TrendingDown size={18} className="text-red-600" />
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-semibold">{formatMoeda(despesas)}</p>
          </CardContent>
        </Card>
      </div>

      {/* Notificações */}
      {empresasSemDados.length > 0 && (
        <Card className="border-yellow-500/40 bg-yellow-500/5">
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-sm text-yellow-700 dark:text-yellow-400">
              <AlertTriangle size={16} />
              {empresasSemDados.length} empresa{empresasSemDados.length > 1 ? "s" : ""} sem dados nos últimos 7 dias
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {empresasSemDados.map((e) => (
                <Link key={e.id} href={`/empresas/${e.id}/desempenho/novo`}>
                  <Badge variant="outline" className="cursor-pointer hover:bg-accent">
                    {e.nome}
                  </Badge>
                </Link>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Metas do mês */}
      {empresasComMeta && empresasComMeta.length > 0 && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-base">
              <Target size={16} />
              Metas do mês
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="divide-y">
              {empresasComMeta.map((e) => {
                const atual = metasPorEmpresa.get(e.id) ?? { engajamento: 0, gasto: 0 };
                const pctEng = e.meta_engajamento > 0
                  ? Math.min(100, Math.round((atual.engajamento / e.meta_engajamento) * 100))
                  : null;
                const pctGasto = e.meta_gasto > 0
                  ? Math.min(100, Math.round((atual.gasto / Number(e.meta_gasto)) * 100))
                  : null;

                return (
                  <li key={e.id} className="py-3 space-y-2">
                    <Link
                      href={`/empresas/${e.id}`}
                      className="text-sm font-medium hover:underline"
                    >
                      {e.nome}
                    </Link>
                    {pctEng !== null && (
                      <div className="space-y-0.5">
                        <div className="flex justify-between text-xs text-muted-foreground">
                          <span>Engajamento — {formatNumero(atual.engajamento)} / {formatNumero(e.meta_engajamento)}</span>
                          <span>{pctEng}%</span>
                        </div>
                        <div className="h-1.5 w-full rounded-full bg-muted overflow-hidden">
                          <div
                            className={`h-full rounded-full ${pctEng >= 100 ? "bg-green-500" : pctEng >= 70 ? "bg-blue-500" : pctEng >= 40 ? "bg-yellow-500" : "bg-red-500"}`}
                            style={{ width: `${pctEng}%` }}
                          />
                        </div>
                      </div>
                    )}
                    {pctGasto !== null && (
                      <div className="space-y-0.5">
                        <div className="flex justify-between text-xs text-muted-foreground">
                          <span>Gasto em ads — {formatMoeda(atual.gasto)} / {formatMoeda(Number(e.meta_gasto))}</span>
                          <span>{pctGasto}%</span>
                        </div>
                        <div className="h-1.5 w-full rounded-full bg-muted overflow-hidden">
                          <div
                            className={`h-full rounded-full ${pctGasto >= 100 ? "bg-green-500" : pctGasto >= 70 ? "bg-blue-500" : pctGasto >= 40 ? "bg-yellow-500" : "bg-red-500"}`}
                            style={{ width: `${pctGasto}%` }}
                          />
                        </div>
                      </div>
                    )}
                  </li>
                );
              })}
            </ul>
          </CardContent>
        </Card>
      )}

      <DesempenhoEvolucao serie={serieEvolucao} />

      {/* Agendamentos */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <Calendar size={18} />
            Próximos agendamentos
          </CardTitle>
        </CardHeader>
        <CardContent>
          {agendamentos && agendamentos.length > 0 ? (
            <ul className="divide-y">
              {agendamentos.map((a) => (
                <li key={a.id} className="py-3 flex justify-between text-sm">
                  <span>{a.titulo}</span>
                  <span className="text-muted-foreground">
                    {new Date(a.data_hora).toLocaleString("pt-BR", {
                      day: "2-digit",
                      month: "2-digit",
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-sm text-muted-foreground">
              Nenhum agendamento pendente.
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}