export type TipoDespesa = 'combustivel' | 'alimentacao' | 'outros';

export interface Despesa {
  id: string;
  estabelecimento: string;
  tipo: TipoDespesa;
  valor: number;
  data: string; // ISO yyyy-mm-dd
  imagem?: string; // data URL da foto do comprovante
  criadoEm: string; // ISO timestamp
}

export const TIPO_LABEL: Record<TipoDespesa, string> = {
  combustivel: 'Combustível',
  alimentacao: 'Alimentação',
  outros: 'Outros',
};
