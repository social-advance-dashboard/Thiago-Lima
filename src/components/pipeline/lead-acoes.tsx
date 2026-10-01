"use client";

import { useTransition } from "react";
import { ChevronRight, ChevronLeft, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { moverEstagioLead, deletarLead } from "@/app/(app)/pipeline/actions";

const ESTAGIOS = ["lead", "contato", "proposta", "negociacao", "fechado"];

export function LeadAcoes({ id, estagio }: { id: string; estagio: string }) {
  const [isPending, startTransition] = useTransition();
  const idx = ESTAGIOS.indexOf(estagio);
  const isPerdido = estagio === "perdido";

  return (
    <div className="flex items-center gap-0.5">
      {!isPerdido && idx > 0 && (
        <Button
          variant="ghost"
          size="icon-sm"
          disabled={isPending}
          onClick={() => startTransition(() => moverEstagioLead(id, ESTAGIOS[idx - 1]))}
          title="Voltar estágio"
        >
          <ChevronLeft size={14} />
        </Button>
      )}
      {!isPerdido && idx < ESTAGIOS.length - 1 && (
        <Button
          variant="ghost"
          size="icon-sm"
          disabled={isPending}
          onClick={() => startTransition(() => moverEstagioLead(id, ESTAGIOS[idx + 1]))}
          title="Avançar estágio"
        >
          <ChevronRight size={14} />
        </Button>
      )}
      {!isPerdido && estagio !== "fechado" && (
        <Button
          variant="ghost"
          size="icon-sm"
          disabled={isPending}
          onClick={() => startTransition(() => moverEstagioLead(id, "perdido"))}
          className="text-muted-foreground hover:text-destructive text-xs px-1.5 h-7"
          title="Marcar como perdido"
        >
          ✕
        </Button>
      )}
      <Button
        variant="ghost"
        size="icon-sm"
        disabled={isPending}
        onClick={() => {
          if (!confirm("Remover lead?")) return;
          startTransition(() => deletarLead(id));
        }}
        className="text-muted-foreground hover:text-destructive"
      >
        <Trash2 size={13} />
      </Button>
    </div>
  );
}
