"use client";

import { useActionState } from "react";
import { editarEmpresa } from "@/app/(app)/empresas/actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
type EmpresaEditavel = {
  id: string;
  nome: string;
  status: string;
  plano: string | null;
  segmento: string | null;
  logo_url: string | null;
  data_entrada: string | null;
};

function Campo({
  label,
  required,
  children,
}: {
  label: string;
  required?: boolean;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-1.5">
      <label className="text-sm font-medium">
        {label}
        {required && <span className="text-destructive ml-1">*</span>}
      </label>
      {children}
    </div>
  );
}

export function EditarEmpresaForm({ empresa }: { empresa: EmpresaEditavel }) {
  const editarComId = editarEmpresa.bind(null, empresa.id);
  const [estado, action, isPending] = useActionState(editarComId, { erro: "" });

  return (
    <form action={action} className="space-y-5">
      <Campo label="Nome da empresa" required>
        <Input name="nome" defaultValue={empresa.nome} required />
      </Campo>

      <Campo label="Status" required>
        <select
          name="status"
          defaultValue={empresa.status}
          className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm focus:outline-none focus:ring-1 focus:ring-ring"
        >
          <option value="ativo">Ativo</option>
          <option value="inativo">Inativo</option>
        </select>
      </Campo>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
        <Campo label="Segmento">
          <Input
            name="segmento"
            defaultValue={empresa.segmento ?? ""}
            list="segmentos-sugeridos"
          />
          <datalist id="segmentos-sugeridos">
            {["E-commerce", "Saúde", "Educação", "Varejo", "Restaurante", "Beleza", "Tecnologia", "Imobiliária"].map((s) => (
              <option key={s} value={s} />
            ))}
          </datalist>
        </Campo>

        <Campo label="Plano">
          <Input
            name="plano"
            defaultValue={empresa.plano ?? ""}
            list="planos-sugeridos"
          />
          <datalist id="planos-sugeridos">
            {["Básico", "Intermediário", "Premium", "Enterprise"].map((p) => (
              <option key={p} value={p} />
            ))}
          </datalist>
        </Campo>
      </div>

      <Campo label="URL da logo">
        <Input name="logo_url" type="url" defaultValue={empresa.logo_url ?? ""} placeholder="https://..." />
      </Campo>

      <Campo label="Data de entrada">
        <Input name="data_entrada" type="date" defaultValue={empresa.data_entrada ?? ""} />
      </Campo>

      {estado?.erro && (
        <p className="text-sm text-destructive">{estado.erro}</p>
      )}

      <div className="flex gap-3 pt-2">
        <Button type="submit" disabled={isPending}>
          {isPending ? "Salvando..." : "Salvar alterações"}
        </Button>
        <Button type="button" variant="outline" onClick={() => history.back()}>
          Cancelar
        </Button>
      </div>
    </form>
  );
}
