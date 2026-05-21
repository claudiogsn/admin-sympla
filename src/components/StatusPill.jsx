// Pill de status reutilizável (evento ou participante).

export default function StatusPill({ status }) {
  const map = {
    CHECKED_IN: { cls: 'ok', txt: 'Check-in feito' },
    ATIVO: { cls: 'ok', txt: 'Ativo' },
    PENDENTE: { cls: 'warn', txt: 'Pendente' },
    INATIVO: { cls: 'warn', txt: 'Inativo' },
  };
  const item = map[status] || { cls: 'warn', txt: status };
  return <span className={`pill ${item.cls}`}>{item.txt}</span>;
}
