import { useState, useEffect } from 'react';
import { getContacts } from '../../services/api';

const AV_CLASS = { WHATSAPP: 'av-wa', INSTAGRAM: 'av-ig', MESSENGER: 'av-fb' };

function initials(name) {
  if (!name) return '?';
  return name.split(' ').slice(0, 2).map(w => w[0]).join('').toUpperCase();
}

export default function ContactsList() {
  const [contacts, setContacts] = useState([]);
  const [search,   setSearch]   = useState('');
  const [loading,  setLoading]  = useState(true);

  useEffect(() => {
    getContacts()
      .then(data => setContacts(data ?? []))
      .catch(() => setContacts([]))
      .finally(() => setLoading(false));
  }, []);

  const filtered = contacts.filter(c =>
    c.name?.toLowerCase().includes(search.toLowerCase()) ||
    c.phone?.includes(search) ||
    c.email?.toLowerCase().includes(search.toLowerCase())
  );

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
            {search ? 'Sin resultados' : 'Sin contactos'}
          </div>
        )}
        {!loading && filtered.map(c => (
          <div
            key={c.id}
            style={{
              display: 'flex', alignItems: 'center', gap: 12,
              padding: '12px 16px', borderBottom: '1px solid var(--border)',
              cursor: 'default',
              transition: 'background .15s',
            }}
            onMouseEnter={e => e.currentTarget.style.background = 'var(--bg2)'}
            onMouseLeave={e => e.currentTarget.style.background = 'none'}
          >
            <div className={`av ${AV_CLASS[c.channels?.[0]?.channel] || 'av-mul'}`} style={{ width: 38, height: 38, fontSize: 13, flexShrink: 0 }}>
              {initials(c.name)}
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
          </div>
        ))}
      </div>
    </div>
  );
}
