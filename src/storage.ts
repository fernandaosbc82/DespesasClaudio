import type { Despesa } from './types';

const CHAVE = 'despesas-viagem';

export function carregarDespesas(): Despesa[] {
  try {
    const dados = localStorage.getItem(CHAVE);
    if (!dados) return [];
    return JSON.parse(dados) as Despesa[];
  } catch {
    return [];
  }
}

export function salvarDespesas(despesas: Despesa[]): void {
  localStorage.setItem(CHAVE, JSON.stringify(despesas));
}

export function adicionarDespesa(despesa: Despesa): Despesa[] {
  const atuais = carregarDespesas();
  const novas = [despesa, ...atuais];
  salvarDespesas(novas);
  return novas;
}

export function removerDespesa(id: string): Despesa[] {
  const restantes = carregarDespesas().filter((d) => d.id !== id);
  salvarDespesas(restantes);
  return restantes;
}

const CHAVE_PRECOS = 'precos-combustivel-mes';

export function carregarPrecosCombustivel(): Record<string, number> {
  try {
    const dados = localStorage.getItem(CHAVE_PRECOS);
    if (!dados) return {};
    return JSON.parse(dados) as Record<string, number>;
  } catch {
    return {};
  }
}

export function salvarPrecoCombustivelMes(mes: string, valor: number): Record<string, number> {
  const atuais = carregarPrecosCombustivel();
  const novos = { ...atuais, [mes]: valor };
  localStorage.setItem(CHAVE_PRECOS, JSON.stringify(novos));
  return novos;
}
