import useStore from '../../store/useStore';

const AV_CLASS    = { WHATSAPP: 'av-wa', INSTAGRAM: 'av-ig', MESSENGER: 'av-fb' };

const CONTACT_DATA = {
  1: { phone: '+54 9 11 5832-7291', email: 'v.acosta@gmail.com', location: 'CABA, Argentina', since: 'abr. 2025',
       channels: [
         { cls: 'ch-wa', label: 'WA', value: '+54 9 11 5832-7291', active: true },
         { cls: 'ch-ig', label: 'IG', value: '@vale.acosta',        active: true },
         { cls: 'ch-fb', label: 'FB', value: 'no vinculado',        active: false },
       ],
       aiSuggestion: 'Ofrecer 10% de descuento por 3+ unidades. Valentina consultó por mayoristas en marzo 2025.',
       history: [
         { label: 'Consulta envío',     badge: 'ch-ig', badgeLabel: 'IG' },
         { label: 'Compra 2 remeras',   badge: 'ch-wa', badgeLabel: 'WA' },
         { label: 'Pregunta talle XL',  badge: 'ch-wa', badgeLabel: 'WA' },
       ],
  },
};

const DEFAULT_CONTACT = {
  phone: '—', email: '—', location: '—', since: '—',
  channels: [], aiSuggestion: null, history: [],
};

export default function InfoPanel() {
  const { activeConversation } = useStore();
  if (!activeConversation) return null;

  const { name, initials, channel, id } = activeConversation;
  const data = CONTACT_DATA[id] || DEFAULT_CONTACT;

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
            <div className="since">cliente desde {data.since}</div>
          </div>
        </div>
        <div className="contact-row"><i className="fa-solid fa-phone" />{data.phone}</div>
        <div className="contact-row"><i className="fa-solid fa-envelope" />{data.email}</div>
        <div className="contact-row"><i className="fa-solid fa-location-dot" />{data.location}</div>
      </div>

      <div className="ip-section">
        <div className="ip-label">Canales vinculados</div>
        <div className="ch-ids">
          {data.channels.map((ch, i) => (
            <div key={i} className={`cid-row${ch.active ? '' : ' inactive'}`}>
              <span className={`ch-badge ${ch.cls}`} style={ch.active ? {} : { opacity: .5 }}>{ch.label}</span>
              {ch.value}
            </div>
          ))}
          {data.channels.length === 0 && (
            <div className="cid-row inactive">Sin canales vinculados</div>
          )}
        </div>
      </div>

      {data.aiSuggestion && (
        <div className="ip-section">
          <div className="ip-label">Sugerencia IA</div>
          <div className="ai-box">
            <div className="ai-label">
              <i className="fa-solid fa-wand-magic-sparkles" /> DeepSeek
            </div>
            <div className="ai-text">{data.aiSuggestion}</div>
          </div>
        </div>
      )}

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

      {data.history.length > 0 && (
        <div className="ip-section">
          <div className="ip-label">Historial cross-canal</div>
          {data.history.map((h, i) => (
            <div key={i} className="hist-item">
              <span>{h.label}</span>
              <span className={`ch-badge ${h.badge}`}>{h.badgeLabel}</span>
            </div>
          ))}
        </div>
      )}

    </aside>
  );
}
