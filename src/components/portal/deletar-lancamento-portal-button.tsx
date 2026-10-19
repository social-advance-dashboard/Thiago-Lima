"use client";

import { useTransition } from "react";
import { Trash2 } from "lucide-react";
import { deletarLancamentoEmpresa } from "@/app/portal/financeiro/actions";

export function DeletarLancamentoPortalButton({ id }: { id: string }) {
  const [pending, startTransition] = useTransition();

  return (
    <button
      disabled={pending}
      onClick={() => {
        if (!confirm("Remover este lançamento?")) return;
        startTransition(() => deletarLancamentoEmpresa(id));
      }}
      className="p-1 rounded text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors disabled:opacity-40"
    >
      <Trash2 size={14} />
    </button>
  );
}
