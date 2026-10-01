"use client";

import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

type Barra = { label: string; valor: number; cor?: string };

function TooltipConteudo({
  active,
  payload,
  label,
  formatter,
}: {
  active?: boolean;
  payload?: { value: number }[];
  label?: string;
  formatter?: (v: number) => string;
}) {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-lg border border-border bg-popover px-3 py-2 text-sm shadow-md">
      <p className="font-medium">{formatter ? formatter(payload[0].value) : payload[0].value}</p>
      <p className="text-xs text-muted-foreground">{label}</p>
    </div>
  );
}

export function BarChartSimples({
  dados,
  cor = "#378ADD",
  height = 220,
  formatter,
}: {
  dados: Barra[];
  cor?: string;
  height?: number;
  formatter?: (v: number) => string;
}) {
  return (
    <ResponsiveContainer width="100%" height={height}>
      <BarChart data={dados} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
        <CartesianGrid vertical={false} stroke="var(--border)" />
        <XAxis
          dataKey="label"
          tickLine={false}
          axisLine={false}
          tick={{ fontSize: 12, fill: "var(--muted-foreground)" }}
        />
        <YAxis
          tickLine={false}
          axisLine={false}
          tick={{ fontSize: 12, fill: "var(--muted-foreground)" }}
          tickFormatter={formatter}
          width={56}
        />
        <Tooltip
          cursor={{ fill: "var(--muted)", opacity: 0.3 }}
          content={<TooltipConteudo formatter={formatter} />}
        />
        <Bar dataKey="valor" radius={[4, 4, 0, 0]} isAnimationActive={false}>
          {dados.map((d, i) => (
            <Cell key={i} fill={d.cor ?? cor} />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}
