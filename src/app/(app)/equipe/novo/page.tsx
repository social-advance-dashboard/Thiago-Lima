import { Card, CardContent } from "@/components/ui/card";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { NovoMembroForm } from "@/components/equipe/novo-membro-form";

export default function NovoMembroPage() {
  return (
    <div className="p-8 max-w-lg">
      <Link href="/equipe" className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground mb-6">
        <ArrowLeft size={15} /> Voltar para Equipe
      </Link>
      <h1 className="text-2xl font-semibold mb-6">Novo membro</h1>
      <Card>
        <CardContent className="pt-6">
          <NovoMembroForm />
        </CardContent>
      </Card>
    </div>
  );
}
