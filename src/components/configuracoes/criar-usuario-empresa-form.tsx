"use client";

import { useActionState, useRef } from "react";
import { criarUsuarioEmpresa, gerarLinkAcesso } from "@/app/(app)/configuracoes/actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { CheckCircle, Copy, Link } from "lucide-react";

type Empresa = { id: string; nome: string };

const estadoCriarInicial = { erro: "", sucesso: false, link: "" };
const estadoLinkInicial = { erro: "", link: "" };

export function CriarUsuarioEmpresaForm({ empresas }: { empresas: Empresa[] }) {
  const [estado, action, isPending] = useActionState(criarUsuarioEmpresa, estadoCriarInicial);
  const [estadoLink, actionLink, isPendingLink] = useActionState(gerarLinkAcesso, estadoLinkInicial);
  const empresaRef = useRef<HTMLInputElement>(null);

  function copiar(texto: string) {
    navigator.clipboard.writeText(texto);
  }

  const linkAtivo = estado.link || estadoLink.link;

  return (
    <div className="space-y-6">
      {/* Formulário de criação */}
      <form action={action} className="space-y-4">
        <input ref={empresaRef} type="hidden" name="empresa_id" defaultValue="" />

        <div className="space-y-1.5">
          <label className="text-sm font-medium">
            Empresa <span className="text-destructive">*</span>
          </label>
          <Select onValueChange={(v) => { if (empresaRef.current) empresaRef.current.value = v; }}>
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Selecione a empresa..." />
            </SelectTrigger>
            <SelectContent>
              {empresas.map((e) => (
                <SelectItem key={e.id} value={e.id}>{e.nome}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-1.5">
          <label className="text-sm font-medium">
            Nome do usuário <span className="text-destructive">*</span>
          </label>
          <Input name="nome" type="text" placeholder="Ex: João Silva" required />
        </div>

        <div className="space-y-1.5">
          <label className="text-sm font-medium">
            Email de acesso <span className="text-destructive">*</span>
          </label>
          <Input name="email" type="email" placeholder="joao@empresa.com" required />
        </div>

        <p className="text-xs text-muted-foreground">
          O usuário não precisa de senha agora — você receberá um link de primeiro acesso para compartilhar com ele.
        </p>

        {estado.erro && <p className="text-sm text-destructive">{estado.erro}</p>}

        {estado.sucesso && (
          <div className="flex items-center gap-2 text-sm text-green-600">
            <CheckCircle size={14} />
            Usuário criado! Copie o link abaixo e envie para ele.
          </div>
        )}

        <Button type="submit" disabled={isPending}>
          {isPending ? "Criando..." : "Criar acesso"}
        </Button>
      </form>

      {/* Link de acesso */}
      {linkAtivo && (
        <div className="rounded-lg border border-dashed p-4 space-y-2 bg-muted/30">
          <p className="text-xs font-medium flex items-center gap-1">
            <Link size={12} /> Link de primeiro acesso
            <span className="text-muted-foreground font-normal ml-1">(expira em 1 hora)</span>
          </p>
          <div className="flex gap-2">
            <Input
              readOnly
              value={linkAtivo}
              className="text-xs font-mono"
              onClick={(e) => (e.target as HTMLInputElement).select()}
            />
            <Button
              type="button"
              size="sm"
              variant="outline"
              onClick={() => copiar(linkAtivo)}
            >
              <Copy size={12} className="mr-1" /> Copiar
            </Button>
          </div>
          <p className="text-xs text-muted-foreground">
            Envie este link para o usuário pelo WhatsApp ou email. Ao clicar, ele definirá a própria senha.
          </p>
        </div>
      )}

      {/* Gerar novo link para usuário existente */}
      <div className="border-t pt-4 space-y-2">
        <p className="text-sm font-medium">Gerar novo link de acesso</p>
        <p className="text-xs text-muted-foreground">
          Use se o link anterior expirou ou o usuário ainda não acessou.
        </p>
        <form action={actionLink} className="flex gap-2">
          <Input name="email" type="email" placeholder="email do usuário" required />
          <Button type="submit" variant="outline" size="sm" disabled={isPendingLink} className="shrink-0">
            {isPendingLink ? "Gerando..." : "Gerar link"}
          </Button>
        </form>
        {estadoLink.erro && <p className="text-xs text-destructive">{estadoLink.erro}</p>}
      </div>
    </div>
  );
}
