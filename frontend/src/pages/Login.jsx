import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import PasswordInput from '../components/UI/PasswordInput';

export default function Login({ onGoRegister }) {
  const { login } = useAuth();
  const [email,    setEmail]    = useState('');
  const [password, setPassword] = useState('');
  const [error,    setError]    = useState('');
  const [loading,  setLoading]  = useState(false);

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
            <label style={styles.label}>Contraseña</label>
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
  input: {
    background: 'var(--bg3)', border: '1px solid var(--border2)',
    borderRadius: 8, padding: '10px 14px', color: 'var(--cream)',
    fontSize: 14, outline: 'none',
  },
  errorBox: {
    background: 'var(--red-bg)', border: '1px solid var(--red-border)',
    borderRadius: 6, padding: '10px 14px', color: 'var(--red-light)', fontSize: 13,
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
};
