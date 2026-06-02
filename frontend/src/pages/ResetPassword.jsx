import { useState } from 'react';
import PasswordInput from '../components/UI/PasswordInput';
import api from '../services/api';

export default function ResetPassword({ token, onDone }) {
  const [password,  setPassword]  = useState('');
  const [password2, setPassword2] = useState('');
  const [error,     setError]     = useState('');
  const [success,   setSuccess]   = useState(false);
  const [loading,   setLoading]   = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (password !== password2) return setError('Las contraseñas no coinciden');
    if (password.length < 6)    return setError('La contraseña debe tener al menos 6 caracteres');

    setLoading(true);
    try {
      await api.post('/auth/reset-password', { token, password });
      setSuccess(true);
    } catch (err) {
      const msg = err.response?.data?.message;
      setError(Array.isArray(msg) ? msg.join(', ') : (msg || 'El link es inválido o ya expiró'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.page}>
      <div style={styles.card}>
        <div style={styles.logoRow}>
          <div style={styles.orb}><i className="fa-solid fa-globe" style={{ fontSize: 14 }} /></div>
          <span style={styles.logoText}>ORBIS</span>
        </div>

        {success ? (
          <>
            <div style={styles.successIcon}>
              <i className="fa-solid fa-circle-check" style={{ fontSize: 28, color: '#4ade80' }} />
            </div>
            <h2 style={styles.title}>¡Contraseña actualizada!</h2>
            <p style={styles.sub}>Ya podés iniciar sesión con tu nueva contraseña.</p>
            <button onClick={onDone} style={styles.btn}>
              Ir al login
            </button>
          </>
        ) : (
          <>
            <h2 style={styles.title}>Nueva contraseña</h2>
            <p style={styles.sub}>Elegí una contraseña segura para tu cuenta.</p>

            <form onSubmit={handleSubmit} style={styles.form}>
              <div style={styles.field}>
                <label style={styles.label}>Nueva contraseña</label>
                <PasswordInput
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="Mínimo 6 caracteres"
                  required
                  autoFocus
                />
              </div>
              <div style={styles.field}>
                <label style={styles.label}>Repetir contraseña</label>
                <PasswordInput
                  value={password2}
                  onChange={e => setPassword2(e.target.value)}
                  placeholder="••••••••"
                  required
                />
              </div>

              {error && (
                <div style={styles.errorBox}>
                  <i className="fa-solid fa-circle-exclamation" style={{ marginRight: 7 }} />{error}
                </div>
              )}

              <button type="submit" disabled={loading} style={styles.btn}>
                {loading
                  ? <><i className="fa-solid fa-spinner fa-spin" style={{ marginRight: 8 }} />Guardando…</>
                  : 'Guardar contraseña'}
              </button>
            </form>
          </>
        )}
      </div>
    </div>
  );
}

const styles = {
  page: {
    minHeight: '100vh', background: 'var(--bg0)',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    fontFamily: "'DM Sans', sans-serif", padding: 20,
  },
  card: {
    width: '100%', maxWidth: 420,
    background: 'var(--bg1)', border: '1px solid var(--border)',
    borderRadius: 12, padding: '40px 36px',
  },
  logoRow: {
    display: 'flex', alignItems: 'center', gap: 10, marginBottom: 28, justifyContent: 'center',
  },
  orb: {
    width: 32, height: 32, background: 'var(--red)', borderRadius: '50%',
    display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff',
  },
  logoText: {
    fontFamily: "'Syne', sans-serif", fontSize: 24, fontWeight: 800,
    letterSpacing: '.12em', color: 'var(--cream)',
  },
  successIcon: { textAlign: 'center', marginBottom: 16 },
  title: {
    fontFamily: "'Syne', sans-serif", fontSize: 20, fontWeight: 700,
    color: 'var(--cream)', textAlign: 'center', marginBottom: 6,
  },
  sub: {
    fontSize: 14, color: 'var(--muted)', textAlign: 'center', marginBottom: 28,
  },
  form: { display: 'flex', flexDirection: 'column', gap: 16 },
  field: { display: 'flex', flexDirection: 'column', gap: 6 },
  label: { fontSize: 13, color: 'var(--cream-dim)', fontWeight: 500 },
  errorBox: {
    background: 'var(--red-bg)', border: '1px solid var(--red-border)',
    borderRadius: 6, padding: '10px 14px', color: 'var(--red-light)', fontSize: 13,
  },
  btn: {
    background: 'var(--red)', border: 'none', borderRadius: 8,
    padding: '12px 0', color: '#fff', fontSize: 15, fontWeight: 600,
    cursor: 'pointer', marginTop: 4, fontFamily: "'Syne', sans-serif",
    letterSpacing: '.03em', width: '100%',
  },
};
