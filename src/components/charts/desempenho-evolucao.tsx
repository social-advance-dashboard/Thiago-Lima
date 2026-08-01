"use client";

import { useMemo, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { EvolucaoLineChart } from "@/components/charts/evolucao-line-chart";
import type { LinhaDesempenho } from "@/lib/desempenho";
import { formatMoeda, formatMoedaCompacta, formatNumero } from "@/lib/formatters";

const PERIODOS = [
  { dias: 7 as const, label: "7 dias" },
  { dias: 30 as const, label: "30 dias" },
];

export function DesempenhoEvolucao({ serie }: { serie: LinhaDesempenho[] }) {
  const [dias, setDias] = useState<7 | 30>(30);

  const serieRecortada = useMemo(() => serie.slice(-dias), [serie, dias]);

  const temEngajamento = serieRecortada.some((p) => p.engajamento > 0);
  const temGasto = serieRecortada.some((p) => p.gasto > 0);

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-medium">Evolução</h2>
        <div className="flex gap-1">
          {PERIODOS.map((periodo) => (
            <Button
              key={periodo.dias}
              size="sm"
              variant={dias === periodo.dias ? "default" : "outline"}
              onClick={() => setDias(periodo.dias)}
            >
              {periodo.label}
            </Button>
          ))}
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
                Sem dados de engajamento no período.
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
                Sem dados de gasto no período.
              </p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
