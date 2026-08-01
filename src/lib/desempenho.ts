export type LinhaDesempenho = {
  data: string;
  engajamento: number;
  gasto: number;
};

type RegistroDesempenho = {
  data: string;
  engajamento: number | null;
  gasto_ads: number | null;
};

/** Agrupa registros por data e preenche os dias sem dado com zero, sempre terminando hoje. */
export function construirSerieDiaria(
  registros: RegistroDesempenho[],
  dias: number
): LinhaDesempenho[] {
  const porData = new Map<string, { engajamento: number; gasto: number }>();

  registros.forEach((r) => {
    const atual = porData.get(r.data) ?? { engajamento: 0, gasto: 0 };
    porData.set(r.data, {
      engajamento: atual.engajamento + (r.engajamento ?? 0),
      gasto: atual.gasto + Number(r.gasto_ads ?? 0),
    });
  });

  const hoje = new Date();
  const serie: LinhaDesempenho[] = [];

  for (let i = dias - 1; i >= 0; i--) {
    const dia = new Date(hoje);
    dia.setDate(dia.getDate() - i);
    const chave = dia.toISOString().split("T")[0];
    const valores = porData.get(chave) ?? { engajamento: 0, gasto: 0 };
    serie.push({ data: chave, ...valores });
  }

  return serie;
}
