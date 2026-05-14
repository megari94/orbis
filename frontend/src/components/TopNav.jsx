import { useState } from 'react';

const NAV_ITEMS = ['Bandeja', 'Contactos', 'Conocimiento', 'Admin'];

export default function TopNav() {
  const [active, setActive] = useState('Bandeja');

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
        <div className="avatar-nav" title="Admin">AD</div>
      </div>
    </nav>
  );
}
