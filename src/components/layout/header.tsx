"use client";

import { useState, useEffect, useRef, useTransition } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";

type Resultado = { id: string; nome: string; segmento: string | null };

export function Header() {
  const [busca, setBusca] = useState("");
  const [resultados, setResultados] = useState<Resultado[]>([]);
  const [aberto, setAberto] = useState(false);
  const [, startTransition] = useTransition();
  const router = useRouter();
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (busca.trim().length < 2) {
      setResultados([]);
      setAberto(false);
      return;
    }
    const supabase = createClient();
    const timer = setTimeout(async () => {
      const { data } = await supabase
        .from("empresas")
        .select("id, nome, segmento")
        .ilike("nome", `%${busca.trim()}%`)
        .limit(6);
      setResultados(data ?? []);
      setAberto(true);
    }, 200);
    return () => clearTimeout(timer);
  }, [busca]);

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setAberto(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  function navegar(id: string) {
    setBusca("");
    setAberto(false);
    startTransition(() => router.push(`/empresas/${id}`));
  }

  return (
    <header className="border-b h-12 flex items-center px-4 bg-background">
      <div className="relative w-full max-w-sm" ref={ref}>
        <Search
          size={15}
          className="pointer-events-none absolute left-2.5 top-1/2 -translate-y-1/2 text-muted-foreground"
        />
        <Input
          placeholder="Buscar empresa..."
          value={busca}
          onChange={(e) => setBusca(e.target.value)}
          className="pl-8 h-8 text-sm"
        />
        {aberto && resultados.length > 0 && (
          <div className="absolute top-full mt-1 w-full rounded-md border bg-popover shadow-md z-50">
            {resultados.map((r) => (
              <button
                key={r.id}
                className="w-full text-left px-3 py-2 text-sm hover:bg-accent flex flex-col"
                onClick={() => navegar(r.id)}
              >
                <span className="font-medium">{r.nome}</span>
                {r.segmento && (
                  <span className="text-xs text-muted-foreground capitalize">{r.segmento}</span>
                )}
              </button>
            ))}
          </div>
        )}
        {aberto && busca.trim().length >= 2 && resultados.length === 0 && (
          <div className="absolute top-full mt-1 w-full rounded-md border bg-popover shadow-md z-50 px-3 py-2 text-sm text-muted-foreground">
            Nenhuma empresa encontrada.
          </div>
        )}
      </div>
    </header>
  );
}
