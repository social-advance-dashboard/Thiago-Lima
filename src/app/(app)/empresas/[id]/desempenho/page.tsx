import { createClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import { ArrowLeft, Plus } from "lucide-react";
import Link from "next/link";
import { formatData, formatMoeda, formatNumero } from "@/lib/formatters";
import { DeletarDesempenhoButton } from "@/components/empresas/deletar-desempenho-button";

export default async function HistoricoDesempenhoPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();

  const { data: empresa } = await supabase
    .from("empresas")
    .select("id, nome")
    .eq("id", id)
    .single();

  if (!empresa) notFound();

  const { data: registros } = await supabase
    .from("desempenho_diario")
    .select("id, data, engajamento, gasto_ads, seguidores_novos")
    .eq("empresa_id", id)
    .order("data", { ascending: false });

  return (
    <div className="p-8 space-y-6">
      <Link
        href={`/empresas/${id}`}
        className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft size={14} />
        Voltar para {empresa.nome}
      </Link>

      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Histórico de desempenho</h1>
          <p className="text-sm text-muted-foreground mt-1">{empresa.nome}</p>
        </div>
        <Link href={`/empresas/${id}/desempenho/novo`}>
          <Button size="sm">
            <Plus size={14} />
            Novo lançamento
          </Button>
        </Link>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">
            {registros?.length ?? 0} registro{registros?.length !== 1 ? "s" : ""}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {!registros || registros.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              Nenhum dado lançado ainda.{" "}
              <Link href={`/empresas/${id}/desempenho/novo`} className="underline">
                Lançar primeiro registro
              </Link>
            </p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Data</TableHead>
                  <TableHead className="text-right">Engajamento</TableHead>
                  <TableHead className="text-right">Gasto ads</TableHead>
                  <TableHead className="text-right">Seguidores novos</TableHead>
                  <TableHead />
                </TableRow>
              </TableHeader>
              <TableBody>
                {registros.map((r) => (
                  <TableRow key={r.id}>
                    <TableCell>{formatData(r.data)}</TableCell>
                    <TableCell className="text-right">{formatNumero(r.engajamento ?? 0)}</TableCell>
                    <TableCell className="text-right">{formatMoeda(Number(r.gasto_ads ?? 0))}</TableCell>
                    <TableCell className="text-right">{formatNumero(r.seguidores_novos ?? 0)}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Link href={`/empresas/${id}/desempenho/novo?data=${r.data}`}>
                          <Button variant="ghost" size="sm">Editar</Button>
                        </Link>
                        <DeletarDesempenhoButton registroId={r.id} empresaId={id} />
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
