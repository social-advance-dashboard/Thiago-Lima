"use client";

import { useTransition } from "react";
import { Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { deletarLancamento } from "@/app/(app)/financeiro/actions";

export function DeletarLancamentoButton({ id }: { id: string }) {
  const [isPending, startTransition] = useTransition();

  function handleClick() {
    if (!confirm("Remover este lançamento?")) return;
    startTransition(() => deletarLancamento(id));
  }

  return (
    <Button
      variant="ghost"
      size="icon-sm"
      onClick={handleClick}
      disabled={isPending}
      className="text-muted-foreground hover:text-destructive"
    >
      <Trash2 size={14} />
      <span className="sr-only">Remover lançamento</span>
    </Button>
  );
}
