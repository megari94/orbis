import { useState, useRef, useEffect } from 'react';
import useStore from '../../store/useStore';

const QUICK_LABELS = ['Urgente', 'Esperando', 'Presupuesto', 'Seguimiento'];

function LabelDropdown({ convId, currentTag, onClose }) {
  const { setConvTag } = useStore();
  const [custom, setCustom] = useState('');
  const ref = useRef(null);

  useEffect(() => {
    const handler = (e) => { if (ref.current && !ref.current.contains(e.target)) onClose(); };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [onClose]);

  const apply = (label) => { setConvTag(convId, label); onClose(); };

  return (
    <div
      ref={ref}
      style={{
        position: 'absolute', top: '100%', left: 0, zIndex: 300,
        background: 'var(--bg2)', border: '1px solid var(--border2)',
        borderRadius: 10, minWidth: 200, padding: '8px 0',
        boxShadow: '0 8px 24px rgba(0,0,0,.5)',
      }}
      onClick={e => e.stopPropagation()}
    >
      <div style={{ padding: '4px 12px 8px', fontSize: 11, color: 'var(--dim)', textTransform: 'uppercase', letterSpacing: .5 }}>
        Etiqueta
      </div>

      {QUICK_LABELS.map(lbl => (
        <button
          key={lbl}
          onClick={() => apply(lbl)}
          style={{
            width: '100%', padding: '8px 14px', background: 'none', border: 'none',
            color: currentTag === lbl ? 'var(--cream)' : 'var(--cream-dim)',
            fontSize: 13, cursor: 'pointer', textAlign: 'left',
            display: 'flex', alignItems: 'center', gap: 8,
            fontWeight: currentTag === lbl ? 600 : 400,
          }}
          onMouseEnter={e => e.currentTarget.style.background = 'var(--bg3)'}
          onMouseLeave={e => e.currentTarget.style.background = 'none'}
        >
          <i className="fa-solid fa-tag" style={{ fontSize: 10, color: 'var(--dim)' }} />
          {lbl}
          {currentTag === lbl && <i className="fa-solid fa-check" style={{ fontSize: 10, marginLeft: 'auto' }} />}
        </button>
      ))}

      {/* Campo personalizado */}
      <div style={{ borderTop: '1px solid var(--border)', margin: '6px 0 0', padding: '8px 12px 4px' }}>
        <div style={{ display: 'flex', gap: 6 }}>
          <input
            autoFocus
            type="text"
            placeholder="Etiqueta personalizada…"
            value={custom}
            onChange={e => setCustom(e.target.value)}
            onKeyDown={e => { if (e.key === 'Enter' && custom.trim()) apply(custom.trim()); }}
            style={{
              flex: 1, background: 'var(--bg3)', border: '1px solid var(--border2)',
              borderRadius: 6, padding: '5px 8px', color: 'var(--cream)',
              fontSize: 12, outline: 'none',
            }}
          />
          <button
            onClick={() => { if (custom.trim()) apply(custom.trim()); }}
            style={{ background: 'var(--red)', border: 'none', borderRadius: 6, color: '#fff', padding: '5px 10px', cursor: 'pointer', fontSize: 12 }}
          >OK</button>
        </div>
      </div>

      {/* Quitar etiqueta */}
      {currentTag && (
        <button
          onClick={() => apply(null)}
          style={{
            width: '100%', padding: '8px 14px', background: 'none', border: 'none',
            color: 'var(--dim)', fontSize: 12, cursor: 'pointer', textAlign: 'left',
            borderTop: '1px solid var(--border)', marginTop: 4,
            display: 'flex', alignItems: 'center', gap: 8,
          }}
          onMouseEnter={e => e.currentTarget.style.background = 'var(--bg3)'}
          onMouseLeave={e => e.currentTarget.style.background = 'none'}
        >
          <i className="fa-solid fa-xmark" />
          Quitar etiqueta
        </button>
      )}
    </div>
  );
}

export default function TagStrip() {
  const { activeConversation, convTags } = useStore();
  const [open, setOpen] = useState(false);

  // Solo mostrar en conversaciones pendientes
  if (!activeConversation || activeConversation.status !== 'pending') return null;

  const convId     = activeConversation.id;
  const currentTag = convTags[convId] ?? activeConversation.tag ?? null;

  return (
    <div className="tag-strip" style={{ position: 'relative' }}>
      {/* Etiqueta activa */}
      {currentTag && (
        <span className="tag-pill">
          <i className="fa-solid fa-tag" style={{ marginRight: 4, fontSize: 10 }} />
          {currentTag}
        </span>
      )}

      {/* Botón agregar / cambiar etiqueta */}
      <span
        className="tag-pill dashed"
        style={{ cursor: 'pointer', position: 'relative' }}
        onClick={() => setOpen(o => !o)}
      >
        <i className="fa-solid fa-plus" style={{ marginRight: 4, fontSize: 10 }} />
        {currentTag ? 'cambiar etiqueta' : 'agregar etiqueta'}

        {open && (
          <LabelDropdown
            convId={convId}
            currentTag={currentTag}
            onClose={() => setOpen(false)}
          />
        )}
      </span>
    </div>
  );
}
