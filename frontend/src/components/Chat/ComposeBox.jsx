import { useState } from 'react';
import useStore from '../../store/useStore';

const QUICK_REPLIES = {
  '/precio':    'Nuestros precios: remeras $8.500 ARS, buzos $14.900 ARS (IVA incluido). ¿Querés más detalles?',
  '/envio':     'Hacemos envíos a todo el país. CABA $1.500 | GBA $2.500 | Interior consultar. Tiempo: 3-5 días hábiles. ¿Cuál es tu código postal?',
  '/mp':        'Aceptamos Mercado Pago con tarjeta, QR o Mercado Crédito. También transferencia bancaria. ¿Cómo preferís pagar?',
  '/horarios':  'Atendemos lunes a viernes 9-18 h, sábados 10-14 h. Cerramos domingos y feriados.',
  '/ubicacion': 'Estamos en Av. Corrientes 1234, CABA. ¿Querés coordinar un turno para venir sin espera?',
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
    <div className="compose">
      <div className="quick-btns">
        {Object.keys(QUICK_REPLIES).map(slash => (
          <button key={slash} className="qbtn" onClick={() => setText(QUICK_REPLIES[slash])}>
            {slash}
          </button>
        ))}
      </div>
      <div className="input-row">
        <button className="attach-btn" title="Adjuntar">
          <i className="fa-solid fa-paperclip" />
        </button>
        <textarea
          className="compose-txt"
          value={text}
          onChange={e => setText(e.target.value)}
          onKeyDown={handleKey}
          rows={2}
          placeholder="Escribí tu respuesta… (usá /atajos para respuestas rápidas)"
        />
        <button className="send-btn" onClick={handleSend} title="Enviar">
          <i className="fa-solid fa-paper-plane" />
        </button>
      </div>
    </div>
  );
}
