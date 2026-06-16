import { useState } from 'react';
import { updateContact } from '../../services/api';

export default function ContactModal({ contact, onClose, onSaved }) {
  // Si el nombre guardado es igual al teléfono (nombre por defecto), arrancamos vacío
  const defaultName = contact?.name === contact?.phone ? '' : (contact?.name || '');

  const [form, setForm] = useState({
    name:    defaultName,
    email:   contact?.email   || '',
    address: contact?.address || '',
  });
  const [saving, setSaving] = useState(false);
  const [error,  setError]  = useState('');

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const handleSave = async () => {
    if (!form.name.trim()) { setError('El nombre es obligatorio.'); return; }
    setSaving(true);
    setError('');
    try {
      if (contact?.id) {
        await updateContact(contact.id, {
          name:     form.name,
          email:    form.email,
          location: form.address,
        });
      }
      onSaved?.({ ...contact, name: form.name, email: form.email, address: form.address });
      onClose();
    } catch (e) {
      setError(`No se pudo guardar: ${e?.response?.data?.message || e?.message || 'error desconocido'}`);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div
      style={{
        position: 'fixed', inset: 0, zIndex: 500,
        background: 'rgba(0,0,0,.6)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
      }}
      onClick={e => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div style={{
        background: 'var(--bg1)', border: '1px solid var(--border2)',
        borderRadius: 14, padding: 28, width: 420, maxWidth: '95vw',
        boxShadow: '0 16px 48px rgba(0,0,0,.6)',
      }}>
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 22 }}>
          <div style={{ fontSize: 16, fontWeight: 700, color: 'var(--cream)', display: 'flex', alignItems: 'center', gap: 10 }}>
            <i className="fa-solid fa-user" style={{ color: 'var(--red)' }} />
            Datos del contacto
          </div>
          <button onClick={onClose} style={{ background: 'none', border: 'none', color: 'var(--dim)', cursor: 'pointer', fontSize: 16 }}>
            <i className="fa-solid fa-xmark" />
          </button>
        </div>

        {/* Teléfono — solo lectura */}
        {contact?.phone && (
          <div style={{ marginBottom: 18 }}>
            <label style={{ display: 'block', fontSize: 11, color: 'var(--dim)', marginBottom: 6, textTransform: 'uppercase', letterSpacing: .6 }}>
              Teléfono
            </label>
            <div style={{
              display: 'flex', alignItems: 'center', gap: 10,
              background: 'var(--bg2)', border: '1px solid var(--border)',
              borderRadius: 8, padding: '9px 12px',
              color: 'var(--dim)', fontSize: 14,
            }}>
              <i className="fa-solid fa-phone" style={{ fontSize: 13, color: 'var(--dim)' }} />
              {contact.phone}
              <span style={{ marginLeft: 'auto', fontSize: 11, color: 'var(--dim)', opacity: .6 }}>solo lectura</span>
            </div>
          </div>
        )}

        {/* Campos editables */}
        {[
          { label: 'Nombre',             key: 'name',    type: 'text',  placeholder: 'Nombre completo del contacto', icon: 'fa-user'         },
          { label: 'Correo electrónico', key: 'email',   type: 'email', placeholder: 'correo@ejemplo.com',           icon: 'fa-envelope'     },
          { label: 'Dirección',          key: 'address', type: 'text',  placeholder: 'Calle, número, ciudad',        icon: 'fa-location-dot' },
        ].map(({ label, key, type, placeholder, icon }) => (
          <div key={key} style={{ marginBottom: 16 }}>
            <label style={{ display: 'block', fontSize: 11, color: 'var(--dim)', marginBottom: 6, textTransform: 'uppercase', letterSpacing: .6 }}>
              {label}
            </label>
            <div style={{ position: 'relative' }}>
              <i className={`fa-solid ${icon}`} style={{
                position: 'absolute', left: 11, top: '50%', transform: 'translateY(-50%)',
                color: 'var(--dim)', fontSize: 13,
              }} />
              <input
                type={type}
                value={form[key]}
                placeholder={placeholder}
                onChange={e => set(key, e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleSave()}
                style={{
                  width: '100%', boxSizing: 'border-box',
                  background: 'var(--bg3)', border: '1px solid var(--border2)',
                  borderRadius: 8, padding: '9px 12px 9px 34px',
                  color: 'var(--cream)', fontSize: 14, outline: 'none',
                }}
              />
            </div>
          </div>
        ))}

        {error && (
          <div style={{ color: 'var(--red-light)', fontSize: 13, marginBottom: 12 }}>
            <i className="fa-solid fa-triangle-exclamation" style={{ marginRight: 6 }} />
            {error}
          </div>
        )}

        {/* Botones */}
        <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end', marginTop: 6 }}>
          <button
            onClick={onClose}
            style={{ padding: '9px 18px', background: 'var(--bg3)', border: '1px solid var(--border2)', borderRadius: 8, color: 'var(--dim)', fontSize: 14, cursor: 'pointer' }}
          >
            Cancelar
          </button>
          <button
            onClick={handleSave}
            disabled={saving}
            style={{ padding: '9px 20px', background: 'var(--red)', border: 'none', borderRadius: 8, color: '#fff', fontSize: 14, fontWeight: 600, cursor: saving ? 'wait' : 'pointer', opacity: saving ? .7 : 1 }}
          >
            <i className="fa-solid fa-floppy-disk" style={{ marginRight: 6 }} />
            {saving ? 'Guardando…' : 'Guardar'}
          </button>
        </div>
      </div>
    </div>
  );
}
