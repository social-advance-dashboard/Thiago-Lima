"use client";

import { useState, useTransition } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  adicionarIntegracao,
  removerIntegracao,
} from "@/app/(app)/empresas/actions";
import {
  sincronizarGoogle,
  sincronizarMeta,
  salvarPropertyId,
  desconectarIntegracao,
} from "@/app/(app)/empresas/integracoes-actions";
import { RefreshCw, X, CheckCircle2, AlertCircle } from "lucide-react";

const PROVIDERS_MANUAIS = [
  { value: "tiktok_ads", label: "TikTok Ads" },
  { value: "linkedin_ads", label: "LinkedIn Ads" },
  { value: "instagram", label: "Instagram (manual)" },
];

type Integracao = {
  id?: string;
  provider: string;
  status: string;
  account_name?: string | null;
  external_account_id?: string | null;
  last_synced_at?: string | null;
};

function formatSyncDate(iso: string | null | undefined) {
  if (!iso) return null;
  return new Date(iso).toLocaleString("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function OAuthCard({
  label,
  provider,
  empresaId,
  integracao,
  connectUrl,
  propertyLabel,
  propertyPlaceholder,
  onSync,
  onDisconnect,
}: {
  label: string;
  provider: string;
  empresaId: string;
  integracao?: Integracao;
  connectUrl: string;
  propertyLabel: string;
  propertyPlaceholder: string;
  onSync: () => Promise<void>;
  onDisconnect: () => void;
}) {
  const [propertyId, setPropertyId] = useState(
    integracao?.external_account_id ?? ""
  );
  const [syncing, startSync] = useTransition();
  const [saving, startSave] = useTransition();
  const [removing, startRemove] = useTransition();
  const [resultado, setResultado] = useState<string | null>(null);

  const isConnected = !!integracao?.account_name;

  function handleSync() {
    setResultado(null);
    startSync(() => {
      void onSync().then(() => setResultado("ok")).catch(() => {});
    });
  }

  function handleSaveProperty() {
    if (!propertyId.trim()) return;
    startSave(() => { void salvarPropertyId(empresaId, provider, propertyId); });
  }

  function handleDisconnect() {
    startRemove(() => {
      void desconectarIntegracao(empresaId, provider).then(() => onDisconnect());
    });
  }

  return (
    <div className="rounded-lg border p-4 space-y-3">
      <div className="flex items-center justify-between">
        <p className="text-sm font-medium">{label}</p>
        {isConnected ? (
          <Badge variant="default" className="gap-1">
            <CheckCircle2 size={11} />
            Conectado
          </Badge>
        ) : (
          <Badge variant="secondary">Desconectado</Badge>
        )}
      </div>

      {!isConnected ? (
        <a href={connectUrl}>
          <Button size="sm" variant="outline" className="w-full">
            Conectar {label}
          </Button>
        </a>
      ) : (
        <div className="space-y-2">
          <p className="text-xs text-muted-foreground">
            Conta: <span className="font-medium text-foreground">{integracao?.account_name}</span>
          </p>

          <div className="flex gap-2">
            <Input
              value={propertyId}
              onChange={(e) => setPropertyId(e.target.value)}
              placeholder={propertyPlaceholder}
              className="h-8 text-xs"
            />
            <Button
              size="sm"
              variant="outline"
              onClick={handleSaveProperty}
              disabled={saving}
              className="shrink-0 h-8 text-xs"
            >
              {saving ? "..." : "Salvar"}
            </Button>
          </div>
          <p className="text-xs text-muted-foreground">{propertyLabel}</p>

          <div className="flex items-center gap-2">
            <Button
              size="sm"
              onClick={handleSync}
              disabled={syncing || !integracao?.external_account_id}
              className="h-8 text-xs flex-1"
            >
              <RefreshCw size={12} className={syncing ? "animate-spin" : ""} />
              {syncing ? "Sincronizando..." : "Sincronizar agora"}
            </Button>
            <Button
              size="sm"
              variant="ghost"
              onClick={handleDisconnect}
              disabled={removing}
              className="h-8 text-xs text-muted-foreground hover:text-destructive"
            >
              <X size={13} />
            </Button>
          </div>

          {resultado === "ok" && (
            <p className="text-xs text-green-600 flex items-center gap-1">
              <CheckCircle2 size={11} /> Sincronizado com sucesso!
            </p>
          )}

          {integracao?.last_synced_at && (
            <p className="text-xs text-muted-foreground">
              Última sync: {formatSyncDate(integracao.last_synced_at)}
            </p>
          )}
        </div>
      )}
    </div>
  );
}

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
  const [isRemoving, startRemove] = useTransition();
  const [isAdding, startAdd] = useTransition();
  const [selectedProvider, setSelectedProvider] = useState(
    PROVIDERS_MANUAIS[0].value
  );

  const googleIntegracao = integracoes.find(
    (i) => i.provider === "google_analytics"
  );
  const metaIntegracao = integracoes.find((i) => i.provider === "meta_ads");
  const manuaisAtivos = integracoes
    .filter((i) => !["google_analytics", "meta_ads"].includes(i.provider))
    .map((i) => i.provider);

  const appUrl =
    typeof window !== "undefined"
      ? window.location.origin
      : process.env.NEXT_PUBLIC_APP_URL ?? "";

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Gerenciar integrações</DialogTitle>
        </DialogHeader>

        <div className="space-y-4 pt-2">
          {/* Google Analytics */}
          <OAuthCard
            label="Google Analytics"
            provider="google_analytics"
            empresaId={empresaId}
            integracao={googleIntegracao}
            connectUrl={`${appUrl}/api/integracoes/google/connect?empresa_id=${empresaId}`}
            propertyLabel="ID da propriedade GA4 (ex: 123456789)"
            propertyPlaceholder="ID da propriedade GA4"
            onSync={async () => {
              const res = await sincronizarGoogle(empresaId);
              if (res.erro) throw new Error(res.erro);
            }}
            onDisconnect={() => onOpenChange(false)}
          />

          {/* Meta / Facebook */}
          <OAuthCard
            label="Meta (Facebook / Instagram)"
            provider="meta_ads"
            empresaId={empresaId}
            integracao={metaIntegracao}
            connectUrl={`${appUrl}/api/integracoes/meta/connect?empresa_id=${empresaId}`}
            propertyLabel="ID da página do Facebook (ex: 123456789)"
            propertyPlaceholder="ID da página"
            onSync={async () => {
              const res = await sincronizarMeta(empresaId);
              if (res.erro) throw new Error(res.erro);
            }}
            onDisconnect={() => onOpenChange(false)}
          />

          {/* Outras plataformas (manual) */}
          <div className="space-y-3">
            <p className="text-sm font-medium text-muted-foreground">
              Outras plataformas
            </p>

            {manuaisAtivos.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {integracoes
                  .filter(
                    (i) =>
                      !["google_analytics", "meta_ads"].includes(i.provider)
                  )
                  .map((i) => (
                    <div key={i.provider} className="flex items-center gap-1">
                      <Badge
                        variant={i.status === "ativo" ? "default" : "secondary"}
                        className="capitalize"
                      >
                        {PROVIDERS_MANUAIS.find((p) => p.value === i.provider)
                          ?.label ?? i.provider}
                      </Badge>
                      <button
                        onClick={() =>
                          startRemove(() =>
                            removerIntegracao(empresaId, i.provider)
                          )
                        }
                        disabled={isRemoving}
                        className="text-muted-foreground hover:text-destructive"
                      >
                        <X size={13} />
                      </button>
                    </div>
                  ))}
              </div>
            )}

            <div className="flex gap-2">
              <select
                value={selectedProvider}
                onChange={(e) => setSelectedProvider(e.target.value)}
                className="flex-1 h-9 rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm focus:outline-none focus:ring-1 focus:ring-ring"
              >
                {PROVIDERS_MANUAIS.filter(
                  (p) => !manuaisAtivos.includes(p.value)
                ).map((p) => (
                  <option key={p.value} value={p.value}>
                    {p.label}
                  </option>
                ))}
              </select>
              <Button
                size="sm"
                disabled={isAdding}
                onClick={() => {
                  const fd = new FormData();
                  fd.set("provider", selectedProvider);
                  startAdd(() => {
                    void adicionarIntegracao(empresaId, { erro: "" }, fd);
                  });
                }}
              >
                {isAdding ? "..." : "Adicionar"}
              </Button>
            </div>
          </div>

          <div className="rounded-md bg-muted/50 p-3 text-xs text-muted-foreground space-y-1">
            <p className="font-medium flex items-center gap-1"><AlertCircle size={11} /> Antes de conectar:</p>
            <p>• Google: crie credenciais OAuth 2.0 em console.cloud.google.com</p>
            <p>• Meta: crie um App em developers.facebook.com</p>
            <p>• Adicione a URL de callback nas configurações de cada plataforma</p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
