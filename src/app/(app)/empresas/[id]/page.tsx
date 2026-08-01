import { createClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Building2, ArrowLeft } from "lucide-react";
import { DesempenhoEvolucao } from "@/components/charts/desempenho-evolucao";
import { GerarRelatorioButton } from "@/components/empresas/gerar-relatorio-button";
import { construirSerieDiaria } from "@/lib/desempenho";
import { formatMoeda, formatNumero, formatData } from "@/lib/formatters";

export default async function EmpresaDetalhesPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();

  const { data: empresa } = await supabase
    .from("empresas")
    .select("id, nome, status, plano, segmento, logo_url, data_entrada")
    .eq("id", id)
    .single();

  if (!empresa) {
    notFound();
  }

  const { data: integracoes } = await supabase
    .from("integracoes_ads")
    .select("provider, status")
    .eq("empresa_id", id);

  const hoje = new Date();
  const inicioMes = new Date(hoje.getFullYear(), hoje.getMonth(), 1)
    .toISOString()
    .split("T")[0];

  const trintaDiasAtras = new Date();
  trintaDiasAtras.setDate(trintaDiasAtras.getDate() - 29);
  const dataInicioEvolucao = trintaDiasAtras.toISOString().split("T")[0];

  const { data: desempenho } = await supabase
    .from("desempenho_diario")
    .select("data, engajamento, gasto_ads, seguidores_novos")
    .eq("empresa_id", id)
    .gte("data", dataInicioEvolucao);

  const desempenhoMes = (desempenho ?? []).filter((d) => d.data >= inicioMes);

  const engajamentoMes = desempenhoMes.reduce((acc, d) => acc + (d.engajamento ?? 0), 0);
  const gastoMes = desempenhoMes.reduce((acc, d) => acc + Number(d.gasto_ads ?? 0), 0);
  const seguidoresMes = desempenhoMes.reduce(
    (acc, d) => acc + (d.seguidores_novos ?? 0),
    0
  );

  const serieEvolucao = construirSerieDiaria(desempenho ?? [], 30);

  return (
    <div className="p-8 space-y-6">
      <Link
        href="/empresas"
        className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft size={14} />
        Voltar para Empresas
      </Link>

      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-4">
          <Avatar size="lg">
            {empresa.logo_url && <AvatarImage src={empresa.logo_url} alt={empresa.nome} />}
            <AvatarFallback>
              <Building2 size={20} />
            </AvatarFallback>
          </Avatar>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-semibold">{empresa.nome}</h1>
              <Badge variant={empresa.status === "ativo" ? "default" : "secondary"}>
                {empresa.status === "ativo" ? "Ativo" : "Inativo"}
              </Badge>
            </div>
            <p className="text-sm text-muted-foreground capitalize">
              {empresa.segmento ?? "Segmento não informado"} · Plano{" "}
              {empresa.plano ?? "—"} · Cliente desde {formatData(empresa.data_entrada)}
            </p>
          </div>
        </div>

        <GerarRelatorioButton empresa={{ id: empresa.id, nome: empresa.nome }} />
      </div>

      {/* Cards de métricas */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Engajamento (mês)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-semibold">{formatNumero(engajamentoMes)}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Gasto em ads (mês)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-semibold">{formatMoeda(gastoMes)}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Seguidores novos (mês)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-semibold">{formatNumero(seguidoresMes)}</p>
          </CardContent>
        </Card>
      </div>

      <DesempenhoEvolucao serie={serieEvolucao} />

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Integrações conectadas</CardTitle>
        </CardHeader>
        <CardContent>
          {integracoes && integracoes.length > 0 ? (
            <div className="flex flex-wrap gap-1.5">
              {integracoes.map((integracao, index) => (
                <Badge
                  key={`${integracao.provider}-${index}`}
                  variant={integracao.status === "ativo" ? "default" : "secondary"}
                  className="capitalize"
                >
                  {integracao.provider} · {integracao.status}
                </Badge>
              ))}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">
              Nenhuma integração conectada ainda.
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
