import { useEffect, useState, useCallback } from 'react';
import { useParams, Link } from 'react-router-dom';
import { api } from '../lib/api';
import StatusPill from '../components/StatusPill';

function formatarDataHora(iso) {
    if (!iso) return '—';
    const d = new Date(String(iso).replace(' ', 'T'));
    if (isNaN(d)) return iso;
    return d.toLocaleString('pt-BR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
    });
}

export default function ParticipantesPage() {
    const { eventoId } = useParams();

    const [busca, setBusca] = useState('');
    const [lista, setLista] = useState([]);
    const [carregando, setCarregando] = useState(false);

    const [detalhe, setDetalhe] = useState(null);
    const [carregandoDetalhe, setCarregandoDetalhe] = useState(false);

    const carregar = useCallback(
        async (termo) => {
            setCarregando(true);
            try {
                const r = await api.buscarParticipantes(eventoId, termo, 50);
                setLista(r.resultados || []);
            } catch {
                setLista([]);
            } finally {
                setCarregando(false);
            }
        },
        [eventoId]
    );

    useEffect(() => {
        carregar('');
    }, [carregar]);

    // Debounce de 300ms na busca.
    useEffect(() => {
        const t = setTimeout(() => carregar(busca), 300);
        return () => clearTimeout(t);
    }, [busca, carregar]);

    async function abrirDetalhe(pid) {
        setCarregandoDetalhe(true);
        setDetalhe({ id: pid });
        try {
            const r = await api.detalheParticipante(eventoId, pid);
            setDetalhe(r.participante);
        } catch {
            setDetalhe(null);
        } finally {
            setCarregandoDetalhe(false);
        }
    }

    return (
        <div className="container">
            <Link to={`/eventos/${eventoId}`} className="link-voltar">
                ← Voltar ao evento
            </Link>

            <div className="page-head">
                <h1>Participantes</h1>
            </div>

            <div
                className="participantes-layout"
                style={{ display: 'grid', gridTemplateColumns: detalhe ? '1.5fr 1fr' : '1fr', gap: 16 }}
            >
                <div className="card">
                    <input
                        className="inp"
                        value={busca}
                        onChange={(e) => setBusca(e.target.value)}
                        placeholder="Buscar por nome, e-mail ou número do ingresso"
                        style={{ marginBottom: 14 }}
                    />
                    {carregando ? (
                        <p className="muted">Carregando...</p>
                    ) : lista.length === 0 ? (
                        <p className="muted">
                            {busca
                                ? 'Nenhum participante encontrado.'
                                : 'Nenhum participante. Sincronize o evento.'}
                        </p>
                    ) : (
                        <table>
                            <thead>
                            <tr>
                                <th>Nome</th>
                                <th>Ingresso</th>
                                <th>Status</th>
                            </tr>
                            </thead>
                            <tbody>
                            {lista.map((p) => (
                                <tr
                                    key={p.id}
                                    onClick={() => abrirDetalhe(p.id)}
                                    className={
                                        detalhe && detalhe.id === p.id ? 'linha-sel' : 'linha-click'
                                    }
                                >
                                    <td>{p.nome}</td>
                                    <td>
                                        <code>{p.ticket_number}</code>
                                    </td>
                                    <td>
                                        <StatusPill status={p.checkin_status} />
                                    </td>
                                </tr>
                            ))}
                            </tbody>
                        </table>
                    )}
                </div>

                {detalhe && (
                    <div className="card" style={{ alignSelf: 'start' }}>
                        <div
                            style={{
                                display: 'flex',
                                justifyContent: 'space-between',
                                alignItems: 'center',
                                marginBottom: 12,
                            }}
                        >
                            <div className="card-title" style={{ margin: 0 }}>
                                Detalhe do participante
                            </div>
                            <button
                                className="btn"
                                onClick={() => setDetalhe(null)}
                                style={{ height: 30, padding: '0 10px' }}
                            >
                                Fechar
                            </button>
                        </div>

                        {carregandoDetalhe ? (
                            <p className="muted">Carregando...</p>
                        ) : (
                            <table>
                                <tbody>
                                <LinhaD rotulo="Nome" valor={detalhe.nome} />
                                <LinhaD rotulo="E-mail" valor={detalhe.email || '—'} />
                                <LinhaD
                                    rotulo="Tipo de ingresso"
                                    valor={detalhe.ticket_name || '—'}
                                />
                                <LinhaD
                                    rotulo="Nº do ingresso"
                                    valor={<code>{detalhe.ticket_number}</code>}
                                />
                                <LinhaD
                                    rotulo="Código do QR"
                                    valor={<code>{detalhe.ticket_num_qr_code || '—'}</code>}
                                />
                                <LinhaD
                                    rotulo="Status"
                                    valor={<StatusPill status={detalhe.checkin_status} />}
                                />
                                <LinhaD
                                    rotulo="Check-in em"
                                    valor={
                                        detalhe.checkin_status === 'CHECKED_IN'
                                            ? formatarDataHora(detalhe.checkin_em)
                                            : '—'
                                    }
                                />
                                </tbody>
                            </table>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}

function LinhaD({ rotulo, valor }) {
    return (
        <tr>
            <td style={{ color: 'var(--text-soft)', width: 140 }}>{rotulo}</td>
            <td>{valor}</td>
        </tr>
    );
}