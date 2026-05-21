// Preview do totem vertical (proporção 1080x1920).
// Mostra como a interface ficará para o participante.

export default function TotemPreview({ cfg }) {
  const w = 170;
  const h = w * (1920 / 1080);

  return (
    <div
      style={{
        width: w,
        height: h,
        borderRadius: 12,
        overflow: 'hidden',
        border: '1px solid var(--border)',
        background: cfg.cor_primaria,
        display: 'flex',
        flexDirection: 'column',
        color: '#fff',
      }}
    >
      <div style={{ padding: '16px 12px', textAlign: 'center' }}>
        {cfg.logo_url ? (
          <img
            src={cfg.logo_url}
            alt=""
            style={{ maxHeight: 26, maxWidth: '80%', objectFit: 'contain' }}
            onError={(e) => {
              e.target.style.display = 'none';
            }}
          />
        ) : (
          <div
            style={{
              fontSize: 10,
              opacity: 0.6,
              border: '1px dashed rgba(255,255,255,.4)',
              padding: '5px',
              borderRadius: 4,
            }}
          >
            logo
          </div>
        )}
        <div style={{ fontSize: 14, fontWeight: 600, marginTop: 11 }}>
          {cfg.titulo_totem || '—'}
        </div>
        <div style={{ fontSize: 10, opacity: 0.75, marginTop: 3 }}>
          {cfg.subtitulo_totem || ''}
        </div>
      </div>

      <div
        style={{
          flex: 1,
          background: '#fff',
          margin: '0 12px',
          borderRadius: 9,
          padding: 11,
        }}
      >
        <div
          style={{
            height: 28,
            background: '#eef0f3',
            borderRadius: 6,
            marginBottom: 9,
          }}
        />
        {[0, 1, 2].map((i) => (
          <div
            key={i}
            style={{
              height: 15,
              background: '#f4f5f7',
              borderRadius: 4,
              marginBottom: 6,
            }}
          />
        ))}
        {!!cfg.teclado_virtual && (
          <div
            style={{
              marginTop: 11,
              display: 'grid',
              gridTemplateColumns: 'repeat(6,1fr)',
              gap: 3,
            }}
          >
            {Array.from({ length: 18 }).map((_, i) => (
              <div
                key={i}
                style={{
                  aspectRatio: '1',
                  background: '#eef0f3',
                  borderRadius: 3,
                }}
              />
            ))}
          </div>
        )}
      </div>

      <div style={{ padding: '14px 12px', textAlign: 'center' }}>
        <div
          style={{
            background: cfg.cor_secundaria,
            borderRadius: 7,
            padding: '9px',
            fontSize: 11,
            fontWeight: 600,
          }}
        >
          Imprimir etiqueta
        </div>
      </div>
    </div>
  );
}
