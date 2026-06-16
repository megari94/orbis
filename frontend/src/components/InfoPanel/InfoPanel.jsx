import { useState } from 'react';
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
  const [notes,    setNotes]    = useState([]);
  const [noteText, setNoteText] = useState('');

  if (!activeConversation) return null;

  const { name, initials, channel, contact } = activeConversation;

  const phone    = contact?.phone    || '—';
  const email    = contact?.email    || '—';
  const location = contact?.location || '—';
  const since    = formatSince(contact?.createdAt);
  const channels = contact?.channels ?? [];

  const addNote = () => {
    const text = noteText.trim();
    if (!text) return;
    setNotes(n => [...n, { id: Date.now(), text }]);
    setNoteText('');
  };

  const handleNoteKey = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      addNote();
    }
  };

  const removeNote = (id) => setNotes(n => n.filter(x => x.id !== id));

  return (
    <aside className="info-panel">

      <div className="ip-section">
        <div className="ip-label">Contacto</div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 }}>
          <div className={`av ${AV_CLASS[channel] || 'av-mul'}`}
            style={{ width: 42, height: 42, fontSize: 14 }}>
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

      {/* Notas internas: Enter para guardar, X para eliminar (#9) */}
      <div className="ip-section">
        <div className="ip-label">Notas internas</div>

        {notes.map(note => (
          <div key={note.id} style={{
            display: 'flex', alignItems: 'flex-start', gap: 8,
            background: 'var(--bg3)', borderRadius: 8, padding: '8px 10px',
            marginBottom: 6, fontSize: 13, color: 'var(--cream-dim)',
          }}>
            <span style={{ flex: 1, lineHeight: 1.5 }}>{note.text}</span>
            <button
              onClick={() => removeNote(note.id)}
              style={{ background: 'none', border: 'none', color: 'var(--dim)', cursor: 'pointer', padding: 0, lineHeight: 1, flexShrink: 0 }}
              title="Eliminar nota"
            >
              <i className="fa-solid fa-xmark" />
            </button>
          </div>
        ))}

        <div style={{ display: 'flex', gap: 6, alignItems: 'flex-end' }}>
          <textarea
            className="note-ta"
            rows={2}
            placeholder="Escribí y presioná Enter para guardar…"
            value={noteText}
            onChange={e => setNoteText(e.target.value)}
            onKeyDown={handleNoteKey}
            style={{ flex: 1, resize: 'none' }}
          />
        </div>
        <div style={{ fontSize: 11, color: 'var(--dim)', marginTop: 4 }}>Enter para guardar · Shift+Enter nueva línea</div>
      </div>

    </aside>
  );
}
