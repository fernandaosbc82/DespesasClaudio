import * as XLSX from 'xlsx';
import type { Despesa } from './types';
import { TIPO_LABEL } from './types';

export function exportarParaExcel(despesas: Despesa[]): void {
  const linhas = despesas.map((d) => ({
    Data: formatarDataBr(d.data),
    Estabelecimento: d.estabelecimento,
    Tipo: TIPO_LABEL[d.tipo],
    'Valor (R$)': d.valor,
  }));

  const planilha = XLSX.utils.json_to_sheet(linhas);
  planilha['!cols'] = [{ wch: 12 }, { wch: 35 }, { wch: 16 }, { wch: 14 }];

  const livro = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(livro, planilha, 'Despesas');

  const dataArquivo = new Date().toISOString().slice(0, 10);
  XLSX.writeFile(livro, `despesas-viagem-${dataArquivo}.xlsx`);
}

function formatarDataBr(isoData: string): string {
  const [ano, mes, dia] = isoData.split('-');
  return `${dia}/${mes}/${ano}`;
}
