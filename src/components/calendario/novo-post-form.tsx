"use client";

import { useActionState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { criarPost } from "@/app/(app)/calendario/actions";

type Empresa = { id: string; nome: string };

export function NovoPostForm({ empresas }: { empresas: Empresa[] }) {
  const [state, action, isPending] = useActionState(criarPost, { erro: "" });

  return (
    <form action={action} className="space-y-4">
      {state.erro && <p className="text-sm text-destructive">{state.erro}</p>}

      <div className="space-y-1.5">
        <Label htmlFor="titulo">Título do conteúdo *</Label>
        <Input id="titulo" name="titulo" placeholder="Ex: Post de lançamento do produto" required />
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="empresa_id">Empresa *</Label>
        <select
          id="empresa_id"
          name="empresa_id"
          required
          className="w-full h-9 rounded-md border border-input bg-background px-3 py-1 text-sm"
        >
          <option value="">Selecione...</option>
          {empresas.map((e) => (
            <option key={e.id} value={e.id}>{e.nome}</option>
          ))}
        </select>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1.5">
          <Label htmlFor="rede_social">Rede social *</Label>
          <select
            id="rede_social"
            name="rede_social"
            required
            className="w-full h-9 rounded-md border border-input bg-background px-3 py-1 text-sm"
          >
            <option value="">Selecione...</option>
            <option value="instagram">Instagram</option>
            <option value="facebook">Facebook</option>
            <option value="tiktok">TikTok</option>
            <option value="linkedin">LinkedIn</option>
            <option value="youtube">YouTube</option>
            <option value="outros">Outros</option>
          </select>
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="formato">Formato</Label>
          <select
            id="formato"
            name="formato"
            className="w-full h-9 rounded-md border border-input bg-background px-3 py-1 text-sm"
          >
            <option value="post">Post</option>
            <option value="story">Story</option>
            <option value="reels">Reels</option>
            <option value="video">Vídeo</option>
            <option value="outros">Outros</option>
          </select>
        </div>
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="data_publicacao">Data de publicação *</Label>
        <Input id="data_publicacao" name="data_publicacao" type="date" required />
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="descricao">Descrição / Briefing</Label>
        <Textarea id="descricao" name="descricao" rows={3} placeholder="Ideia, copy, referências..." />
      </div>

      <Button type="submit" disabled={isPending} className="w-full">
        {isPending ? "Salvando..." : "Adicionar ao calendário"}
      </Button>
    </form>
  );
}
