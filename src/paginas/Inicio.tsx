import { useNavigate } from 'react-router-dom';
import Topo from '../components/Topo';

export default function Inicio() {
  const navigate = useNavigate();
  return (
    <>
      <Topo titulo="Minhas Despesas" />
      <main className="conteudo">
        <button
          type="button"
          className="botao-grande"
          onClick={() => navigate('/novo')}
        >
          <span className="icone">📷</span>
          Cadastrar Novo Gasto
        </button>
        <button
          type="button"
          className="botao-grande secundario"
          onClick={() => navigate('/painel')}
        >
          <span className="icone">📊</span>
          Ver Painel de Gastos
        </button>
      </main>
    </>
  );
}
