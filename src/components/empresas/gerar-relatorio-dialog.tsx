"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { createClient } from "@/lib/supabase/client";
import { Loader2, Check, Copy, CopyCheck } from "lucide-react";

type Formato = "pdf" | "link" | "ambos";

const LABEL_FORMATO: Record<Formato, string> = {
  pdf: "PDF",
  link: "Link",
  ambos: "Ambos",
};

function primeiroDiaDoMes() {
  const hoje = new Date();
  return new Date(hoje.getFullYear(), hoje.getMonth(), 1).toISOString().split("T")[0];
}

function hojeISO() {
  return new Date().toISOString().split("T")[0];
}

export function GerarRelatorioDialog({
  empresa,
  open,
  onOpenChange,
}: {
  empresa: { id: string; nome: string };
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const [periodoInicio, setPeriodoInicio] = useState(primeiroDiaDoMes());
  const [periodoFim, setPeriodoFim] = useState(hojeISO());
  const [formato, setFormato] = useState<Formato>("link");
  const [enviando, setEnviando] = useState(false);
  const [erro, setErro] = useState<string | null>(null);
  const [linkGerado, setLinkGerado] = useState<string | null>(null);
  const [copiado, setCopiado] = useState(false);

  async function handleSubmit() {
    setEnviando(true);
    setErro(null);

    const supabase = createClient();
    const { data, error } = await supabase
      .from("relatorios")
      .insert({
        empresa_id: empresa.id,
        periodo_inicio: periodoInicio,
        periodo_fim: periodoFim,
        formato,
      })
      .select("id")
      .single();

    if (error || !data) {
      setEnviando(false);
      setErro("Não foi possível registrar o relatório. Tente novamente.");
      return;
    }

    const link = `${window.location.origin}/relatorios/${data.id}`;

    await supabase.from("relatorios").update({ link_publico: link }).eq("id", data.id);

    setEnviando(false);
    setLinkGerado(link);
  }

  async function handleCopiarLink() {
    if (!linkGerado) return;
    await navigator.clipboard.writeText(linkGerado);
    setCopiado(true);
    setTimeout(() => setCopiado(false), 2000);
  }

  function handleOpenChange(novoEstado: boolean) {
    if (!novoEstado) {
      // reseta o formulário ao fechar
      setLinkGerado(null);
      setCopiado(false);
      setErro(null);
      setFormato("link");
      setPeriodoInicio(primeiroDiaDoMes());
      setPeriodoFim(hojeISO());
    }
    onOpenChange(novoEstado);
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Gerar relatório</DialogTitle>
          <DialogDescription>
            {empresa.nome} — escolha o período e o formato do relatório.
          </DialogDescription>
        </DialogHeader>

        {linkGerado ? (
          <div className="flex flex-col items-center gap-2 py-4 text-center">
            <div className="flex size-10 items-center justify-center rounded-full bg-primary/10 text-primary">
              <Check size={20} />
            </div>
            <p className="font-medium">Relatório gerado com sucesso</p>
            <p className="text-sm text-muted-foreground">
              Compartilhe o link abaixo com o cliente.
              {formato !== "link" &&
                " O PDF para download será adicionado a essa mesma página em breve."}
            </p>
            <div className="mt-2 flex w-full gap-2">
              <Input readOnly value={linkGerado} className="text-xs" />
              <Button type="button" variant="outline" size="icon" onClick={handleCopiarLink}>
                {copiado ? <CopyCheck size={14} /> : <Copy size={14} />}
                <span className="sr-only">Copiar link</span>
              </Button>
            </div>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-sm text-muted-foreground" htmlFor="periodo-inicio">
                  Data início
                </label>
                <Input
                  id="periodo-inicio"
                  type="date"
                  value={periodoInicio}
                  onChange={(e) => setPeriodoInicio(e.target.value)}
                />
              </div>
              <div className="space-y-1">
                <label className="text-sm text-muted-foreground" htmlFor="periodo-fim">
                  Data fim
                </label>
                <Input
                  id="periodo-fim"
                  type="date"
                  value={periodoFim}
                  onChange={(e) => setPeriodoFim(e.target.value)}
                />
              </div>
            </div>

            <div className="space-y-1">
              <p className="text-sm text-muted-foreground">Formato</p>
              <div className="flex gap-2">
                {(Object.keys(LABEL_FORMATO) as Formato[]).map((opcao) => (
                  <Button
                    key={opcao}
                    type="button"
                    variant={formato === opcao ? "default" : "outline"}
                    size="sm"
                    onClick={() => setFormato(opcao)}
                  >
                    {LABEL_FORMATO[opcao]}
                  </Button>
                ))}
              </div>
            </div>

            {erro && <p className="text-sm text-destructive">{erro}</p>}
          </>
        )}

        <DialogFooter>
          {linkGerado ? (
            <Button onClick={() => handleOpenChange(false)}>Fechar</Button>
          ) : (
            <Button onClick={handleSubmit} disabled={enviando}>
              {enviando && <Loader2 size={14} className="animate-spin" />}
              Gerar relatório
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
