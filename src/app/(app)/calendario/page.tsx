import { createClient } from "@/lib/supabase/server";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Plus, CalendarClock } from "lucide-react";
import { PostAcoes } from "@/components/calendario/post-acoes";
import { formatData } from "@/lib/formatters";

const STATUS_BADGE: Record<string, { label: string; variant: "default" | "secondary" | "destructive" | "outline" }> = {
  planejado: { label: "Planejado", variant: "outline" },
  em_producao: { label: "Em produção", variant: "default" },
  aprovado: { label: "Aprovado", variant: "secondary" },
  publicado: { label: "Publicado", variant: "secondary" },
  cancelado: { label: "Cancelado", variant: "destructive" },
};

const REDE_EMOJI: Record<string, string> = {
  instagram: "📸",
  facebook: "👥",
  tiktok: "🎵",
  linkedin: "💼",
  youtube: "▶️",
  outros: "🌐",
};

const FORMATO_LABEL: Record<string, string> = {
  post: "Post",
  story: "Story",
  reels: "Reels",
  video: "Vídeo",
  outros: "Outros",
};

type Post = {
  id: string;
  titulo: string;
  descricao: string | null;
  rede_social: string;
  formato: string;
  data_publicacao: string;
  status: string;
  empresa_id: string;
  empresas: { nome: string } | { nome: string }[] | null;
};

export default async function CalendarioPage() {
  const supabase = await createClient();

  const { data } = await supabase
    .from("calendario_editorial")
    .select("id, titulo, descricao, rede_social, formato, data_publicacao, status, empresa_id, empresas(nome)")
    .order("data_publicacao", { ascending: true });

  const posts = (data ?? []) as Post[];

  // Agrupar por semana / mês
  const ativos = posts.filter((p) => p.status !== "publicado" && p.status !== "cancelado");
  const publicados = posts.filter((p) => p.status === "publicado");

  function getEmpresa(p: Post) {
    const raw = p.empresas;
    return (Array.isArray(raw) ? raw[0] : raw) as { nome: string } | null;
  }

  function PostCard({ p }: { p: Post }) {
    const s = STATUS_BADGE[p.status] ?? STATUS_BADGE.planejado;
    const empresa = getEmpresa(p);
    return (
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 py-3 border-b last:border-0">
        <div className="flex items-start gap-3">
          <span className="text-xl mt-0.5">{REDE_EMOJI[p.rede_social] ?? "🌐"}</span>
          <div>
            <p className="text-sm font-medium">{p.titulo}</p>
            <div className="flex flex-wrap items-center gap-2 mt-0.5">
              {empresa && (
                <Link href={`/empresas/${p.empresa_id}`} className="text-xs text-muted-foreground hover:underline">
                  {empresa.nome}
                </Link>
              )}
              <span className="text-xs text-muted-foreground">·</span>
              <span className="text-xs text-muted-foreground capitalize">{FORMATO_LABEL[p.formato]}</span>
              <span className="text-xs text-muted-foreground">·</span>
              <span className="text-xs text-muted-foreground">{formatData(p.data_publicacao)}</span>
            </div>
            {p.descricao && <p className="text-xs text-muted-foreground mt-1 line-clamp-1">{p.descricao}</p>}
          </div>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <Badge variant={s.variant}>{s.label}</Badge>
          <PostAcoes id={p.id} status={p.status} />
        </div>
      </div>
    );
  }

  return (
    <div className="p-8 space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Calendário Editorial</h1>
          <p className="text-sm text-muted-foreground mt-1">Planejamento de conteúdo dos clientes</p>
        </div>
        <Link href="/calendario/novo">
          <Button><Plus size={14} /> Novo post</Button>
        </Link>
      </div>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="flex items-center gap-2 text-base">
            <CalendarClock size={16} />
            Em produção / planejados ({ativos.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {ativos.length === 0 ? (
            <p className="text-sm text-muted-foreground py-2">Nenhum conteúdo planejado.</p>
          ) : (
            ativos.map((p) => <PostCard key={p.id} p={p} />)
          )}
        </CardContent>
      </Card>

      {publicados.length > 0 && (
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base text-muted-foreground">Publicados ({publicados.length})</CardTitle>
          </CardHeader>
          <CardContent className="opacity-60">
            {publicados.map((p) => <PostCard key={p.id} p={p} />)}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
