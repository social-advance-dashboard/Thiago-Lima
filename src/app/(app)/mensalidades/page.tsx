import { createClient } from "@/lib/supabase/server";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Plus, CheckCircle, AlertCircle, Clock, DollarSign } from "lucide-react";
import { formatMoeda, formatData } from "@/lib/formatters";
import { MensalidadeAcoes } from "@/components/mensalidades/mensalidade-acoes";

const STATUS_BADGE: Record<string, { label: string; variant: "default" | "secondary" | "destructive" | "outline" }> = {
  pago: { label: "Pago", variant: "secondary" },
  pendente: { label: "Pendente", variant: "outline" },
  atrasado: { label: "Atrasado", variant: "destructive" },
};

export default async function MensalidadesPage() {
  const supabase = await createClient();

  const { data: mensalidades } = await supabase
    .from("mensalidades")
    .select("id, valor, mes_referencia, data_vencimento, data_pagamento, status, observacoes, empresa_id, empresas(nome)")
    .order("data_vencimento", { ascending: false });

  const lista = mensalidades ?? [];

  const totalPago = lista.filter((m) => m.status === "pago").reduce((a, m) => a + Number(m.valor), 0);
  const totalPendente = lista.filter((m) => m.status === "pendente").reduce((a, m) => a + Number(m.valor), 0);
  const totalAtrasado = lista.filter((m) => m.status === "atrasado").reduce((a, m) => a + Number(m.valor), 0);

  return (
    <div className="p-8 space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Mensalidades</h1>
          <p className="text-sm text-muted-foreground mt-1">Controle de pagamentos dos clientes</p>
        </div>
        <Link href="/mensalidades/nova">
          <Button><Plus size={14} /> Nova mensalidade</Button>
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Recebido</CardTitle>
            <CheckCircle size={18} className="text-green-600" />
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-semibold text-green-700 dark:text-green-400">{formatMoeda(totalPago)}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">A receber</CardTitle>
            <Clock size={18} className="text-blue-500" />
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-semibold">{formatMoeda(totalPendente)}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Atrasado</CardTitle>
            <AlertCircle size={18} className="text-destructive" />
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-semibold text-destructive">{formatMoeda(totalAtrasado)}</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <DollarSign size={16} />
            {lista.length} mensalidade{lista.length !== 1 ? "s" : ""}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {lista.length === 0 ? (
            <p className="text-sm text-muted-foreground">Nenhuma mensalidade cadastrada ainda.</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Empresa</TableHead>
                  <TableHead>Referência</TableHead>
                  <TableHead>Vencimento</TableHead>
                  <TableHead>Pagamento</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Valor</TableHead>
                  <TableHead className="w-24" />
                </TableRow>
              </TableHeader>
              <TableBody>
                {lista.map((m) => {
                  const raw = m.empresas;
                  const empresa = (Array.isArray(raw) ? raw[0] : raw) as { nome: string } | null;
                  const s = STATUS_BADGE[m.status] ?? STATUS_BADGE.pendente;
                  return (
                    <TableRow key={m.id}>
                      <TableCell className="font-medium">
                        <Link href={`/empresas/${m.empresa_id}`} className="hover:underline">
                          {empresa?.nome ?? "—"}
                        </Link>
                      </TableCell>
                      <TableCell>{m.mes_referencia}</TableCell>
                      <TableCell>{formatData(m.data_vencimento)}</TableCell>
                      <TableCell>{m.data_pagamento ? formatData(m.data_pagamento) : "—"}</TableCell>
                      <TableCell>
                        <Badge variant={s.variant}>{s.label}</Badge>
                      </TableCell>
                      <TableCell className="text-right font-medium">{formatMoeda(Number(m.valor))}</TableCell>
                      <TableCell>
                        <MensalidadeAcoes id={m.id} status={m.status} />
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
