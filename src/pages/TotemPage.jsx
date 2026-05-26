import { useState, useEffect, useRef, useCallback } from 'react';
import { useParams } from 'react-router-dom';
import { api } from '../lib/api';
import TecladoVirtual from '../components/TecladoVirtual';
import EtiquetaImprimivel from '../components/EtiquetaImprimivel';
import '../totem.css';

// Tempo (ms) que as telas finais ficam antes de voltar ao início.
const AUTO_RETORNO_MS = 6000;

function iniciais(nome) {
  return (nome || '')
    .trim()
    .split(/\s+/)
    .map((p) => p[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();
}

export default function TotemPage() {
  const { eventoId } = useParams();

  const [cfg, setCfg] = useState(null);
  const [evento, setEvento] = useState(null);
  const [erroFatal, setErroFatal] = useState('');

  const [tela, setTela] = useState('inicio'); // inicio|confirma|imprimindo|sucesso|jausado|erro
  const [termo, setTermo] = useState('');
  const [resultados, setResultados] = useState([]);
  const [pessoa, setPessoa] = useState(null);
  const [msgErro, setMsgErro] = useState('');
  const [imprimirJaUsado, setImprimirJaUsado] = useState(false);

  const timerRef = useRef(null);

  // Carrega configuração e dados do evento.
  useEffect(() => {
    Promise.all([
      api.obterTotemConfig(eventoId),
      api.buscarEvento(eventoId),
    ])
      .then(([c, e]) => {
        setCfg(c.config);
        setEvento(e.evento);
      })
      .catch((err) => setErroFatal(err.message));
  }, [eventoId]);

  const voltarInicio = useCallback(() => {
    setTermo('');
    setResultados([]);
    setPessoa(null);
    setMsgErro('');
    setImprimirJaUsado(false);
    setTela('inicio');
  }, []);

  // Auto-retorno nas telas finais.
  useEffect(() => {
    if (['sucesso', 'jausado', 'erro'].includes(tela)) {
      timerRef.current = setTimeout(voltarInicio, AUTO_RETORNO_MS);
      return () => clearTimeout(timerRef.current);
    }
  }, [tela, voltarInicio]);

  // Busca com debounce de 300ms.
  useEffect(() => {
    if (termo.trim().length < 2) {
      setResultados([]);
      return;
    }
    const t = setTimeout(async () => {
      try {
        const r = await api.buscarParticipantes(eventoId, termo, 6);
        setResultados(r.resultados || []);
      } catch {
        setResultados([]);
      }
    }, 300);
    return () => clearTimeout(t);
  }, [termo, eventoId]);

  function onKey(k) {
    if (k === 'DEL') setTermo((t) => t.slice(0, -1));
    else if (k === 'CLR') setTermo('');
    else setTermo((t) => (t + k).slice(0, 50));
  }

  function escolher(p) {
    setPessoa(p);
    setTela('confirma');
  }

  async function confirmar() {
    setTela('imprimindo');
    try {
      await api.checkin(eventoId, pessoa.ticket_number, `totem:${eventoId}`);
      // O componente da etiqueta dispara window.print() ao montar
      // na tela 'sucesso'.
      setTela('sucesso');
    } catch (err) {
      // Se a Sympla recusou por já ter check-in, mostra a tela certa.
      if (/utilizado|já fez/i.test(err.message)) {
        setTela('jausado');
      } else {
        setMsgErro(err.message);
        setTela('erro');
      }
    }
  }

  if (erroFatal) {
    return (
      <div
        className="totem-root"
        style={{ alignItems: 'center', justifyContent: 'center' }}
      >
        <p style={{ fontSize: '3vh', color: '#a32d2d', padding: '0 8vw', textAlign: 'center' }}>
          Não foi possível carregar o totem: {erroFatal}
        </p>
      </div>
    );
  }
  if (!cfg || !evento) {
    return (
      <div
        className="totem-root"
        style={{ alignItems: 'center', justifyContent: 'center' }}
      >
        <p style={{ fontSize: '3vh', color: '#6b7280' }}>Carregando...</p>
      </div>
    );
  }

  const Topo = (
    <div className="totem-topo" style={{ background: cfg.cor_primaria }}>
      {cfg.logo_url && (
        <img className="totem-logo" src={cfg.logo_url} alt="" />
      )}
      <div className="totem-evento">{evento.nome}</div>
      <div className="totem-titulo">{cfg.titulo_totem}</div>
    </div>
  );

  return (
    <div className="totem-root" style={{ background: cfg.cor_primaria }}>
      {Topo}

      {tela === 'inicio' && (
        <>
          <div className="totem-corpo" style={{ background: '#fff' }}>
            <div
              className="totem-campo"
              style={{
                borderColor: termo ? cfg.cor_secundaria : '#e2e5ea',
                color: termo ? '#111' : '#9aa0ab',
              }}
            >
              {termo || cfg.subtitulo_totem || 'Digite seu nome'}
            </div>
            <div className="totem-resultados">
              {termo.trim().length < 2 ? (
                <p style={{ color: '#9aa0ab', textAlign: 'center', marginTop: '4vh', fontSize: '2.2vh' }}>
                  Digite ao menos 2 letras do seu nome
                </p>
              ) : resultados.length === 0 ? (
                <p style={{ color: '#9aa0ab', textAlign: 'center', marginTop: '4vh', fontSize: '2.2vh' }}>
                  Nenhum participante encontrado
                </p>
              ) : (
                resultados.map((p) => (
                  <div
                    key={p.id}
                    className="totem-res-item"
                    onClick={() => escolher(p)}
                  >
                    <div
                      className="totem-avatar"
                      style={{
                        width: '7vh',
                        height: '7vh',
                        fontSize: '2.4vh',
                        background: cfg.cor_primaria,
                      }}
                    >
                      {iniciais(p.nome)}
                    </div>
                    <div style={{ minWidth: 0 }}>
                      <div style={{ fontSize: '2.8vh', fontWeight: 600 }}>
                        {p.nome}
                      </div>
                      <div style={{ fontSize: '2vh', color: '#6b7280' }}>
                        Ingresso {p.ticket_number}
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
          {!!cfg.teclado_virtual && (
            <div className="totem-teclado">
              <TecladoVirtual onKey={onKey} corPrimaria={cfg.cor_primaria} />
            </div>
          )}
        </>
      )}

      {tela === 'confirma' && (
        <div className="totem-centro" style={{ background: '#fff' }}>
          <p style={{ fontSize: '2.4vh', color: '#64748b', fontWeight: 500, marginBottom: '2vh' }}>
            Confirmação de Dados
          </p>
          
          <div
            style={{
              background: '#f8fafc',
              border: '0.3vh solid #e2e8f0',
              borderRadius: '3vh',
              padding: '4vh 5vw',
              width: '100%',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              boxShadow: '0 1vh 3vh rgba(0,0,0,0.04)',
            }}
          >
            {/* Avatar */}
            <div
              className="totem-avatar"
              style={{
                width: '13vh',
                height: '13vh',
                fontSize: '4.5vh',
                background: cfg.cor_primaria,
                marginBottom: '2.5vh',
                boxShadow: '0 0.8vh 2vh rgba(0,0,0,0.1)',
              }}
            >
              {iniciais(pessoa.nome)}
            </div>

            {/* Nome */}
            <div style={{ fontSize: '3.8vh', fontWeight: 700, color: '#0f172a', textAlign: 'center', lineHeight: 1.2 }}>
              {pessoa.nome}
            </div>

            {/* Email */}
            {pessoa.email && (
              <div style={{ fontSize: '2.2vh', color: '#64748b', marginTop: '1vh', textAlign: 'center', wordBreak: 'break-all' }}>
                {pessoa.email}
              </div>
            )}

            {/* Badge de Status de Check-in */}
            {pessoa.checkin_status === 'CHECKED_IN' && (
              <div
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '1vw',
                  background: '#d1fae5',
                  color: '#065f46',
                  border: '0.2vh solid #a7f3d0',
                  borderRadius: '9999px',
                  padding: '0.8vh 2.5vw',
                  fontSize: '2vh',
                  fontWeight: 600,
                  marginTop: '2vh',
                }}
              >
                <span style={{ fontSize: '2.2vh', color: '#10b981' }}>✓</span> Check-in já realizado
              </div>
            )}

            {/* Divisor */}
            <div style={{ width: '100%', height: '0.2vh', background: '#e2e8f0', margin: '3vh 0' }} />

            {/* Grid de Detalhes */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '4vw', width: '100%', textAlign: 'left' }}>
              <div>
                <div style={{ fontSize: '1.8vh', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: 600 }}>
                  Tipo de Ingresso
                </div>
                <div style={{ fontSize: '2.4vh', fontWeight: 700, color: '#334155', marginTop: '0.5vh' }}>
                  {pessoa.ticket_name || 'Ingresso Geral'}
                </div>
              </div>
              
              <div>
                <div style={{ fontSize: '1.8vh', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: 600 }}>
                  Código do Ingresso
                </div>
                <div style={{ fontSize: '2.4vh', fontWeight: 700, color: '#334155', marginTop: '0.5vh', fontFamily: 'monospace', letterSpacing: '0.05em' }}>
                  {pessoa.ticket_number}
                </div>
              </div>
            </div>
          </div>

          {/* Botões */}
          <div style={{ display: 'flex', gap: '3vw', marginTop: '5vh', width: '100%' }}>
            <button
              className="totem-btn totem-btn-sec"
              onClick={voltarInicio}
              style={{ flex: 1, height: '9vh' }}
            >
              {pessoa.checkin_status === 'CHECKED_IN' ? 'Voltar' : 'Não sou eu'}
            </button>

            {pessoa.checkin_status === 'CHECKED_IN' ? (
              <button
                className="totem-btn"
                onClick={() => setImprimirJaUsado(true)}
                style={{
                  flex: 1.4,
                  height: '9vh',
                  background: cfg.cor_secundaria,
                  color: '#fff',
                }}
              >
                Imprimir etiqueta
              </button>
            ) : (
              <button
                className="totem-btn"
                onClick={confirmar}
                style={{
                  flex: 1.4,
                  height: '9vh',
                  background: cfg.cor_secundaria,
                  color: '#fff',
                }}
              >
                Confirmar check-in
              </button>
            )}
          </div>

          {imprimirJaUsado && (
            <EtiquetaImprimivel
              pessoa={pessoa}
              cfg={cfg}
              onDepoisImprimir={() => setImprimirJaUsado(false)}
            />
          )}
        </div>
      )}

      {tela === 'imprimindo' && (
        <div className="totem-centro" style={{ background: '#fff' }}>
          <p style={{ fontSize: '3.4vh', fontWeight: 600 }}>
            Confirmando seu check-in...
          </p>
        </div>
      )}

      {tela === 'sucesso' && (
        <div className="totem-centro" style={{ background: '#fff' }}>
          <div className="totem-circulo" style={{ background: '#e6f4ec' }}>
            <span style={{ fontSize: '9vh', color: '#1d7a44' }}>✓</span>
          </div>
          <div style={{ fontSize: '4vh', fontWeight: 700, marginTop: '3vh' }}>
            Check-in confirmado!
          </div>
          <div style={{ fontSize: '2.8vh', color: '#6b7280', marginTop: '1vh' }}>
            {pessoa.nome}
          </div>
          <div style={{ fontSize: '2.2vh', color: '#6b7280', marginTop: '3vh' }}>
            Retire sua etiqueta na impressora
          </div>
          <button
            className="totem-btn totem-btn-sec"
            onClick={voltarInicio}
            style={{ marginTop: '5vh', height: '8vh', padding: '0 6vw' }}
          >
            Concluir
          </button>
          <EtiquetaImprimivel pessoa={pessoa} cfg={cfg} />
        </div>
      )}

      {tela === 'jausado' && (
        <div className="totem-centro" style={{ background: '#fff' }}>
          <div className="totem-circulo" style={{ background: '#fdf1dd' }}>
            <span style={{ fontSize: '8vh', color: '#9a6312' }}>!</span>
          </div>
          <div style={{ fontSize: '3.6vh', fontWeight: 700, marginTop: '3vh' }}>
            Ingresso já utilizado
          </div>
          <div style={{ fontSize: '2.6vh', color: '#6b7280', marginTop: '1vh' }}>
            {pessoa?.nome}
          </div>
          <div
            style={{
              fontSize: '2.2vh',
              color: '#6b7280',
              marginTop: '3vh',
              lineHeight: 1.5,
            }}
          >
            Este check-in já foi realizado.
            <br />
            Você pode reimprimir sua etiqueta abaixo.
          </div>
          <div style={{ display: 'flex', gap: '3vw', marginTop: '5vh', width: '100%' }}>
            <button
              className="totem-btn totem-btn-sec"
              onClick={voltarInicio}
              style={{ flex: 1, height: '8vh' }}
            >
              Voltar
            </button>
            <button
              className="totem-btn"
              onClick={() => setImprimirJaUsado(true)}
              style={{
                flex: 1.4,
                height: '8vh',
                background: cfg.cor_secundaria,
                color: '#fff',
              }}
            >
              Imprimir etiqueta
            </button>
          </div>
          {imprimirJaUsado && (
            <EtiquetaImprimivel
              pessoa={pessoa}
              cfg={cfg}
              onDepoisImprimir={() => setImprimirJaUsado(false)}
            />
          )}
        </div>
      )}

      {tela === 'erro' && (
        <div className="totem-centro" style={{ background: '#fff' }}>
          <div className="totem-circulo" style={{ background: '#fbe9e9' }}>
            <span style={{ fontSize: '8vh', color: '#a32d2d' }}>×</span>
          </div>
          <div style={{ fontSize: '3.4vh', fontWeight: 700, marginTop: '3vh' }}>
            Não foi possível concluir
          </div>
          <div
            style={{
              fontSize: '2.2vh',
              color: '#6b7280',
              marginTop: '2vh',
              lineHeight: 1.5,
            }}
          >
            {msgErro || 'Tente novamente ou procure a equipe do evento.'}
          </div>
          <button
            className="totem-btn totem-btn-sec"
            onClick={voltarInicio}
            style={{ marginTop: '5vh', height: '8vh', padding: '0 6vw' }}
          >
            Voltar
          </button>
        </div>
      )}
    </div>
  );
}
