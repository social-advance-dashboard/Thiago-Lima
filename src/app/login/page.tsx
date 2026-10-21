"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [modo, setModo] = useState<"login" | "reset">("login");
  const [resetEnviado, setResetEnviado] = useState(false);
  const router = useRouter();

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const supabase = createClient();
    const { error } = await supabase.auth.signInWithPassword({ email, password });

    if (error) {
      setError(error.message);
      setLoading(false);
      return;
    }

    router.push("/");
    router.refresh();
  }

  async function handleReset(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const supabase = createClient();
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/login/nova-senha`,
    });

    setLoading(false);
    if (error) {
      setError(error.message);
      return;
    }
    setResetEnviado(true);
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-background">
      <Card className="w-full max-w-sm">
        <CardHeader>
          <CardTitle className="text-center text-xl">Social Advance</CardTitle>
        </CardHeader>
        <CardContent>
          {modo === "login" ? (
            <form onSubmit={handleLogin} className="flex flex-col gap-4">
              <Input
                type="email"
                placeholder="Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
              <Input
                type="password"
                placeholder="Senha"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
              {error && <p className="text-sm text-red-500">{error}</p>}
              <Button type="submit" disabled={loading} className="w-full">
                {loading ? "Entrando..." : "Entrar"}
              </Button>
              <button
                type="button"
                onClick={() => { setModo("reset"); setError(null); }}
                className="text-xs text-muted-foreground hover:text-foreground text-center"
              >
                Esqueci minha senha
              </button>
            </form>
          ) : resetEnviado ? (
            <div className="flex flex-col gap-4 text-center">
              <p className="text-sm">
                Email enviado para <strong>{email}</strong>. Verifique sua caixa de entrada e clique no link para redefinir a senha.
              </p>
              <button
                type="button"
                onClick={() => { setModo("login"); setResetEnviado(false); }}
                className="text-xs text-muted-foreground hover:text-foreground"
              >
                Voltar para o login
              </button>
            </div>
          ) : (
            <form onSubmit={handleReset} className="flex flex-col gap-4">
              <p className="text-sm text-muted-foreground">
                Informe seu email e enviaremos um link para redefinir a senha.
              </p>
              <Input
                type="email"
                placeholder="Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
              {error && <p className="text-sm text-red-500">{error}</p>}
              <Button type="submit" disabled={loading} className="w-full">
                {loading ? "Enviando..." : "Enviar link"}
              </Button>
              <button
                type="button"
                onClick={() => { setModo("login"); setError(null); }}
                className="text-xs text-muted-foreground hover:text-foreground text-center"
              >
                Voltar para o login
              </button>
            </form>
          )}
        </CardContent>
      </Card>
    </div>
  );
}