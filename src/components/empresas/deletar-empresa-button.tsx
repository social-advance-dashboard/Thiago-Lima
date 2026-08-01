"use client";

import { useTransition, useState } from "react";
import { deletarEmpresa } from "@/app/(app)/empresas/actions";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Trash2 } from "lucide-react";

export function DeletarEmpresaButton({
  empresaId,
  empresaNome,
}: {
  empresaId: string;
  empresaNome: string;
}) {
  const [aberto, setAberto] = useState(false);
  const [isPending, startTransition] = useTransition();

  function confirmar() {
    startTransition(() => deletarEmpresa(empresaId));
  }

  return (
    <>
      <Button
        variant="outline"
        size="sm"
        className="text-destructive hover:bg-destructive hover:text-destructive-foreground"
        onClick={() => setAberto(true)}
      >
        <Trash2 size={14} />
        Deletar empresa
      </Button>

      <Dialog open={aberto} onOpenChange={setAberto}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle>Deletar empresa</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-muted-foreground">
            Tem certeza que deseja deletar <strong>{empresaNome}</strong>? Essa ação não pode ser desfeita e removerá todos os dados associados.
          </p>
          <div className="flex gap-3 pt-2">
            <Button
              variant="destructive"
              onClick={confirmar}
              disabled={isPending}
            >
              {isPending ? "Deletando..." : "Sim, deletar"}
            </Button>
            <Button variant="outline" onClick={() => setAberto(false)}>
              Cancelar
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
