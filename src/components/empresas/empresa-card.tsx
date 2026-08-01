"use client";

import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Building2, MoreVertical, Info, FileText } from "lucide-react";
import Link from "next/link";
import { EmpresaDetalhesDialog } from "./empresa-detalhes-dialog";
import { GerarRelatorioDialog } from "./gerar-relatorio-dialog";
import type { EmpresaComDados } from "./empresas-client";

function formatMoeda(valor: number) {
  return valor.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

export function EmpresaCard({ empresa }: { empresa: EmpresaComDados }) {
  const [detalhesAbertos, setDetalhesAbertos] = useState(false);
  const [relatorioAberto, setRelatorioAberto] = useState(false);

  return (
    <>
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center gap-3 mb-3">
            <Avatar>
              {empresa.logo_url && (
                <AvatarImage src={empresa.logo_url} alt={empresa.nome} />
              )}
              <AvatarFallback>
                <Building2 size={18} />
              </AvatarFallback>
            </Avatar>
            <Link href={`/empresas/${empresa.id}`} className="flex-1 min-w-0 hover:underline">
              <p className="font-medium truncate">{empresa.nome}</p>
              <p className="text-xs text-muted-foreground capitalize">
                {empresa.segmento ?? "—"}
              </p>
            </Link>
            <Badge variant={empresa.status === "ativo" ? "default" : "secondary"}>
              {empresa.status === "ativo" ? "Ativo" : "Inativo"}
            </Badge>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon-sm">
                  <MoreVertical size={16} />
                  <span className="sr-only">Ações de {empresa.nome}</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem
                  onSelect={(e) => {
                    e.preventDefault();
                    setDetalhesAbertos(true);
                  }}
                >
                  <Info size={14} />
                  Ver detalhes
                </DropdownMenuItem>
                <DropdownMenuItem
                  onSelect={(e) => {
                    e.preventDefault();
                    setRelatorioAberto(true);
                  }}
                >
                  <FileText size={14} />
                  Gerar relatório
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
          <div className="flex justify-between text-sm pt-3 border-t">
            <span className="text-muted-foreground">Gasto ads (mês)</span>
            <span className="font-medium">{formatMoeda(empresa.gasto)}</span>
          </div>
          <div className="flex justify-between text-sm pt-2">
            <span className="text-muted-foreground">Pagamento</span>
            <Badge
              variant={
                empresa.status_pagamento === "em_dia"
                  ? "default"
                  : empresa.status_pagamento === "atrasado"
                  ? "destructive"
                  : "secondary"
              }
              className="text-xs"
            >
              {empresa.status_pagamento === "em_dia"
                ? "Em dia"
                : empresa.status_pagamento === "atrasado"
                ? "Atrasado"
                : "Cancelado"}
            </Badge>
          </div>
        </CardContent>
      </Card>

      <EmpresaDetalhesDialog
        empresa={empresa}
        open={detalhesAbertos}
        onOpenChange={setDetalhesAbertos}
      />
      <GerarRelatorioDialog
        empresa={empresa}
        open={relatorioAberto}
        onOpenChange={setRelatorioAberto}
      />
    </>
  );
}
