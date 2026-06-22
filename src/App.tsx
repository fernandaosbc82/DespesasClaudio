import { HashRouter, Route, Routes } from 'react-router-dom';
import Inicio from './paginas/Inicio';
import NovoGasto from './paginas/NovoGasto';
import Painel from './paginas/Painel';

function App() {
  return (
    <HashRouter>
      <Routes>
        <Route path="/" element={<Inicio />} />
        <Route path="/novo" element={<NovoGasto />} />
        <Route path="/editar/:id" element={<NovoGasto />} />
        <Route path="/painel" element={<Painel />} />
      </Routes>
    </HashRouter>
  );
}

export default App;
