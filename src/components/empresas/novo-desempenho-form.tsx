"use client";

import { useActionState } from "react";
import { adicionarDesempenho } from "@/app/(app)/empresas/actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

function Campo({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1.5">
      <label className="text-sm font-medium">{label}</label>
      {children}
    </div>
  );
}

export function NovoDesempenhoForm({ empresaId }: { empresaId: string }) {
  const adicionarComId = adicionarDesempenho.bind(null, empresaId);
  const [estado, action, isPending] = useActionState(adicionarComId, { erro: "" });

  const hoje = new Date().toISOString().split("T")[0];

  return (
    <form action={action} className="space-y-5">
      <Campo label="Data *">
        <Input name="data" type="date" defaultValue={hoje} required />
      </Campo>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
        <Campo label="Engajamento">
          <Input name="engajamento" type="number" min="0" defaultValue="0" />
        </Campo>
        <Campo label="Gasto em ads (R$)">
          <Input name="gasto_ads" type="number" min="0" step="0.01" defaultValue="0" />
        </Campo>
        <Campo label="Seguidores novos">
          <Input name="seguidores_novos" type="number" min="0" defaultValue="0" />
        </Campo>
      </div>

      <p className="text-xs text-muted-foreground">
        Se já existir registro para essa data, os valores serão substituídos.
      </p>

      {estado?.erro && (
        <p className="text-sm text-destructive">{estado.erro}</p>
      )}

      <div className="flex gap-3 pt-2">
        <Button type="submit" disabled={isPending}>
          {isPending ? "Salvando..." : "Lançar desempenho"}
        </Button>
        <Button type="button" variant="outline" onClick={() => history.back()}>
          Cancelar
        </Button>
      </div>
    </form>
  );
}
