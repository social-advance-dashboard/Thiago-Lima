"use client";

import { useActionState } from "react";
import { editarAgendamento } from "@/app/(app)/agendamentos/actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

type Agendamento = {
  id: string;
  titulo: string;
  tipo: string;
  data_hora: string;
  descricao: string | null;
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

const TIPOS = [
  { value: "reuniao", label: "Reunião" },
  { value: "ligacao", label: "Ligação" },
  { value: "entrega", label: "Entrega de material" },
  { value: "visita", label: "Visita ao cliente" },
  { value: "prazo", label: "Prazo / Deadline" },
  { value: "outros", label: "Outros" },
];

export function EditarAgendamentoForm({
  agendamento,
}: {
  agendamento: Agendamento;
}) {
  const editarComId = editarAgendamento.bind(null, agendamento.id);
  const [estado, action, isPending] = useActionState(editarComId, { erro: "" });

  // Convert ISO to datetime-local format (YYYY-MM-DDTHH:mm)
  const defaultDataHora = agendamento.data_hora.slice(0, 16);

  return (
    <form action={action} className="space-y-5">
      <Campo label="Título" required>
        <Input
          name="titulo"
          defaultValue={agendamento.titulo}
          required
        />
      </Campo>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
        <Campo label="Tipo" required>
          <select
            name="tipo"
            defaultValue={agendamento.tipo}
            className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm focus:outline-none focus:ring-1 focus:ring-ring"
          >
            {TIPOS.map((t) => (
              <option key={t.value} value={t.value}>
                {t.label}
              </option>
            ))}
          </select>
        </Campo>

        <Campo label="Data e hora" required>
          <Input
            name="data_hora"
            type="datetime-local"
            defaultValue={defaultDataHora}
            required
          />
        </Campo>
      </div>

      <Campo label="Descrição / Notas">
        <textarea
          name="descricao"
          rows={3}
          defaultValue={agendamento.descricao ?? ""}
          placeholder="Detalhes sobre o agendamento..."
          className="flex w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-1 focus:ring-ring resize-none"
        />
      </Campo>

      {estado?.erro && (
        <p className="text-sm text-destructive">{estado.erro}</p>
      )}

      <div className="flex gap-3 pt-2">
        <Button type="submit" disabled={isPending}>
          {isPending ? "Salvando..." : "Salvar alterações"}
        </Button>
        <Button
          type="button"
          variant="outline"
          onClick={() => history.back()}
        >
          Cancelar
        </Button>
      </div>
    </form>
  );
}
