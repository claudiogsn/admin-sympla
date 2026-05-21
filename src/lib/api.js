// Camada de acesso à API do backend de check-in.
// Os paths e formatos refletem exatamente o routes.js do backend.

const BASE = '/api';

async function req(path, { method = 'GET', body } = {}) {
  const res = await fetch(`${BASE}${path}`, {
    method,
    headers: { 'Content-Type': 'application/json' },
    body: body ? JSON.stringify(body) : undefined,
  });

  let data = null;
  try {
    data = await res.json();
  } catch {
    // resposta sem corpo JSON
  }

  // O backend usa HTTP 207 para "importado, mas sync falhou":
  // não é erro, devolvemos os dados com o aviso embutido.
  if (!res.ok && res.status !== 207) {
    const msg = (data && (data.erro || data.mensagem)) || `Erro ${res.status}`;
    const err = new Error(msg);
    err.status = res.status;
    err.data = data;
    throw err;
  }
  return data;
}

export const api = {
  // ----- Produtores -----
  listarProdutores: () => req('/produtores'),

  buscarProdutor: (id) => req(`/produtores/${id}`),

  criarProdutor: (nome, sympla_token) =>
      req('/produtores', { method: 'POST', body: { nome, sympla_token } }),

  // Eventos já importados deste produtor.
  eventosDoProdutor: (id) => req(`/produtores/${id}/eventos`),

  // Eventos da conta Sympla do produtor (cada um com flag `importado`).
  symplaEventos: (id) => req(`/produtores/${id}/sympla-eventos`),

  importarEvento: (produtorId, sympla_event_id) =>
      req(`/produtores/${produtorId}/importar`, {
        method: 'POST',
        body: { sympla_event_id },
      }),

  // ----- Eventos -----
  buscarEvento: (id) => req(`/eventos/${id}`),

  sincronizar: (id) => req(`/eventos/${id}/sync`, { method: 'POST' }),

  status: (id) => req(`/eventos/${id}/status`),

  // ----- Participantes -----
  buscarParticipantes: (id, q = '', limit = 25) =>
      req(`/eventos/${id}/search?q=${encodeURIComponent(q)}&limit=${limit}`),

  detalheParticipante: (eventoId, pid) =>
      req(`/eventos/${eventoId}/participantes/${pid}`),

  checkin: (id, ticket_number, origem) =>
      req(`/eventos/${id}/checkin`, {
        method: 'POST',
        body: { ticket_number, origem },
      }),

  // ----- Configuração do totem -----
  obterTotemConfig: (id) => req(`/eventos/${id}/totem-config`),

  salvarTotemConfig: (id, config) =>
      req(`/eventos/${id}/totem-config`, { method: 'PUT', body: config }),
};