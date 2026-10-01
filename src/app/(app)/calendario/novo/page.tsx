import { createClient } from "@/lib/supabase/server";
import { Card, CardContent } from "@/components/ui/card";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { NovoPostForm } from "@/components/calendario/novo-post-form";

export default async function NovoPostPage() {
  const supabase = await createClient();
  const { data: empresas } = await supabase
    .from("empresas")
    .select("id, nome")
    .eq("status", "ativo")
    .order("nome");

  return (
    <div className="p-8 max-w-lg">
      <Link href="/calendario" className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground mb-6">
        <ArrowLeft size={15} /> Voltar para Calendário
      </Link>
      <h1 className="text-2xl font-semibold mb-6">Novo conteúdo</h1>
      <Card>
        <CardContent className="pt-6">
          <NovoPostForm empresas={empresas ?? []} />
        </CardContent>
      </Card>
    </div>
  );
}
