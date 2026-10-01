"use client";

import { useTransition } from "react";
import { ChevronRight, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { atualizarStatusPost, deletarPost } from "@/app/(app)/calendario/actions";

const ORDEM = ["planejado", "em_producao", "aprovado", "publicado"];
const LABEL_PROXIMO: Record<string, string> = {
  planejado: "Em produção",
  em_producao: "Aprovado",
  aprovado: "Publicado",
};

export function PostAcoes({ id, status }: { id: string; status: string }) {
  const [isPending, startTransition] = useTransition();
  const idx = ORDEM.indexOf(status);
  const proximo = idx < ORDEM.length - 1 ? ORDEM[idx + 1] : null;

  return (
    <div className="flex items-center gap-1">
      {proximo && status !== "cancelado" && (
        <Button
          variant="ghost"
          size="sm"
          disabled={isPending}
          onClick={() => startTransition(() => atualizarStatusPost(id, proximo))}
          className="text-xs h-7 gap-1"
        >
          <ChevronRight size={12} />
          {LABEL_PROXIMO[status]}
        </Button>
      )}
      <Button
        variant="ghost"
        size="icon-sm"
        disabled={isPending}
        onClick={() => {
          if (!confirm("Remover post do calendário?")) return;
          startTransition(() => deletarPost(id));
        }}
        className="text-muted-foreground hover:text-destructive"
      >
        <Trash2 size={13} />
      </Button>
    </div>
  );
}
