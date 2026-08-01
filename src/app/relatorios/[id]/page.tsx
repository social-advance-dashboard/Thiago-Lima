import { createClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Building2 } from "lucide-react";
import { EvolucaoLineChart } from "@/components/charts/evolucao-line-chart";
import { formatData, formatMoeda, formatMoedaCompacta, formatNumero } from "@/lib/formatters";
import { BotaoPrint } from "@/components/relatorios/botao-print";

type RelatorioPublico = {
  relatorio: {
    id: string;
    periodo_inicio: string;
    periodo_fim: string;
    formato: "pdf" | "link" | "ambos";
    pdf_url: string | null;
  };
  empresa: {
    nome: string;
    logo_url: string | null;
    segmento: string | null;
  };
  engajamento_total: number;
  gasto_total: number;
  serie_diaria: { data: string; engajamento: number; gasto: number }[];
};

export default async function RelatorioPublicoPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();

  const { data } = await supabase.rpc("obter_relatorio_publico", {
    relatorio_id: id,
  });

  const relatorio = data as RelatorioPublico | null;

  if (!relatorio) {
    notFound();
  }

  const { relatorio: info, empresa, engajamento_total, gasto_total, serie_diaria } =
    relatorio;

  return (
    <div className="min-h-screen bg-muted/30 p-6 sm:p-10">
      <div className="mx-auto max-w-3xl space-y-6">
        <div className="flex items-center gap-4">
          <Avatar size="lg">
            {empresa.logo_url && <AvatarImage src={empresa.logo_url} alt={empresa.nome} />}
            <AvatarFallback>
              <Building2 size={20} />
            </AvatarFallback>
          </Avatar>
          <div>
            <h1 className="text-xl font-semibold">{empresa.nome}</h1>
            <p className="text-sm text-muted-foreground capitalize">
              {empresa.segmento ?? "—"} · {formatData(info.periodo_inicio)} a{" "}
              {formatData(info.periodo_fim)}
            </p>
          </div>
        </div>

        {info.formato !== "link" && (
          <p className="text-sm text-muted-foreground">
            {info.pdf_url ? (
              <>
                Download em PDF disponível{" "}
                <a href={info.pdf_url} className="underline">
                  aqui
                </a>
                .
              </>
            ) : (
              "O download em PDF deste relatório será disponibilizado em breve."
            )}
          </p>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Engajamento no período
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-semibold">{formatNumero(engajamento_total)}</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Gasto em ads no período
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-semibold">{formatMoeda(gasto_total)}</p>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Engajamento
            </CardTitle>
          </CardHeader>
          <CardContent>
            <EvolucaoLineChart
              dados={serie_diaria.map((p) => ({ data: p.data, valor: p.engajamento }))}
              axisValueFormatter={formatNumero}
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Gasto em ads
            </CardTitle>
          </CardHeader>
          <CardContent>
            <EvolucaoLineChart
              dados={serie_diaria.map((p) => ({ data: p.data, valor: p.gasto }))}
              axisValueFormatter={formatMoedaCompacta}
              tooltipValueFormatter={formatMoeda}
            />
          </CardContent>
        </Card>

        <div className="flex items-center justify-between print:hidden">
          <p className="text-xs text-muted-foreground">
            Relatório gerado pela Social Advance
          </p>
          <BotaoPrint />
        </div>
      </div>
    </div>
  );
}
