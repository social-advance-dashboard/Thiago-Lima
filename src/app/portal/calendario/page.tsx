import { createClient } from "@/lib/supabase/server";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";

const REDE_LABEL: Record<string, string> = {
  instagram: "Instagram",
  facebook: "Facebook",
  tiktok: "TikTok",
  linkedin: "LinkedIn",
  youtube: "YouTube",
  outros: "Outros",
};

const STATUS_VARIANT: Record<
  string,
  "default" | "secondary" | "outline" | "destructive"
> = {
  planejado: "outline",
  em_producao: "default",
  aprovado: "secondary",
  publicado: "secondary",
  cancelado: "destructive",
};

const STATUS_LABEL: Record<string, string> = {
  planejado: "Planejado",
  em_producao: "Em produção",
  aprovado: "Aprovado",
  publicado: "Publicado",
  cancelado: "Cancelado",
};

function formatData(iso: string) {
  return new Date(iso).toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
}

function labelMes(yyyyMm: string) {
  const [a, m] = yyyyMm.split("-").map(Number);
  return new Date(a, m - 1, 1).toLocaleDateString("pt-BR", {
    month: "long",
    year: "numeric",
  });
}

export default async function PortalCalendarioPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  const empresaId = user?.app_metadata?.empresa_id as string | undefined;

  const { data } = await supabase
    .from("calendario_editorial")
    .select("id, titulo, descricao, rede_social, formato, data_publicacao, status")
    .eq("empresa_id", empresaId ?? "")
    .order("data_publicacao", { ascending: true });

  const posts = data ?? [];

  const porMes = new Map<string, typeof posts>();
  posts.forEach((p) => {
    const mes = p.data_publicacao.slice(0, 7);
    if (!porMes.has(mes)) porMes.set(mes, []);
    porMes.get(mes)!.push(p);
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">Calendário Editorial</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Conteúdos planejados para seus perfis
        </p>
      </div>

      {porMes.size === 0 && (
        <p className="text-sm text-muted-foreground py-8 text-center">
          Nenhum conteúdo planejado ainda.
        </p>
      )}

      {Array.from(porMes.entries()).map(([mes, items]) => (
        <div key={mes}>
          <h2 className="text-sm font-semibold capitalize mb-3">
            {labelMes(mes)}
          </h2>
          <div className="flex flex-col gap-2">
            {items.map((p) => (
              <Card key={p.id}>
                <CardContent className="py-3 flex flex-col sm:flex-row sm:items-center gap-3 justify-between">
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm">{p.titulo}</p>
                    {p.descricao && (
                      <p className="text-xs text-muted-foreground mt-0.5 truncate">
                        {p.descricao}
                      </p>
                    )}
                    <div className="flex gap-2 mt-1 flex-wrap">
                      <span className="text-xs text-muted-foreground">
                        {REDE_LABEL[p.rede_social] ?? p.rede_social}
                      </span>
                      <span className="text-xs text-muted-foreground">·</span>
                      <span className="text-xs text-muted-foreground capitalize">
                        {p.formato}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 shrink-0">
                    <span className="text-xs text-muted-foreground">
                      {formatData(p.data_publicacao)}
                    </span>
                    <Badge
                      variant={STATUS_VARIANT[p.status] ?? "outline"}
                      className="text-xs"
                    >
                      {STATUS_LABEL[p.status] ?? p.status}
                    </Badge>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
