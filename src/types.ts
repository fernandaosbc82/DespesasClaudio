export interface Despesa {
  id: string;
  valor: number;
  data: string; // ISO yyyy-mm-dd
  imagem?: string; // data URL da foto do comprovante
  criadoEm: string; // ISO timestamp
  kmRodado?: number;
  cliente?: string;
  observacoes?: string;
}
