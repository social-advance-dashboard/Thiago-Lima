"use client";

import { useTransition } from "react";
import { CheckCircle, Trash2, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { marcarPago, marcarAtrasado, deletarMensalidade } from "@/app/(app)/mensalidades/actions";

export function MensalidadeAcoes({ id, status }: { id: string; status: string }) {
  const [isPending, startTransition] = useTransition();

  return (
    <div className="flex items-center gap-1">
      {status !== "pago" && (
        <Button
          variant="ghost"
          size="icon-sm"
          disabled={isPending}
          onClick={() => startTransition(() => marcarPago(id))}
          className="text-green-600 hover:text-green-700 hover:bg-green-50 dark:hover:bg-green-950"
          title="Marcar como pago"
        >
          <CheckCircle size={15} />
        </Button>
      )}
      {status === "pendente" && (
        <Button
          variant="ghost"
          size="icon-sm"
          disabled={isPending}
          onClick={() => startTransition(() => marcarAtrasado(id))}
          className="text-orange-500 hover:text-orange-600"
          title="Marcar como atrasado"
        >
          <AlertCircle size={15} />
        </Button>
      )}
      <Button
        variant="ghost"
        size="icon-sm"
        disabled={isPending}
        onClick={() => {
          if (!confirm("Remover esta mensalidade?")) return;
          startTransition(() => deletarMensalidade(id));
        }}
        className="text-muted-foreground hover:text-destructive"
        title="Remover"
      >
        <Trash2 size={14} />
      </Button>
    </div>
  );
}
