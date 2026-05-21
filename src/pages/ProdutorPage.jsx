import { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { api } from '../lib/api';
import StatusPill from '../components/StatusPill';

export default function ProdutorPage() {
    const { produtorId } = useParams();
    const navigate = useNavigate();

    const [produtor, setProdutor] = useState(null);
    const [eventos, setEventos] = useState([]);
    const [carregando, setCarregando] = useState(true);
    const [erro, setErro] = useState('');

    useEffect(() => {
        setCarregando(true);
        Promise.all([
            api.buscarProdutor(produtorId),
            api.eventosDoProdutor(produtorId),
        ])
            .then(([p, e]) => {
                setProdutor(p.produtor);
                setEventos(e.eventos || []);
            })
            .catch((err) => setErro(err.message))
            .finally(() => setCarregando(false));
    }, [produtorId]);

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
                <Link to="/produtores" className="link-voltar">
                    ← Voltar para produtores
                </Link>
            </div>
        );
    }

    return (
        <div className="container">
            <Link to="/produtores" className="link-voltar">
                ← Produtores
            </Link>

            <div className="page-head">
                <h1>{produtor?.nome || 'Produtor'}</h1>
                <button
                    className="btn btn-primary"
                    onClick={() => navigate(`/produtores/${produtorId}/importar`)}
                >
                    Novo evento
                </button>
            </div>

            {eventos.length === 0 ? (
                <div className="card">
                    <p className="muted">
                        Nenhum evento importado ainda. Use "Novo evento" para buscar e
                        importar os eventos desta conta Sympla.
                    </p>
                </div>
            ) : (
                <div className="card-grid">
                    {eventos.map((ev) => (
                        <button
                            key={ev.id}
                            className="tile"
                            onClick={() => navigate(`/eventos/${ev.id}`)}
                        >
                            <div className="tile-titulo">{ev.nome || 'Evento'}</div>
                            <div className="tile-sub">{ev.local || '—'}</div>
                            <div style={{ marginTop: 10 }}>
                                <StatusPill status={ev.status || 'ATIVO'} />
                            </div>
                        </button>
                    ))}
                </div>
            )}
        </div>
    );
}