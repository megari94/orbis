import { useState, useRef, useEffect } from 'react';
import useStore from '../../store/useStore';
import ContactModal from '../Contact/ContactModal';
import { deleteContact } from '../../services/api';

const AV_CLASS   = { WHATSAPP: 'av-wa', INSTAGRAM: 'av-ig', MESSENGER: 'av-fb' };
const AV_ICON    = { WHATSAPP: 'fa-brands fa-whatsapp', INSTAGRAM: 'fa-brands fa-instagram', MESSENGER: 'fa-brands fa-facebook-messenger' };

const CHANNEL_CONFIG = {
  WHATSAPP:  { cls: 'ch-wa', label: 'WA' },
  INSTAGRAM: { cls: 'ch-ig', label: 'IG' },
  MESSENGER: { cls: 'ch-fb', label: 'FB' },
};

function formatSince(iso) {
  if (!iso) return '—';
  return new Date(iso).toLocaleDateString('es-AR', { month: 'short', year: 'numeric' });
}

function ContactMenu({ contact, onEdit, onDelete, onClose }) {
  const ref = useRef(null);
  useEffect(() => {
    const h = (e) => { if (ref.current && !ref.current.contains(e.target)) onClose(); };
    document.addEventListener('mousedown', h);
    return () => document.removeEventListener('mousedown', h);
  }, [onClose]);

  return (
    <div ref={ref} style={{
      position: 'absolute', top: 28, right: 0, zIndex: 300,
      background: 'var(--bg2)', border: '1px solid var(--border2)',
      borderRadius: 10, minWidth: 180, padding: '4px 0',
      boxShadow: '0 8px 24px rgba(0,0,0,.5)',
    }}>
      <button
        onClick={() => { onEdit(contact); onClose(); }}
        style={{ width: '100%', padding: '10px 14px', background: 'none', border: 'none', color: 'var(--cream-dim)', fontSize: 13, cursor: 'pointer', textAlign: 'left', display: 'flex', alignItems: 'center', gap: 10 }}
        onMouseEnter={e => e.currentTarget.style.background = 'var(--bg3)'}
        onMouseLeave={e => e.currentTarget.style.background = 'none'}
      >
        <i className="fa-solid fa-pen" style={{ width: 14, textAlign: 'center' }} />
        Editar contacto
      </button>
      <button
        onClick={() => { onDelete(contact); onClose(); }}
        style={{ width: '100%', padding: '10px 14px', background: 'none', border: 'none', color: 'var(--red-light)', fontSize: 13, cursor: 'pointer', textAlign: 'left', display: 'flex', alignItems: 'center', gap: 10, borderTop: '1px solid var(--border)' }}
        onMouseEnter={e => e.currentTarget.style.background = 'var(--bg3)'}
        onMouseLeave={e => e.currentTarget.style.background = 'none'}
      >
        <i className="fa-solid fa-trash" style={{ width: 14, textAlign: 'center' }} />
        Eliminar contacto
      </button>
    </div>
  );
}

export default function InfoPanel() {
  const { activeConversation, removeConversation, reset } = useStore();
  const [notes,          setNotes]          = useState([]);
  const [noteText,       setNoteText]       = useState('');
  const [showMenu,       setShowMenu]       = useState(false);
  const [editingContact, setEditingContact] = useState(null);

  const handleDeleteContact = async (contact) => {
    if (!contact?.id) return;
    if (!confirm(`¿Eliminar el contacto "${contact.name || contact.phone}"?\nSe eliminarán todas sus conversaciones y mensajes.`)) return;
    try {
      await deleteContact(contact.id);
      // Limpiar conversación activa y lista
      reset();
    } catch {
      alert('No se pudo eliminar el contacto. Intentá de nuevo.');
    }
  };

  if (!activeConversation) return null;

  const { name, initials, channel, contact } = activeConversation;

  const phone      = contact?.phone    || '—';
  const email      = contact?.email    || '—';
  const location   = contact?.location || '—';
  const since      = formatSince(contact?.createdAt);
  // Si el nombre guardado es igual al teléfono, significa que no tiene nombre real aún
  const hasRealName = name && name !== phone && name !== contact?.phone;
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
    <>
    <aside className="info-panel">

      <div className="ip-section">
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 4 }}>
          <div className="ip-label" style={{ marginBottom: 0 }}>Contacto</div>
          <div style={{ position: 'relative' }}>
            <button
              className="hbtn"
              style={{ fontSize: 13 }}
              title="Más opciones"
              onClick={() => setShowMenu(m => !m)}
            >
              <i className="fa-solid fa-ellipsis-vertical" />
            </button>
            {showMenu && (
              <ContactMenu
                contact={{ id: contact?.id, name, phone: contact?.phone, email: contact?.email, address: contact?.location }}
                onEdit={setEditingContact}
                onDelete={handleDeleteContact}
                onClose={() => setShowMenu(false)}
              />
            )}
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 }}>
          <div className={`av ${AV_CLASS[channel] || 'av-mul'}`}
            style={{ width: 42, height: 42, fontSize: 20 }}>
            <i className={AV_ICON[channel] || 'fa-solid fa-comment'} />
          </div>
          <div>
            {hasRealName
              ? <div className="contact-big-name">{name}</div>
              : <div className="contact-big-name" style={{ color: 'var(--dim)', fontStyle: 'italic', fontSize: 13 }}>Sin nombre</div>
            }
            <div className="since">cliente desde {since}</div>
          </div>
        </div>
        <div className="contact-row"><i className="fa-solid fa-phone" />{phone}</div>
        <div className="contact-row"><i className="fa-solid fa-envelope" />{email}</div>
        <div className="contact-row"><i className="fa-solid fa-location-dot" />{location}</div>
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

    {editingContact && (
      <ContactModal
        contact={editingContact}
        onClose={() => setEditingContact(null)}
        onSaved={() => setEditingContact(null)}
      />
    )}
    </>
  );
}
