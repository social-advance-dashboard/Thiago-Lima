import { createClient } from "@/lib/supabase/server";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Plus, TrendingUp, TrendingDown, DollarSign } from "lucide-react";
import { formatMoeda, formatData } from "@/lib/formatters";
import { DeletarLancamentoButton } from "@/components/financeiro/deletar-lancamento-button";
import { SeletorMes } from "@/components/financeiro/seletor-mes";

export default async function FinanceiroPage({
  searchParams,
}: {
  searchParams: Promise<{ mes?: string }>;
}) {
  const { mes } = await searchParams;
  const supabase = await createClient();

  const hoje = new Date();
  const mesSelecionado = mes ?? hoje.toISOString().slice(0, 7); // "YYYY-MM"
  const [ano, mesNum] = mesSelecionado.split("-").map(Number);
  const inicioMes = `${mesSelecionado}-01`;
  const fimMes = new Date(ano, mesNum, 0).toISOString().split("T")[0];

  const { data: lancamentos } = await supabase
    .from("financeiro_agencia")
    .select("id, tipo, valor, data, descricao")
    .gte("data", inicioMes)
    .lte("data", fimMes)
    .order("data", { ascending: false });

  const receitas =
    (lancamentos ?? [])
      .filter((l) => l.tipo === "receita")
      .reduce((acc, l) => acc + Number(l.valor), 0);

  const despesas =
    (lancamentos ?? [])
      .filter((l) => l.tipo === "despesa")
      .reduce((acc, l) => acc + Number(l.valor), 0);

  const lucro = receitas - despesas;

  // Meses para o seletor (últimos 12)
  const meses = Array.from({ length: 12 }, (_, i) => {
    const d = new Date(hoje.getFullYear(), hoje.getMonth() - i, 1);
    return d.toISOString().slice(0, 7);
  });

  function labelMes(yyyyMm: string) {
    const [a, m] = yyyyMm.split("-").map(Number);
    return new Date(a, m - 1, 1).toLocaleDateString("pt-BR", {
      month: "long",
      year: "numeric",
    });
  }

  return (
    <div className="p-8 space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Financeiro</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Receitas e despesas da agência
          </p>
        </div>

        <div className="flex items-center gap-2">
          <SeletorMes meses={meses} mesSelecionado={mesSelecionado} />

          <Link href="/financeiro/nova">
            <Button>
              <Plus size={14} />
              Novo lançamento
            </Button>
          </Link>
        </div>
      </div>

      {/* Cards de resumo */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Receitas
            </CardTitle>
            <TrendingUp size={18} className="text-green-600" />
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-semibold text-green-700 dark:text-green-400">
              {formatMoeda(receitas)}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Despesas
            </CardTitle>
            <TrendingDown size={18} className="text-red-600" />
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-semibold text-red-700 dark:text-red-400">
              {formatMoeda(despesas)}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Lucro
            </CardTitle>
            <DollarSign
              size={18}
              className={lucro >= 0 ? "text-blue-600" : "text-red-600"}
            />
          </CardHeader>
          <CardContent>
            <p
              className={`text-2xl font-semibold ${
                lucro >= 0
                  ? "text-blue-700 dark:text-blue-400"
                  : "text-red-700 dark:text-red-400"
              }`}
            >
              {formatMoeda(lucro)}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Tabela de lançamentos */}
      <Card>
        <CardContent className="pt-6">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Data</TableHead>
                <TableHead>Tipo</TableHead>
                <TableHead>Descrição</TableHead>
                <TableHead className="text-right">Valor</TableHead>
                <TableHead className="w-10" />
              </TableRow>
            </TableHeader>
            <TableBody>
              {(lancamentos ?? []).map((l) => (
                <TableRow key={l.id}>
                  <TableCell className="whitespace-nowrap">
                    {formatData(l.data)}
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant={
                        l.tipo === "receita" ? "default" : "destructive"
                      }
                    >
                      {l.tipo === "receita" ? "Receita" : "Despesa"}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {l.descricao ?? "—"}
                  </TableCell>
                  <TableCell
                    className={`text-right font-medium ${
                      l.tipo === "receita"
                        ? "text-green-700 dark:text-green-400"
                        : "text-red-700 dark:text-red-400"
                    }`}
                  >
                    {l.tipo === "receita" ? "+" : "-"}
                    {formatMoeda(Number(l.valor))}
                  </TableCell>
                  <TableCell>
                    <DeletarLancamentoButton id={l.id} />
                  </TableCell>
                </TableRow>
              ))}

              {(lancamentos ?? []).length === 0 && (
                <TableRow>
                  <TableCell
                    colSpan={5}
                    className="text-center text-muted-foreground py-8"
                  >
                    Nenhum lançamento em {labelMes(mesSelecionado)}.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
