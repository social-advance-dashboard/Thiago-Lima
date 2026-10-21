"use client";

import { useActionState, useState } from "react";
import { criarTarefaPortal } from "@/app/portal/tarefas/actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus, X, CheckCircle } from "lucide-react";

const PRIORIDADES = [
  { value: "alta", label: "Alta" },
  { value: "media", label: "Média" },
  { value: "baixa", label: "Baixa" },
];

export function NovaTarefaForm() {
  const [aberto, setAberto] = useState(false);
  const [estado, action, isPending] = useActionState(criarTarefaPortal, {
    erro: "",
    sucesso: false,
  });

  if (estado.sucesso && aberto) setAberto(false);

  return (
    <div>
      {!aberto ? (
        <Button size="sm" onClick={() => setAberto(true)}>
          <Plus size={14} className="mr-1" /> Nova tarefa
        </Button>
      ) : (
        <div className="border rounded-lg p-4 bg-muted/30 space-y-3">
          <div className="flex items-center justify-between">
            <p className="text-sm font-semibold">Nova tarefa</p>
            <button onClick={() => setAberto(false)} className="text-muted-foreground hover:text-foreground">
              <X size={14} />
            </button>
          </div>

          <form action={action} className="space-y-3">
            <Input name="titulo" placeholder="Título da tarefa *" required />

            <div className="grid grid-cols-2 gap-2">
              <select
                name="prioridade"
                defaultValue="media"
                className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm"
              >
                {PRIORIDADES.map((p) => (
                  <option key={p.value} value={p.value}>{p.label}</option>
                ))}
              </select>

              <Input name="data_prazo" type="date" />
            </div>

            <Input name="descricao" placeholder="Descrição (opcional)" />

            {estado.erro && (
              <p className="text-xs text-destructive">{estado.erro}</p>
            )}

            <div className="flex gap-2">
              <Button type="submit" size="sm" disabled={isPending}>
                {isPending ? "Criando..." : "Criar tarefa"}
              </Button>
              <Button type="button" size="sm" variant="outline" onClick={() => setAberto(false)}>
                Cancelar
              </Button>
            </div>
          </form>
        </div>
      )}

      {estado.sucesso && (
        <p className="flex items-center gap-1 text-xs text-green-600 mt-2">
          <CheckCircle size={12} /> Tarefa criada!
        </p>
      )}
    </div>
  );
}
