import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../lib/api';

export default function ProdutoresPage() {
    const [produtores, setProdutores] = useState([]);
    const [carregando, setCarregando] = useState(true);
    const [toast, setToast] = useState(null);

    const [mostrarForm, setMostrarForm] = useState(false);
    const [nome, setNome] = useState('');
    const [token, setToken] = useState('');
    const [salvando, setSalvando] = useState(false);

    const navigate = useNavigate();

    function flash(texto, tipo = 'ok') {
        setToast({ texto, tipo });
        setTimeout(() => setToast(null), 3500);
    }

    async function carregar() {
        setCarregando(true);
        try {
            const r = await api.listarProdutores();
            setProdutores(r.produtores || []);
        } catch (err) {
            flash(err.message, 'err');
        } finally {
            setCarregando(false);
        }
    }

    useEffect(() => {
        carregar();
    }, []);

    async function cadastrar() {
        if (!token.trim()) return flash('Cole o token do produtor.', 'err');
        setSalvando(true);
        try {
            await api.criarProdutor(nome.trim(), token.trim());
            setNome('');
            setToken('');
            setMostrarForm(false);
            flash('Produtor cadastrado.', 'ok');
            carregar();
        } catch (err) {
            flash(err.message, 'err');
        } finally {
            setSalvando(false);
        }
    }

    return (
        <div className="container">
            <div className="page-head">
                <h1>Produtores</h1>
                <button
                    className="btn btn-primary"
                    onClick={() => setMostrarForm((v) => !v)}
                >
                    {mostrarForm ? 'Cancelar' : 'Novo produtor'}
                </button>
            </div>

            {toast && <div className={`toast ${toast.tipo}`}>{toast.texto}</div>}

            {mostrarForm && (
                <div className="card" style={{ marginBottom: 18 }}>
                    <div className="card-title">Cadastrar produtor</div>
                    <div className="row" style={{ flexWrap: 'wrap', alignItems: 'flex-end' }}>
                        <div style={{ flex: 1, minWidth: 160 }}>
                            <label className="lbl">Nome do produtor</label>
                            <input
                                className="inp"
                                value={nome}
                                onChange={(e) => setNome(e.target.value)}
                                placeholder="ex.: Produtora XYZ"
                            />
                        </div>
                        <div style={{ flex: 2, minWidth: 220 }}>
                            <label className="lbl">Token de acesso da conta Sympla</label>
                            <input
                                className="inp"
                                type="password"
                                value={token}
                                onChange={(e) => setToken(e.target.value)}
                                placeholder="s_token da conta"
                            />
                        </div>
                        <button
                            className="btn btn-primary"
                            onClick={cadastrar}
                            disabled={salvando}
                        >
                            {salvando ? 'Validando...' : 'Validar e cadastrar'}
                        </button>
                    </div>
                    <p className="muted" style={{ marginTop: 10 }}>
                        O backend valida o token na Sympla antes de salvar.
                    </p>
                </div>
            )}

            {carregando ? (
                <p className="muted">Carregando...</p>
            ) : produtores.length === 0 ? (
                <div className="card">
                    <p className="muted">
                        Nenhum produtor cadastrado. Use "Novo produtor" para começar.
                    </p>
                </div>
            ) : (
                <div className="card-grid">
                    {produtores.map((p) => (
                        <button
                            key={p.id}
                            className="tile"
                            onClick={() => navigate(`/produtores/${p.id}`)}
                        >
                            <div className="tile-titulo">{p.nome || 'Produtor sem nome'}</div>
                            <div className="tile-sub">
                                {p.total_eventos ?? 0}{' '}
                                {Number(p.total_eventos) === 1 ? 'evento' : 'eventos'}
                            </div>
                        </button>
                    ))}
                </div>
            )}
        </div>
    );
}