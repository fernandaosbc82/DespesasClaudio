import { useNavigate } from 'react-router-dom';

interface TopoProps {
  titulo: string;
  mostrarVoltar?: boolean;
}

export default function Topo({ titulo, mostrarVoltar }: TopoProps) {
  const navigate = useNavigate();
  return (
    <header className="topo">
      {mostrarVoltar && (
        <button
          type="button"
          className="voltar"
          aria-label="Voltar"
          onClick={() => navigate(-1)}
        >
          ←
        </button>
      )}
      <h1>{titulo}</h1>
    </header>
  );
}
