"use client";

import { useMemo, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { EvolucaoLineChart } from "@/components/charts/evolucao-line-chart";
import type { LinhaDesempenho } from "@/lib/desempenho";
import { formatMoeda, formatMoedaCompacta, formatNumero } from "@/lib/formatters";

type Periodo = 7 | 30 | 90 | "custom";

const PERIODOS: { dias: Periodo; label: string }[] = [
  { dias: 7, label: "7d" },
  { dias: 30, label: "30d" },
  { dias: 90, label: "90d" },
  { dias: "custom", label: "Intervalo" },
];

export function DesempenhoEvolucao({ serie }: { serie: LinhaDesempenho[] }) {
  const [periodo, setPeriodo] = useState<Periodo>(30);
  const [dataInicio, setDataInicio] = useState("");
  const [dataFim, setDataFim] = useState("");

  const serieRecortada = useMemo(() => {
    if (periodo === "custom") {
      if (!dataInicio && !dataFim) return serie;
      return serie.filter((p) => {
        if (dataInicio && p.data < dataInicio) return false;
        if (dataFim && p.data > dataFim) return false;
        return true;
      });
    }
    return serie.slice(-periodo);
  }, [serie, periodo, dataInicio, dataFim]);

  const temEngajamento = serieRecortada.some((p) => p.engajamento > 0);
  const temGasto = serieRecortada.some((p) => p.gasto > 0);

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center gap-2 justify-between">
        <h2 className="text-lg font-medium">Evolução</h2>
        <div className="flex flex-wrap gap-1 items-center">
          {PERIODOS.map((p) => (
            <Button
              key={String(p.dias)}
              size="sm"
              variant={periodo === p.dias ? "default" : "outline"}
              onClick={() => setPeriodo(p.dias)}
            >
              {p.label}
            </Button>
          ))}
          {periodo === "custom" && (
            <div className="flex gap-1 items-center ml-1">
              <Input
                type="date"
                value={dataInicio}
                onChange={(e) => setDataInicio(e.target.value)}
                className="h-8 w-36 text-xs"
              />
              <span className="text-muted-foreground text-xs">→</span>
              <Input
                type="date"
                value={dataFim}
                onChange={(e) => setDataFim(e.target.value)}
                className="h-8 w-36 text-xs"
              />
            </div>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Engajamento
            </CardTitle>
          </CardHeader>
          <CardContent>
            {temEngajamento ? (
              <EvolucaoLineChart
                dados={serieRecortada.map((p) => ({ data: p.data, valor: p.engajamento }))}
                axisValueFormatter={formatNumero}
              />
            ) : (
              <p className="py-16 text-center text-sm text-muted-foreground">
                Sem dados no período.
              </p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Gasto em ads
            </CardTitle>
          </CardHeader>
          <CardContent>
            {temGasto ? (
              <EvolucaoLineChart
                dados={serieRecortada.map((p) => ({ data: p.data, valor: p.gasto }))}
                axisValueFormatter={formatMoedaCompacta}
                tooltipValueFormatter={formatMoeda}
              />
            ) : (
              <p className="py-16 text-center text-sm text-muted-foreground">
                Sem dados no período.
              </p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
