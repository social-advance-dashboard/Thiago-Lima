"use client";

import { useActionState, useTransition } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { adicionarIntegracao, removerIntegracao } from "@/app/(app)/empresas/actions";
import { X } from "lucide-react";

const PROVIDERS = [
  { value: "instagram", label: "Instagram" },
  { value: "meta_ads", label: "Meta Ads" },
  { value: "google_ads", label: "Google Ads" },
  { value: "tiktok_ads", label: "TikTok Ads" },
  { value: "linkedin_ads", label: "LinkedIn Ads" },
];

type Integracao = { provider: string; status: string };

export function GerenciarIntegracoesDialog({
  empresaId,
  integracoes,
  open,
  onOpenChange,
}: {
  empresaId: string;
  integracoes: Integracao[];
  open: boolean;
  onOpenChange: (v: boolean) => void;
}) {
  const adicionarComId = adicionarIntegracao.bind(null, empresaId);
  const [estado, action, isPending] = useActionState(adicionarComId, { erro: "" });
  const [isRemoving, startRemove] = useTransition();

  const providersAtivos = integracoes.map((i) => i.provider);
  const providersDisponiveis = PROVIDERS.filter((p) => !providersAtivos.includes(p.value));

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Gerenciar integrações</DialogTitle>
        </DialogHeader>

        <div className="space-y-5 pt-2">
          {/* Integrações ativas */}
          <div>
            <p className="text-sm font-medium mb-2">Conectadas</p>
            {integracoes.length === 0 ? (
              <p className="text-sm text-muted-foreground">Nenhuma integração conectada.</p>
            ) : (
              <div className="flex flex-wrap gap-2">
                {integracoes.map((i) => (
                  <div key={i.provider} className="flex items-center gap-1">
                    <Badge variant={i.status === "ativo" ? "default" : "secondary"} className="capitalize">
                      {PROVIDERS.find((p) => p.value === i.provider)?.label ?? i.provider}
                    </Badge>
                    <button
                      onClick={() =>
                        startRemove(() => removerIntegracao(empresaId, i.provider))
                      }
                      disabled={isRemoving}
                      className="text-muted-foreground hover:text-destructive transition-colors"
                    >
                      <X size={13} />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Adicionar nova */}
          {providersDisponiveis.length > 0 && (
            <form action={action} className="space-y-3">
              <p className="text-sm font-medium">Adicionar integração</p>
              <div className="flex gap-2">
                <select
                  name="provider"
                  className="flex-1 h-9 rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm focus:outline-none focus:ring-1 focus:ring-ring"
                >
                  {providersDisponiveis.map((p) => (
                    <option key={p.value} value={p.value}>
                      {p.label}
                    </option>
                  ))}
                </select>
                <Button type="submit" size="sm" disabled={isPending}>
                  {isPending ? "..." : "Adicionar"}
                </Button>
              </div>
              {estado?.erro && (
                <p className="text-sm text-destructive">{estado.erro}</p>
              )}
            </form>
          )}

          {providersDisponiveis.length === 0 && (
            <p className="text-sm text-muted-foreground">Todas as integrações disponíveis já estão conectadas.</p>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
