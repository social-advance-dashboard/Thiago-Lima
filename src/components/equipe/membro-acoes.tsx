"use client";

import { useTransition } from "react";
import { Trash2, UserCheck, UserX } from "lucide-react";
import { Button } from "@/components/ui/button";
import { alterarStatusMembro, deletarMembro } from "@/app/(app)/equipe/actions";

export function MembroAcoes({ id, status }: { id: string; status: string }) {
  const [isPending, startTransition] = useTransition();

  return (
    <div className="flex items-center gap-1">
      <Button
        variant="ghost"
        size="icon-sm"
        disabled={isPending}
        onClick={() =>
          startTransition(() =>
            alterarStatusMembro(id, status === "ativo" ? "inativo" : "ativo")
          )
        }
        className={status === "ativo" ? "text-muted-foreground hover:text-orange-500" : "text-muted-foreground hover:text-green-600"}
        title={status === "ativo" ? "Desativar" : "Reativar"}
      >
        {status === "ativo" ? <UserX size={14} /> : <UserCheck size={14} />}
      </Button>
      <Button
        variant="ghost"
        size="icon-sm"
        disabled={isPending}
        onClick={() => {
          if (!confirm("Remover membro?")) return;
          startTransition(() => deletarMembro(id));
        }}
        className="text-muted-foreground hover:text-destructive"
      >
        <Trash2 size={14} />
      </Button>
    </div>
  );
}
