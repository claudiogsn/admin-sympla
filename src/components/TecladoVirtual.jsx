// Teclado virtual QWERTY para o totem.
// Emite a tecla pressionada via onKey: letras, ' ', 'DEL', 'CLR'.

const LINHAS = ['QWERTYUIOP', 'ASDFGHJKL', 'ZXCVBNM'];

export default function TecladoVirtual({ onKey, corPrimaria }) {
  return (
    <div className="tv-wrap">
      {LINHAS.map((linha, i) => (
        <div
          key={i}
          className="tv-linha"
          style={{
            gridTemplateColumns: `repeat(${linha.length}, 1fr)`,
            padding: i === 1 ? '0 4%' : i === 2 ? '0 12%' : '0',
          }}
        >
          {linha.split('').map((c) => (
            <button key={c} className="tv-key" onClick={() => onKey(c)}>
              {c}
            </button>
          ))}
        </div>
      ))}
      <div
        className="tv-linha"
        style={{ gridTemplateColumns: '1.6fr 3fr 1.6fr' }}
      >
        <button
          className="tv-key tv-key-fn"
          onClick={() => onKey('CLR')}
        >
          Limpar
        </button>
        <button className="tv-key" onClick={() => onKey(' ')}>
          espaço
        </button>
        <button
          className="tv-key tv-key-fn"
          onClick={() => onKey('DEL')}
          aria-label="Apagar"
          style={{ color: corPrimaria }}
        >
          ⌫
        </button>
      </div>
    </div>
  );
}
