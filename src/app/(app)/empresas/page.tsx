import { createClient } from "@/lib/supabase/server";
import { EmpresasClient } from "@/components/empresas/empresas-client";

export default async function EmpresasPage() {
  const supabase = await createClient();

  // Busca empresas
  const { data: empresas } = await supabase
    .from("empresas")
    .select("id, nome, status, plano, segmento, logo_url, data_entrada, status_pagamento")
    .order("nome", { ascending: true });

  const hoje = new Date();
  const inicioMes = new Date(hoje.getFullYear(), hoje.getMonth(), 1)
    .toISOString()
    .split("T")[0];

  // Busca desempenho do mês por empresa (para calcular engajamento e gasto)
  const { data: desempenho } = await supabase
    .from("desempenho_diario")
    .select("empresa_id, engajamento, gasto_ads")
    .gte("data", inicioMes);

  // Busca integrações de anúncios conectadas por empresa
  const { data: integracoes } = await supabase
    .from("integracoes_ads")
    .select("empresa_id, provider, status");

  // Agrupa desempenho por empresa
  const desempenhoPorEmpresa = new Map<string, { engajamento: number; gasto: number }>();

  desempenho?.forEach((d) => {
    const atual = desempenhoPorEmpresa.get(d.empresa_id) ?? {
      engajamento: 0,
      gasto: 0,
    };
    desempenhoPorEmpresa.set(d.empresa_id, {
      engajamento: atual.engajamento + (d.engajamento ?? 0),
      gasto: atual.gasto + Number(d.gasto_ads ?? 0),
    });
  });

  // Agrupa integrações por empresa
  const integracoesPorEmpresa = new Map<
    string,
    { provider: string; status: string }[]
  >();

  integracoes?.forEach((i) => {
    const atual = integracoesPorEmpresa.get(i.empresa_id) ?? [];
    atual.push({ provider: i.provider, status: i.status });
    integracoesPorEmpresa.set(i.empresa_id, atual);
  });

  const empresasComDados = (empresas ?? []).map((e) => ({
    ...e,
    status_pagamento: e.status_pagamento ?? "em_dia",
    engajamento: desempenhoPorEmpresa.get(e.id)?.engajamento ?? 0,
    gasto: desempenhoPorEmpresa.get(e.id)?.gasto ?? 0,
    integracoes: integracoesPorEmpresa.get(e.id) ?? [],
  }));

  return (
    <div className="p-8">
      <EmpresasClient empresas={empresasComDados} />
    </div>
  );
}
