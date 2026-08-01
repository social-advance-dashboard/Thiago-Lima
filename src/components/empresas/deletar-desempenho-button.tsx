"use client";

import { useTransition } from "react";
import { deletarDesempenho } from "@/app/(app)/empresas/actions";
import { Button } from "@/components/ui/button";

export function DeletarDesempenhoButton({
  registroId,
  empresaId,
}: {
  registroId: string;
  empresaId: string;
}) {
  const [isPending, startTransition] = useTransition();

  return (
    <Button
      variant="ghost"
      size="sm"
      className="text-destructive hover:text-destructive"
      disabled={isPending}
      onClick={() =>
        startTransition(() => deletarDesempenho(registroId, empresaId))
      }
    >
      {isPending ? "..." : "Apagar"}
    </Button>
  );
}
