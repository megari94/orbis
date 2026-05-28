import useStore from '../../store/useStore';

const AV_CLASS = { WHATSAPP: 'av-wa', INSTAGRAM: 'av-ig', MESSENGER: 'av-fb' };

const CHANNEL_CONFIG = {
  WHATSAPP:  { cls: 'ch-wa', label: 'WA' },
  INSTAGRAM: { cls: 'ch-ig', label: 'IG' },
  MESSENGER: { cls: 'ch-fb', label: 'FB' },
};

function formatSince(iso) {
  if (!iso) return '—';
  return new Date(iso).toLocaleDateString('es-AR', { month: 'short', year: 'numeric' });
}

export default function InfoPanel() {
  const { activeConversation } = useStore();
  if (!activeConversation) return null;

  const { name, initials, channel, contact } = activeConversation;

  const phone    = contact?.phone    || '—';
  const email    = contact?.email    || '—';
  const location = contact?.location || '—';
  const since    = formatSince(contact?.createdAt);
  const channels = contact?.channels ?? [];

  return (
    <aside className="info-panel">

      <div className="ip-section">
        <div className="ip-label">Contacto</div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 }}>
          <div className={`av ${AV_CLASS[channel] || 'av-mul'}`} style={{ width: 42, height: 42, fontSize: 14 }}>
            {initials}
          </div>
          <div>
            <div className="contact-big-name">{name}</div>
            <div className="since">cliente desde {since}</div>
          </div>
        </div>
        <div className="contact-row"><i className="fa-solid fa-phone" />{phone}</div>
        <div className="contact-row"><i className="fa-solid fa-envelope" />{email}</div>
        <div className="contact-row"><i className="fa-solid fa-location-dot" />{location}</div>
      </div>

      <div className="ip-section">
        <div className="ip-label">Canales vinculados</div>
        <div className="ch-ids">
          {channels.length > 0
            ? channels.map((ch, i) => {
                const cfg = CHANNEL_CONFIG[ch.channel] || { cls: '', label: ch.channel };
                return (
                  <div key={i} className="cid-row">
                    <span className={`ch-badge ${cfg.cls}`}>{cfg.label}</span>
                    {ch.externalId}
                  </div>
                );
              })
            : <div className="cid-row inactive">Sin canales vinculados</div>
          }
        </div>
      </div>

      <div className="ip-section">
        <div className="ip-label">Asignado a</div>
        <select className="assign-sel">
          <option>Sin asignar</option>
          <option defaultValue>Vos (admin)</option>
          <option>Agente: Romina</option>
          <option>Agente: Tomás</option>
        </select>
      </div>

      <div className="ip-section">
        <div className="ip-label">Nota interna</div>
        <textarea className="note-ta" rows={3} placeholder="Solo visible para el equipo…" />
      </div>

    </aside>
  );
}
