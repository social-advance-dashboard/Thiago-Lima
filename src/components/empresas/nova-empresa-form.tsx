"use client";

import { useActionState } from "react";
import { criarEmpresa } from "@/app/(app)/empresas/actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

const estadoInicial = { erro: "" };

function Campo({
  label,
  required,
  children,
}: {
  label: string;
  required?: boolean;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-1.5">
      <label className="text-sm font-medium">
        {label}
        {required && <span className="text-destructive ml-1">*</span>}
      </label>
      {children}
    </div>
  );
}

function Select({
  name,
  defaultValue,
  children,
}: {
  name: string;
  defaultValue?: string;
  children: React.ReactNode;
}) {
  return (
    <select
      name={name}
      defaultValue={defaultValue}
      className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm focus:outline-none focus:ring-1 focus:ring-ring"
    >
      {children}
    </select>
  );
}

export function NovaEmpresaForm() {
  const [estado, action, isPending] = useActionState(criarEmpresa, estadoInicial);

  return (
    <form action={action} className="space-y-5">
      <Campo label="Nome da empresa" required>
        <Input name="nome" placeholder="Ex: Loja ABC" required />
      </Campo>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
        <Campo label="Status" required>
          <Select name="status" defaultValue="ativo">
            <option value="ativo">Ativo</option>
            <option value="inativo">Inativo</option>
          </Select>
        </Campo>

        <Campo label="Status de pagamento">
          <Select name="status_pagamento" defaultValue="em_dia">
            <option value="em_dia">Em dia</option>
            <option value="atrasado">Atrasado</option>
            <option value="cancelado">Cancelado</option>
          </Select>
        </Campo>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
        <Campo label="Segmento">
          <Input
            name="segmento"
            placeholder="Ex: e-commerce, saúde, varejo"
            list="segmentos-sugeridos"
          />
          <datalist id="segmentos-sugeridos">
            {[
              "E-commerce",
              "Saúde",
              "Educação",
              "Varejo",
              "Restaurante",
              "Beleza",
              "Tecnologia",
              "Imobiliária",
            ].map((s) => (
              <option key={s} value={s} />
            ))}
          </datalist>
        </Campo>

        <Campo label="Plano">
          <Input
            name="plano"
            placeholder="Ex: básico, premium"
            list="planos-sugeridos"
          />
          <datalist id="planos-sugeridos">
            {["Básico", "Intermediário", "Premium", "Enterprise"].map((p) => (
              <option key={p} value={p} />
            ))}
          </datalist>
        </Campo>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
        <Campo label="Meta de engajamento (mês)">
          <Input
            name="meta_engajamento"
            type="number"
            min="0"
            defaultValue={0}
            placeholder="Ex: 5000"
          />
        </Campo>
        <Campo label="Meta de gasto em ads (mês) R$">
          <Input
            name="meta_gasto"
            type="number"
            min="0"
            step="0.01"
            defaultValue={0}
            placeholder="Ex: 1500"
          />
        </Campo>
      </div>

      <Campo label="URL da logo">
        <Input name="logo_url" type="url" placeholder="https://..." />
      </Campo>

      <Campo label="Data de entrada">
        <Input name="data_entrada" type="date" />
      </Campo>

      <Campo label="Observações">
        <textarea
          name="observacoes"
          rows={3}
          placeholder="Notas internas sobre esta empresa..."
          className="flex w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-1 focus:ring-ring resize-none"
        />
      </Campo>

      {estado?.erro && (
        <p className="text-sm text-destructive">{estado.erro}</p>
      )}

      <div className="flex gap-3 pt-2">
        <Button type="submit" disabled={isPending}>
          {isPending ? "Salvando..." : "Cadastrar empresa"}
        </Button>
        <Button
          type="button"
          variant="outline"
          onClick={() => history.back()}
        >
          Cancelar
        </Button>
      </div>
    </form>
  );
}
