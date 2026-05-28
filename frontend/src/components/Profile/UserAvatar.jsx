const API_BASE = import.meta.env.VITE_API_URL?.replace('/api', '') || 'http://localhost:3000';

/**
 * Muestra la foto de perfil del usuario o sus iniciales si no tiene foto.
 * Props:
 *  - user: { name, avatarUrl }
 *  - size: número en px (default 36)
 *  - className: clase CSS adicional (ej. "avatar-nav")
 *  - style: estilos inline extra
 *  - onClick: handler de click
 */
export default function UserAvatar({ user, size = 36, className = '', style = {}, onClick }) {
  const initials = (user?.name || 'U')
    .split(' ').slice(0, 2).map(w => w[0]).join('').toUpperCase();

  const fontSize = Math.round(size * 0.38);

  const base = {
    width: size, height: size, borderRadius: '50%',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    overflow: 'hidden', flexShrink: 0,
    cursor: onClick ? 'pointer' : 'default',
    ...style,
  };

  if (user?.avatarUrl) {
    const src = user.avatarUrl.startsWith('http')
      ? user.avatarUrl
      : `${API_BASE}${user.avatarUrl}`;

    return (
      <div className={className} style={base} onClick={onClick} title={user?.name}>
        <img
          src={src}
          alt={user?.name}
          style={{ width: '100%', height: '100%', objectFit: 'cover' }}
          onError={e => { e.currentTarget.style.display = 'none'; e.currentTarget.nextSibling.style.display = 'flex'; }}
        />
        {/* Fallback a iniciales si la imagen falla */}
        <span style={{ display: 'none', width: '100%', height: '100%', alignItems: 'center', justifyContent: 'center', fontSize }}>
          {initials}
        </span>
      </div>
    );
  }

  return (
    <div className={className} style={{ ...base, fontSize }} onClick={onClick} title={user?.name}>
      {initials}
    </div>
  );
}
