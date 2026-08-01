"use client";

import { useTransition } from "react";
import { CheckCircle, XCircle, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  atualizarStatusAgendamento,
  deletarAgendamento,
} from "@/app/(app)/agendamentos/actions";

export function AgendamentoAcoes({
  id,
  status,
}: {
  id: string;
  status: string;
}) {
  const [isPending, startTransition] = useTransition();

  function concluir() {
    startTransition(() => atualizarStatusAgendamento(id, "concluido"));
  }

  function cancelar() {
    startTransition(() => atualizarStatusAgendamento(id, "cancelado"));
  }

  function deletar() {
    if (!confirm("Remover este agendamento?")) return;
    startTransition(() => deletarAgendamento(id));
  }

  return (
    <div className="flex items-center gap-1">
      {status === "pendente" && (
        <>
          <Button
            variant="ghost"
            size="icon-sm"
            onClick={concluir}
            disabled={isPending}
            className="text-muted-foreground hover:text-green-600"
            title="Concluir"
          >
            <CheckCircle size={15} />
          </Button>
          <Button
            variant="ghost"
            size="icon-sm"
            onClick={cancelar}
            disabled={isPending}
            className="text-muted-foreground hover:text-orange-600"
            title="Cancelar"
          >
            <XCircle size={15} />
          </Button>
        </>
      )}
      <Button
        variant="ghost"
        size="icon-sm"
        onClick={deletar}
        disabled={isPending}
        className="text-muted-foreground hover:text-destructive"
        title="Remover"
      >
        <Trash2 size={14} />
      </Button>
    </div>
  );
}
