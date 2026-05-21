import { useEffect, useState, useCallback } from 'react';
import { api } from './lib/api';
import EventosPage from './pages/EventosPage';
import ParticipantesPage from './pages/ParticipantesPage';
import TotemConfigPage from './pages/TotemConfigPage';

const ABAS = [
  ['eventos', 'Eventos'],
  ['participantes', 'Participantes'],
  ['totem', 'Config. do totem'],
];

export default function App() {
  const [aba, setAba] = useState('eventos');
  const [eventos, setEventos] = useState([]);
  const [selId, setSelId] = useState(null);
  const [toast, setToast] = useState(null);

  const mostrarToast = useCallback((texto, tipo = 'ok') => {
    setToast({ texto, tipo });
    setTimeout(() => setToast(null), 3500);
  }, []);

  const carregarEventos = useCallback(async () => {
    try {
      const r = await api.listarEventos();
      const lista = r.eventos || [];
      setEventos(lista);
      // Mantém a seleção, ou seleciona o primeiro.
      setSelId((atual) => {
        if (atual && lista.some((e) => e.id === atual)) return atual;
        return lista.length ? lista[0].id : null;
      });
    } catch (err) {
      mostrarToast(err.message, 'err');
    }
  }, [mostrarToast]);

  useEffect(() => {
    carregarEventos();
  }, [carregarEventos]);

  const eventoSel = eventos.find((e) => e.id === selId) || null;

  return (
    <div className="app-shell">
      <header className="topbar">
        <span className="brand">Check-in Sympla</span>
        <nav>
          {ABAS.map(([id, label]) => (
            <a
              key={id}
              href="#"
              className={aba === id ? 'active' : ''}
              onClick={(e) => {
                e.preventDefault();
                setAba(id);
              }}
            >
              {label}
            </a>
          ))}
        </nav>
      </header>

      <div className="container">
        {toast && <div className={`toast ${toast.tipo}`}>{toast.texto}</div>}

        {eventos.length > 0 && (
          <div className="event-tabs">
            {eventos.map((e) => (
              <button
                key={e.id}
                className={`event-tab ${e.id === selId ? 'active' : ''}`}
                onClick={() => setSelId(e.id)}
              >
                {e.nome}
              </button>
            ))}
          </div>
        )}

        {aba === 'eventos' && (
          <EventosPage
            eventos={eventos}
            eventoSel={eventoSel}
            onRecarregar={carregarEventos}
            onToast={mostrarToast}
          />
        )}
        {aba === 'participantes' && (
          <ParticipantesPage eventoSel={eventoSel} onToast={mostrarToast} />
        )}
        {aba === 'totem' && (
          <TotemConfigPage eventoSel={eventoSel} onToast={mostrarToast} />
        )}
      </div>
    </div>
  );
}
