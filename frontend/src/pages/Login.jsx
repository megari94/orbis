import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import PasswordInput from '../components/UI/PasswordInput';
import api from '../services/api';

export default function Login({ onGoRegister }) {
  const { login } = useAuth();
  const [email,    setEmail]    = useState('');
  const [password, setPassword] = useState('');
  const [error,    setError]    = useState('');
  const [loading,  setLoading]  = useState(false);

  // Recuperar contraseña
  const [showForgot,   setShowForgot]   = useState(false);
  const [forgotEmail,  setForgotEmail]  = useState('');
  const [forgotMsg,    setForgotMsg]    = useState('');
  const [forgotError,  setForgotError]  = useState('');
  const [forgotLoading,setForgotLoading]= useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await login(email, password);
    } catch (err) {
      const msg = err.response?.data?.message;
      setError(Array.isArray(msg) ? msg.join(', ') : (msg || 'Error al iniciar sesión'));
    } finally {
      setLoading(false);
    }
  };

  const handleForgot = async (e) => {
    e.preventDefault();
    setForgotError('');
    setForgotMsg('');
    setForgotLoading(true);
    try {
      await api.post('/auth/forgot-password', { email: forgotEmail });
      setForgotMsg('Si el email existe, vas a recibir un link de recuperación en tu casilla.');
    } catch (err) {
      setForgotError('Ocurrió un error. Intentá de nuevo.');
    } finally {
      setForgotLoading(false);
    }
  };

  return (
    <div style={styles.page}>
      <div style={styles.card}>
        {/* Logo */}
        <div style={styles.logoRow}>
          <div style={styles.orb}><i className="fa-solid fa-globe" style={{ fontSize: 14 }} /></div>
          <span style={styles.logoText}>ORBIS</span>
        </div>

        <h2 style={styles.title}>Bienvenido de vuelta</h2>
        <p style={styles.sub}>Iniciá sesión para acceder a tu bandeja</p>

        <form onSubmit={handleSubmit} style={styles.form}>
          <div style={styles.field}>
            <label style={styles.label}>Email</label>
            <input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="tu@email.com"
              required
              style={styles.input}
            />
          </div>

          <div style={styles.field}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <label style={styles.label}>Contraseña</label>
              <button
                type="button"
                onClick={() => { setShowForgot(true); setForgotEmail(email); setForgotMsg(''); setForgotError(''); }}
                style={styles.forgotLink}
              >
                ¿Olvidaste tu contraseña?
              </button>
            </div>
            <PasswordInput
              value={password}
              onChange={e => setPassword(e.target.value)}
              placeholder="••••••••"
              required
            />
          </div>

          {error && <div style={styles.errorBox}><i className="fa-solid fa-circle-exclamation" style={{ marginRight: 7 }} />{error}</div>}

          <button type="submit" disabled={loading} style={styles.btn}>
            {loading ? <><i className="fa-solid fa-spinner fa-spin" style={{ marginRight: 8 }} />Ingresando…</> : 'Ingresar'}
          </button>
        </form>

        <p style={styles.switchText}>
          ¿No tenés cuenta?{' '}
          <button onClick={onGoRegister} style={styles.link}>Registrate</button>
        </p>
      </div>

      {/* Modal recuperar contraseña */}
      {showForgot && (
        <div style={styles.overlay} onClick={() => setShowForgot(false)}>
          <div style={styles.modal} onClick={e => e.stopPropagation()}>
            <button style={styles.closeBtn} onClick={() => setShowForgot(false)}>
              <i className="fa-solid fa-xmark" />
            </button>

            <div style={styles.modalIcon}>
              <i className="fa-solid fa-lock-open" style={{ fontSize: 20, color: 'var(--red)' }} />
            </div>
            <h3 style={styles.modalTitle}>Recuperar contraseña</h3>
            <p style={styles.modalSub}>
              Ingresá tu email y te enviamos un link para crear una nueva contraseña.
            </p>

            {forgotMsg ? (
              <div style={styles.successBox}>
                <i className="fa-solid fa-circle-check" style={{ marginRight: 8 }} />
                {forgotMsg}
              </div>
            ) : (
              <form onSubmit={handleForgot} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                <input
                  type="email"
                  value={forgotEmail}
                  onChange={e => setForgotEmail(e.target.value)}
                  placeholder="tu@email.com"
                  required
                  style={styles.input}
                  autoFocus
                />
                {forgotError && (
                  <div style={styles.errorBox}>
                    <i className="fa-solid fa-circle-exclamation" style={{ marginRight: 7 }} />{forgotError}
                  </div>
                )}
                <button type="submit" disabled={forgotLoading} style={styles.btn}>
                  {forgotLoading
                    ? <><i className="fa-solid fa-spinner fa-spin" style={{ marginRight: 8 }} />Enviando…</>
                    : 'Enviar link de recuperación'}
                </button>
              </form>
            )}
          </div>
        </div>
      )}
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
  forgotLink: {
    background: 'none', border: 'none', color: 'var(--muted)', cursor: 'pointer',
    fontSize: 12, padding: 0, textDecoration: 'underline',
  },
  input: {
    background: 'var(--bg3)', border: '1px solid var(--border2)',
    borderRadius: 8, padding: '10px 14px', color: 'var(--cream)',
    fontSize: 14, outline: 'none', width: '100%', boxSizing: 'border-box',
  },
  errorBox: {
    background: 'var(--red-bg)', border: '1px solid var(--red-border)',
    borderRadius: 6, padding: '10px 14px', color: 'var(--red-light)', fontSize: 13,
  },
  successBox: {
    background: '#0d2b1a', border: '1px solid #1a5c35',
    borderRadius: 6, padding: '12px 16px', color: '#4ade80', fontSize: 13,
    lineHeight: 1.5,
  },
  btn: {
    background: 'var(--red)', border: 'none', borderRadius: 8,
    padding: '12px 0', color: '#fff', fontSize: 15, fontWeight: 600,
    cursor: 'pointer', marginTop: 4, fontFamily: "'Syne', sans-serif",
    letterSpacing: '.03em',
  },
  switchText: { textAlign: 'center', fontSize: 13, color: 'var(--muted)', marginTop: 20 },
  link: {
    background: 'none', border: 'none', color: 'var(--cream)',
    cursor: 'pointer', textDecoration: 'underline', fontSize: 13, padding: 0,
  },
  // Modal
  overlay: {
    position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    zIndex: 1000, padding: 20,
  },
  modal: {
    background: 'var(--bg1)', border: '1px solid var(--border)',
    borderRadius: 14, padding: '36px 32px', width: '100%', maxWidth: 400,
    position: 'relative',
  },
  closeBtn: {
    position: 'absolute', top: 14, right: 14,
    background: 'none', border: 'none', color: 'var(--muted)',
    cursor: 'pointer', fontSize: 16, padding: 4,
  },
  modalIcon: {
    width: 48, height: 48, background: 'var(--bg3)', borderRadius: '50%',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    margin: '0 auto 16px',
  },
  modalTitle: {
    fontFamily: "'Syne', sans-serif", fontSize: 18, fontWeight: 700,
    color: 'var(--cream)', textAlign: 'center', margin: '0 0 8px',
  },
  modalSub: {
    fontSize: 13, color: 'var(--muted)', textAlign: 'center', marginBottom: 20, lineHeight: 1.5,
  },
};
