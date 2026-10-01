"use client";

import {
  Cell,
  Legend,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
} from "recharts";

type Fatia = { label: string; valor: number; cor: string };

export function DonutChartSimples({ dados, height = 220 }: { dados: Fatia[]; height?: number }) {
  const total = dados.reduce((acc, d) => acc + d.valor, 0);

  return (
    <ResponsiveContainer width="100%" height={height}>
      <PieChart>
        <Pie
          data={dados}
          dataKey="valor"
          nameKey="label"
          cx="50%"
          cy="50%"
          innerRadius="55%"
          outerRadius="75%"
          paddingAngle={2}
          isAnimationActive={false}
        >
          {dados.map((d, i) => (
            <Cell key={i} fill={d.cor} />
          ))}
        </Pie>
        <Tooltip
          formatter={(value: number) => [
            `${value} (${total > 0 ? Math.round((value / total) * 100) : 0}%)`,
          ]}
          contentStyle={{
            background: "var(--popover)",
            border: "1px solid var(--border)",
            borderRadius: 8,
            fontSize: 13,
          }}
        />
        <Legend
          iconType="circle"
          iconSize={8}
          formatter={(value) => (
            <span style={{ fontSize: 12, color: "var(--muted-foreground)" }}>{value}</span>
          )}
        />
      </PieChart>
    </ResponsiveContainer>
  );
}
