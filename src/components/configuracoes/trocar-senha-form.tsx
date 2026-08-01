"use client";

import { useState, useTransition } from "react";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export function TrocarSenhaForm() {
  const [novaSenha, setNovaSenha] = useState("");
  const [confirmar, setConfirmar] = useState("");
  const [mensagem, setMensagem] = useState<{ tipo: "ok" | "erro"; texto: string } | null>(null);
  const [isPending, startTransition] = useTransition();

  function submit(e: React.FormEvent) {
    e.preventDefault();
    if (novaSenha.length < 6) {
      setMensagem({ tipo: "erro", texto: "A senha deve ter pelo menos 6 caracteres." });
      return;
    }
    if (novaSenha !== confirmar) {
      setMensagem({ tipo: "erro", texto: "As senhas não coincidem." });
      return;
    }

    startTransition(async () => {
      const supabase = createClient();
      const { error } = await supabase.auth.updateUser({ password: novaSenha });
      if (error) {
        setMensagem({ tipo: "erro", texto: error.message });
      } else {
        setMensagem({ tipo: "ok", texto: "Senha alterada com sucesso!" });
        setNovaSenha("");
        setConfirmar("");
      }
    });
  }

  return (
    <form onSubmit={submit} className="space-y-4">
      <div className="space-y-1.5">
        <label className="text-sm font-medium">Nova senha</label>
        <Input
          type="password"
          value={novaSenha}
          onChange={(e) => setNovaSenha(e.target.value)}
          placeholder="Mínimo 6 caracteres"
          required
        />
      </div>
      <div className="space-y-1.5">
        <label className="text-sm font-medium">Confirmar nova senha</label>
        <Input
          type="password"
          value={confirmar}
          onChange={(e) => setConfirmar(e.target.value)}
          placeholder="Repita a senha"
          required
        />
      </div>

      {mensagem && (
        <p className={`text-sm ${mensagem.tipo === "ok" ? "text-green-600 dark:text-green-400" : "text-destructive"}`}>
          {mensagem.texto}
        </p>
      )}

      <Button type="submit" disabled={isPending}>
        {isPending ? "Alterando..." : "Alterar senha"}
      </Button>
    </form>
  );
}
