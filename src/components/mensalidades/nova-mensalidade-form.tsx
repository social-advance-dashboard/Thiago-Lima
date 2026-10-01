"use client";

import { useActionState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { criarMensalidade } from "@/app/(app)/mensalidades/actions";

type Empresa = { id: string; nome: string };

export function NovaMensalidadeForm({ empresas }: { empresas: Empresa[] }) {
  const [state, action, isPending] = useActionState(criarMensalidade, { erro: "" });

  const hoje = new Date();
  const mesAtual = hoje.toISOString().slice(0, 7);
  const diaAtual = hoje.toISOString().split("T")[0];

  return (
    <form action={action} className="space-y-4">
      {state.erro && (
        <p className="text-sm text-destructive">{state.erro}</p>
      )}

      <div className="space-y-1.5">
        <Label htmlFor="empresa_id">Empresa *</Label>
        <select
          id="empresa_id"
          name="empresa_id"
          required
          className="w-full h-9 rounded-md border border-input bg-background px-3 py-1 text-sm"
        >
          <option value="">Selecione...</option>
          {empresas.map((e) => (
            <option key={e.id} value={e.id}>{e.nome}</option>
          ))}
        </select>
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="valor">Valor (R$) *</Label>
        <Input id="valor" name="valor" type="number" step="0.01" min="0" placeholder="0,00" required />
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="mes_referencia">Mês de referência *</Label>
        <Input id="mes_referencia" name="mes_referencia" type="month" defaultValue={mesAtual} required />
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="data_vencimento">Data de vencimento *</Label>
        <Input id="data_vencimento" name="data_vencimento" type="date" defaultValue={diaAtual} required />
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="observacoes">Observações</Label>
        <Textarea id="observacoes" name="observacoes" rows={2} placeholder="Opcional..." />
      </div>

      <Button type="submit" disabled={isPending} className="w-full">
        {isPending ? "Salvando..." : "Salvar mensalidade"}
      </Button>
    </form>
  );
}
