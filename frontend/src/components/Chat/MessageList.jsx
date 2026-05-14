import { useEffect, useRef } from 'react';
import useStore from '../../store/useStore';

const BADGE_CLASS = { WHATSAPP: 'ch-wa', INSTAGRAM: 'ch-ig', MESSENGER: 'ch-fb' };
const BADGE_SHORT = { WHATSAPP: 'WA', INSTAGRAM: 'IG', MESSENGER: 'FB' };
const AV_CLASS    = { WHATSAPP: 'av-wa', INSTAGRAM: 'av-ig', MESSENGER: 'av-fb' };

function DaySep({ text }) {
  return <div className="day-sep">{text}</div>;
}

function InternalNote({ text }) {
  return (
    <div className="internal-note">
      <i className="fa-solid fa-robot" style={{ marginRight: 6 }} />
      {text}
    </div>
  );
}

function MessageRow({ msg, conv }) {
  const isIn  = msg.dir === 'in';
  const isBot = msg.dir === 'out' && msg.bot;

  const botAvatar = (
    <div
      className="msg-av"
      style={{ background: 'var(--green-bg)', border: '1px solid var(--green-border)', width: 30, height: 30 }}
    >
      <i className="fa-solid fa-robot" style={{ fontSize: 12, color: 'var(--green-light)' }} />
    </div>
  );

  const agentAvatar = (
    <div
      className="av av-mul msg-av"
      style={{ width: 30, height: 30, fontSize: 11, border: '1px solid var(--border2)' }}
    >
      AD
    </div>
  );

  const inAvatar = (
    <div className={`av ${AV_CLASS[conv?.channel] || 'av-mul'} msg-av`} style={{ width: 30, height: 30, fontSize: 12 }}>
      {conv?.initials || '?'}
    </div>
  );

  return (
    <div className={`msg-row ${msg.dir}`} style={msg.ghost ? { opacity: .35 } : {}}>
      {isIn  && inAvatar}
      {isBot && botAvatar}
      {!isIn && !isBot && agentAvatar}

      <div className="msg-group">
        <div
          className={`bubble${isBot ? ' bubble-bot' : ''}${msg.ghost ? ' ghost-bubble' : ''}`}
          dangerouslySetInnerHTML={{ __html: msg.text }}
        />
        <div className="msg-meta">
          {isIn && msg.channel && (
            <span className={`ch-micro ${BADGE_CLASS[msg.channel] || ''}`}>
              {BADGE_SHORT[msg.channel] || ''}
            </span>
          )}
          {isBot && (
            <span className="bot-chip">
              <i className="fa-solid fa-robot" style={{ fontSize: 9, marginRight: 3 }} />
              bot
            </span>
          )}
          {msg.time}
          {msg.dir === 'out' && !msg.ghost && ' ✓✓'}
        </div>
      </div>
    </div>
  );
}

export default function MessageList() {
  const { messages, activeConversation } = useStore();
  const bottomRef = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  return (
    <div className="messages">
      {messages.map(msg => {
        if (msg.type === 'day-sep')  return <DaySep key={msg.id} text={msg.text} />;
        if (msg.type === 'internal') return <InternalNote key={msg.id} text={msg.text} />;
        return <MessageRow key={msg.id} msg={msg} conv={activeConversation} />;
      })}
      <div ref={bottomRef} />
    </div>
  );
}
