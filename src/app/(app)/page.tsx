import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  TrendingUp,
  TrendingDown,
  Calendar,
  AlertTriangle,
  Target,
  CheckSquare,
  CreditCard,
  Kanban,
  CalendarClock,
  Clock,
  DollarSign,
} from "lucide-react";
import { DesempenhoEvolucao } from "@/components/charts/desempenho-evolucao";
import { construirSerieDiaria } from "@/lib/desempenho";
import { formatNumero, formatMoeda } from "@/lib/formatters";
import Link from "next/link";

export default async function DashboardPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const hoje = new Date();
  const hojeStr = hoje.toISOString().split("T")[0];
  const em7Dias = new Date(hoje);
  em7Dias.setDate(em7Dias.getDate() + 7);
  const em7DiasStr = em7Dias.toISOString().split("T")[0];

  const inicioMes = new Date(hoje.getFullYear(), hoje.getMonth(), 1)
    .toISOString()
    .split("T")[0];

  // ── Financeiro do mês ──────────────────────────────────────────────
  const { data: financeiro } = await supabase
    .from("financeiro_agencia")
    .select("tipo, valor")
    .gte("data", inicioMes);

  const receitas =
    financeiro?.filter((f) => f.tipo === "receita").reduce((acc, f) => acc + Number(f.valor), 0) ?? 0;
  const despesas =
    financeiro?.filter((f) => f.tipo === "despesa").reduce((acc, f) => acc + Number(f.valor), 0) ?? 0;
  const lucro = receitas - despesas;

  // ── Tarefas ────────────────────────────────────────────────────────
  const { data: tarefas } = await supabase
    .from("tarefas")
    .select("id, status, data_prazo, titulo");

  const tarefasAtivas = (tarefas ?? []).filter((t) =>
    ["pendente", "em_andamento", "revisao"].includes(t.status)
  );
  const tarefasAtrasadas = tarefasAtivas.filter(
    (t) => t.data_prazo && t.data_prazo < hojeStr
  );

  // ── Pipeline ───────────────────────────────────────────────────────
  const { data: leads } = await supabase
    .from("leads")
    .select("id, estagio, valor_estimado, nome");

  const leadsAtivos = (leads ?? []).filter(
    (l) => !["fechado", "perdido"].includes(l.estagio)
  );
  const valorPipeline = leadsAtivos.reduce(
    (acc, l) => acc + Number(l.valor_estimado ?? 0),
    0
  );

  // ── Mensalidades ───────────────────────────────────────────────────
  const { data: mensalidades } = await supabase
    .from("mensalidades")
    .select("id, status, data_vencimento, valor, empresa_id, empresas(nome)");

  const mensAtrasadas = (mensalidades ?? []).filter((m) => m.status === "atrasado");
  const mensVencendo = (mensalidades ?? []).filter(
    (m) =>
      m.status === "pendente" &&
      m.data_vencimento >= hojeStr &&
      m.data_vencimento <= em7DiasStr
  );
  const totalAtrasado = mensAtrasadas.reduce((acc, m) => acc + Number(m.valor), 0);

  // ── Calendário editorial ───────────────────────────────────────────
  const { data: posts } = await supabase
    .from("calendario_editorial")
    .select("id, status, data_publicacao, titulo")
    .in("status", ["planejado", "em_producao", "aprovado"])
    .lte("data_publicacao", em7DiasStr);

  // ── Próximos agendamentos ──────────────────────────────────────────
  const { data: agendamentos } = await supabase
    .from("agendamentos")
    .select("id, titulo, data_hora, tipo")
    .eq("status", "pendente")
    .gte("data_hora", new Date().toISOString())
    .order("data_hora", { ascending: true })
    .limit(5);

  // ── Evolução (últimos 30 dias) ─────────────────────────────────────
  const trintaDiasAtras = new Date();
  trintaDiasAtras.setDate(trintaDiasAtras.getDate() - 29);
  const dataInicioEvolucao = trintaDiasAtras.toISOString().split("T")[0];

  const { data: desempenhoEvolucao } = await supabase
    .from("desempenho_diario")
    .select("data, engajamento, gasto_ads")
    .gte("data", dataInicioEvolucao);

  const serieEvolucao = construirSerieDiaria(desempenhoEvolucao ?? [], 30);

  // ── Alertas de empresas sem dados ─────────────────────────────────
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

  // ── Metas do mês ──────────────────────────────────────────────────
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

  const temAlertas =
    tarefasAtrasadas.length > 0 ||
    mensAtrasadas.length > 0 ||
    mensVencendo.length > 0;

  return (
    <div className="p-4 md:p-8 space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">Dashboard</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Visão geral da Social Advance
        </p>
      </div>

      {/* ── KPIs financeiros ── */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Lucro do mês</CardTitle>
            <DollarSign size={18} className={lucro >= 0 ? "text-blue-600" : "text-red-500"} />
          </CardHeader>
          <CardContent>
            <p className={`text-2xl font-semibold ${lucro >= 0 ? "" : "text-red-500"}`}>
              {formatMoeda(lucro)}
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              R {formatMoeda(receitas)} em receitas · R {formatMoeda(despesas)} em despesas
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Pipeline ativo</CardTitle>
            <Kanban size={18} className="text-purple-500" />
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-semibold">{leadsAtivos.length}</p>
            <p className="text-xs text-muted-foreground mt-1">
              {formatMoeda(valorPipeline)} em valor estimado
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Inadimplência</CardTitle>
            <CreditCard size={18} className="text-red-500" />
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-semibold text-red-500">{formatMoeda(totalAtrasado)}</p>
            <p className="text-xs text-muted-foreground mt-1">
              {mensAtrasadas.length} mensalidade{mensAtrasadas.length !== 1 ? "s" : ""} em atraso
            </p>
          </CardContent>
        </Card>
      </div>

      {/* ── KPIs operacionais ── */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Link href="/tarefas">
          <Card className="hover:bg-accent/50 transition-colors cursor-pointer">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Tarefas ativas</CardTitle>
              <CheckSquare size={16} className="text-blue-500" />
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-semibold">{tarefasAtivas.length}</p>
              {tarefasAtrasadas.length > 0 && (
                <p className="text-xs text-red-500 mt-1">
                  {tarefasAtrasadas.length} atrasada{tarefasAtrasadas.length > 1 ? "s" : ""}
                </p>
              )}
            </CardContent>
          </Card>
        </Link>

        <Link href="/mensalidades">
          <Card className="hover:bg-accent/50 transition-colors cursor-pointer">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Vencendo em 7d</CardTitle>
              <Clock size={16} className="text-yellow-500" />
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-semibold">{mensVencendo.length}</p>
              <p className="text-xs text-muted-foreground mt-1">mensalidades</p>
            </CardContent>
          </Card>
        </Link>

        <Link href="/calendario">
          <Card className="hover:bg-accent/50 transition-colors cursor-pointer">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Posts esta semana</CardTitle>
              <CalendarClock size={16} className="text-green-500" />
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-semibold">{posts?.length ?? 0}</p>
              <p className="text-xs text-muted-foreground mt-1">a publicar</p>
            </CardContent>
          </Card>
        </Link>

        <Link href="/relatorios">
          <Card className="hover:bg-accent/50 transition-colors cursor-pointer">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Clientes ativos</CardTitle>
              <TrendingUp size={16} className="text-blue-500" />
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-semibold">{todasEmpresas?.length ?? 0}</p>
              <p className="text-xs text-muted-foreground mt-1">empresas</p>
            </CardContent>
          </Card>
        </Link>
      </div>

      {/* ── Alertas ── */}
      {temAlertas && (
        <div className="space-y-3">
          {tarefasAtrasadas.length > 0 && (
            <Card className="border-red-500/40 bg-red-500/5">
              <CardHeader className="pb-2">
                <CardTitle className="flex items-center gap-2 text-sm text-red-600 dark:text-red-400">
                  <AlertTriangle size={16} />
                  {tarefasAtrasadas.length} tarefa{tarefasAtrasadas.length > 1 ? "s" : ""} com prazo vencido
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {tarefasAtrasadas.map((t) => (
                    <Link key={t.id} href="/tarefas">
                      <Badge variant="outline" className="cursor-pointer hover:bg-accent border-red-500/30">
                        {t.titulo}
                      </Badge>
                    </Link>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {mensAtrasadas.length > 0 && (
            <Card className="border-orange-500/40 bg-orange-500/5">
              <CardHeader className="pb-2">
                <CardTitle className="flex items-center gap-2 text-sm text-orange-600 dark:text-orange-400">
                  <AlertTriangle size={16} />
                  {mensAtrasadas.length} mensalidade{mensAtrasadas.length > 1 ? "s" : ""} em atraso —{" "}
                  {formatMoeda(totalAtrasado)}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {mensAtrasadas.map((m) => {
                    const raw = m.empresas;
                    const empresa = (Array.isArray(raw) ? raw[0] : raw) as { nome: string } | null;
                    return (
                      <Link key={m.id} href="/mensalidades">
                        <Badge variant="outline" className="cursor-pointer hover:bg-accent border-orange-500/30">
                          {empresa?.nome ?? "—"} · {formatMoeda(Number(m.valor))}
                        </Badge>
                      </Link>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          )}

          {mensVencendo.length > 0 && (
            <Card className="border-yellow-500/40 bg-yellow-500/5">
              <CardHeader className="pb-2">
                <CardTitle className="flex items-center gap-2 text-sm text-yellow-700 dark:text-yellow-400">
                  <Clock size={16} />
                  {mensVencendo.length} mensalidade{mensVencendo.length > 1 ? "s" : ""} vencendo nos próximos 7 dias
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {mensVencendo.map((m) => {
                    const raw = m.empresas;
                    const empresa = (Array.isArray(raw) ? raw[0] : raw) as { nome: string } | null;
                    return (
                      <Link key={m.id} href="/mensalidades">
                        <Badge variant="outline" className="cursor-pointer hover:bg-accent border-yellow-500/30">
                          {empresa?.nome ?? "—"} · {m.data_vencimento}
                        </Badge>
                      </Link>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      )}

      {/* ── Alertas de empresas sem dados ── */}
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

      {/* ── Metas do mês ── */}
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
                const pctEng =
                  e.meta_engajamento > 0
                    ? Math.min(100, Math.round((atual.engajamento / e.meta_engajamento) * 100))
                    : null;
                const pctGasto =
                  e.meta_gasto > 0
                    ? Math.min(100, Math.round((atual.gasto / Number(e.meta_gasto)) * 100))
                    : null;

                return (
                  <li key={e.id} className="py-3 space-y-2">
                    <Link href={`/empresas/${e.id}`} className="text-sm font-medium hover:underline">
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

      {/* ── Próximos agendamentos ── */}
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
            <p className="text-sm text-muted-foreground">Nenhum agendamento pendente.</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
