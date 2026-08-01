"use client";

import { useRouter } from "next/navigation";

function labelMes(yyyyMm: string) {
  const [a, m] = yyyyMm.split("-").map(Number);
  return new Date(a, m - 1, 1).toLocaleDateString("pt-BR", {
    month: "long",
    year: "numeric",
  });
}

export function SeletorMes({
  meses,
  mesSelecionado,
}: {
  meses: string[];
  mesSelecionado: string;
}) {
  const router = useRouter();

  return (
    <select
      value={mesSelecionado}
      onChange={(e) => router.push(`/financeiro?mes=${e.target.value}`)}
      className="h-9 rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm focus:outline-none focus:ring-1 focus:ring-ring"
    >
      {meses.map((m) => (
        <option key={m} value={m}>
          {labelMes(m)}
        </option>
      ))}
    </select>
  );
}
