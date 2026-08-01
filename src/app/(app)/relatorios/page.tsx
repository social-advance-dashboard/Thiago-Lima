import { createClient } from "@/lib/supabase/server";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { formatData } from "@/lib/formatters";
import { ExternalLink } from "lucide-react";
import Link from "next/link";

export default async function RelatoriosPage() {
  const supabase = await createClient();

  const { data: relatorios } = await supabase
    .from("relatorios")
    .select("id, periodo_inicio, periodo_fim, formato, link_publico, created_at, empresa_id, empresas(nome)")
    .order("created_at", { ascending: false });

  return (
    <div className="p-8 space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">Relatórios</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Histórico de todos os relatórios gerados
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">
            {relatorios?.length ?? 0} relatório{relatorios?.length !== 1 ? "s" : ""}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {!relatorios || relatorios.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              Nenhum relatório gerado ainda. Acesse uma empresa e clique em &quot;Gerar relatório&quot;.
            </p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Empresa</TableHead>
                  <TableHead>Período</TableHead>
                  <TableHead>Formato</TableHead>
                  <TableHead>Gerado em</TableHead>
                  <TableHead>Link</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {relatorios.map((r) => {
                  const raw = r.empresas;
                  const empresa = (Array.isArray(raw) ? raw[0] : raw) as { nome: string } | null;
                  return (
                    <TableRow key={r.id}>
                      <TableCell className="font-medium">
                        <Link
                          href={`/empresas/${r.empresa_id}`}
                          className="hover:underline"
                        >
                          {empresa?.nome ?? "—"}
                        </Link>
                      </TableCell>
                      <TableCell>
                        {formatData(r.periodo_inicio)} → {formatData(r.periodo_fim)}
                      </TableCell>
                      <TableCell>
                        <Badge variant="secondary" className="capitalize">
                          {r.formato}
                        </Badge>
                      </TableCell>
                      <TableCell>{formatData(r.created_at)}</TableCell>
                      <TableCell>
                        {r.link_publico ? (
                          <a
                            href={r.link_publico}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 text-sm text-[#378ADD] hover:underline"
                          >
                            Abrir <ExternalLink size={12} />
                          </a>
                        ) : (
                          <span className="text-muted-foreground text-sm">—</span>
                        )}
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
