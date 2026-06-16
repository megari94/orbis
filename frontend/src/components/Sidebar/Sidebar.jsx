import { useState, useRef, useEffect, useCallback } from 'react';
import useStore from '../../store/useStore';

const SIDEBAR_MIN = 220;
const SIDEBAR_MAX = 480;
const SIDEBAR_DEFAULT = 272;

function useSidebarResize() {
  const [width, setWidth] = useState(
    () => parseInt(localStorage.getItem('sidebarWidth') || SIDEBAR_DEFAULT, 10)
  );
  const dragging = useRef(false);
  const startX   = useRef(0);
  const startW   = useRef(0);

  const onMouseDown = useCallback((e) => {
    dragging.current = true;
    startX.current   = e.clientX;
    startW.current   = width;
    document.body.style.cursor    = 'col-resize';
    document.body.style.userSelect = 'none';
  }, [width]);

  useEffect(() => {
    const onMouseMove = (e) => {
      if (!dragging.current) return;
      const delta  = e.clientX - startX.current;
      const newW   = Math.min(SIDEBAR_MAX, Math.max(SIDEBAR_MIN, startW.current + delta));
      setWidth(newW);
    };
    const onMouseUp = () => {
      if (!dragging.current) return;
      dragging.current = false;
      document.body.style.cursor     = '';
      document.body.style.userSelect = '';
      setWidth(w => { localStorage.setItem('sidebarWidth', w); return w; });
    };
    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseup',   onMouseUp);
    return () => {
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseup',   onMouseUp);
    };
  }, []);

  return { width, onMouseDown };
}

const CHANNEL_CLASS = { WHATSAPP: 'av-wa', INSTAGRAM: 'av-ig', MESSENGER: 'av-fb' };
const BADGE_CLASS   = { WHATSAPP: 'ch-wa', INSTAGRAM: 'ch-ig', MESSENGER: 'ch-fb' };
const BADGE_LABEL   = { WHATSAPP: 'WhatsApp', INSTAGRAM: 'Instagram', MESSENGER: 'Messenger' };

const STATUS_PIP   = { nuevo: 'pip-new', open: 'pip-open', pending: 'pip-pending', done: 'pip-done' };
const STATUS_TEXT  = { nuevo: 'st-new',  open: 'st-open',  pending: 'st-pending',  done: 'st-done' };
const STATUS_LABEL = { nuevo: 'nuevo', open: 'en curso', pending: 'pendiente', done: 'resuelto' };

const CHANNEL_TABS = [
  { key: 'all',       label: 'Todos',  icon: 'fa-solid fa-layer-group',         color: 'var(--cream)' },
  { key: 'WHATSAPP',  label: 'WA',     icon: 'fa-brands fa-whatsapp',           color: '#25d366'      },
  { key: 'INSTAGRAM', label: 'IG',     icon: 'fa-brands fa-instagram',          color: '#e1306c'      },
  { key: 'MESSENGER', label: 'MSG',    icon: 'fa-brands fa-facebook-messenger', color: '#0084ff'      },
];

const QUICK_LABELS = ['Urgente', 'Esperando', 'Presupuesto', 'Seguimiento'];

function LabelMenu({ conv, onClose, onSetLabel }) {
  const [custom, setCustom] = useState('');
  const ref = useRef(null);

  useEffect(() => {
    const handler = (e) => { if (ref.current && !ref.current.contains(e.target)) onClose(); };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [onClose]);

  return (
    <div
      ref={ref}
      style={{
        position: 'absolute', top: 36, right: 4, zIndex: 300,
        background: 'var(--bg2)', border: '1px solid var(--border2)',
        borderRadius: 10, minWidth: 180, padding: '8px 0',
        boxShadow: '0 8px 24px rgba(0,0,0,.5)',
      }}
      onClick={e => e.stopPropagation()}
    >
      <div style={{ padding: '4px 12px 8px', fontSize: 11, color: 'var(--dim)', textTransform: 'uppercase', letterSpacing: .5 }}>
        Etiqueta para pendiente
      </div>
      {QUICK_LABELS.map(lbl => (
        <button
          key={lbl}
          onClick={() => { onSetLabel(conv.id, lbl); onClose(); }}
          style={{
            width: '100%', padding: '8px 12px', background: 'none', border: 'none',
            color: conv.tag === lbl ? 'var(--cream)' : 'var(--cream-dim)',
            fontSize: 13, cursor: 'pointer', textAlign: 'left',
            display: 'flex', alignItems: 'center', gap: 8,
            fontWeight: conv.tag === lbl ? 600 : 400,
          }}
          onMouseEnter={e => e.currentTarget.style.background = 'var(--bg3)'}
          onMouseLeave={e => e.currentTarget.style.background = 'none'}
        >
          {conv.tag === lbl && <i className="fa-solid fa-check" style={{ fontSize: 10 }} />}
          {conv.tag !== lbl && <span style={{ width: 14 }} />}
          {lbl}
        </button>
      ))}
      <div style={{ borderTop: '1px solid var(--border)', margin: '6px 0', padding: '6px 12px 0' }}>
        <div style={{ display: 'flex', gap: 6 }}>
          <input
            type="text"
            placeholder="Etiqueta personalizada…"
            value={custom}
            onChange={e => setCustom(e.target.value)}
            onKeyDown={e => { if (e.key === 'Enter' && custom.trim()) { onSetLabel(conv.id, custom.trim()); onClose(); } }}
            style={{
              flex: 1, background: 'var(--bg3)', border: '1px solid var(--border2)',
              borderRadius: 6, padding: '5px 8px', color: 'var(--cream)',
              fontSize: 12, outline: 'none',
            }}
          />
          <button
            onClick={() => { if (custom.trim()) { onSetLabel(conv.id, custom.trim()); onClose(); } }}
            style={{ background: 'var(--red)', border: 'none', borderRadius: 6, color: '#fff', padding: '5px 8px', cursor: 'pointer', fontSize: 12 }}
          >OK</button>
        </div>
      </div>
      {conv.tag && (
        <button
          onClick={() => { onSetLabel(conv.id, null); onClose(); }}
          style={{
            width: '100%', padding: '8px 12px', background: 'none', border: 'none',
            color: 'var(--dim)', fontSize: 12, cursor: 'pointer', textAlign: 'left',
            borderTop: '1px solid var(--border)', marginTop: 4,
          }}
          onMouseEnter={e => e.currentTarget.style.background = 'var(--bg3)'}
          onMouseLeave={e => e.currentTarget.style.background = 'none'}
        >
          <i className="fa-solid fa-xmark" style={{ marginRight: 6 }} />
          Quitar etiqueta
        </button>
      )}
    </div>
  );
}

export default function Sidebar() {
  const { conversations, activeConversation, selectConversation, loading } = useStore();
  const [search,        setSearch]        = useState('');
  const [statusFilter,  setStatusFilter]  = useState(null);
  const [channelFilter, setChannelFilter] = useState('all');
  const [labelMenuId,   setLabelMenuId]   = useState(null);
  // tags locales por conversación (pendiente → etiqueta)
  const [localTags,     setLocalTags]     = useState({});
  const { width, onMouseDown } = useSidebarResize();

  const toggleStatus = (key) => setStatusFilter(s => s === key ? null : key);

  const setLabel = (convId, label) => {
    setLocalTags(t => ({ ...t, [convId]: label }));
    // TODO: persistir en API
  };

  const getTag = (conv) => localTags[conv.id] ?? conv.tag ?? null;

  const filtered = conversations.filter(c => {
    const matchSearch  = c.name.toLowerCase().includes(search.toLowerCase()) ||
                         c.preview?.toLowerCase().includes(search.toLowerCase());
    const matchChannel = channelFilter === 'all' || c.channel === channelFilter;
    const matchStatus  = !statusFilter || c.status === statusFilter;
    return matchSearch && matchChannel && matchStatus;
  });

  const countNew     = conversations.filter(c => c.status === 'nuevo').length;
  const countOpen    = conversations.filter(c => c.status === 'open').length;
  const countPending = conversations.filter(c => c.status === 'pending').length;
  const countDone    = conversations.filter(c => c.status === 'done').length;

  return (
    <aside className="sidebar" style={{ width, minWidth: width }}>
      <div className="sidebar-resizer" onMouseDown={onMouseDown} title="Arrastrá para redimensionar" />
      <div className="sidebar-head">
        <div className="sidebar-title">Conversaciones</div>
        <div className="search-wrap">
          <i className="fa-solid fa-magnifying-glass" />
          <input
            type="text"
            placeholder="Buscar por nombre, teléfono…"
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>
      </div>

      <div className="stats-bar">
        {[
          { key: 'nuevo',   count: countNew,     label: 'Nuevos',     cls: 'red'   },
          { key: 'open',    count: countOpen,     label: 'En curso',   cls: 'yel'   },
          { key: 'pending', count: countPending,  label: 'Pendientes', cls: 'muted' },
          { key: 'done',    count: countDone,     label: 'Resueltos',  cls: 'green' },
        ].map(({ key, count, label, cls }) => (
          <div
            key={key}
            className={`stat-cell${statusFilter === key ? ' stat-active' : ''}`}
            onClick={() => toggleStatus(key)}
            title={statusFilter === key ? 'Ver todos' : `Filtrar: ${label}`}
          >
            <div className={`stat-n ${cls}`}>{count}</div>
            <div className="stat-lbl">{label}</div>
          </div>
        ))}
      </div>

      {statusFilter && (
        <div className="filter-active-bar">
          <span>
            Filtrando: <strong>{{
              nuevo: 'Nuevos', open: 'En curso', pending: 'Pendientes', done: 'Resueltos'
            }[statusFilter]}</strong>
          </span>
          <button onClick={() => setStatusFilter(null)}>
            <i className="fa-solid fa-xmark" style={{ marginRight: 4 }} />
            Ver todos
          </button>
        </div>
      )}

      <div className="channel-tabs">
        {CHANNEL_TABS.map(({ key, label, icon, color }) => (
          <button
            key={key}
            className={`chtab${channelFilter === key ? ' active' : ''}`}
            style={channelFilter === key ? { borderColor: color, color } : {}}
            onClick={() => setChannelFilter(key)}
            title={label}
          >
            <i className={icon} />
            <span>{label}</span>
          </button>
        ))}
      </div>

      <div className="conv-list">
        {loading && (
          <div style={{ display: 'flex', justifyContent: 'center', padding: '32px 0', color: 'var(--dim)' }}>
            <i className="fa-solid fa-circle-notch fa-spin" style={{ fontSize: 20 }} />
          </div>
        )}
        {!loading && filtered.length === 0 && (
          <div style={{ textAlign: 'center', padding: '40px 16px', color: 'var(--dim)', fontSize: 13 }}>
            {search ? 'Sin resultados para esa búsqueda' : 'No hay conversaciones'}
          </div>
        )}
        {!loading && filtered.map(conv => {
          const tag = getTag(conv);
          return (
            <div
              key={conv.id}
              className={`conv-item${activeConversation?.id === conv.id ? ' active' : ''}`}
              onClick={() => selectConversation(conv)}
              style={{ position: 'relative' }}
            >
              <div className={`av ${CHANNEL_CLASS[conv.channel] || 'av-mul'}`}>
                {conv.initials}
              </div>
              <div className="conv-body">
                <div className="conv-row1">
                  <span className="conv-name">{conv.name}</span>
                  <span className="conv-time">{conv.time}</span>
                </div>
                <div className="conv-preview">{conv.preview}</div>
                <div className="conv-meta">
                  <span className={`ch-badge ${BADGE_CLASS[conv.channel] || ''}`}>
                    {BADGE_LABEL[conv.channel] || conv.channel}
                  </span>
                  {tag
                    ? <span className="prio-tag">{tag}</span>
                    : conv.status && (
                        <>
                          <span className={`status-pip ${STATUS_PIP[conv.status] || ''}`} />
                          <span className={`status-text ${STATUS_TEXT[conv.status] || ''}`}>
                            {STATUS_LABEL[conv.status] || conv.status}
                          </span>
                        </>
                      )
                  }
                  {conv.unread > 0 && (
                    <span className="unread-badge">{conv.unread}</span>
                  )}
                </div>
              </div>

              {/* Botón etiqueta para pendiente (#3) */}
              {conv.status === 'pending' && (
                <div style={{ position: 'relative' }}>
                  <button
                    className="hbtn"
                    title="Agregar etiqueta"
                    style={{ fontSize: 11, opacity: .6 }}
                    onClick={e => { e.stopPropagation(); setLabelMenuId(id => id === conv.id ? null : conv.id); }}
                  >
                    <i className="fa-solid fa-tag" />
                  </button>
                  {labelMenuId === conv.id && (
                    <LabelMenu
                      conv={{ ...conv, tag }}
                      onClose={() => setLabelMenuId(null)}
                      onSetLabel={setLabel}
                    />
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </aside>
  );
}
