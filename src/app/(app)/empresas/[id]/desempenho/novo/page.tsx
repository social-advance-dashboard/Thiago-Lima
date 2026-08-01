import { createClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";
import { NovoDesempenhoForm } from "@/components/empresas/novo-desempenho-form";
import { Card, CardContent } from "@/components/ui/card";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";

export default async function NovoDesempenhoPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();

  const { data: empresa } = await supabase
    .from("empresas")
    .select("id, nome")
    .eq("id", id)
    .single();

  if (!empresa) notFound();

  return (
    <div className="p-8 max-w-2xl">
      <Link
        href={`/empresas/${id}`}
        className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground mb-6"
      >
        <ArrowLeft size={15} />
        Voltar para {empresa.nome}
      </Link>

      <h1 className="text-2xl font-semibold mb-1">Lançar desempenho</h1>
      <p className="text-sm text-muted-foreground mb-6">{empresa.nome}</p>

      <Card>
        <CardContent className="pt-6">
          <NovoDesempenhoForm empresaId={id} />
        </CardContent>
      </Card>
    </div>
  );
}
