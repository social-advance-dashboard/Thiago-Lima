"use client";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Building2, ArrowUpRight } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import type { EmpresaComDados } from "./empresas-client";
import { formatMoeda, formatData } from "@/lib/formatters";

export function EmpresaDetalhesDialog({
  empresa,
  open,
  onOpenChange,
}: {
  empresa: EmpresaComDados;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <div className="flex items-center gap-3">
            <Avatar size="lg">
              {empresa.logo_url && <AvatarImage src={empresa.logo_url} alt={empresa.nome} />}
              <AvatarFallback>
                <Building2 size={18} />
              </AvatarFallback>
            </Avatar>
            <div>
              <DialogTitle>{empresa.nome}</DialogTitle>
              <DialogDescription className="capitalize">
                {empresa.segmento ?? "Segmento não informado"}
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <dl className="grid grid-cols-2 gap-3 text-sm">
          <div>
            <dt className="text-muted-foreground">Status</dt>
            <dd className="mt-0.5">
              <Badge variant={empresa.status === "ativo" ? "default" : "secondary"}>
                {empresa.status === "ativo" ? "Ativo" : "Inativo"}
              </Badge>
            </dd>
          </div>
          <div>
            <dt className="text-muted-foreground">Plano</dt>
            <dd className="mt-0.5 font-medium capitalize">{empresa.plano ?? "—"}</dd>
          </div>
          <div>
            <dt className="text-muted-foreground">Cliente desde</dt>
            <dd className="mt-0.5 font-medium">{formatData(empresa.data_entrada)}</dd>
          </div>
          <div>
            <dt className="text-muted-foreground">Engajamento (mês)</dt>
            <dd className="mt-0.5 font-medium">
              {empresa.engajamento.toLocaleString("pt-BR")}
            </dd>
          </div>
          <div className="col-span-2">
            <dt className="text-muted-foreground">Gasto em ads (mês)</dt>
            <dd className="mt-0.5 font-medium">{formatMoeda(empresa.gasto)}</dd>
          </div>
        </dl>

        <div>
          <p className="text-sm text-muted-foreground mb-1.5">Integrações conectadas</p>
          {empresa.integracoes.length === 0 ? (
            <p className="text-sm text-muted-foreground">Nenhuma integração conectada ainda.</p>
          ) : (
            <div className="flex flex-wrap gap-1.5">
              {empresa.integracoes.map((integracao, index) => (
                <Badge
                  key={`${integracao.provider}-${index}`}
                  variant={integracao.status === "ativo" ? "default" : "secondary"}
                  className="capitalize"
                >
                  {integracao.provider} · {integracao.status}
                </Badge>
              ))}
            </div>
          )}
        </div>

        <DialogFooter>
          <Button asChild variant="outline">
            <Link href={`/empresas/${empresa.id}`} onClick={() => onOpenChange(false)}>
              Ver página completa
              <ArrowUpRight size={14} />
            </Link>
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
