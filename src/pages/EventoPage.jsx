import { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { api } from '../lib/api';

function formatarData(iso) {
    if (!iso) return '—';
    const d = new Date(String(iso).replace(' ', 'T'));
    if (isNaN(d)) return iso;
    return d.toLocaleDateString('pt-BR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
    });
}

export default function EventoPage() {
    const { eventoId } = useParams();
    const navigate = useNavigate();

    const [evento, setEvento] = useState(null);
    const [contadores, setContadores] = useState(null);
    const [erro, setErro] = useState('');
    const [carregando, setCarregando] = useState(true);
    const [sincronizando, setSincronizando] = useState(false);
    const [toast, setToast] = useState(null);

    function flash(texto, tipo = 'ok') {
        setToast({ texto, tipo });
        setTimeout(() => setToast(null), 3500);
    }

    async function carregar() {
        setCarregando(true);
        try {
            const [e, s] = await Promise.all([
                api.buscarEvento(eventoId),
                api.status(eventoId),
            ]);
            setEvento(e.evento);
            setContadores({ total: s.total, checked_in: s.checked_in });
        } catch (err) {
            setErro(err.message);
        } finally {
            setCarregando(false);
        }
    }

    useEffect(() => {
        carregar();
    }, [eventoId]);

    async function sincronizar() {
        setSincronizando(true);
        try {
            const r = await api.sincronizar(eventoId);
            flash(`Sincronização concluída: ${r.sincronizados} participantes.`, 'ok');
            carregar();
        } catch (err) {
            flash(err.message, 'err');
        } finally {
            setSincronizando(false);
        }
    }

    if (carregando) {
        return (
            <div className="container">
                <p className="muted">Carregando...</p>
            </div>
        );
    }
    if (erro) {
        return (
            <div className="container">
                <div className="toast err">{erro}</div>
            </div>
        );
    }

    return (
        <div className="container">
            <Link
                to={
                    evento?.produtor_id
                        ? `/produtores/${evento.produtor_id}`
                        : '/produtores'
                }
                className="link-voltar"
            >
                ← Voltar
            </Link>

            <div className="page-head">
                <h1>{evento?.nome || 'Evento'}</h1>
                <button
                    className="btn btn-primary"
                    onClick={sincronizar}
                    disabled={sincronizando}
                >
                    {sincronizando ? 'Sincronizando...' : 'Sincronizar participantes'}
                </button>
            </div>

            {toast && <div className={`toast ${toast.tipo}`}>{toast.texto}</div>}

            <div className="card" style={{ marginBottom: 18 }}>
                <div className="card-title">Resumo do evento</div>
                <div className="resumo-grid">
                    <Metrica rotulo="Local" valor={evento?.local || '—'} />
                    <Metrica rotulo="Data" valor={formatarData(evento?.data_inicio)} />
                    <Metrica
                        rotulo="Participantes"
                        valor={contadores?.total ?? 0}
                    />
                    <Metrica
                        rotulo="Check-ins feitos"
                        valor={contadores?.checked_in ?? 0}
                    />
                    <Metrica
                        rotulo="Última sincronização"
                        valor={evento?.ultima_sync || 'nunca'}
                    />
                    <Metrica
                        rotulo="URL do totem"
                        valor={`/toten/${evento?.id}`}
                        mono
                    />
                </div>
            </div>

            <div className="acao-grid">
                <button
                    className="acao-card"
                    onClick={() => navigate(`/eventos/${eventoId}/participantes`)}
                >
                    <div className="acao-titulo">Ver participantes</div>
                    <div className="acao-sub">
                        Buscar, listar e ver detalhes dos inscritos
                    </div>
                </button>
                <button
                    className="acao-card"
                    onClick={() => navigate(`/eventos/${eventoId}/totem-config`)}
                >
                    <div className="acao-titulo">Configurar totem</div>
                    <div className="acao-sub">
                        Identidade visual, etiqueta e comportamento
                    </div>
                </button>
            </div>
        </div>
    );
}

function Metrica({ rotulo, valor, mono }) {
    return (
        <div className="metrica">
            <div className="metrica-rotulo">{rotulo}</div>
            <div className="metrica-valor" style={mono ? { fontFamily: 'ui-monospace, monospace', fontSize: 14 } : null}>
                {valor}
            </div>
        </div>
    );
}