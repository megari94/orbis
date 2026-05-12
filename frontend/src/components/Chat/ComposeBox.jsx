import { useState } from 'react';
import useStore from '../../store/useStore';

const QUICK_REPLIES = {
  '/precio':    'Nuestros precios: remeras $8.500 ARS, buzos $14.900 ARS (IVA incluido).',
  '/envio':     'Enviamos a todo el país. CABA $1.500 | GBA $2.500 | Interior a consultar.',
  '/mp':        'Aceptamos Mercado Pago con tarjeta, QR o Mercado Crédito.',
  '/horarios':  'Atendemos lunes a viernes 9-18 h, sábados 10-14 h.',
  '/ubicacion': 'Av. Corrientes 1234, CABA. ¿Querés coordinar un turno?',
};

export default function ComposeBox() {
  const [text, setText] = useState('');
  const { sendMessage } = useStore();

  const handleSend = async () => {
    const t = text.trim();
    if (!t) return;
    setText('');
    await sendMessage(t);
  };

  const handleKey = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend(); }
  };

  return (
    <div style={{ borderTop: '1px solid #202020', padding: '12px 14px', background: '#121212', flexShrink: 0 }}>
      <div style={{ display: 'flex', gap: 6, marginBottom: 9, flexWrap: 'wrap' }}>
        {Object.keys(QUICK_REPLIES).map(slash => (
          <button key={slash}
            onClick={() => setText(QUICK_REPLIES[slash])}
            style={{ fontSize: 12, padding: '4px 11px', borderRadius: 4, border: '1px solid #2a2a2a', background: '#1e1e1e', color: '#AAAAAA', cursor: 'pointer' }}>
            {slash}
          </button>
        ))}
      </div>
      <div style={{ display: 'flex', gap: 8, alignItems: 'flex-end' }}>
        <button style={{ width: 38, height: 38, border: '1px solid #2a2a2a', background: '#1e1e1e', borderRadius: 6, color: '#AAAAAA', cursor: 'pointer', fontSize: 14, flexShrink: 0 }}>
          <i className="fa-solid fa-paperclip" />
        </button>
        <textarea
          value={text}
          onChange={e => setText(e.target.value)}
          onKeyDown={handleKey}
          rows={2}
          placeholder="Escribí tu respuesta… (usá /atajos)"
          style={{ flex: 1, background: '#1e1e1e', border: '1px solid #2a2a2a', borderRadius: 8, padding: '10px 14px', color: '#fff', fontSize: 14, lineHeight: 1.45, outline: 'none', resize: 'none' }}
        />
        <button onClick={handleSend}
          style={{ width: 38, height: 38, background: '#9F4346', border: 'none', borderRadius: 6, color: '#fff', fontSize: 15, cursor: 'pointer', flexShrink: 0 }}>
          <i className="fa-solid fa-paper-plane" />
        </button>
      </div>
    </div>
  );
}