"use client";

import { Button } from "@/components/ui/button";
import { Printer } from "lucide-react";

export function BotaoPrint() {
  return (
    <Button variant="outline" size="sm" onClick={() => window.print()}>
      <Printer size={14} />
      Imprimir / Salvar PDF
    </Button>
  );
}
