"use client";

import { useActionState, useRef } from "react";
import { criarUsuarioEmpresa } from "@/app/(app)/configuracoes/actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { CheckCircle } from "lucide-react";

type Empresa = { id: string; nome: string };

const estadoInicial = { erro: "", sucesso: false };

export function CriarUsuarioEmpresaForm({ empresas }: { empresas: Empresa[] }) {
  const [estado, action, isPending] = useActionState(criarUsuarioEmpresa, estadoInicial);
  const empresaRef = useRef<HTMLInputElement>(null);

  return (
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

      <div className="space-y-1.5">
        <label className="text-sm font-medium">
          Senha inicial <span className="text-destructive">*</span>
        </label>
        <Input name="senha" type="text" placeholder="Ex: Beckes2025" minLength={6} required />
        <p className="text-xs text-muted-foreground">
          Use a mesma senha para todos e peça para cada um trocar no portal em "Alterar senha".
        </p>
      </div>

      {estado.erro && <p className="text-sm text-destructive">{estado.erro}</p>}

      {estado.sucesso && (
        <div className="flex items-center gap-2 text-sm text-green-600">
          <CheckCircle size={14} />
          Usuário criado! Já pode fazer login em sa-dashboard.store.
        </div>
      )}

      <Button type="submit" disabled={isPending}>
        {isPending ? "Criando..." : "Criar acesso"}
      </Button>
    </form>
  );
}
