"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Plug } from "lucide-react";
import { GerenciarIntegracoesDialog } from "./gerenciar-integracoes-dialog";

type Integracao = { provider: string; status: string };

export function GerenciarIntegracoesWrapper({
  empresaId,
  integracoes,
}: {
  empresaId: string;
  integracoes: Integracao[];
}) {
  const [aberto, setAberto] = useState(false);

  return (
    <>
      <Button variant="outline" size="sm" onClick={() => setAberto(true)}>
        <Plug size={14} />
        Gerenciar
      </Button>
      <GerenciarIntegracoesDialog
        empresaId={empresaId}
        integracoes={integracoes}
        open={aberto}
        onOpenChange={setAberto}
      />
    </>
  );
}
