"use client";

import { useActionState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { criarLead } from "@/app/(app)/pipeline/actions";

export function NovoLeadForm() {
  const [state, action, isPending] = useActionState(criarLead, { erro: "" });

  return (
    <form action={action} className="space-y-4">
      {state.erro && <p className="text-sm text-destructive">{state.erro}</p>}

      <div className="space-y-1.5">
        <Label htmlFor="nome">Nome do contato *</Label>
        <Input id="nome" name="nome" placeholder="Ex: João Silva" required />
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="empresa">Empresa</Label>
        <Input id="empresa" name="empresa" placeholder="Nome da empresa" />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1.5">
          <Label htmlFor="email">Email</Label>
          <Input id="email" name="email" type="email" placeholder="email@exemplo.com" />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="telefone">Telefone</Label>
          <Input id="telefone" name="telefone" placeholder="(00) 00000-0000" />
        </div>
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="valor_estimado">Valor estimado (R$/mês)</Label>
        <Input id="valor_estimado" name="valor_estimado" type="number" step="0.01" min="0" placeholder="0,00" />
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="observacoes">Observações</Label>
        <Textarea id="observacoes" name="observacoes" rows={2} placeholder="Notas sobre o lead..." />
      </div>

      <Button type="submit" disabled={isPending} className="w-full">
        {isPending ? "Salvando..." : "Adicionar lead"}
      </Button>
    </form>
  );
}
