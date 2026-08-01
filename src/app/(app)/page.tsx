import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TrendingUp, TrendingDown, Calendar } from "lucide-react";
import { DesempenhoEvolucao } from "@/components/charts/desempenho-evolucao";
import { construirSerieDiaria } from "@/lib/desempenho";

function formatMoeda(valor: number) {
  return valor.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

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