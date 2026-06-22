import * as XLSX from 'xlsx';
import type { Despesa } from './types';
import { TIPO_LABEL } from './types';

const KM_POR_LITRO = 10;

export function exportarParaExcel(
  despesas: Despesa[],
  precosCombustivel: Record<string, number>,
): void {
  const linhas = despesas.map((d) => {
    const mes = d.data.slice(0, 7);
    const precoMedio = precosCombustivel[mes];
    return {
      Data: formatarDataBr(d.data),
      Tipo: TIPO_LABEL[d.tipo],
      'Valor (R$)': d.valor,
      'Km Rodado': d.kmRodado ?? '',
      'Valor médio gasolina': precoMedio ?? '',
      Cliente: d.cliente ?? '',
      Observações: d.observacoes ?? '',
    };
  });

  const planilha = XLSX.utils.json_to_sheet(linhas);
  planilha['!cols'] = [
    { wch: 12 },
    { wch: 16 },
    { wch: 14 },
    { wch: 12 },
    { wch: 18 },
    { wch: 25 },
    { wch: 40 },
  ];

  const livro = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(livro, planilha, 'Despesas');

  const resumoMensal = montarResumoMensal(despesas, precosCombustivel);
  if (resumoMensal.length > 0) {
    const planilhaResumo = XLSX.utils.json_to_sheet(resumoMensal);
    planilhaResumo['!cols'] = [
      { wch: 12 },
      { wch: 14 },
      { wch: 18 },
      { wch: 18 },
      { wch: 22 },
    ];
    XLSX.utils.book_append_sheet(livro, planilhaResumo, 'Resumo Mensal');
  }

  const dataArquivo = new Date().toISOString().slice(0, 10);
  XLSX.writeFile(livro, `despesas-viagem-${dataArquivo}.xlsx`);
}

function montarResumoMensal(despesas: Despesa[], precosCombustivel: Record<string, number>) {
  const porMes = new Map<string, number>();
  for (const d of despesas) {
    const mes = d.data.slice(0, 7);
    porMes.set(mes, (porMes.get(mes) ?? 0) + (d.kmRodado ?? 0));
  }
  return [...porMes.entries()]
    .sort((a, b) => (a[0] < b[0] ? -1 : 1))
    .map(([mes, kmTotal]) => {
      const litrosEstimados = kmTotal / KM_POR_LITRO;
      const precoMedio = precosCombustivel[mes];
      const gastoEstimado = precoMedio ? litrosEstimados * precoMedio : '';
      return {
        Mês: mes,
        'Km Rodado': kmTotal,
        'Litros Estimados': Number(litrosEstimados.toFixed(2)),
        'Valor médio gasolina': precoMedio ?? '',
        'Gasto Estimado Combustível': gastoEstimado,
      };
    });
}

function formatarDataBr(isoData: string): string {
  const [ano, mes, dia] = isoData.split('-');
  return `${dia}/${mes}/${ano}`;
}
