import { createClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";
import { EditarEmpresaForm } from "@/components/empresas/editar-empresa-form";
import { Card, CardContent } from "@/components/ui/card";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";

export default async function EditarEmpresaPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();

  const { data: empresa } = await supabase
    .from("empresas")
    .select(
      "id, nome, status, plano, segmento, logo_url, data_entrada, meta_engajamento, meta_gasto, status_pagamento, observacoes"
    )
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

      <h1 className="text-2xl font-semibold mb-6">Editar empresa</h1>

      <Card>
        <CardContent className="pt-6">
          <EditarEmpresaForm empresa={empresa} />
        </CardContent>
      </Card>
    </div>
  );
}
