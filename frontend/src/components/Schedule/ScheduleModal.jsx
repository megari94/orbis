import { useState } from 'react';

export default function ScheduleModal({ contact, onClose }) {
  const [form, setForm] = useState({
    name:    contact?.name    || '',
    email:   contact?.email   || '',
    address: contact?.address || '',
    date:    '',
    time:    '',
    note:    '',
  });

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const handleSave = () => {
    if (!form.name || !form.date || !form.time) {
      alert('Completá al menos nombre, fecha y hora.');
      return;
    }
    // TODO: llamar API para guardar turno
    console.log('Nuevo turno:', form);
    onClose();
  };

  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 500,
      background: 'rgba(0,0,0,.6)', display: 'flex',
      alignItems: 'center', justifyContent: 'center',
    }} onClick={e => { if (e.target === e.currentTarget) onClose(); }}>
      <div style={{
        background: 'var(--bg1)', border: '1px solid var(--border2)',
        borderRadius: 14, padding: 28, width: 420, maxWidth: '95vw',
        boxShadow: '0 16px 48px rgba(0,0,0,.6)',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
          <div style={{ fontSize: 16, fontWeight: 700, color: 'var(--cream)', display: 'flex', alignItems: 'center', gap: 10 }}>
            <i className="fa-solid fa-calendar-plus" style={{ color: 'var(--red)' }} />
            Agendar turno
          </div>
          <button onClick={onClose} style={{ background: 'none', border: 'none', color: 'var(--dim)', cursor: 'pointer', fontSize: 16 }}>
            <i className="fa-solid fa-xmark" />
          </button>
        </div>

        {[
          { label: 'Nombre', key: 'name',    type: 'text',           placeholder: 'Nombre del cliente' },
          { label: 'Correo', key: 'email',   type: 'email',          placeholder: 'correo@ejemplo.com' },
          { label: 'Dirección', key: 'address', type: 'text',        placeholder: 'Dirección del turno' },
          { label: 'Fecha',  key: 'date',    type: 'date',           placeholder: '' },
          { label: 'Hora',   key: 'time',    type: 'time',           placeholder: '' },
        ].map(({ label, key, type, placeholder }) => (
          <div key={key} style={{ marginBottom: 14 }}>
            <label style={{ display: 'block', fontSize: 12, color: 'var(--dim)', marginBottom: 5, textTransform: 'uppercase', letterSpacing: .5 }}>
              {label}
            </label>
            <input
              type={type}
              value={form[key]}
              placeholder={placeholder}
              onChange={e => set(key, e.target.value)}
              style={{
                width: '100%', boxSizing: 'border-box',
                background: 'var(--bg3)', border: '1px solid var(--border2)',
                borderRadius: 8, padding: '9px 12px',
                color: 'var(--cream)', fontSize: 14, outline: 'none',
              }}
            />
          </div>
        ))}

        <div style={{ marginBottom: 20 }}>
          <label style={{ display: 'block', fontSize: 12, color: 'var(--dim)', marginBottom: 5, textTransform: 'uppercase', letterSpacing: .5 }}>
            Nota
          </label>
          <textarea
            rows={2}
            value={form.note}
            placeholder="Motivo del turno…"
            onChange={e => set('note', e.target.value)}
            style={{
              width: '100%', boxSizing: 'border-box', resize: 'none',
              background: 'var(--bg3)', border: '1px solid var(--border2)',
              borderRadius: 8, padding: '9px 12px',
              color: 'var(--cream)', fontSize: 14, outline: 'none',
            }}
          />
        </div>

        <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
          <button
            onClick={onClose}
            style={{ padding: '9px 18px', background: 'var(--bg3)', border: '1px solid var(--border2)', borderRadius: 8, color: 'var(--dim)', fontSize: 14, cursor: 'pointer' }}
          >
            Cancelar
          </button>
          <button
            onClick={handleSave}
            style={{ padding: '9px 18px', background: 'var(--red)', border: 'none', borderRadius: 8, color: '#fff', fontSize: 14, fontWeight: 600, cursor: 'pointer' }}
          >
            <i className="fa-solid fa-calendar-check" style={{ marginRight: 6 }} />
            Guardar turno
          </button>
        </div>
      </div>
    </div>
  );
}
