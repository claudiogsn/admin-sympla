// Preview visual da etiqueta de impressão.
// Reflete em tempo real a configuração escolhida no formulário.

export default function EtiquetaPreview({ cfg }) {
  const escala = 3;
  const w = Number(cfg.etiqueta_largura_mm) * escala;
  const h = Number(cfg.etiqueta_altura_mm) * escala;

  return (
    <div
      style={{
        width: w,
        height: h,
        background: '#fff',
        borderRadius: 6,
        border: '1px solid var(--border)',
        display: 'flex',
        overflow: 'hidden',
        color: '#111',
      }}
    >
      <div style={{ width: 9, background: cfg.cor_primaria }} />
      <div
        style={{
          flex: 1,
          padding: '10px 14px',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
        }}
      >
        {!!cfg.etq_mostrar_nome1 && (
          <div style={{ fontSize: 21, fontWeight: 600, lineHeight: 1.15 }}>
            Ana Beatriz
          </div>
        )}
        {!!cfg.etq_mostrar_nome2 && (
          <div style={{ fontSize: 16, color: '#444' }}>Souza</div>
        )}
        {!!cfg.etq_mostrar_cargo && (
          <div
            style={{
              fontSize: 11,
              marginTop: 5,
              color: cfg.cor_secundaria,
              fontWeight: 600,
              letterSpacing: 0.4,
            }}
          >
            CREDENCIAL · VIP
          </div>
        )}
      </div>
      {!!cfg.etq_mostrar_qrcode && (
        <div
          style={{
            width: h - 20,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: 7,
          }}
        >
          <div
            style={{
              width: '100%',
              aspectRatio: '1',
              background:
                'repeating-conic-gradient(#111 0% 25%, #fff 0% 50%)',
              backgroundSize: '9px 9px',
              border: '2px solid #111',
            }}
          />
        </div>
      )}
    </div>
  );
}
