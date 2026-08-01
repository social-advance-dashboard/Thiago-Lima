"use client";

import { useMemo, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Search, ArrowUpDown, Filter, Plus } from "lucide-react";
import Link from "next/link";
import { EmpresaCard } from "./empresa-card";

export type EmpresaComDados = {
  id: string;
  nome: string;
  status: string;
  plano: string | null;
  segmento: string | null;
  logo_url: string | null;
  data_entrada: string | null;
  engajamento: number;
  gasto: number;
  integracoes: { provider: string; status: string }[];
};

type FiltroStatus = "todos" | "ativo" | "inativo";
type Ordenacao = "nome" | "engajamento";

const LABEL_STATUS: Record<FiltroStatus, string> = {
  todos: "Todos os status",
  ativo: "Ativas",
  inativo: "Inativas",
};

const LABEL_ORDENACAO: Record<Ordenacao, string> = {
  nome: "Nome (A-Z)",
  engajamento: "Engajamento (maior primeiro)",
};

export function EmpresasClient({ empresas }: { empresas: EmpresaComDados[] }) {
  const [busca, setBusca] = useState("");
  const [filtroStatus, setFiltroStatus] = useState<FiltroStatus>("todos");
  const [ordenacao, setOrdenacao] = useState<Ordenacao>("nome");

  const empresasFiltradas = useMemo(() => {
    const termo = busca.trim().toLowerCase();

    const filtradas = empresas.filter((empresa) => {
      const combinaBusca = termo === "" || empresa.nome.toLowerCase().includes(termo);
      const combinaStatus = filtroStatus === "todos" || empresa.status === filtroStatus;
      return combinaBusca && combinaStatus;
    });

    const ordenadas = [...filtradas].sort((a, b) => {
      if (ordenacao === "engajamento") {
        return b.engajamento - a.engajamento;
      }
      return a.nome.localeCompare(b.nome, "pt-BR");
    });

    return ordenadas;
  }, [empresas, busca, filtroStatus, ordenacao]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Empresas</h1>
          <p className="text-sm text-muted-foreground mt-1">
            {empresasFiltradas.length} de {empresas.length} empresa
            {empresas.length !== 1 && "s"}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <Link href="/empresas/nova">
            <Button>
              <Plus size={14} />
              Nova empresa
            </Button>
          </Link>

          <div className="relative">
            <Search
              size={16}
              className="pointer-events-none absolute left-2.5 top-1/2 -translate-y-1/2 text-muted-foreground"
            />
            <Input
              placeholder="Buscar empresa..."
              value={busca}
              onChange={(e) => setBusca(e.target.value)}
              className="max-w-xs pl-8"
            />
          </div>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="default">
                <Filter size={14} />
                {LABEL_STATUS[filtroStatus]}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuRadioGroup
                value={filtroStatus}
                onValueChange={(valor) => setFiltroStatus(valor as FiltroStatus)}
              >
                {(Object.keys(LABEL_STATUS) as FiltroStatus[]).map((status) => (
                  <DropdownMenuRadioItem key={status} value={status}>
                    {LABEL_STATUS[status]}
                  </DropdownMenuRadioItem>
                ))}
              </DropdownMenuRadioGroup>
            </DropdownMenuContent>
          </DropdownMenu>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="default">
                <ArrowUpDown size={14} />
                {LABEL_ORDENACAO[ordenacao]}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuRadioGroup
                value={ordenacao}
                onValueChange={(valor) => setOrdenacao(valor as Ordenacao)}
              >
                {(Object.keys(LABEL_ORDENACAO) as Ordenacao[]).map((opcao) => (
                  <DropdownMenuRadioItem key={opcao} value={opcao}>
                    {LABEL_ORDENACAO[opcao]}
                  </DropdownMenuRadioItem>
                ))}
              </DropdownMenuRadioGroup>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {empresasFiltradas.map((empresa) => (
          <EmpresaCard key={empresa.id} empresa={empresa} />
        ))}

        {empresasFiltradas.length === 0 && (
          <p className="text-sm text-muted-foreground col-span-full">
            {empresas.length === 0
              ? "Nenhuma empresa cadastrada ainda."
              : "Nenhuma empresa encontrada com esses filtros."}
          </p>
        )}
      </div>

      {/* Tabela */}
      <Card>
        <CardContent className="pt-6">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nome</TableHead>
                <TableHead>Segmento</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Plano</TableHead>
                <TableHead className="text-right">Engajamento (mês)</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {empresasFiltradas.map((empresa) => (
                <TableRow key={empresa.id}>
                  <TableCell className="font-medium">
                    <Link href={`/empresas/${empresa.id}`} className="hover:underline">
                      {empresa.nome}
                    </Link>
                  </TableCell>
                  <TableCell className="capitalize">
                    {empresa.segmento ?? "—"}
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant={
                        empresa.status === "ativo" ? "default" : "secondary"
                      }
                    >
                      {empresa.status === "ativo" ? "Ativo" : "Inativo"}
                    </Badge>
                  </TableCell>
                  <TableCell className="capitalize">
                    {empresa.plano ?? "—"}
                  </TableCell>
                  <TableCell className="text-right">
                    {empresa.engajamento.toLocaleString("pt-BR")}
                  </TableCell>
                </TableRow>
              ))}

              {empresasFiltradas.length === 0 && (
                <TableRow>
                  <TableCell colSpan={5} className="text-center text-muted-foreground">
                    Nenhuma empresa encontrada com esses filtros.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
