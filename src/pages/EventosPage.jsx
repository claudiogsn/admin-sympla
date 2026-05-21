import { useState } from 'react';
import { api } from '../lib/api';
import StatusPill from '../components/StatusPill';

export default function EventosPage({ eventos, eventoSel, onRecarregar, onToast }) {
  const [novo, setNovo] = useState({ sympla_event_id: '', sympla_token: '' });
  const [criando, setCriando] = useState(false);
  const [sincronizando, setSincronizando] = useState(false);

  async function criar() {
    if (!novo.sympla_event_id.trim() || !novo.sympla_token.trim()) {
      return onToast('Preencha o ID do evento e o token.', 'err');
    }
    setCriando(true);
    try {
      await api.criarEvento(novo.sympla_event_id.trim(), novo.sympla_token.trim());
      setNovo({ sympla_event_id: '', sympla_token: '' });
      onToast('Evento cadastrado com sucesso.', 'ok');
      onRecarregar();
    } catch (err) {
      onToast(err.message, 'err');
    } finally {
      setCriando(false);
    }
  }

  async function sincronizar() {
    if (!eventoSel) return;
    setSincronizando(true);
    try {
      const r = await api.sincronizar(eventoSel.id);
      onToast(`Sincronização concluída: ${r.sincronizados} participantes.`, 'ok');
      onRecarregar();
    } catch (err) {
      onToast(err.message, 'err');
    } finally {
      setSincronizando(false);
    }
  }

  return (
    <div style={{ display: 'grid', gap: 16 }}>
      <div className="card">
        <div className="card-title">Cadastrar novo evento</div>
        <div className="row" style={{ flexWrap: 'wrap', alignItems: 'flex-end' }}>
          <div style={{ flex: 1, minWidth: 150 }}>
            <label className="lbl">ID do evento na Sympla</label>
            <input
              className="inp"
              value={novo.sympla_event_id}
              onChange={(e) => setNovo({ ...novo, sympla_event_id: e.target.value })}
              placeholder="ex.: 2959602"
            />
          </div>
          <div style={{ flex: 2, minWidth: 200 }}>
            <label className="lbl">Token de acesso (s_token)</label>
            <input
              className="inp"
              type="password"
              value={novo.sympla_token}
              onChange={(e) => setNovo({ ...novo, sympla_token: e.target.value })}
              placeholder="token da conta Sympla"
            />
          </div>
          <button className="btn btn-primary" onClick={criar} disabled={criando}>
            {criando ? 'Validando...' : 'Buscar e cadastrar'}
          </button>
        </div>
        <p className="muted" style={{ marginTop: 10 }}>
          O backend valida o token na Sympla e importa nome, local e datas do evento.
        </p>
      </div>

      {eventoSel ? (
        <div className="card">
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: 12,
            }}
          >
            <div className="card-title" style={{ margin: 0 }}>
              {eventoSel.nome}
            </div>
            <button
              className="btn btn-primary"
              onClick={sincronizar}
              disabled={sincronizando}
            >
              {sincronizando ? 'Sincronizando...' : 'Sincronizar participantes'}
            </button>
          </div>
          <table>
            <tbody>
              <Linha rotulo="ID Sympla" valor={eventoSel.sympla_event_id} />
              <Linha rotulo="Local" valor={eventoSel.local || '—'} />
              <Linha
                rotulo="Status"
                valor={<StatusPill status={eventoSel.status} />}
              />
              <Linha
                rotulo="Última sincronização"
                valor={eventoSel.ultima_sync || 'nunca'}
              />
              <Linha
                rotulo="Participantes importados"
                valor={eventoSel.total_sincronizado ?? 0}
              />
              <Linha
                rotulo="URL do totem"
                valor={<code>/toten/{eventoSel.id}</code>}
              />
            </tbody>
          </table>
        </div>
      ) : (
        <div className="card">
          <p className="muted">
            {eventos.length === 0
              ? 'Nenhum evento cadastrado ainda. Cadastre o primeiro acima.'
              : 'Selecione um evento na barra acima.'}
          </p>
        </div>
      )}
    </div>
  );
}

function Linha({ rotulo, valor }) {
  return (
    <tr>
      <td style={{ color: 'var(--text-soft)', width: 200 }}>{rotulo}</td>
      <td>{valor}</td>
    </tr>
  );
}
