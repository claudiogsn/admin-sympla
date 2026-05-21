import { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { api } from '../lib/api';

function formatarData(iso) {
    if (!iso) return '';
    const d = new Date(iso.replace(' ', 'T'));
    if (isNaN(d)) return iso;
    return d.toLocaleDateString('pt-BR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
    });
}

export default function ImportarEventoPage() {
    const { produtorId } = useParams();
    const navigate = useNavigate();

    const [eventos, setEventos] = useState([]);
    const [carregando, setCarregando] = useState(true);
    const [erro, setErro] = useState('');
    const [importandoId, setImportandoId] = useState(null);
    const [toast, setToast] = useState(null);

    function flash(texto, tipo = 'ok') {
        setToast({ texto, tipo });
        setTimeout(() => setToast(null), 4000);
    }

    async function carregar() {
        setCarregando(true);
        setErro('');
        try {
            const r = await api.symplaEventos(produtorId);
            setEventos(r.eventos || []);
        } catch (err) {
            setErro(err.message);
        } finally {
            setCarregando(false);
        }
    }

    useEffect(() => {
        carregar();
    }, [produtorId]);

    async function importar(ev) {
        setImportandoId(ev.sympla_event_id);
        try {
            const r = await api.importarEvento(produtorId, ev.sympla_event_id);
            // O backend pode devolver aviso (HTTP 207): evento criado, sync falhou.
            if (r.aviso) {
                flash(r.aviso, 'err');
            } else {
                flash(
                    `Evento importado: ${r.sincronizados} participantes sincronizados.`,
                    'ok'
                );
            }
            // Marca como importado na lista, sem recarregar tudo.
            setEventos((lista) =>
                lista.map((x) =>
                    x.sympla_event_id === ev.sympla_event_id
                        ? { ...x, importado: true }
                        : x
                )
            );
        } catch (err) {
            flash(err.message, 'err');
        } finally {
            setImportandoId(null);
        }
    }

    return (
        <div className="container">
            <Link to={`/produtores/${produtorId}`} className="link-voltar">
                ← Voltar
            </Link>

            <div className="page-head">
                <h1>Importar evento</h1>
                <button className="btn" onClick={carregar} disabled={carregando}>
                    Atualizar lista
                </button>
            </div>

            {toast && <div className={`toast ${toast.tipo}`}>{toast.texto}</div>}

            {carregando ? (
                <p className="muted">Buscando eventos na Sympla...</p>
            ) : erro ? (
                <div className="card">
                    <div className="toast err" style={{ marginBottom: 0 }}>
                        {erro}
                    </div>
                </div>
            ) : eventos.length === 0 ? (
                <div className="card">
                    <p className="muted">
                        Nenhum evento encontrado nesta conta Sympla.
                    </p>
                </div>
            ) : (
                <div className="card">
                    <table>
                        <thead>
                        <tr>
                            <th>Evento</th>
                            <th>Local</th>
                            <th>Data</th>
                            <th style={{ textAlign: 'right' }}>Ação</th>
                        </tr>
                        </thead>
                        <tbody>
                        {eventos.map((ev) => (
                            <tr key={ev.sympla_event_id}>
                                <td>{ev.nome || '—'}</td>
                                <td>{ev.local || '—'}</td>
                                <td>{formatarData(ev.data_inicio)}</td>
                                <td style={{ textAlign: 'right' }}>
                                    {ev.importado ? (
                                        <span className="pill ok">Já importado</span>
                                    ) : (
                                        <button
                                            className="btn btn-primary"
                                            onClick={() => importar(ev)}
                                            disabled={importandoId === ev.sympla_event_id}
                                        >
                                            {importandoId === ev.sympla_event_id
                                                ? 'Importando...'
                                                : 'Importar'}
                                        </button>
                                    )}
                                </td>
                            </tr>
                        ))}
                        </tbody>
                    </table>
                </div>
            )}

            <p className="muted" style={{ marginTop: 14 }}>
                Importar um evento cria-o na base e sincroniza os participantes
                automaticamente.
            </p>
        </div>
    );
}