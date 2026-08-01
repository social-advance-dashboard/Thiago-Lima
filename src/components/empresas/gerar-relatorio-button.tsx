"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { FileText } from "lucide-react";
import { GerarRelatorioDialog } from "./gerar-relatorio-dialog";

export function GerarRelatorioButton({
  empresa,
}: {
  empresa: { id: string; nome: string };
}) {
  const [aberto, setAberto] = useState(false);

  return (
    <>
      <Button variant="outline" onClick={() => setAberto(true)}>
        <FileText size={14} />
        Gerar relatório
      </Button>
      <GerarRelatorioDialog empresa={empresa} open={aberto} onOpenChange={setAberto} />
    </>
  );
}
