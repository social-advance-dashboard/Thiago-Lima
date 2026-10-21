import { createClient } from "@/lib/supabase/server";
import { Card, CardContent } from "@/components/ui/card";

const MEDALHA = ["🥇", "🥈", "🥉"];

function labelMes(yyyyMm: string) {
  const [a, m] = yyyyMm.split("-").map(Number);
  return new Date(a, m - 1, 1).toLocaleDateString("pt-BR", {
    month: "long",
    year: "numeric",
  });
}

export default async function PortalRankingPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  const empresaId = user?.app_metadata?.empresa_id as string | undefined;

  const agora = new Date();
  const mesAtual = `${agora.getFullYear()}-${String(agora.getMonth() + 1).padStart(2, "0")}`;

  const { data } = await supabase
    .from("ranking_mensal")
    .select("id, empresa_id, empresa_nome, pontuacao, posicao, mes")
    .eq("mes", mesAtual)
    .order("posicao", { ascending: true });

  const ranking = data ?? [];

  const minhaPos = ranking.findIndex((r) => r.empresa_id === empresaId);
  const minhaEntrada = ranking[minhaPos];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">Ranking</h1>
        <p className="text-sm text-muted-foreground mt-1 capitalize">
          {labelMes(mesAtual)}
        </p>
      </div>

      {minhaEntrada && (
        <Card className="border-foreground/20 bg-muted/30">
          <CardContent className="py-4 flex items-center gap-4">
            <span className="text-3xl">
              {minhaPos < 3 ? MEDALHA[minhaPos] : "🏆"}
            </span>
            <div>
              <p className="text-xs text-muted-foreground">Sua posição</p>
              <p className="text-2xl font-bold">#{minhaEntrada.posicao}</p>
              <p className="text-sm text-muted-foreground">
                {minhaEntrada.pontuacao} pontos
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      {ranking.length === 0 && (
        <p className="text-sm text-muted-foreground py-8 text-center">
          Ranking do mês ainda não disponível.
        </p>
      )}

      {ranking.length > 0 && (
        <div className="flex flex-col gap-2">
          {ranking.map((r, i) => {
            const isEmpresa = r.empresa_id === empresaId;
            return (
              <Card
                key={r.id}
                className={isEmpresa ? "border-foreground/40 ring-1 ring-foreground/20" : ""}
              >
                <CardContent className="py-3 flex items-center gap-4">
                  <span className="text-lg w-8 text-center shrink-0">
                    {i < 3 ? MEDALHA[i] : <span className="text-muted-foreground text-sm">#{r.posicao}</span>}
                  </span>
                  <div className="flex-1 min-w-0">
                    <p className={`text-sm font-medium truncate ${isEmpresa ? "font-semibold" : ""}`}>
                      {r.empresa_nome}
                      {isEmpresa && (
                        <span className="ml-2 text-xs text-muted-foreground font-normal">
                          (você)
                        </span>
                      )}
                    </p>
                  </div>
                  <p className="text-sm font-semibold shrink-0">
                    {r.pontuacao} pts
                  </p>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
