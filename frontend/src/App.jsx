import { Routes, Route } from 'react-router-dom';
import Layout from './components/layout/Layout';
import Dashboard from './pages/Dashboard';
import Eventos from './pages/Eventos';
import CrearEvento from './pages/CrearEvento';
import DetalleEvento from './pages/DetalleEvento';
import Clientes from './pages/Clientes';
import Equipos from './pages/Equipos';
import NotFound from './pages/NotFound';

export default function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route path="/" element={<Dashboard />} />
        <Route path="/eventos" element={<Eventos />} />
        <Route path="/eventos/crear" element={<CrearEvento />} />
        <Route path="/eventos/:id" element={<DetalleEvento />} />
        <Route path="/clientes" element={<Clientes />} />
        <Route path="/equipos" element={<Equipos />} />
        <Route path="*" element={<NotFound />} />
      </Route>
    </Routes>
  );
}