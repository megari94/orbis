import useStore from '../../store/useStore';

const STATUSES = [
  { key: 'nuevo',   label: 'Nuevo',      cls: 'spill-new',     icon: 'fa-solid fa-circle-dot' },
  { key: 'open',    label: 'En curso',   cls: 'spill-open',    icon: 'fa-solid fa-circle-half-stroke' },
  { key: 'pending', label: 'Pendiente',  cls: 'spill-pending', icon: 'fa-regular fa-clock' },
  { key: 'done',    label: 'Resuelto',   cls: 'spill-done',    icon: 'fa-solid fa-circle-check' },
];

export default function StatusStrip() {
  const { activeConversation, updateStatus } = useStore();
  if (!activeConversation) return null;

  const isActive = (key) => activeConversation.status === key;

  return (
    <div className="status-strip">
      {STATUSES.map(({ key, label, cls, icon }) => (
        <button
          key={key}
          className={`spill ${cls}${isActive(key) ? ' spill-active' : ''}`}
          onClick={() => !isActive(key) && updateStatus(key)}
          title={isActive(key) ? `Estado actual: ${label}` : `Cambiar a ${label}`}
        >
          <i className={icon} style={{ marginRight: 5, fontSize: 11 }} />
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
