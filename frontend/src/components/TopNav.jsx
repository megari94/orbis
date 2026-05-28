import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import useStore from '../store/useStore';
import SettingsModal from './Settings/SettingsModal';
import { EditProfileModal, ChangePasswordModal, DeleteAccountModal } from './Profile/ProfileModals';
import UserAvatar from './Profile/UserAvatar';

const NAV_ITEMS = ['Bandeja', 'Contactos', 'Conocimiento', 'Admin'];

export default function TopNav() {
  const [active,       setActive]       = useState('Bandeja');
  const [showMenu,     setShowMenu]     = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [modal,        setModal]        = useState(null); // 'profile' | 'password' | 'delete'

  const { user, logout, setUser } = useAuth();
  const resetStore                = useStore(s => s.reset);

  const openModal = (name) => { setModal(name); setShowMenu(false); };
  const closeModal = () => setModal(null);

  const handleLogout = () => { resetStore(); logout(); };

  const handleAccountDeleted = () => {
    resetStore();
    logout();
  };

  const menuItems = [
    { icon: 'fa-solid fa-user-pen',           label: 'Editar perfil',        action: () => openModal('profile')  },
    { icon: 'fa-solid fa-lock',               label: 'Cambiar contraseña',   action: () => openModal('password') },
    { icon: 'fa-solid fa-trash',              label: 'Eliminar cuenta',      action: () => openModal('delete'),  danger: true },
  ];

  return (
    <>
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

          <button
            className={`nav-icon-btn${showSettings ? ' active' : ''}`}
            aria-label="Configuración de canales"
            onClick={() => { setShowSettings(s => !s); setShowMenu(false); }}
            style={showSettings ? { color: 'var(--cream)', background: 'var(--bg3)' } : {}}
          >
            <i className="fa-solid fa-gear" />
          </button>

          {/* Avatar + dropdown de usuario */}
          <div style={{ position: 'relative' }}>
            <UserAvatar
              user={user}
              size={34}
              className="avatar-nav"
              onClick={() => { setShowMenu(m => !m); setShowSettings(false); }}
            />

            {showMenu && (
              <div style={{
                position: 'absolute', top: 44, right: 0, zIndex: 200,
                background: 'var(--bg2)', border: '1px solid var(--border2)',
                borderRadius: 10, minWidth: 210,
                boxShadow: '0 10px 30px rgba(0,0,0,.5)',
                overflow: 'hidden',
              }}>
                {/* Info usuario */}
                <div style={{ padding: '13px 15px', borderBottom: '1px solid var(--border)' }}>
                  <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--cream)' }}>{user?.name}</div>
                  <div style={{ fontSize: 12, color: 'var(--dim)', marginTop: 2 }}>{user?.email}</div>
                </div>

                {/* Opciones */}
                {menuItems.map((item, i) => (
                  <button
                    key={i}
                    onClick={item.action}
                    style={{
                      width: '100%', padding: '11px 15px',
                      background: 'none', border: 'none',
                      color: item.danger ? 'var(--red-light)' : 'var(--cream-dim)',
                      fontSize: 13, cursor: 'pointer',
                      textAlign: 'left', display: 'flex', alignItems: 'center', gap: 10,
                      borderTop: item.danger ? '1px solid var(--border)' : 'none',
                      transition: 'background .15s',
                    }}
                    onMouseEnter={e => e.currentTarget.style.background = 'var(--bg3)'}
                    onMouseLeave={e => e.currentTarget.style.background = 'none'}
                  >
                    <i className={item.icon} style={{ width: 14, textAlign: 'center' }} />
                    {item.label}
                  </button>
                ))}

                {/* Separador + Cerrar sesión */}
                <div style={{ borderTop: '1px solid var(--border)' }}>
                  <button
                    onClick={handleLogout}
                    style={{
                      width: '100%', padding: '11px 15px',
                      background: 'none', border: 'none',
                      color: 'var(--dim)', fontSize: 13,
                      cursor: 'pointer', textAlign: 'left',
                      display: 'flex', alignItems: 'center', gap: 10,
                      transition: 'background .15s',
                    }}
                    onMouseEnter={e => e.currentTarget.style.background = 'var(--bg3)'}
                    onMouseLeave={e => e.currentTarget.style.background = 'none'}
                  >
                    <i className="fa-solid fa-right-from-bracket" style={{ width: 14, textAlign: 'center' }} />
                    Cerrar sesión
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </nav>

      {/* Modal de configuración de canales */}
      {showSettings && <SettingsModal onClose={() => setShowSettings(false)} />}

      {/* Modales de perfil */}
      {modal === 'profile'  && (
        <EditProfileModal
          user={user}
          onClose={closeModal}
          onUpdated={(updated) => { setUser(updated); closeModal(); }}
        />
      )}
      {modal === 'password' && <ChangePasswordModal onClose={closeModal} />}
      {modal === 'delete'   && (
        <DeleteAccountModal onClose={closeModal} onDeleted={handleAccountDeleted} />
      )}
    </>
  );
}
