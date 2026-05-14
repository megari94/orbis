import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import useStore from '../store/useStore';

const NAV_ITEMS = ['Bandeja', 'Contactos', 'Conocimiento', 'Admin'];

function getInitials(name = '') {
  return name.split(' ').slice(0, 2).map(w => w[0]).join('').toUpperCase() || 'U';
}

export default function TopNav() {
  const [active,      setActive]      = useState('Bandeja');
  const [showMenu,    setShowMenu]    = useState(false);
  const { user, logout }              = useAuth();
  const resetStore                    = useStore(s => s.reset);

  const handleLogout = () => {
    resetStore();
    logout();
  };

  const initials = getInitials(user?.name);

  return (
    <nav className="topnav">
      <div className="logo">
        <div className="logo-orb">
          <i className="fa-solid fa-globe" style={{ fontSize: 12 }} />
        </div>
        ORBIS
      </div>

      <div className="nav-pills">
        {NAV_ITEMS.map(item => (
          <button
            key={item}
            className={`nav-pill${active === item ? ' active' : ''}`}
            onClick={() => setActive(item)}
          >
            {item}
          </button>
        ))}
      </div>

      <div className="nav-right">
        <button className="nav-icon-btn" aria-label="Notificaciones">
          <i className="fa-solid fa-bell" />
          <span className="notif-dot" />
        </button>
        <button className="nav-icon-btn" aria-label="Configuración">
          <i className="fa-solid fa-gear" />
        </button>

        {/* Avatar con dropdown de logout */}
        <div style={{ position: 'relative' }}>
          <div
            className="avatar-nav"
            title={user?.name || 'Usuario'}
            onClick={() => setShowMenu(m => !m)}
          >
            {initials}
          </div>
          {showMenu && (
            <div style={{
              position: 'absolute', top: 40, right: 0, zIndex: 100,
              background: 'var(--bg2)', border: '1px solid var(--border2)',
              borderRadius: 8, minWidth: 180, boxShadow: '0 8px 24px rgba(0,0,0,.4)',
            }}>
              <div style={{ padding: '12px 14px', borderBottom: '1px solid var(--border)' }}>
                <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--cream)' }}>{user?.name}</div>
                <div style={{ fontSize: 12, color: 'var(--dim)', marginTop: 2 }}>{user?.email}</div>
              </div>
              <button
                onClick={handleLogout}
                style={{
                  width: '100%', padding: '11px 14px', background: 'none',
                  border: 'none', color: 'var(--red-light)', fontSize: 13,
                  cursor: 'pointer', textAlign: 'left', display: 'flex',
                  alignItems: 'center', gap: 8,
                }}
              >
                <i className="fa-solid fa-right-from-bracket" />
                Cerrar sesión
              </button>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
}
