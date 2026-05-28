import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import PasswordInput from '../components/UI/PasswordInput';

export default function Register({ onGoLogin }) {
  const { register } = useAuth();
  const [form,    setForm]    = useState({ name: '', email: '', password: '', tenantName: '' });
  const [error,   setError]   = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (k) => (e) => setForm(f => ({ ...f, [k]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (form.password.length < 6) { setError('La contraseña debe tener al menos 6 caracteres'); return; }
    setLoading(true);
    try {
      await register(form.email, form.password, form.name, form.tenantName);
    } catch (err) {
      const msg = err.response?.data?.message;
      setError(Array.isArray(msg) ? msg.join(', ') : (msg || 'Error al registrarse'));
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

        <h2 style={styles.title}>Crear cuenta</h2>
        <p style={styles.sub}>Registrá tu negocio y empezá a usar ORBIS</p>

        <form onSubmit={handleSubmit} style={styles.form}>
          <div style={styles.row}>
            <div style={styles.field}>
              <label style={styles.label}>Tu nombre</label>
              <input type="text" value={form.name} onChange={handleChange('name')} placeholder="Ana García" required style={styles.input} />
            </div>
            <div style={styles.field}>
              <label style={styles.label}>Nombre del negocio</label>
              <input type="text" value={form.tenantName} onChange={handleChange('tenantName')} placeholder="Mi Tienda" required style={styles.input} />
            </div>
          </div>

          <div style={styles.field}>
            <label style={styles.label}>Email</label>
            <input type="email" value={form.email} onChange={handleChange('email')} placeholder="tu@negocio.com" required style={styles.input} />
          </div>

          <div style={styles.field}>
            <label style={styles.label}>Contraseña</label>
            <PasswordInput
              value={form.password}
              onChange={handleChange('password')}
              placeholder="Mínimo 6 caracteres"
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
              ? <><i className="fa-solid fa-spinner fa-spin" style={{ marginRight: 8 }} />Creando cuenta…</>
              : 'Crear cuenta'}
          </button>
        </form>

        <p style={styles.switchText}>
          ¿Ya tenés cuenta?{' '}
          <button onClick={onGoLogin} style={styles.link}>Iniciá sesión</button>
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
    width: '100%', maxWidth: 480,
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
  sub: { fontSize: 14, color: 'var(--muted)', textAlign: 'center', marginBottom: 28 },
  form: { display: 'flex', flexDirection: 'column', gap: 16 },
  row:  { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 },
  field: { display: 'flex', flexDirection: 'column', gap: 6 },
  label: { fontSize: 13, color: 'var(--cream-dim)', fontWeight: 500 },
  input: {
    background: 'var(--bg3)', border: '1px solid var(--border2)',
    borderRadius: 8, padding: '10px 14px', color: 'var(--cream)',
    fontSize: 14, outline: 'none', width: '100%', boxSizing: 'border-box',
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
