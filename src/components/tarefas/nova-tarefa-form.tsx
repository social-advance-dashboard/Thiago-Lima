"use client";

import { useActionState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { criarTarefa } from "@/app/(app)/tarefas/actions";

type Empresa = { id: string; nome: string };

export function NovaTarefaForm({ empresas }: { empresas: Empresa[] }) {
  const [state, action, isPending] = useActionState(criarTarefa, { erro: "" });

  return (
    <form action={action} className="space-y-4">
      {state.erro && <p className="text-sm text-destructive">{state.erro}</p>}

      <div className="space-y-1.5">
        <Label htmlFor="titulo">Título *</Label>
        <Input id="titulo" name="titulo" placeholder="Ex: Criar artes para o mês" required />
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="empresa_id">Empresa (opcional)</Label>
        <select
          id="empresa_id"
          name="empresa_id"
          className="w-full h-9 rounded-md border border-input bg-background px-3 py-1 text-sm"
        >
          <option value="">Sem empresa</option>
          {empresas.map((e) => (
            <option key={e.id} value={e.id}>{e.nome}</option>
          ))}
        </select>
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="prioridade">Prioridade</Label>
        <select
          id="prioridade"
          name="prioridade"
          className="w-full h-9 rounded-md border border-input bg-background px-3 py-1 text-sm"
        >
          <option value="baixa">Baixa</option>
          <option value="media" selected>Média</option>
          <option value="alta">Alta</option>
        </select>
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="responsavel">Responsável</Label>
        <Input id="responsavel" name="responsavel" placeholder="Nome do responsável" />
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="data_prazo">Prazo</Label>
        <Input id="data_prazo" name="data_prazo" type="date" />
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="descricao">Descrição</Label>
        <Textarea id="descricao" name="descricao" rows={2} placeholder="Detalhes da tarefa..." />
      </div>

      <Button type="submit" disabled={isPending} className="w-full">
        {isPending ? "Salvando..." : "Criar tarefa"}
      </Button>
    </form>
  );
}
