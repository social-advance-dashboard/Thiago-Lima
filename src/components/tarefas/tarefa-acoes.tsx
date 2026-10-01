"use client";

import { useTransition } from "react";
import { ChevronRight, ChevronLeft, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { moverStatusTarefa, deletarTarefa } from "@/app/(app)/tarefas/actions";

const ORDEM = ["pendente", "em_andamento", "revisao", "concluida"];

export function TarefaAcoes({ id, status }: { id: string; status: string }) {
  const [isPending, startTransition] = useTransition();
  const idx = ORDEM.indexOf(status);

  return (
    <div className="flex items-center gap-0.5">
      {idx > 0 && (
        <Button
          variant="ghost"
          size="icon-sm"
          disabled={isPending}
          onClick={() => startTransition(() => moverStatusTarefa(id, ORDEM[idx - 1]))}
          title="Voltar"
        >
          <ChevronLeft size={14} />
        </Button>
      )}
      {idx < ORDEM.length - 1 && (
        <Button
          variant="ghost"
          size="icon-sm"
          disabled={isPending}
          onClick={() => startTransition(() => moverStatusTarefa(id, ORDEM[idx + 1]))}
          title="Avançar"
        >
          <ChevronRight size={14} />
        </Button>
      )}
      <Button
        variant="ghost"
        size="icon-sm"
        disabled={isPending}
        onClick={() => {
          if (!confirm("Remover tarefa?")) return;
          startTransition(() => deletarTarefa(id));
        }}
        className="text-muted-foreground hover:text-destructive"
      >
        <Trash2 size={13} />
      </Button>
    </div>
  );
}
