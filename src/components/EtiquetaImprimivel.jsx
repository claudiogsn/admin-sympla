// Etiqueta imprimível. Renderiza num container fora da tela e é
// acionada por window.print(). A folha @page é injetada dinamicamente
// com as dimensões em mm vindas da configuração do evento.
// O QR code é gerado de verdade pela lib `qrcode` a partir do
// ticket_number — legível por qualquer leitor.

import { useEffect, useState, useRef } from 'react';
import { createPortal } from 'react-dom';
import QRCode from 'qrcode';

function montarEstiloPagina(larguraMm, alturaMm) {
  const css = `
    #etiqueta-print {
      position: absolute;
      left: -99999px;
      top: 0;
      width: ${larguraMm}mm;
      height: ${alturaMm}mm;
      -webkit-print-color-adjust: exact;
      print-color-adjust: exact;
    }
    @media print {
      body * { visibility: hidden !important; }
      #etiqueta-print, #etiqueta-print * { visibility: visible !important; }
      #etiqueta-print {
        position: absolute !important;
        left: 0 !important;
        top: 0 !important;
        width: ${larguraMm}mm !important;
        height: ${alturaMm}mm !important;
        -webkit-print-color-adjust: exact !important;
        print-color-adjust: exact !important;
      }
      @page { size: ${larguraMm}mm ${alturaMm}mm; margin: 0; }
    }
  `;
  let tag = document.getElementById('etiqueta-print-style');
  if (!tag) {
    tag = document.createElement('style');
    tag.id = 'etiqueta-print-style';
    document.head.appendChild(tag);
  }
  tag.textContent = css;
}

function partesNome(nomeCompleto) {
  const partes = (nomeCompleto || '').trim().split(/\s+/);
  return {
    primeiro: partes[0] || '',
    resto: partes.slice(1).join(' '),
  };
}

export default function EtiquetaImprimivel({ pessoa, cfg, onDepoisImprimir }) {
  // Data URL da imagem do QR code real, gerada pela lib `qrcode`.
  const [qrDataUrl, setQrDataUrl] = useState('');
  const jaImprimiu = useRef(false);

  // Passo 1: gerar o QR code a partir do ticket_number.
  useEffect(() => {
    if (!pessoa || !cfg.etq_mostrar_qrcode) {
      setQrDataUrl('');
      return;
    }
    let cancelado = false;
    QRCode.toDataURL(String(pessoa.ticket_number || ''), {
      errorCorrectionLevel: 'M',
      margin: 1,
      width: 256,
    })
        .then((url) => {
          if (!cancelado) setQrDataUrl(url);
        })
        .catch(() => {
          if (!cancelado) setQrDataUrl('');
        });
    return () => {
      cancelado = true;
    };
  }, [pessoa, cfg.etq_mostrar_qrcode]);

  // Passo 2: imprimir — só depois que o QR estiver pronto
  // (ou se a etiqueta não usa QR). Garante que a imagem não saia em branco.
  useEffect(() => {
    if (!pessoa) return;

    const usaQr = !!cfg.etq_mostrar_qrcode;
    const qrPronto = !usaQr || !!qrDataUrl;
    if (!qrPronto || jaImprimiu.current) return;

    montarEstiloPagina(cfg.etiqueta_largura_mm, cfg.etiqueta_altura_mm);

    let cancelado = false;
    let raf2 = null;

    // Dois frames de pintura para garantir que o DOM da etiqueta
    // (incluindo a imagem do QR) já está na tela antes de imprimir.
    const raf1 = requestAnimationFrame(() => {
      raf2 = requestAnimationFrame(() => {
        if (cancelado) return;
        jaImprimiu.current = true;
        window.print();
        if (onDepoisImprimir) onDepoisImprimir();
      });
    });

    return () => {
      cancelado = true;
      cancelAnimationFrame(raf1);
      if (raf2) cancelAnimationFrame(raf2);
    };
  }, [pessoa, cfg, qrDataUrl, onDepoisImprimir]);

  if (!pessoa) return null;

  const { primeiro, resto } = partesNome(pessoa.nome);

  return createPortal(
      <div
          id="etiqueta-print"
          style={{
            background: '#fff',
            color: '#000',
            display: 'flex',
            overflow: 'hidden',
          }}
      >
        <div style={{ width: '4mm', background: cfg.cor_primaria }} />
        <div
            style={{
              flex: 1,
              padding: '4mm 5mm',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'center',
            }}
        >
          {!!cfg.etq_mostrar_nome1 && (
              <div style={{ fontSize: '8mm', fontWeight: 700, lineHeight: 1.05 }}>
                {primeiro}
              </div>
          )}
          {!!cfg.etq_mostrar_nome2 && resto && (
              <div style={{ fontSize: '5mm', color: '#333' }}>{resto}</div>
          )}
          {!!cfg.etq_mostrar_cargo && (
              <div
                  style={{
                    fontSize: '2.8mm',
                    marginTop: '2mm',
                    color: cfg.cor_secundaria,
                    fontWeight: 700,
                    letterSpacing: '0.3mm',
                  }}
              >
                CREDENCIAL · {(pessoa.ticket_name || '').toUpperCase()}
              </div>
          )}
        </div>
        {!!cfg.etq_mostrar_qrcode && qrDataUrl && (
            <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  padding: '3mm',
                }}
            >
              <img
                  src={qrDataUrl}
                  alt={`Ingresso ${pessoa.ticket_number}`}
                  style={{ width: '14mm', height: '14mm', display: 'block' }}
              />
            </div>
        )}
      </div>,
      document.body
  );
}