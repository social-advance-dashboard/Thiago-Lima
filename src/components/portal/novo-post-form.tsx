"use client";

import { useActionState, useState } from "react";
import { criarPostPortal } from "@/app/portal/calendario/actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus, X, CheckCircle } from "lucide-react";

const REDES = [
  { value: "instagram", label: "Instagram" },
  { value: "facebook", label: "Facebook" },
  { value: "tiktok", label: "TikTok" },
  { value: "linkedin", label: "LinkedIn" },
  { value: "youtube", label: "YouTube" },
  { value: "outros", label: "Outros" },
];

const FORMATOS = [
  { value: "post", label: "Post" },
  { value: "stories", label: "Stories" },
  { value: "reels", label: "Reels" },
  { value: "video", label: "Vídeo" },
  { value: "carrossel", label: "Carrossel" },
  { value: "outros", label: "Outros" },
];

export function NovoPostForm() {
  const [aberto, setAberto] = useState(false);
  const [estado, action, isPending] = useActionState(criarPostPortal, {
    erro: "",
    sucesso: false,
  });

  if (estado.sucesso && aberto) setAberto(false);

  return (
    <div>
      {!aberto ? (
        <Button size="sm" onClick={() => setAberto(true)}>
          <Plus size={14} className="mr-1" /> Novo post
        </Button>
      ) : (
        <div className="border rounded-lg p-4 bg-muted/30 space-y-3">
          <div className="flex items-center justify-between">
            <p className="text-sm font-semibold">Novo post</p>
            <button onClick={() => setAberto(false)} className="text-muted-foreground hover:text-foreground">
              <X size={14} />
            </button>
          </div>

          <form action={action} className="space-y-3">
            <Input name="titulo" placeholder="Título do post *" required />

            <div className="grid grid-cols-2 gap-2">
              <select
                name="rede_social"
                defaultValue=""
                required
                className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm"
              >
                <option value="" disabled>Rede social *</option>
                {REDES.map((r) => (
                  <option key={r.value} value={r.value}>{r.label}</option>
                ))}
              </select>

              <select
                name="formato"
                defaultValue="post"
                className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm"
              >
                {FORMATOS.map((f) => (
                  <option key={f.value} value={f.value}>{f.label}</option>
                ))}
              </select>
            </div>

            <div className="space-y-1">
              <label className="text-xs text-muted-foreground">Data de publicação *</label>
              <Input name="data_publicacao" type="date" required />
            </div>

            <Input name="descricao" placeholder="Descrição (opcional)" />

            {estado.erro && (
              <p className="text-xs text-destructive">{estado.erro}</p>
            )}

            <div className="flex gap-2">
              <Button type="submit" size="sm" disabled={isPending}>
                {isPending ? "Criando..." : "Criar post"}
              </Button>
              <Button type="button" size="sm" variant="outline" onClick={() => setAberto(false)}>
                Cancelar
              </Button>
            </div>
          </form>
        </div>
      )}

      {estado.sucesso && (
        <p className="flex items-center gap-1 text-xs text-green-600 mt-2">
          <CheckCircle size={12} /> Post adicionado ao calendário!
        </p>
      )}
    </div>
  );
}
