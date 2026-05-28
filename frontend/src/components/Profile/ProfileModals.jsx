import { useState, useRef } from 'react';
import { updateProfileApi, changePasswordApi, deleteAccountApi, uploadAvatarApi } from '../../services/api';
import UserAvatar from './UserAvatar';
import PasswordInput from '../UI/PasswordInput';

// ── Overlay base ──────────────────────────────────────────────────────────────
function Overlay({ onClose, children }) {
  return (
    <>
      <div
        onClick={onClose}
        style={{
          position: 'fixed', inset: 0, background: 'rgba(0,0,0,.6)',
          zIndex: 300, backdropFilter: 'blur(3px)',
        }}
      />
      <div style={{
        position: 'fixed', top: '50%', left: '50%',
        transform: 'translate(-50%,-50%)',
        zIndex: 301, width: '100%', maxWidth: 420, padding: '0 16px',
        animation: 'fadeScaleIn .18s ease-out',
      }}>
        {children}
      </div>
      <style>{`
        @keyframes fadeScaleIn {
          from { opacity: 0; transform: translate(-50%,-48%) scale(.97); }
          to   { opacity: 1; transform: translate(-50%,-50%) scale(1); }
        }
      `}</style>
    </>
  );
}

function Card({ title, icon, onClose, children }) {
  return (
    <div style={{
      background: 'var(--bg1)', border: '1px solid var(--border)',
      borderRadius: 12, overflow: 'hidden',
      boxShadow: '0 20px 60px rgba(0,0,0,.5)',
    }}>
      {/* Header */}
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '18px 20px', borderBottom: '1px solid var(--border)',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <i className={icon} style={{ color: 'var(--cream-dim)', fontSize: 15 }} />
          <span style={{ fontSize: 15, fontWeight: 700, color: 'var(--cream)', fontFamily: "'Syne', sans-serif" }}>
            {title}
          </span>
        </div>
        <button
          onClick={onClose}
          style={{ background: 'none', border: 'none', color: 'var(--dim)', cursor: 'pointer', fontSize: 17, padding: 4 }}
        >
          <i className="fa-solid fa-xmark" />
        </button>
      </div>
      {/* Body */}
      <div style={{ padding: '20px 20px 22px' }}>
        {children}
      </div>
    </div>
  );
}

// ── Inputs / botones compartidos ──────────────────────────────────────────────
const sty = {
  field:  { display: 'flex', flexDirection: 'column', gap: 5, marginBottom: 14 },
  label:  { fontSize: 12, fontWeight: 500, color: 'var(--cream-dim)' },
  input:  {
    background: 'var(--bg3)', border: '1px solid var(--border2)',
    borderRadius: 8, padding: '10px 13px', color: 'var(--cream)',
    fontSize: 14, outline: 'none', width: '100%', boxSizing: 'border-box',
  },
  error:  {
    background: 'var(--red-bg)', border: '1px solid var(--red-border)',
    borderRadius: 7, padding: '9px 13px', color: 'var(--red-light)',
    fontSize: 13, marginBottom: 14,
  },
  success: {
    background: 'rgba(76,175,80,.1)', border: '1px solid rgba(76,175,80,.3)',
    borderRadius: 7, padding: '9px 13px', color: '#4caf50',
    fontSize: 13, marginBottom: 14,
  },
  btnPrimary: {
    width: '100%', background: 'var(--red)', border: 'none',
    borderRadius: 8, padding: '11px 0', color: '#fff',
    fontSize: 14, fontWeight: 600, cursor: 'pointer',
    fontFamily: "'Syne', sans-serif",
  },
  btnDanger: {
    width: '100%', background: 'transparent',
    border: '1px solid #e53935', borderRadius: 8,
    padding: '11px 0', color: '#e53935',
    fontSize: 14, fontWeight: 600, cursor: 'pointer',
  },
};

// ── 1. Modal: Cambiar perfil ──────────────────────────────────────────────────
export function EditProfileModal({ user, onClose, onUpdated }) {
  const [name,         setName]         = useState(user?.name  ?? '');
  const [email,        setEmail]        = useState(user?.email ?? '');
  const [error,        setError]        = useState('');
  const [success,      setSuccess]      = useState('');
  const [loading,      setLoading]      = useState(false);
  const [avatarLoading, setAvatarLoading] = useState(false);
  const [localUser,    setLocalUser]    = useState(user);
  const fileRef = useRef(null);

  // Subir foto al seleccionar el archivo
  const handleAvatarChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setAvatarLoading(true);
    setError('');
    try {
      const updated = await uploadAvatarApi(file);
      setLocalUser(updated);
      onUpdated(updated);
    } catch (err) {
      const msg = err.response?.data?.message;
      setError(Array.isArray(msg) ? msg.join(', ') : (msg || 'Error al subir la foto'));
    } finally {
      setAvatarLoading(false);
      e.target.value = '';
    }
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setError(''); setSuccess('');
    setLoading(true);
    try {
      const updated = await updateProfileApi({ name, email });
      onUpdated(updated);
      setSuccess('Perfil actualizado correctamente');
      setTimeout(onClose, 1400);
    } catch (err) {
      const msg = err.response?.data?.message;
      setError(Array.isArray(msg) ? msg.join(', ') : (msg || 'Error al actualizar'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <Overlay onClose={onClose}>
      <Card title="Editar perfil" icon="fa-solid fa-user-pen" onClose={onClose}>

        {/* Foto de perfil */}
        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 22 }}>
          <div style={{ position: 'relative', display: 'inline-block' }}>
            <UserAvatar user={localUser} size={80} className="avatar-nav" style={{ fontSize: 28 }} />

            {/* Botón cámara encima del avatar */}
            <button
              type="button"
              onClick={() => fileRef.current?.click()}
              disabled={avatarLoading}
              style={{
                position: 'absolute', bottom: 0, right: 0,
                width: 26, height: 26, borderRadius: '50%',
                background: 'var(--red)', border: '2px solid var(--bg1)',
                color: '#fff', cursor: 'pointer', fontSize: 11,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}
              title="Cambiar foto"
            >
              {avatarLoading
                ? <i className="fa-solid fa-spinner fa-spin" />
                : <i className="fa-solid fa-camera" />
              }
            </button>

            <input
              ref={fileRef}
              type="file"
              accept="image/jpeg,image/png,image/webp,image/gif"
              style={{ display: 'none' }}
              onChange={handleAvatarChange}
            />
          </div>
        </div>

        <form onSubmit={handleSave}>
          <div style={sty.field}>
            <label style={sty.label}>Nombre</label>
            <input
              type="text" value={name} required minLength={2}
              onChange={e => setName(e.target.value)}
              placeholder="Tu nombre"
              style={sty.input}
            />
          </div>
          <div style={sty.field}>
            <label style={sty.label}>Email</label>
            <input
              type="email" value={email} required
              onChange={e => setEmail(e.target.value)}
              placeholder="tu@email.com"
              style={sty.input}
            />
          </div>

          {error   && <div style={sty.error}><i className="fa-solid fa-circle-exclamation" style={{ marginRight: 7 }} />{error}</div>}
          {success && <div style={sty.success}><i className="fa-solid fa-check" style={{ marginRight: 7 }} />{success}</div>}

          <button type="submit" disabled={loading} style={sty.btnPrimary}>
            {loading ? <><i className="fa-solid fa-spinner fa-spin" style={{ marginRight: 8 }} />Guardando…</> : 'Guardar cambios'}
          </button>
        </form>
      </Card>
    </Overlay>
  );
}

// ── 2. Modal: Cambiar contraseña ──────────────────────────────────────────────
export function ChangePasswordModal({ onClose }) {
  const [current,  setCurrent]  = useState('');
  const [newPass,  setNewPass]  = useState('');
  const [confirm,  setConfirm]  = useState('');
  const [error,    setError]    = useState('');
  const [success,  setSuccess]  = useState('');
  const [loading,  setLoading]  = useState(false);

  const handleSave = async (e) => {
    e.preventDefault();
    setError(''); setSuccess('');
    if (newPass !== confirm) { setError('Las contraseñas nuevas no coinciden'); return; }
    if (newPass.length < 6)  { setError('La nueva contraseña debe tener al menos 6 caracteres'); return; }
    setLoading(true);
    try {
      await changePasswordApi({ currentPassword: current, newPassword: newPass });
      setSuccess('Contraseña actualizada correctamente');
      setTimeout(onClose, 1400);
    } catch (err) {
      const msg = err.response?.data?.message;
      setError(Array.isArray(msg) ? msg.join(', ') : (msg || 'Error al cambiar contraseña'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <Overlay onClose={onClose}>
      <Card title="Cambiar contraseña" icon="fa-solid fa-lock" onClose={onClose}>
        <form onSubmit={handleSave}>
          <div style={sty.field}>
            <label style={sty.label}>Contraseña actual</label>
            <PasswordInput value={current} required onChange={e => setCurrent(e.target.value)} placeholder="••••••••" />
          </div>
          <div style={sty.field}>
            <label style={sty.label}>Nueva contraseña</label>
            <PasswordInput value={newPass}  required onChange={e => setNewPass(e.target.value)}  placeholder="Mínimo 6 caracteres" />
          </div>
          <div style={sty.field}>
            <label style={sty.label}>Confirmar nueva contraseña</label>
            <PasswordInput value={confirm}  required onChange={e => setConfirm(e.target.value)}  placeholder="Repetí la nueva contraseña" />
          </div>

          {error   && <div style={sty.error}><i className="fa-solid fa-circle-exclamation" style={{ marginRight: 7 }} />{error}</div>}
          {success && <div style={sty.success}><i className="fa-solid fa-check" style={{ marginRight: 7 }} />{success}</div>}

          <button type="submit" disabled={loading} style={sty.btnPrimary}>
            {loading ? <><i className="fa-solid fa-spinner fa-spin" style={{ marginRight: 8 }} />Guardando…</> : 'Cambiar contraseña'}
          </button>
        </form>
      </Card>
    </Overlay>
  );
}

// ── 3. Modal: Eliminar cuenta ─────────────────────────────────────────────────
export function DeleteAccountModal({ onClose, onDeleted }) {
  const [password, setPassword] = useState('');
  const [confirm,  setConfirm]  = useState(false);
  const [error,    setError]    = useState('');
  const [loading,  setLoading]  = useState(false);

  const handleDelete = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await deleteAccountApi({ password });
      onDeleted();
    } catch (err) {
      const msg = err.response?.data?.message;
      setError(Array.isArray(msg) ? msg.join(', ') : (msg || 'Error al eliminar la cuenta'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <Overlay onClose={onClose}>
      <Card title="Eliminar cuenta" icon="fa-solid fa-triangle-exclamation" onClose={onClose}>

        {/* Advertencia */}
        <div style={{
          background: 'rgba(229,57,53,.08)', border: '1px solid rgba(229,57,53,.3)',
          borderRadius: 8, padding: '12px 14px', marginBottom: 18,
          fontSize: 13, color: 'var(--cream-dim)', lineHeight: 1.6,
        }}>
          <i className="fa-solid fa-triangle-exclamation" style={{ color: '#e53935', marginRight: 8 }} />
          Esta acción es <strong style={{ color: '#e53935' }}>irreversible</strong>. Se eliminarán tu cuenta,
          todos tus contactos, conversaciones y configuraciones.
        </div>

        <form onSubmit={handleDelete}>
          {/* Checkbox de confirmación */}
          <label style={{
            display: 'flex', alignItems: 'flex-start', gap: 10,
            fontSize: 13, color: 'var(--cream-dim)', cursor: 'pointer', marginBottom: 16,
          }}>
            <input
              type="checkbox"
              checked={confirm}
              onChange={e => setConfirm(e.target.checked)}
              style={{ marginTop: 2, accentColor: '#e53935', flexShrink: 0 }}
            />
            Entiendo que todos mis datos serán eliminados permanentemente
          </label>

          <div style={sty.field}>
            <label style={sty.label}>Confirmá con tu contraseña</label>
            <PasswordInput
              value={password} required
              onChange={e => setPassword(e.target.value)}
              placeholder="Tu contraseña actual"
              inputStyle={{ borderColor: 'rgba(229,57,53,.4)' }}
            />
          </div>

          {error && <div style={sty.error}><i className="fa-solid fa-circle-exclamation" style={{ marginRight: 7 }} />{error}</div>}

          <button
            type="submit"
            disabled={loading || !confirm}
            style={{
              ...sty.btnDanger,
              opacity: (!confirm) ? 0.5 : 1,
              cursor:  (!confirm) ? 'not-allowed' : 'pointer',
            }}
          >
            {loading
              ? <><i className="fa-solid fa-spinner fa-spin" style={{ marginRight: 8 }} />Eliminando…</>
              : <><i className="fa-solid fa-trash" style={{ marginRight: 8 }} />Eliminar mi cuenta</>
            }
          </button>
        </form>
      </Card>
    </Overlay>
  );
}
