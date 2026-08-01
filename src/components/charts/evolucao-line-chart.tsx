"use client";

import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

type PontoSerie = {
  data: string;
  valor: number;
};

function formatDataCurta(data: string) {
  const [, mes, dia] = data.split("-");
  return `${dia}/${mes}`;
}

function formatNumero(valor: number) {
  return valor.toLocaleString("pt-BR");
}

function TooltipConteudo({
  active,
  payload,
  label,
  valueFormatter,
}: {
  active?: boolean;
  payload?: { value: number }[];
  label?: string;
  valueFormatter: (valor: number) => string;
}) {
  if (!active || !payload?.length) return null;

  return (
    <div className="rounded-lg border border-border bg-popover px-3 py-2 text-sm shadow-md ring-1 ring-foreground/10">
      <p className="font-medium">{valueFormatter(payload[0].value)}</p>
      <p className="text-xs text-muted-foreground">{formatDataCurta(label ?? "")}</p>
    </div>
  );
}

export function EvolucaoLineChart({
  dados,
  cor = "#378ADD",
  axisValueFormatter = formatNumero,
  tooltipValueFormatter,
}: {
  dados: PontoSerie[];
  cor?: string;
  axisValueFormatter?: (valor: number) => string;
  tooltipValueFormatter?: (valor: number) => string;
}) {
  return (
    <ResponsiveContainer width="100%" height={240}>
      <LineChart data={dados} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
        <CartesianGrid vertical={false} stroke="var(--border)" />
        <XAxis
          dataKey="data"
          tickFormatter={formatDataCurta}
          tickLine={false}
          axisLine={false}
          tick={{ fontSize: 12, fill: "var(--muted-foreground)" }}
          minTickGap={24}
        />
        <YAxis
          tickLine={false}
          axisLine={false}
          tick={{ fontSize: 12, fill: "var(--muted-foreground)" }}
          tickFormatter={axisValueFormatter}
          width={56}
        />
        <Tooltip
          cursor={{ stroke: "var(--border)", strokeWidth: 1 }}
          content={
            <TooltipConteudo
              valueFormatter={tooltipValueFormatter ?? axisValueFormatter}
            />
          }
        />
        <Line
          type="monotone"
          dataKey="valor"
          stroke={cor}
          strokeWidth={2}
          strokeLinecap="round"
          dot={false}
          activeDot={{ r: 4, strokeWidth: 2, stroke: "var(--background)" }}
          isAnimationActive={false}
        />
      </LineChart>
    </ResponsiveContainer>
  );
}
