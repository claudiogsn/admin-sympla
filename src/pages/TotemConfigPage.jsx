import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { api } from '../lib/api';
import EtiquetaPreview from '../components/EtiquetaPreview';
import TotemPreview from '../components/TotemPreview';

const TOGGLES_ETIQUETA = [
  ['etq_mostrar_nome1', 'Primeiro nome'],
  ['etq_mostrar_nome2', 'Sobrenome'],
  ['etq_mostrar_cargo', 'Cargo / tipo de ingresso'],
  ['etq_mostrar_qrcode', 'QR code (código da inscrição)'],
  ['etq_mostrar_logo', 'Logo na etiqueta'],
];

export default function TotemConfigPage() {
  const { eventoId } = useParams();
  const [cfg, setCfg] = useState(null);
  const [erro, setErro] = useState('');
  const [salvando, setSalvando] = useState(false);
  const [toast, setToast] = useState(null);

  function flash(texto, tipo = 'ok') {
    setToast({ texto, tipo });
    setTimeout(() => setToast(null), 3500);
  }

  useEffect(() => {
    api
        .obterTotemConfig(eventoId)
        .then((r) => setCfg(r.config))
        .catch((err) => setErro(err.message));
  }, [eventoId]);

  const set = (k, v) => setCfg((c) => ({ ...c, [k]: v }));

  async function salvar() {
    setSalvando(true);
    try {
      const r = await api.salvarTotemConfig(eventoId, cfg);
      setCfg(r.config);
      flash('Configuração salva.', 'ok');
    } catch (err) {
      flash(err.message, 'err');
    } finally {
      setSalvando(false);
    }
  }

  if (erro) {
    return (
        <div className="container">
          <div className="toast err">{erro}</div>
        </div>
    );
  }
  if (!cfg) {
    return (
        <div className="container">
          <p className="muted">Carregando configuração...</p>
        </div>
    );
  }

  return (
      <div className="container">
        <Link to={`/eventos/${eventoId}`} className="link-voltar">
          ← Voltar ao evento
        </Link>

        <div className="page-head">
          <h1>Configurar totem</h1>
          <button className="btn btn-primary" onClick={salvar} disabled={salvando}>
            {salvando ? 'Salvando...' : 'Salvar configuração'}
          </button>
        </div>

        {toast && <div className={`toast ${toast.tipo}`}>{toast.texto}</div>}

        <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: 16 }}>
          <div style={{ display: 'grid', gap: 16 }}>
            <div className="card">
              <div className="card-title">Identidade visual</div>
              <div className="grid-2" style={{ marginBottom: 12 }}>
                <div>
                  <label className="lbl">Cor primária</label>
                  <input
                      type="color"
                      className="inp"
                      value={cfg.cor_primaria}
                      onChange={(e) => set('cor_primaria', e.target.value)}
                      style={{ padding: 3 }}
                  />
                </div>
                <div>
                  <label className="lbl">Cor secundária</label>
                  <input
                      type="color"
                      className="inp"
                      value={cfg.cor_secundaria}
                      onChange={(e) => set('cor_secundaria', e.target.value)}
                      style={{ padding: 3 }}
                  />
                </div>
              </div>
              <label className="lbl">URL do logo</label>
              <input
                  className="inp"
                  value={cfg.logo_url}
                  onChange={(e) => set('logo_url', e.target.value)}
                  placeholder="https://..."
                  style={{ marginBottom: 12 }}
              />
              <label className="lbl">URL do banner</label>
              <input
                  className="inp"
                  value={cfg.banner_url}
                  onChange={(e) => set('banner_url', e.target.value)}
                  placeholder="https://..."
              />
            </div>

            <div className="card">
              <div className="card-title">Comportamento do totem</div>
              <label className="lbl">Título</label>
              <input
                  className="inp"
                  value={cfg.titulo_totem}
                  onChange={(e) => set('titulo_totem', e.target.value)}
                  style={{ marginBottom: 12 }}
              />
              <label className="lbl">Subtítulo</label>
              <input
                  className="inp"
                  value={cfg.subtitulo_totem}
                  onChange={(e) => set('subtitulo_totem', e.target.value)}
                  style={{ marginBottom: 12 }}
              />
              <label className="checkbox-line">
                <input
                    type="checkbox"
                    checked={!!cfg.teclado_virtual}
                    onChange={(e) => set('teclado_virtual', e.target.checked ? 1 : 0)}
                />
                Exibir teclado virtual na tela
              </label>
            </div>

            <div className="card">
              <div className="card-title">Etiqueta de impressão</div>
              <div className="grid-2" style={{ marginBottom: 12 }}>
                <div>
                  <label className="lbl">Largura (mm)</label>
                  <input
                      className="inp"
                      type="number"
                      value={cfg.etiqueta_largura_mm}
                      onChange={(e) =>
                          set('etiqueta_largura_mm', Number(e.target.value))
                      }
                  />
                </div>
                <div>
                  <label className="lbl">Altura (mm)</label>
                  <input
                      className="inp"
                      type="number"
                      value={cfg.etiqueta_altura_mm}
                      onChange={(e) =>
                          set('etiqueta_altura_mm', Number(e.target.value))
                      }
                  />
                </div>
              </div>
              {TOGGLES_ETIQUETA.map(([k, txt]) => (
                  <label key={k} className="checkbox-line">
                    <input
                        type="checkbox"
                        checked={!!cfg[k]}
                        onChange={(e) => set(k, e.target.checked ? 1 : 0)}
                    />
                    {txt}
                  </label>
              ))}
            </div>
          </div>

          <div style={{ display: 'grid', gap: 16, alignContent: 'start' }}>
            <div className="card">
              <div className="card-title" style={{ marginBottom: 4 }}>
                Preview da etiqueta
              </div>
              <p className="muted" style={{ marginBottom: 12 }}>
                {cfg.etiqueta_largura_mm} × {cfg.etiqueta_altura_mm} mm
              </p>
              <div style={{ display: 'flex', justifyContent: 'center', padding: '8px 0' }}>
                <EtiquetaPreview cfg={cfg} />
              </div>
            </div>
            <div className="card">
              <div className="card-title" style={{ marginBottom: 4 }}>
                Preview do totem
              </div>
              <p className="muted" style={{ marginBottom: 12 }}>
                Vertical 1080 × 1920
              </p>
              <div style={{ display: 'flex', justifyContent: 'center', padding: '8px 0' }}>
                <TotemPreview cfg={cfg} />
              </div>
            </div>
          </div>
        </div>
      </div>
  );
}