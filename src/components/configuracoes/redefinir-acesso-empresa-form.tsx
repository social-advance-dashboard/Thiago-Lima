"use client";

import { useActionState } from "react";
import { redefinirAcessoEmpresa } from "@/app/(app)/configuracoes/actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { CheckCircle } from "lucide-react";

const estadoInicial = { erro: "", sucesso: false };

export function RedefinirAcessoEmpresaForm() {
  const [estado, action, isPending] = useActionState(
    redefinirAcessoEmpresa,
    estadoInicial
  );

  return (
    <form action={action} className="space-y-4">
      <div className="space-y-1.5">
        <label className="text-sm font-medium">
          Email da empresa <span className="text-destructive">*</span>
        </label>
        <Input
          name="email"
          type="email"
          placeholder="email@empresa.com"
          required
        />
      </div>

      <div className="space-y-1.5">
        <label className="text-sm font-medium">
          Nova senha <span className="text-destructive">*</span>
        </label>
        <Input
          name="nova_senha"
          type="password"
          placeholder="Mínimo 6 caracteres"
          minLength={6}
          required
        />
      </div>

      {estado.erro && (
        <p className="text-sm text-destructive">{estado.erro}</p>
      )}

      {estado.sucesso && (
        <div className="flex items-center gap-2 text-sm text-green-600">
          <CheckCircle size={14} />
          Senha atualizada! A empresa já pode entrar com a nova senha.
        </div>
      )}

      <Button type="submit" variant="outline" disabled={isPending}>
        {isPending ? "Atualizando..." : "Redefinir senha"}
      </Button>
    </form>
  );
}
