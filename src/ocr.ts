import { createWorker } from 'tesseract.js';
import type { TipoDespesa } from './types';

export interface DadosExtraidos {
  estabelecimento: string;
  tipo: TipoDespesa;
  valor: number | null;
  data: string | null; // ISO yyyy-mm-dd
  textoCompleto: string;
}

export async function lerComprovante(
  imagem: string,
  onProgresso?: (percentual: number) => void,
): Promise<DadosExtraidos> {
  const worker = await createWorker('por', 1, {
    logger: (m) => {
      if (m.status === 'recognizing text' && onProgresso) {
        onProgresso(Math.round(m.progress * 100));
      }
    },
  });
  try {
    const { data } = await worker.recognize(imagem);
    return interpretarTexto(data.text);
  } finally {
    await worker.terminate();
  }
}

const PALAVRAS_COMBUSTIVEL = [
  'posto', 'combustivel', 'combustível', 'gasolina', 'etanol', 'alcool',
  'álcool', 'diesel', 'gnv', 'gas natural', 'litro', 'litros', 'shell',
  'ipiranga', 'petrobras', 'br distribuidora', 'ale combustiveis',
];

const PALAVRAS_ALIMENTACAO = [
  'restaurante', 'lanchonete', 'padaria', 'mercado', 'supermercado',
  'alimentos', 'churrascaria', 'pizzaria', 'cafe', 'café', 'bar',
  'refeicao', 'refeição', 'self service', 'self-service', 'buffet',
  'pastelaria', 'sorveteria', 'hamburgueria', 'açai', 'acai',
];

function identificarTipo(textoMinusculo: string): TipoDespesa {
  if (PALAVRAS_COMBUSTIVEL.some((p) => textoMinusculo.includes(p))) {
    return 'combustivel';
  }
  if (PALAVRAS_ALIMENTACAO.some((p) => textoMinusculo.includes(p))) {
    return 'alimentacao';
  }
  return 'outros';
}

function extrairData(texto: string): string | null {
  const match = texto.match(/(\d{2})[\/.-](\d{2})[\/.-](\d{2,4})/);
  if (!match) return null;
  let [, dia, mes, ano] = match;
  if (ano.length === 2) ano = `20${ano}`;
  const diaNum = Number(dia);
  const mesNum = Number(mes);
  if (diaNum < 1 || diaNum > 31 || mesNum < 1 || mesNum > 12) return null;
  return `${ano}-${mes.padStart(2, '0')}-${dia.padStart(2, '0')}`;
}

function extrairValor(texto: string): number | null {
  const linhas = texto.split('\n');
  let candidato: number | null = null;

  const padraoMoeda = /(?:r\$\s*)?(\d{1,3}(?:[.,]\d{3})*[.,]\d{2})/gi;

  for (const linha of linhas) {
    const linhaMinuscula = linha.toLowerCase();
    const ehLinhaTotal = /total|valor\s*pago|valor\s*total|total\s*r\$/i.test(linhaMinuscula);
    const valores = [...linha.matchAll(padraoMoeda)].map((m) => paraNumero(m[1]));
    if (valores.length === 0) continue;
    const maiorDaLinha = Math.max(...valores);
    if (ehLinhaTotal) {
      return maiorDaLinha;
    }
    if (candidato === null || maiorDaLinha > candidato) {
      candidato = maiorDaLinha;
    }
  }
  return candidato;
}

function paraNumero(valorTexto: string): number {
  const limpo = valorTexto.replace(/\./g, '').replace(',', '.');
  return parseFloat(limpo);
}

function extrairEstabelecimento(texto: string): string {
  const linhas = texto
    .split('\n')
    .map((l) => l.trim())
    .filter((l) => l.length > 2);

  for (const linha of linhas) {
    const apenasLetras = linha.replace(/[^a-zA-ZÀ-ÿ\s]/g, '').trim();
    if (apenasLetras.length >= 3 && apenasLetras.length / linha.length > 0.5) {
      return linha.slice(0, 60);
    }
  }
  return linhas[0]?.slice(0, 60) ?? '';
}

function interpretarTexto(texto: string): DadosExtraidos {
  const textoMinusculo = texto.toLowerCase();
  return {
    estabelecimento: extrairEstabelecimento(texto),
    tipo: identificarTipo(textoMinusculo),
    valor: extrairValor(texto),
    data: extrairData(texto),
    textoCompleto: texto,
  };
}
