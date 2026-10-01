"use client";

import { useActionState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { criarMembro } from "@/app/(app)/equipe/actions";

export function NovoMembroForm() {
  const [state, action, isPending] = useActionState(criarMembro, { erro: "" });

  return (
    <form action={action} className="space-y-4">
      {state.erro && <p className="text-sm text-destructive">{state.erro}</p>}

      <div className="space-y-1.5">
        <Label htmlFor="nome">Nome *</Label>
        <Input id="nome" name="nome" placeholder="Nome completo" required />
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="cargo">Cargo</Label>
        <Input id="cargo" name="cargo" placeholder="Ex: Social Media, Designer..." />
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="email">Email</Label>
        <Input id="email" name="email" type="email" placeholder="email@exemplo.com" />
      </div>

      <Button type="submit" disabled={isPending} className="w-full">
        {isPending ? "Salvando..." : "Adicionar membro"}
      </Button>
    </form>
  );
}
