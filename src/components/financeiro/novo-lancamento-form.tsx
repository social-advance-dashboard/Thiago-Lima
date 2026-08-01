"use client";

import { useActionState } from "react";
import { criarLancamento } from "@/app/(app)/financeiro/actions";
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

export function NovoLancamentoForm() {
  const [estado, action, isPending] = useActionState(
    criarLancamento,
    estadoInicial
  );

  return (
    <form action={action} className="space-y-5">
      <Campo label="Tipo" required>
        <select
          name="tipo"
          defaultValue="receita"
          className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm focus:outline-none focus:ring-1 focus:ring-ring"
        >
          <option value="receita">Receita</option>
          <option value="despesa">Despesa</option>
        </select>
      </Campo>

      <Campo label="Descrição">
        <Input
          name="descricao"
          placeholder="Ex: Mensalidade cliente ABC, Ferramenta de marketing..."
        />
      </Campo>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
        <Campo label="Valor (R$)" required>
          <Input
            name="valor"
            type="number"
            min="0.01"
            step="0.01"
            placeholder="0,00"
            required
          />
        </Campo>

        <Campo label="Data" required>
          <Input
            name="data"
            type="date"
            defaultValue={new Date().toISOString().split("T")[0]}
            required
          />
        </Campo>
      </div>

      {estado?.erro && (
        <p className="text-sm text-destructive">{estado.erro}</p>
      )}

      <div className="flex gap-3 pt-2">
        <Button type="submit" disabled={isPending}>
          {isPending ? "Salvando..." : "Adicionar lançamento"}
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
