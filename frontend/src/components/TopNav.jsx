const CHANNEL_COLORS = {
  WHATSAPP: { bg: '#0d1a0f', color: '#6a8a6e', border: '#1e3520' },
  INSTAGRAM: { bg: '#1f0d0a', color: '#d4584a', border: '#3a1510' },
  MESSENGER: { bg: '#040f18', color: '#5a90b8', border: '#092030' },
};

export default function TopNav() {
  return (
    <nav style={{
      height: 52, background: '#121212',
      borderBottom: '1px solid #202020',
      display: 'flex', alignItems: 'center',
      padding: '0 20px', gap: 16, flexShrink: 0,
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 9, fontFamily: 'Syne, sans-serif', fontSize: 22, fontWeight: 800, letterSpacing: '.12em', color: '#fff' }}>
        <div style={{ width: 26, height: 26, background: '#9F4346', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12 }}>
          <i className="fa-solid fa-globe" />
        </div>
        ORBIS
      </div>
      <div style={{ display: 'flex', gap: 4, marginLeft: 24 }}>
        {['Bandeja','Contactos','Conocimiento','Admin'].map((label, i) => (
          <button key={label} style={{
            padding: '5px 14px', borderRadius: 4, fontSize: 13,
            color: i === 0 ? '#fff' : '#AAAAAA',
            background: i === 0 ? '#252525' : 'transparent',
            border: 'none', cursor: 'pointer',
            borderBottom: i === 0 ? '2px solid #9F4346' : '2px solid transparent',
          }}>
            {label}
          </button>
        ))}
      </div>
      <div style={{ marginLeft: 'auto', display: 'flex', gap: 10, alignItems: 'center' }}>
        <button style={{ width: 32, height: 32, borderRadius: 6, border: '1px solid #2a2a2a', background: '#1A1A1A', color: '#AAAAAA', cursor: 'pointer', fontSize: 14, position: 'relative' }}>
          <i className="fa-solid fa-bell" />
          <span style={{ position: 'absolute', top: 5, right: 5, width: 5, height: 5, background: '#9F4346', borderRadius: '50%' }} />
        </button>
        <button style={{ width: 32, height: 32, borderRadius: 6, border: '1px solid #2a2a2a', background: '#1A1A1A', color: '#AAAAAA', cursor: 'pointer', fontSize: 14 }}>
          <i className="fa-solid fa-gear" />
        </button>
        <div style={{ width: 32, height: 32, borderRadius: '50%', background: '#01344F', border: '1.5px solid #1a5070', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 700, color: '#fff', cursor: 'pointer', fontFamily: 'Syne, sans-serif' }}>
          AD
        </div>
      </div>
    </nav>
  );
}