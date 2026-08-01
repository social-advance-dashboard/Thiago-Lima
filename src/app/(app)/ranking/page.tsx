import { createClient } from "@/lib/supabase/server";
import { Card, CardContent } from "@/components/ui/card";
import { Trophy, Building2 } from "lucide-react";
import { cn } from "@/lib/utils";

function formatMoeda(valor: number) {
  return valor.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

const medalhas = ["text-amber-500", "text-muted-foreground", "text-orange-700"];

export default async function RankingPage() {
  const supabase = await createClient();

  const hoje = new Date();
  const inicioMesAtual = new Date(
    hoje.getFullYear(),
    hoje.getMonth(),
    1
  ).toISOString();

  const { data: ranking } = await supabase
    .from("ranking_mensal")
    .select("*")
    .eq("mes", inicioMesAtual.split("T")[0])
    .order("posicao", { ascending: true });

  return (
    <div className="p-8 space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">Ranking</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Empresas ordenadas por engajamento digital no mês
        </p>
      </div>

      <Card>
        <CardContent className="pt-6">
          {ranking && ranking.length > 0 ? (
            <ul className="divide-y">
              {ranking.map((item) => (
                <li
                  key={item.empresa_id}
                  className="flex items-center gap-4 py-4"
                >
                  <div className="w-8 flex justify-center">
                    {item.posicao <= 3 ? (
                      <Trophy
                        size={20}
                        className={cn(medalhas[item.posicao - 1])}
                      />
                    ) : (
                      <span className="text-sm text-muted-foreground font-medium">
                        {item.posicao}
                      </span>
                    )}
                  </div>

                  <div className="w-9 h-9 rounded-full bg-blue-50 flex items-center justify-center shrink-0">
                    <Building2 size={16} className="text-blue-600" />
                  </div>

                  <div className="flex-1 min-w-0">
                    <p className="font-medium truncate">{item.nome}</p>
                  </div>

                  <div className="text-right">
                    <p className="font-medium">
                      {Number(item.engajamento_total).toLocaleString("pt-BR")}
                    </p>
                    <p className="text-xs text-muted-foreground">engajamento</p>
                  </div>

                  <div className="text-right w-28">
                    <p className="text-sm text-muted-foreground">
                      {formatMoeda(Number(item.gasto_total))}
                    </p>
                    <p className="text-xs text-muted-foreground">gasto ads</p>
                  </div>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-sm text-muted-foreground">
              Nenhum dado de desempenho registrado neste mês ainda.
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}