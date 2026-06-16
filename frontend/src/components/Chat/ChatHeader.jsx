import { useState, useRef, useEffect } from 'react';
import useStore from '../../store/useStore';

const CHANNEL_CLASS = { WHATSAPP: 'av-wa', INSTAGRAM: 'av-ig', MESSENGER: 'av-fb' };
const BADGE_CLASS   = { WHATSAPP: 'ch-wa', INSTAGRAM: 'ch-ig', MESSENGER: 'ch-fb' };
const BADGE_LABEL   = { WHATSAPP: 'WhatsApp', INSTAGRAM: 'Instagram', MESSENGER: 'Messenger' };

export default function ChatHeader({ onEditContact, onSearch }) {
  const { activeConversation } = useStore();
  const [showMenu,   setShowMenu]   = useState(false);
  const [showSearch, setShowSearch] = useState(false);
  const [searchQ,    setSearchQ]    = useState('');
  const menuRef   = useRef(null);
  const searchRef = useRef(null);

  if (!activeConversation) return null;

  const { name, initials, channel, contact } = activeConversation;
  const phone = contact?.phone || '';

  // Cerrar menú al hacer clic afuera
  useEffect(() => {
    const handler = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) setShowMenu(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const handleDeleteChat = () => {
    setShowMenu(false);
    if (confirm(`¿Eliminar la conversación con ${name}? El contacto no se eliminará.`)) {
      console.log('Eliminar conversación', activeConversation.id);
    }
  };

  const handleSearch = (e) => {
    if (e.key === 'Enter' || e.key === 'Escape') {
      if (e.key === 'Escape') { setSearchQ(''); setShowSearch(false); }
      onSearch?.(searchQ);
    }
  };

  return (
    <div className="chat-header">
      {/* Avatar — solo visual, sin acción */}
      <div className={`av ${CHANNEL_CLASS[channel] || 'av-mul'}`}
        style={{ width: 40, height: 40, fontSize: 14 }}>
        {initials}
      </div>

      <div>
        <div className="chat-name">{name}</div>
        <div className="chat-sub">
          <span className={`ch-badge ${BADGE_CLASS[channel] || ''}`} style={{ marginRight: 6 }}>
            {BADGE_LABEL[channel] || channel}
          </span>
          {phone}
        </div>
      </div>

      <div className="chat-head-right">
        {/* Ícono persona → editar datos del contacto */}
        <button
          className="hbtn"
          title="Datos del contacto"
          onClick={() => onEditContact?.({
            id:      contact?.id,
            name,
            email:   contact?.email   || '',
            address: contact?.location || '',
          })}
        >
          <i className="fa-solid fa-user" />
        </button>

        {/* Barra de búsqueda de mensajes */}
        {showSearch && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, background: 'var(--bg3)', borderRadius: 8, padding: '4px 10px' }}>
            <i className="fa-solid fa-magnifying-glass" style={{ fontSize: 12, color: 'var(--dim)' }} />
            <input
              ref={searchRef}
              autoFocus
              type="text"
              placeholder="Buscar en mensajes…"
              value={searchQ}
              onChange={e => { setSearchQ(e.target.value); onSearch?.(e.target.value); }}
              onKeyDown={handleSearch}
              style={{ background: 'none', border: 'none', outline: 'none', color: 'var(--cream)', fontSize: 13, width: 160 }}
            />
            <button
              onClick={() => { setShowSearch(false); setSearchQ(''); onSearch?.(''); }}
              style={{ background: 'none', border: 'none', color: 'var(--dim)', cursor: 'pointer', padding: 0 }}
            >
              <i className="fa-solid fa-xmark" />
            </button>
          </div>
        )}

        {/* Lupa */}
        {!showSearch && (
          <button className="hbtn" title="Buscar mensajes" onClick={() => setShowSearch(true)}>
            <i className="fa-solid fa-magnifying-glass" />
          </button>
        )}

        {/* Menú más → eliminar chat */}
        <div style={{ position: 'relative' }} ref={menuRef}>
          <button className="hbtn" title="Más" onClick={() => setShowMenu(m => !m)}>
            <i className="fa-solid fa-ellipsis-vertical" />
          </button>
          {showMenu && (
            <div style={{
              position: 'absolute', top: 38, right: 0, zIndex: 200,
              background: 'var(--bg2)', border: '1px solid var(--border2)',
              borderRadius: 10, minWidth: 180,
              boxShadow: '0 8px 24px rgba(0,0,0,.5)',
              overflow: 'hidden',
            }}>
              <button
                onClick={handleDeleteChat}
                style={{
                  width: '100%', padding: '11px 15px',
                  background: 'none', border: 'none',
                  color: 'var(--red-light)', fontSize: 13,
                  cursor: 'pointer', textAlign: 'left',
                  display: 'flex', alignItems: 'center', gap: 10,
                  transition: 'background .15s',
                }}
                onMouseEnter={e => e.currentTarget.style.background = 'var(--bg3)'}
                onMouseLeave={e => e.currentTarget.style.background = 'none'}
              >
                <i className="fa-solid fa-trash" style={{ width: 14, textAlign: 'center' }} />
                Eliminar conversación
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
