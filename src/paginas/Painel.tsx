import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Topo from '../components/Topo';
import { carregarDespesas, removerDespesa } from '../storage';
import { exportarParaExcel } from '../exportarExcel';
import type { Despesa, TipoDespesa } from '../types';
import { TIPO_LABEL } from '../types';

export default function Painel() {
  const navigate = useNavigate();
  const [despesas, setDespesas] = useState<Despesa[]>([]);

  useEffect(() => {
    setDespesas(carregarDespesas());
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

  const despesasOrdenadas = useMemo(
    () => [...despesas].sort((a, b) => (a.data < b.data ? 1 : -1)),
    [despesas],
  );

  function aoExcluir(id: string) {
    const confirmou = window.confirm('Tem certeza que deseja excluir este gasto?');
    if (!confirmou) return;
    setDespesas(removerDespesa(id));
  }

  function formatarValor(valor: number) {
    return valor.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
  }

  function formatarDataBr(isoData: string) {
    const [ano, mes, dia] = isoData.split('-');
    return `${dia}/${mes}/${ano}`;
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

        <button
          type="button"
          className="botao-acao principal"
          disabled={despesas.length === 0}
          onClick={() => exportarParaExcel(despesas)}
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
                <h3>{d.estabelecimento}</h3>
                <p>{formatarDataBr(d.data)}</p>
                <span className={`selo-tipo ${d.tipo}`}>{TIPO_LABEL[d.tipo]}</span>
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
