import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Topo from '../components/Topo';
import {
  carregarDespesas,
  carregarPrecosCombustivel,
  removerDespesa,
  salvarPrecoCombustivelMes,
} from '../storage';
import { exportarParaExcel } from '../exportarExcel';
import type { Despesa, TipoDespesa } from '../types';
import { TIPO_LABEL } from '../types';

const KM_POR_LITRO = 10;

export default function Painel() {
  const navigate = useNavigate();
  const [despesas, setDespesas] = useState<Despesa[]>([]);
  const [precosCombustivel, setPrecosCombustivel] = useState<Record<string, number>>({});

  useEffect(() => {
    setDespesas(carregarDespesas());
    setPrecosCombustivel(carregarPrecosCombustivel());
  }, []);

  const totais = useMemo(() => {
    const porTipo: Record<TipoDespesa, number> = {
      combustivel: 0,
      alimentacao: 0,
      outros: 0,
    };
    let geral = 0;
    for (const d of despesas) {
      porTipo[d.tipo] += d.valor;
      geral += d.valor;
    }
    return { porTipo, geral };
  }, [despesas]);

  const resumoMensal = useMemo(() => {
    const porMes = new Map<string, number>();
    for (const d of despesas) {
      const mes = d.data.slice(0, 7);
      porMes.set(mes, (porMes.get(mes) ?? 0) + (d.kmRodado ?? 0));
    }
    return [...porMes.entries()]
      .sort((a, b) => (a[0] < b[0] ? 1 : -1))
      .map(([mes, kmTotal]) => {
        const litrosEstimados = kmTotal / KM_POR_LITRO;
        const precoMedio = precosCombustivel[mes];
        const gastoEstimado = precoMedio ? litrosEstimados * precoMedio : null;
        return { mes, kmTotal, litrosEstimados, precoMedio, gastoEstimado };
      });
  }, [despesas, precosCombustivel]);

  const despesasOrdenadas = useMemo(
    () => [...despesas].sort((a, b) => (a.data < b.data ? 1 : -1)),
    [despesas],
  );

  function aoExcluir(id: string) {
    const confirmou = window.confirm('Tem certeza que deseja excluir este gasto?');
    if (!confirmou) return;
    setDespesas(removerDespesa(id));
  }

  function aoMudarPrecoCombustivel(mes: string, valorTexto: string) {
    const valor = parseFloat(valorTexto.replace(',', '.'));
    if (isNaN(valor) || valor < 0) return;
    setPrecosCombustivel(salvarPrecoCombustivelMes(mes, valor));
  }

  function formatarValor(valor: number) {
    return valor.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
  }

  function formatarDataBr(isoData: string) {
    const [ano, mes, dia] = isoData.split('-');
    return `${dia}/${mes}/${ano}`;
  }

  function formatarMes(mes: string) {
    const [ano, mesNum] = mes.split('-');
    const nomes = [
      'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
      'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro',
    ];
    return `${nomes[Number(mesNum) - 1]}/${ano}`;
  }

  return (
    <>
      <Topo titulo="Painel de Gastos" mostrarVoltar />
      <main className="conteudo">
        <div className="resumo-totais">
          <div className="linha-total geral">
            <span>Total Geral</span>
            <span>{formatarValor(totais.geral)}</span>
          </div>
          <div className="linha-total combustivel">
            <span>{TIPO_LABEL.combustivel}</span>
            <span>{formatarValor(totais.porTipo.combustivel)}</span>
          </div>
          <div className="linha-total alimentacao">
            <span>{TIPO_LABEL.alimentacao}</span>
            <span>{formatarValor(totais.porTipo.alimentacao)}</span>
          </div>
          <div className="linha-total outros">
            <span>{TIPO_LABEL.outros}</span>
            <span>{formatarValor(totais.porTipo.outros)}</span>
          </div>
        </div>

        {resumoMensal.length > 0 && (
          <div className="cartao">
            <h2 style={{ marginTop: 0 }}>Resumo Mensal de Km Rodado</h2>
            {resumoMensal.map(({ mes, kmTotal, litrosEstimados, precoMedio, gastoEstimado }) => (
              <div className="resumo-mes" key={mes}>
                <h3>{formatarMes(mes)}</h3>
                <p>Km rodado: {kmTotal.toLocaleString('pt-BR')} km</p>
                <p>Consumo estimado ({KM_POR_LITRO} km/l): {litrosEstimados.toLocaleString('pt-BR', { maximumFractionDigits: 1 })} litros</p>
                <label htmlFor={`preco-${mes}`}>Valor médio pago por litro de combustível (R$)</label>
                <input
                  id={`preco-${mes}`}
                  type="text"
                  inputMode="decimal"
                  defaultValue={precoMedio !== undefined ? String(precoMedio).replace('.', ',') : ''}
                  onBlur={(e) => aoMudarPrecoCombustivel(mes, e.target.value)}
                  placeholder="Ex: 6,15"
                />
                {gastoEstimado !== null && (
                  <p className="gasto-estimado">
                    Gasto estimado com combustível: {formatarValor(gastoEstimado)}
                  </p>
                )}
              </div>
            ))}
          </div>
        )}

        <button
          type="button"
          className="botao-acao principal"
          disabled={despesas.length === 0}
          onClick={() => exportarParaExcel(despesas, precosCombustivel)}
          style={{ marginBottom: '1.2rem' }}
        >
          📥 Exportar para Excel
        </button>

        <button
          type="button"
          className="botao-acao"
          onClick={() => navigate('/novo')}
          style={{ marginBottom: '1.5rem' }}
        >
          ➕ Cadastrar Novo Gasto
        </button>

        {despesasOrdenadas.length === 0 ? (
          <p className="mensagem-vazio">Nenhum gasto cadastrado ainda.</p>
        ) : (
          despesasOrdenadas.map((d) => (
            <div className="cartao item-despesa" key={d.id}>
              <div className="info">
                <h3>{formatarDataBr(d.data)}</h3>
                <span className={`selo-tipo ${d.tipo}`}>{TIPO_LABEL[d.tipo]}</span>
                {d.cliente && <p>Cliente: {d.cliente}</p>}
                {d.kmRodado !== undefined && <p>Km rodado: {d.kmRodado}</p>}
                {d.observacoes && <p>Obs: {d.observacoes}</p>}
              </div>
              <div style={{ textAlign: 'right' }}>
                <p className="valor-despesa">{formatarValor(d.valor)}</p>
                <button
                  type="button"
                  className="botao-excluir"
                  aria-label="Excluir gasto"
                  onClick={() => aoExcluir(d.id)}
                >
                  🗑️
                </button>
              </div>
            </div>
          ))
        )}
      </main>
    </>
  );
}
