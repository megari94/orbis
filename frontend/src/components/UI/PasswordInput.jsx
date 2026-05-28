import { useState } from 'react';

/**
 * Input de contraseña con toggle de visibilidad (ojito).
 * Acepta las mismas props que un <input> normal más:
 *  - inputStyle: estilos extra para el <input>
 *  - containerStyle: estilos extra para el wrapper
 */
export default function PasswordInput({ inputStyle = {}, containerStyle = {}, ...props }) {
  const [visible, setVisible] = useState(false);

  return (
    <div style={{ position: 'relative', display: 'flex', alignItems: 'center', ...containerStyle }}>
      <input
        {...props}
        type={visible ? 'text' : 'password'}
        style={{
          background: 'var(--bg3)',
          border: '1px solid var(--border2)',
          borderRadius: 8,
          padding: '10px 40px 10px 13px',
          color: 'var(--cream)',
          fontSize: 14,
          outline: 'none',
          width: '100%',
          boxSizing: 'border-box',
          ...inputStyle,
        }}
      />
      <button
        type="button"
        onClick={() => setVisible(v => !v)}
        tabIndex={-1}
        style={{
          position: 'absolute',
          right: 11,
          background: 'none',
          border: 'none',
          color: visible ? 'var(--cream-dim)' : 'var(--dim)',
          cursor: 'pointer',
          padding: 4,
          display: 'flex',
          alignItems: 'center',
          fontSize: 14,
        }}
        title={visible ? 'Ocultar contraseña' : 'Ver contraseña'}
      >
        <i className={visible ? 'fa-solid fa-eye-slash' : 'fa-solid fa-eye'} />
      </button>
    </div>
  );
}
