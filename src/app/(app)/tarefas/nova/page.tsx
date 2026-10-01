import { createClient } from "@/lib/supabase/server";
import { Card, CardContent } from "@/components/ui/card";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { NovaTarefaForm } from "@/components/tarefas/nova-tarefa-form";

export default async function NovaTarefaPage() {
  const supabase = await createClient();
  const { data: empresas } = await supabase
    .from("empresas")
    .select("id, nome")
    .eq("status", "ativo")
    .order("nome");

  return (
    <div className="p-8 max-w-lg">
      <Link href="/tarefas" className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground mb-6">
        <ArrowLeft size={15} /> Voltar para Tarefas
      </Link>
      <h1 className="text-2xl font-semibold mb-6">Nova tarefa</h1>
      <Card>
        <CardContent className="pt-6">
          <NovaTarefaForm empresas={empresas ?? []} />
        </CardContent>
      </Card>
    </div>
  );
}
