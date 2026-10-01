"use client";

import { useActionState } from "react";
import { criarLancamento } from "@/app/(app)/financeiro/actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useRef } from "react";

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

  const tipoRef = useRef<HTMLInputElement>(null);
  const categoriaRef = useRef<HTMLInputElement>(null);

  return (
    <form action={action} className="space-y-5">
      {/* hidden inputs para o server action receber os valores */}
      <input ref={tipoRef} type="hidden" name="tipo" defaultValue="receita" />
      <input ref={categoriaRef} type="hidden" name="categoria" defaultValue="mensalidade" />

      <Campo label="Tipo" required>
        <Select
          defaultValue="receita"
          onValueChange={(v) => { if (tipoRef.current) tipoRef.current.value = v; }}
        >
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="receita">Receita</SelectItem>
            <SelectItem value="despesa">Despesa</SelectItem>
          </SelectContent>
        </Select>
      </Campo>

      <Campo label="Categoria" required>
        <Select
          defaultValue="mensalidade"
          onValueChange={(v) => { if (categoriaRef.current) categoriaRef.current.value = v; }}
        >
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="mensalidade">Mensalidade</SelectItem>
            <SelectItem value="servico">Serviço avulso</SelectItem>
            <SelectItem value="ferramenta">Ferramenta / Software</SelectItem>
            <SelectItem value="salario">Salário / Freelancer</SelectItem>
            <SelectItem value="imposto">Imposto / Tarifa</SelectItem>
            <SelectItem value="marketing">Marketing / Ads</SelectItem>
            <SelectItem value="outros">Outros</SelectItem>
          </SelectContent>
        </Select>
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
