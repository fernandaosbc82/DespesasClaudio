import { useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Topo from '../components/Topo';
import { lerComprovante } from '../ocr';
import { adicionarDespesa } from '../storage';
import type { TipoDespesa } from '../types';
import { TIPO_LABEL } from '../types';

export default function NovoGasto() {
  const navigate = useNavigate();
  const inputFotoRef = useRef<HTMLInputElement>(null);

  const [imagem, setImagem] = useState<string | null>(null);
  const [lendoFoto, setLendoFoto] = useState(false);
  const [progresso, setProgresso] = useState(0);
  const [erro, setErro] = useState('');

  const [estabelecimento, setEstabelecimento] = useState('');
  const [tipo, setTipo] = useState<TipoDespesa>('outros');
  const [valor, setValor] = useState('');
  const [data, setData] = useState(() => new Date().toISOString().slice(0, 10));

  async function aoEscolherFoto(arquivo: File) {
    setErro('');
    const leitor = new FileReader();
    leitor.onload = async () => {
      const urlImagem = leitor.result as string;
      setImagem(urlImagem);
      setLendoFoto(true);
      setProgresso(0);
      try {
        const dados = await lerComprovante(urlImagem, setProgresso);
        setEstabelecimento(dados.estabelecimento || '');
        setTipo(dados.tipo);
        if (dados.valor !== null) setValor(dados.valor.toFixed(2).replace('.', ','));
        if (dados.data) setData(dados.data);
        if (!dados.estabelecimento && dados.valor === null && !dados.data) {
          setErro('Não conseguimos ler todos os dados. Por favor, confira e complete abaixo.');
        }
      } catch {
        setErro('Não foi possível ler a foto automaticamente. Preencha os campos abaixo.');
      } finally {
        setLendoFoto(false);
      }
    };
    leitor.readAsDataURL(arquivo);
  }

  function aoMudarArquivo(evento: React.ChangeEvent<HTMLInputElement>) {
    const arquivo = evento.target.files?.[0];
    if (arquivo) aoEscolherFoto(arquivo);
  }

  function aoSalvar() {
    const valorNumerico = parseFloat(valor.replace(',', '.'));
    if (!estabelecimento.trim()) {
      setErro('Informe o nome do estabelecimento.');
      return;
    }
    if (isNaN(valorNumerico) || valorNumerico <= 0) {
      setErro('Informe um valor válido.');
      return;
    }
    if (!data) {
      setErro('Informe a data da compra.');
      return;
    }
    adicionarDespesa({
      id: crypto.randomUUID(),
      estabelecimento: estabelecimento.trim(),
      tipo,
      valor: valorNumerico,
      data,
      imagem: imagem ?? undefined,
      criadoEm: new Date().toISOString(),
    });
    navigate('/painel');
  }

  return (
    <>
      <Topo titulo="Novo Gasto" mostrarVoltar />
      <main className="conteudo">
        {!imagem && (
          <button
            type="button"
            className="botao-grande"
            onClick={() => inputFotoRef.current?.click()}
          >
            <span className="icone">📷</span>
            Tirar Foto do Comprovante
          </button>
        )}
        <input
          ref={inputFotoRef}
          type="file"
          accept="image/*"
          capture="environment"
          style={{ display: 'none' }}
          onChange={aoMudarArquivo}
        />

        {imagem && (
          <div className="cartao">
            <img src={imagem} alt="Comprovante" className="previa-foto" />
            <button
              type="button"
              className="botao-acao"
              onClick={() => inputFotoRef.current?.click()}
            >
              Tirar Outra Foto
            </button>
          </div>
        )}

        {lendoFoto && (
          <div className="aviso-ocr">
            <span className="spinner" />
            Lendo o comprovante… {progresso}%
          </div>
        )}

        <div className="cartao">
          <label htmlFor="estabelecimento">Nome do Estabelecimento</label>
          <input
            id="estabelecimento"
            type="text"
            value={estabelecimento}
            onChange={(e) => setEstabelecimento(e.target.value)}
            placeholder="Ex: Posto Shell"
          />

          <label htmlFor="tipo">Tipo de Gasto</label>
          <select id="tipo" value={tipo} onChange={(e) => setTipo(e.target.value as TipoDespesa)}>
            {Object.entries(TIPO_LABEL).map(([valorTipo, rotulo]) => (
              <option key={valorTipo} value={valorTipo}>
                {rotulo}
              </option>
            ))}
          </select>

          <label htmlFor="valor">Valor (R$)</label>
          <input
            id="valor"
            type="text"
            inputMode="decimal"
            value={valor}
            onChange={(e) => setValor(e.target.value)}
            placeholder="Ex: 150,00"
          />

          <label htmlFor="data">Data da Compra</label>
          <input
            id="data"
            type="date"
            value={data}
            onChange={(e) => setData(e.target.value)}
          />

          {erro && <p className="erro-texto">{erro}</p>}

          <div style={{ marginTop: '1.3rem' }}>
            <button type="button" className="botao-acao principal" onClick={aoSalvar}>
              Salvar Gasto
            </button>
          </div>
        </div>
      </main>
    </>
  );
}
