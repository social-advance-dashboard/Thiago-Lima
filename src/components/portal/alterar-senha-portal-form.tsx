"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { CheckCircle } from "lucide-react";

export function AlterarSenhaPortalForm() {
  const [senhaAtual, setSenhaAtual] = useState("");
  const [novaSenha, setNovaSenha] = useState("");
  const [confirmar, setConfirmar] = useState("");
  const [erro, setErro] = useState("");
  const [sucesso, setSucesso] = useState(false);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErro("");
    setSucesso(false);

    if (novaSenha.length < 6) {
      setErro("A nova senha deve ter pelo menos 6 caracteres.");
      return;
    }
    if (novaSenha !== confirmar) {
      setErro("As senhas não coincidem.");
      return;
    }

    setLoading(true);
    const supabase = createClient();

    // Reautentica com a senha atual para confirmar a identidade
    const { data: { user } } = await supabase.auth.getUser();
    const email = user?.email;

    if (!email) {
      setErro("Sessão inválida. Faça login novamente.");
      setLoading(false);
      return;
    }

    const { error: errReauth } = await supabase.auth.signInWithPassword({
      email,
      password: senhaAtual,
    });

    if (errReauth) {
      setErro("Senha atual incorreta.");
      setLoading(false);
      return;
    }

    const { error } = await supabase.auth.updateUser({ password: novaSenha });

    setLoading(false);
    if (error) {
      setErro(error.message);
      return;
    }

    setSucesso(true);
    setSenhaAtual("");
    setNovaSenha("");
    setConfirmar("");
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-1.5">
        <label className="text-sm font-medium">Senha atual</label>
        <Input
          type="password"
          value={senhaAtual}
          onChange={(e) => setSenhaAtual(e.target.value)}
          required
        />
      </div>

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
          required
        />
      </div>

      {erro && <p className="text-sm text-destructive">{erro}</p>}

      {sucesso && (
        <div className="flex items-center gap-2 text-sm text-green-600">
          <CheckCircle size={14} /> Senha alterada com sucesso!
        </div>
      )}

      <Button type="submit" disabled={loading}>
        {loading ? "Salvando..." : "Alterar senha"}
      </Button>
    </form>
  );
}
