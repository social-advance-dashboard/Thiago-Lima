import { Card, CardContent } from "@/components/ui/card";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { NovoLeadForm } from "@/components/pipeline/novo-lead-form";

export default function NovoPipelinePage() {
  return (
    <div className="p-8 max-w-lg">
      <Link href="/pipeline" className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground mb-6">
        <ArrowLeft size={15} /> Voltar para Pipeline
      </Link>
      <h1 className="text-2xl font-semibold mb-6">Novo lead</h1>
      <Card>
        <CardContent className="pt-6">
          <NovoLeadForm />
        </CardContent>
      </Card>
    </div>
  );
}
