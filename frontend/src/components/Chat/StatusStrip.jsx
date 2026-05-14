import useStore from '../../store/useStore';

const STATUSES = [
  { key: 'nuevo',   label: '● nuevo',    cls: 'spill-new' },
  { key: 'open',    label: 'en curso',   cls: 'spill-open' },
  { key: 'pending', label: 'pendiente',  cls: 'spill-pending' },
  { key: 'done',    label: 'resuelto',   cls: 'spill-done' },
];

export default function StatusStrip() {
  const { activeConversation, updateStatus } = useStore();
  if (!activeConversation) return null;

  return (
    <div className="status-strip">
      {STATUSES.map(({ key, label, cls }) => (
        <button
          key={key}
          className={`spill ${cls}${activeConversation.status === key ? '' : ''}`}
          style={activeConversation.status === key ? { opacity: 1 } : {}}
          onClick={() => updateStatus(key)}
        >
          {label}
        </button>
      ))}
      {activeConversation.priority && (
        <span className="high-prio">
          <i className="fa-solid fa-triangle-exclamation" style={{ marginRight: 4, fontSize: 10 }} />
          alta prioridad
        </span>
      )}
    </div>
  );
}
