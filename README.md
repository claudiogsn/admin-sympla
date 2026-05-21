# Check-in Sympla — Frontend (Admin + Totem)

Frontend único com duas áreas, separadas por rota:

- `/` — painel administrativo (eventos, sync, participantes, config do totem)
- `/toten/:eventoId` — interface do totem de autoatendimento (vertical 1080x1920)

## Rodar em desenvolvimento

```bash
npm install
npm run dev
```

- Admin:  http://localhost:5173/
- Totem:  http://localhost:5173/toten/1   (troque 1 pelo id do evento)

O Vite faz proxy de `/api` para o backend Node em `http://localhost:3001`.
Suba o backend antes.

## Build de produção

```bash
npm run build
```

Gera `dist/`. IMPORTANTE: como o totem usa rotas do React Router
(`/toten/:id`), o servidor web precisa redirecionar todas as rotas
para `index.html` (SPA fallback), senão acessar a URL direto dá 404.

- Nginx:  `try_files $uri $uri/ /index.html;`
- Apache: regra de rewrite para index.html

## A impressão da etiqueta

A tela de sucesso do totem dispara `window.print()` automaticamente.
Uma folha `@page` é injetada com a largura/altura em mm configuradas
para o evento. O navegador abre o diálogo de impressão; defina a
impressora de etiquetas como padrão no SO do totem.

NOTA sobre o QR code: o componente EtiquetaImprimivel desenha um QR
placeholder (padrão visual). Para um QR realmente legível por scanner,
troque a função QrCode por uma biblioteca dedicada — por exemplo
`qrcode` (npm) gerando o ticket_number do participante.

## Estrutura

- src/main.jsx — roteamento (admin vs totem)
- src/AdminApp.jsx — app do painel admin
- src/pages/TotemPage.jsx — a tela do totem (máquina de estados)
- src/pages/EventosPage / ParticipantesPage / TotemConfigPage — admin
- src/components/ — teclado virtual, etiqueta imprimível, previews
- src/lib/api.js — camada de acesso ao backend

## Segurança

O painel admin manipula tokens da Sympla. Em produção, coloque a área
administrativa atrás de autenticação própria e proteja as rotas
administrativas no backend. A rota /toten/:id é pública por natureza.
