import { createClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  Building2,
  ArrowLeft,
  Pencil,
  TrendingUp,
  TrendingDown,
  Clock,
} from "lucide-react";
import { DesempenhoEvolucao } from "@/components/charts/desempenho-evolucao";
import { GerarRelatorioButton } from "@/components/empresas/gerar-relatorio-button";
import { DeletarEmpresaButton } from "@/components/empresas/deletar-empresa-button";
import { GerenciarIntegracoesWrapper } from "@/components/empresas/gerenciar-integracoes-wrapper";
import { construirSerieDiaria } from "@/lib/desempenho";
import { formatMoeda, formatNumero, formatData } from "@/lib/formatters";

const PAGAMENTO_LABEL: Record<string, string> = {
  em_dia: "Em dia",
  atrasado: "Atrasado",
  cancelado: "Cancelado",
};

const PAGAMENTO_VARIANT: Record<
  string,
  "default" | "destructive" | "secondary"
> = {
  em_dia: "default",
  atrasado: "destructive",
  cancelado: "secondary",
};

function Delta({ atual, anterior }: { atual: number; anterior: number }) {
  if (anterior === 0) return null;
  const pct = Math.round(((atual - anterior) / anterior) * 100);
  const up = pct >= 0;
  return (
    <span
      className={`mt-1 flex items-center gap-0.5 text-xs ${
        up ? "text-green-600 dark:text-green-400" : "text-red-600 dark:text-red-400"
      }`}
    >
      {up ? <TrendingUp size={11} /> : <TrendingDown size={11} />}
      {up ? "+" : ""}
      {pct}% vs mês anterior
    </span>
  );
}

function BarraMeta({
  label,
  atual,
  meta,
  formatar,
}: {
  label: string;
  atual: number;
  meta: number;
  formatar: (v: number) => string;
}) {
  const pct = meta > 0 ? Math.min(100, Math.round((atual / meta) * 100)) : 0;
  const cor =
    pct >= 100
      ? "bg-green-500"
      : pct >= 70
      ? "bg-blue-500"
      : pct >= 40
      ? "bg-yellow-500"
      : "bg-red-500";

  return (
    <div className="space-y-1">
      <div className="flex justify-between text-sm">
        <span className="text-muted-foreground">{label}</span>
        <span className="font-medium">{pct}%</span>
      </div>
      <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
        <div className={`h-full rounded-full ${cor}`} style={{ width: `${pct}%` }} />
      </div>
      <div className="flex justify-between text-xs text-muted-foreground">
        <span>{formatar(atual)}</span>
        <span>Meta: {formatar(meta)}</span>
      </div>
    </div>
  );
}

export default async function EmpresaDetalhesPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();

  const { data: empresa } = await supabase
    .from("empresas")
    .select(
      "id, nome, status, plano, segmento, logo_url, data_entrada, status_pagamento, meta_engajamento, meta_gasto, observacoes"
    )
    .eq("id", id)
    .single();

  if (!empresa) notFound();

  const { data: integracoes } = await supabase
    .from("integracoes_ads")
    .select("id, provider, status, account_name, external_account_id, last_synced_at")
    .eq("empresa_id", id);

  const hoje = new Date();
  const inicioMes = new Date(hoje.getFullYear(), hoje.getMonth(), 1)
    .toISOString()
    .split("T")[0];
  const inicioMesAnterior = new Date(
    hoje.getFullYear(),
    hoje.getMonth() - 1,
    1
  )
    .toISOString()
    .split("T")[0];

  // Query covering two months for comparativo + evolution chart
  const { data: desempenho } = await supabase
    .from("desempenho_diario")
    .select("data, engajamento, gasto_ads, seguidores_novos")
    .eq("empresa_id", id)
    .gte("data", inicioMesAnterior);

  const fimMesAnterior = new Date(hoje.getFullYear(), hoje.getMonth(), 0)
    .toISOString()
    .split("T")[0];

  const desempenhoMes = (desempenho ?? []).filter((d) => d.data >= inicioMes);
  const desempenhoAnterior = (desempenho ?? []).filter(
    (d) => d.data >= inicioMesAnterior && d.data <= fimMesAnterior
  );

  const engajamentoMes = desempenhoMes.reduce(
    (acc, d) => acc + (d.engajamento ?? 0),
    0
  );
  const gastoMes = desempenhoMes.reduce(
    (acc, d) => acc + Number(d.gasto_ads ?? 0),
    0
  );
  const seguidoresMes = desempenhoMes.reduce(
    (acc, d) => acc + (d.seguidores_novos ?? 0),
    0
  );

  const engajamentoAnterior = desempenhoAnterior.reduce(
    (acc, d) => acc + (d.engajamento ?? 0),
    0
  );
  const gastoAnterior = desempenhoAnterior.reduce(
    (acc, d) => acc + Number(d.gasto_ads ?? 0),
    0
  );
  const seguidoresAnterior = desempenhoAnterior.reduce(
    (acc, d) => acc + (d.seguidores_novos ?? 0),
    0
  );

  const serieEvolucao = construirSerieDiaria(desempenho ?? [], 30);

  const { data: historico } = await supabase
    .from("historico_alteracoes")
    .select("campo, valor_anterior, valor_novo, alterado_em")
    .eq("empresa_id", id)
    .order("alterado_em", { ascending: false })
    .limit(15);

  const metaEngajamento = empresa.meta_engajamento ?? 0;
  const metaGasto = empresa.meta_gasto ?? 0;
  const temMetas = metaEngajamento > 0 || metaGasto > 0;

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
            {empresa.logo_url && (
              <AvatarImage src={empresa.logo_url} alt={empresa.nome} />
            )}
            <AvatarFallback>
              <Building2 size={20} />
            </AvatarFallback>
          </Avatar>
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="text-2xl font-semibold">{empresa.nome}</h1>
              <Badge
                variant={empresa.status === "ativo" ? "default" : "secondary"}
              >
                {empresa.status === "ativo" ? "Ativo" : "Inativo"}
              </Badge>
              <Badge
                variant={
                  PAGAMENTO_VARIANT[empresa.status_pagamento ?? "em_dia"]
                }
              >
                {PAGAMENTO_LABEL[empresa.status_pagamento ?? "em_dia"]}
              </Badge>
            </div>
            <p className="text-sm text-muted-foreground capitalize">
              {empresa.segmento ?? "Segmento não informado"} · Plano{" "}
              {empresa.plano ?? "—"} · Cliente desde{" "}
              {formatData(empresa.data_entrada)}
            </p>
          </div>
        </div>

        <div className="flex flex-wrap gap-2">
          <Link href={`/empresas/${id}/editar`}>
            <Button variant="outline" size="sm">
              <Pencil size={14} />
              Editar
            </Button>
          </Link>
          <Link href={`/empresas/${id}/desempenho`}>
            <Button variant="outline" size="sm">
              <TrendingUp size={14} />
              Desempenho
            </Button>
          </Link>
          <GerarRelatorioButton empresa={{ id: empresa.id, nome: empresa.nome }} />
          <DeletarEmpresaButton empresaId={id} empresaNome={empresa.nome} />
        </div>
      </div>

      {/* Métricas do mês com comparativo */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Engajamento (mês)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-semibold">
              {formatNumero(engajamentoMes)}
            </p>
            <Delta atual={engajamentoMes} anterior={engajamentoAnterior} />
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
            <Delta atual={gastoMes} anterior={gastoAnterior} />
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Seguidores novos (mês)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-semibold">
              {formatNumero(seguidoresMes)}
            </p>
            <Delta atual={seguidoresMes} anterior={seguidoresAnterior} />
          </CardContent>
        </Card>
      </div>

      {/* Metas mensais */}
      {temMetas && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Metas do mês</CardTitle>
          </CardHeader>
          <CardContent className="space-y-5">
            {metaEngajamento > 0 && (
              <BarraMeta
                label="Engajamento"
                atual={engajamentoMes}
                meta={metaEngajamento}
                formatar={formatNumero}
              />
            )}
            {metaGasto > 0 && (
              <BarraMeta
                label="Gasto em ads"
                atual={gastoMes}
                meta={metaGasto}
                formatar={formatMoeda}
              />
            )}
          </CardContent>
        </Card>
      )}

      <DesempenhoEvolucao serie={serieEvolucao} />

      {/* Observações */}
      {empresa.observacoes && (
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Observações</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground whitespace-pre-wrap">
              {empresa.observacoes}
            </p>
          </CardContent>
        </Card>
      )}

      {/* Integrações */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-3">
          <CardTitle className="text-base">Integrações conectadas</CardTitle>
          <GerenciarIntegracoesWrapper
            empresaId={id}
            integracoes={integracoes ?? []}
          />
        </CardHeader>
        <CardContent>
          {integracoes && integracoes.length > 0 ? (
            <div className="flex flex-wrap gap-1.5">
              {integracoes.map((integracao, index) => (
                <Badge
                  key={`${integracao.provider}-${index}`}
                  variant={
                    integracao.status === "ativo" ? "default" : "secondary"
                  }
                  className="capitalize"
                >
                  {integracao.provider.replace("_", " ")} · {integracao.status}
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

      {/* Histórico de alterações */}
      {historico && historico.length > 0 && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-base">
              <Clock size={16} />
              Histórico de alterações
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-3">
              {historico.map((h, i) => (
                <li key={i} className="flex flex-col gap-0.5 text-sm border-b last:border-0 pb-3 last:pb-0">
                  <div className="flex items-center justify-between">
                    <span className="font-medium">{h.campo}</span>
                    <span className="text-xs text-muted-foreground">
                      {new Date(h.alterado_em).toLocaleString("pt-BR", {
                        day: "2-digit",
                        month: "2-digit",
                        year: "2-digit",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-muted-foreground text-xs">
                    <span className="line-through">{h.valor_anterior || "—"}</span>
                    <span>→</span>
                    <span className="text-foreground">{h.valor_novo || "—"}</span>
                  </div>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
