import { useEffect, useRef, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import Topo from '../components/Topo';
import { lerComprovante } from '../ocr';
import { adicionarDespesa, atualizarDespesa, buscarDespesaPorId } from '../storage';

export default function NovoGasto() {
  const navigate = useNavigate();
  const { id } = useParams();
  const emEdicao = Boolean(id);
  const inputFotoRef = useRef<HTMLInputElement>(null);
  const inputAnexoRef = useRef<HTMLInputElement>(null);

  const [imagem, setImagem] = useState<string | null>(null);
  const [lendoFoto, setLendoFoto] = useState(false);
  const [progresso, setProgresso] = useState(0);
  const [erro, setErro] = useState('');
  const [criadoEm, setCriadoEm] = useState<string | null>(null);

  const [data, setData] = useState(() => new Date().toISOString().slice(0, 10));
  const [cliente, setCliente] = useState('');
  const [valor, setValor] = useState('');
  const [kmRodado, setKmRodado] = useState('');

  const [mostrarOpcionais, setMostrarOpcionais] = useState(false);
  const [observacoes, setObservacoes] = useState('');

  useEffect(() => {
    if (!id) return;
    const despesa = buscarDespesaPorId(id);
    if (!despesa) {
      navigate('/painel');
      return;
    }
    setData(despesa.data);
    setCliente(despesa.cliente ?? '');
    setValor(despesa.valor.toFixed(2).replace('.', ','));
    setKmRodado(despesa.kmRodado !== undefined ? String(despesa.kmRodado).replace('.', ',') : '');
    setObservacoes(despesa.observacoes ?? '');
    setImagem(despesa.imagem ?? null);
    setCriadoEm(despesa.criadoEm);
    if (despesa.observacoes) setMostrarOpcionais(true);
  }, [id, navigate]);

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
        if (dados.valor !== null) setValor(dados.valor.toFixed(2).replace('.', ','));
        if (dados.data) setData(dados.data);
        if (dados.valor === null && !dados.data) {
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
    if (isNaN(valorNumerico) || valorNumerico <= 0) {
      setErro('Informe um valor válido.');
      return;
    }
    if (!data) {
      setErro('Informe a data da compra.');
      return;
    }
    const kmRodadoNumerico = kmRodado.trim() ? parseFloat(kmRodado.replace(',', '.')) : NaN;
    const despesa = {
      id: id ?? crypto.randomUUID(),
      valor: valorNumerico,
      data,
      imagem: imagem ?? undefined,
      criadoEm: criadoEm ?? new Date().toISOString(),
      kmRodado: isNaN(kmRodadoNumerico) ? undefined : kmRodadoNumerico,
      cliente: cliente.trim() || undefined,
      observacoes: observacoes.trim() || undefined,
    };
    if (emEdicao) {
      atualizarDespesa(despesa);
    } else {
      adicionarDespesa(despesa);
    }
    navigate('/painel');
  }

  return (
    <>
      <Topo titulo={emEdicao ? 'Editar Gasto' : 'Novo Gasto'} mostrarVoltar />
      <main className="conteudo">
        {!imagem && (
          <div className="grupo-botoes-foto">
            <button
              type="button"
              className="botao-grande"
              onClick={() => inputFotoRef.current?.click()}
            >
              <span className="icone">📷</span>
              Tirar Foto do Comprovante
            </button>
            <button
              type="button"
              className="botao-grande secundario"
              onClick={() => inputAnexoRef.current?.click()}
            >
              <span className="icone">🖼️</span>
              Anexar Foto da Galeria
            </button>
          </div>
        )}
        <input
          ref={inputFotoRef}
          type="file"
          accept="image/*"
          capture="environment"
          style={{ display: 'none' }}
          onChange={aoMudarArquivo}
        />
        <input
          ref={inputAnexoRef}
          type="file"
          accept="image/*"
          style={{ display: 'none' }}
          onChange={aoMudarArquivo}
        />

        {imagem && (
          <div className="cartao">
            <img src={imagem} alt="Comprovante" className="previa-foto" />
            <div className="grupo-botoes-foto">
              <button
                type="button"
                className="botao-acao"
                onClick={() => inputFotoRef.current?.click()}
              >
                Tirar Outra Foto
              </button>
              <button
                type="button"
                className="botao-acao"
                onClick={() => inputAnexoRef.current?.click()}
              >
                Anexar Outra Foto
              </button>
            </div>
          </div>
        )}

        {lendoFoto && (
          <div className="aviso-ocr">
            <span className="spinner" />
            Lendo o comprovante… {progresso}%
          </div>
        )}

        <div className="cartao">
          <label htmlFor="data">Data da Compra</label>
          <input
            id="data"
            type="date"
            value={data}
            onChange={(e) => setData(e.target.value)}
          />

          <label htmlFor="cliente">Cliente</label>
          <input
            id="cliente"
            type="text"
            value={cliente}
            onChange={(e) => setCliente(e.target.value)}
            placeholder="Ex: Empresa ABC"
          />

          <label htmlFor="valor">Valor Gasto (R$)</label>
          <input
            id="valor"
            type="text"
            inputMode="decimal"
            value={valor}
            onChange={(e) => setValor(e.target.value)}
            placeholder="Ex: 150,00"
          />

          <label htmlFor="kmRodado">Km Rodado</label>
          <input
            id="kmRodado"
            type="text"
            inputMode="decimal"
            value={kmRodado}
            onChange={(e) => setKmRodado(e.target.value)}
            placeholder="Ex: 150"
          />

          {erro && <p className="erro-texto">{erro}</p>}
        </div>

        {!mostrarOpcionais && (
          <button
            type="button"
            className="botao-acao"
            onClick={() => setMostrarOpcionais(true)}
          >
            ➕ Adicionar Mais Informações (opcional)
          </button>
        )}

        {mostrarOpcionais && (
          <div className="cartao">
            <h2 style={{ marginTop: 0 }}>Informações Opcionais</h2>

            <label htmlFor="observacoes">Observações</label>
            <input
              id="observacoes"
              type="text"
              value={observacoes}
              onChange={(e) => setObservacoes(e.target.value)}
              placeholder="Anotações sobre o gasto"
            />
          </div>
        )}

        <button
          type="button"
          className="botao-acao principal"
          onClick={aoSalvar}
          style={{ marginTop: '0.3rem' }}
        >
          {emEdicao ? 'Salvar Alterações' : 'Salvar Gasto'}
        </button>
      </main>
    </>
  );
}
