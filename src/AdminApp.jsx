import { Routes, Route, Navigate, Link } from 'react-router-dom';
import ProdutoresPage from './pages/ProdutoresPage';
import ProdutorPage from './pages/ProdutorPage';
import ImportarEventoPage from './pages/ImportarEventoPage';
import EventoPage from './pages/EventoPage';
import ParticipantesPage from './pages/ParticipantesPage';
import TotemConfigPage from './pages/TotemConfigPage';

export default function AdminApp() {
  return (
      <div className="app-shell">
        <header className="topbar">
          <Link to="/produtores" className="brand">
            Check-in Sympla
          </Link>
        </header>
        <Routes>
          <Route path="/" element={<Navigate to="/produtores" replace />} />
          <Route path="/produtores" element={<ProdutoresPage />} />
          <Route path="/produtores/:produtorId" element={<ProdutorPage />} />
          <Route
              path="/produtores/:produtorId/importar"
              element={<ImportarEventoPage />}
          />
          <Route path="/eventos/:eventoId" element={<EventoPage />} />
          <Route
              path="/eventos/:eventoId/participantes"
              element={<ParticipantesPage />}
          />
          <Route
              path="/eventos/:eventoId/totem-config"
              element={<TotemConfigPage />}
          />
          <Route path="*" element={<Navigate to="/produtores" replace />} />
        </Routes>
      </div>
  );
}