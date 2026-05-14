import useStore from '../../store/useStore';

const CHANNEL_CLASS = { WHATSAPP: 'av-wa', INSTAGRAM: 'av-ig', MESSENGER: 'av-fb' };
const BADGE_CLASS   = { WHATSAPP: 'ch-wa', INSTAGRAM: 'ch-ig', MESSENGER: 'ch-fb' };
const BADGE_LABEL   = { WHATSAPP: 'WhatsApp', INSTAGRAM: 'Instagram', MESSENGER: 'Messenger' };
const PHONE_BY_CHANNEL = {
  WHATSAPP:  '+54 9 11 5832-7291',
  INSTAGRAM: '@usuario',
  MESSENGER: 'Facebook Messenger',
};

export default function ChatHeader() {
  const { activeConversation } = useStore();
  if (!activeConversation) return null;

  const { name, initials, channel } = activeConversation;

  return (
    <div className="chat-header">
      <div className={`av ${CHANNEL_CLASS[channel] || 'av-mul'}`} style={{ width: 40, height: 40, fontSize: 14 }}>
        {initials}
      </div>
      <div>
        <div className="chat-name">{name}</div>
        <div className="chat-sub">
          <span className={`ch-badge ${BADGE_CLASS[channel] || ''}`} style={{ marginRight: 6 }}>
            {BADGE_LABEL[channel] || channel}
          </span>
          {PHONE_BY_CHANNEL[channel] || ''}
        </div>
      </div>
      <div className="chat-head-right">
        <button className="hbtn" title="Ver perfil"><i className="fa-solid fa-user" /></button>
        <button className="hbtn" title="Buscar"><i className="fa-solid fa-magnifying-glass" /></button>
        <button className="hbtn" title="Transferir"><i className="fa-solid fa-arrow-right-arrow-left" /></button>
        <button className="hbtn" title="Más"><i className="fa-solid fa-ellipsis-vertical" /></button>
      </div>
    </div>
  );
}
