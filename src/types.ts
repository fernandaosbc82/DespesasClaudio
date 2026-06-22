export type TipoDespesa = 'combustivel' | 'alimentacao' | 'outros';

export interface Despesa {
  id: string;
  tipo: TipoDespesa;
  valor: number;
  data: string; // ISO yyyy-mm-dd
  imagem?: string; // data URL da foto do comprovante
  criadoEm: string; // ISO timestamp
  kmRodado?: number;
  cliente?: string;
  observacoes?: string;
}

export const TIPO_LABEL: Record<TipoDespesa, string> = {
  combustivel: 'Combustível',
  alimentacao: 'Alimentação',
  outros: 'Outros',
};
