import { useState, useEffect, useRef } from 'react';
import { getContacts, deleteContact } from '../../services/api';
import ContactModal from '../Contact/ContactModal';

const AV_CLASS  = { WHATSAPP: 'av-wa', INSTAGRAM: 'av-ig', MESSENGER: 'av-fb' };
const AV_ICON   = { WHATSAPP: 'fa-brands fa-whatsapp', INSTAGRAM: 'fa-brands fa-instagram', MESSENGER: 'fa-brands fa-facebook-messenger' };

function ContactMenu({ contact, onEdit, onDelete, onClose }) {
  const ref = useRef(null);
  useEffect(() => {
    const h = (e) => { if (ref.current && !ref.current.contains(e.target)) onClose(); };
    document.addEventListener('mousedown', h);
    return () => document.removeEventListener('mousedown', h);
  }, [onClose]);

  return (
    <div ref={ref} style={{
      position: 'absolute', top: 32, right: 0, zIndex: 300,
      background: 'var(--bg2)', border: '1px solid var(--border2)',
      borderRadius: 10, minWidth: 160, padding: '4px 0',
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

export default function ContactsList({ onOpenChat }) {
  const [contacts,   setContacts]   = useState([]);
  const [search,     setSearch]     = useState('');
  const [loading,    setLoading]    = useState(true);
  const [menuId,     setMenuId]     = useState(null);
  const [editing,    setEditing]    = useState(null); // contacto a editar

  const load = () => {
    setLoading(true);
    getContacts()
      .then(data => setContacts(data ?? []))
      .catch(() => setContacts([]))
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  const onSaved = (updated) => {
    setContacts(cs => cs.map(c => c.id === updated.id ? { ...c, ...updated } : c));
    setEditing(null);
  };

  const onDelete = async (contact) => {
    if (!confirm(`¿Eliminar el contacto "${contact.name || contact.phone}"?\nSe eliminarán todas sus conversaciones y mensajes.`)) return;
    try {
      await deleteContact(contact.id);
      setContacts(cs => cs.filter(c => c.id !== contact.id));
    } catch {
      alert('No se pudo eliminar el contacto. Intentá de nuevo.');
    }
  };

  // "Agendado" = tiene nombre real (no vacío y no es solo un número de teléfono)
  const looksLikePhone = (s) => !s || /^[+\d\s()\-]+$/.test(s.trim());

  const agendados = contacts.filter(c => !looksLikePhone(c.name));

  const filtered = agendados.filter(c =>
    c.name?.toLowerCase().includes(search.toLowerCase()) ||
    c.phone?.includes(search) ||
    c.email?.toLowerCase().includes(search.toLowerCase())
  );

  const channel0 = (c) => c.channels?.[0]?.channel;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', overflow: 'hidden' }}>
      <div className="sidebar-head" style={{ borderBottom: '1px solid var(--border)' }}>
        <div className="sidebar-title">Contactos</div>
        <div className="search-wrap">
          <i className="fa-solid fa-magnifying-glass" />
          <input
            type="text"
            placeholder="Buscar contacto…"
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>
      </div>

      <div style={{ flex: 1, overflowY: 'auto' }}>
        {loading && (
          <div style={{ display: 'flex', justifyContent: 'center', padding: '40px 0', color: 'var(--dim)' }}>
            <i className="fa-solid fa-circle-notch fa-spin" style={{ fontSize: 20 }} />
          </div>
        )}
        {!loading && filtered.length === 0 && (
          <div style={{ textAlign: 'center', padding: '40px 16px', color: 'var(--dim)', fontSize: 13 }}>
            {search ? 'Sin resultados' : 'No hay contactos agendados'}
          </div>
        )}
        {!loading && filtered.map(c => (
          <div
            key={c.id}
            style={{
              display: 'flex', alignItems: 'center', gap: 12,
              padding: '12px 16px', borderBottom: '1px solid var(--border)',
              position: 'relative', transition: 'background .15s',
              cursor: 'pointer',
            }}
            onClick={() => onOpenChat?.(c)}
            onMouseEnter={e => e.currentTarget.style.background = 'var(--bg2)'}
            onMouseLeave={e => e.currentTarget.style.background = 'none'}
          >
            {/* Avatar con logo de red social */}
            <div className={`av ${AV_CLASS[channel0(c)] || 'av-mul'}`}
              style={{ width: 38, height: 38, fontSize: 16, flexShrink: 0 }}>
              {channel0(c)
                ? <i className={AV_ICON[channel0(c)]} />
                : <i className="fa-solid fa-user" style={{ fontSize: 14 }} />
              }
            </div>

            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--cream)', marginBottom: 2, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                {c.name || '(sin nombre)'}
              </div>
              <div style={{ fontSize: 12, color: 'var(--dim)', display: 'flex', gap: 10, flexWrap: 'wrap' }}>
                {c.phone && <span><i className="fa-solid fa-phone" style={{ marginRight: 4 }} />{c.phone}</span>}
                {c.email && <span><i className="fa-solid fa-envelope" style={{ marginRight: 4 }} />{c.email}</span>}
              </div>
              {c.location && (
                <div style={{ fontSize: 12, color: 'var(--dim)', marginTop: 2 }}>
                  <i className="fa-solid fa-location-dot" style={{ marginRight: 4 }} />{c.location}
                </div>
              )}
            </div>

            {/* 3 puntos */}
            <div style={{ position: 'relative', flexShrink: 0 }}>
              <button
                className="hbtn"
                style={{ fontSize: 13 }}
                onClick={e => { e.stopPropagation(); setMenuId(id => id === c.id ? null : c.id); }}
                title="Más opciones"
              >
                <i className="fa-solid fa-ellipsis-vertical" />
              </button>
              {menuId === c.id && (
                <ContactMenu
                  contact={c}
                  onEdit={setEditing}
                  onDelete={onDelete}
                  onClose={() => setMenuId(null)}
                />
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Modal edición */}
      {editing && (
        <ContactModal
          contact={{ id: editing.id, name: editing.name, email: editing.email, address: editing.location }}
          onClose={() => setEditing(null)}
          onSaved={onSaved}
        />
      )}
    </div>
  );
}
