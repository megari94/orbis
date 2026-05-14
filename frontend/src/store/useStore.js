import { create } from 'zustand';
import { getConversations, getMessages, sendMessage as apiSendMessage, updateConversation } from '../services/api';

// ── Mapeo de valores entre backend y frontend ─────────────────────────────────
const STATUS_FROM_API = { NEW: 'nuevo', OPEN: 'open', PENDING: 'pending', RESOLVED: 'done' };
const STATUS_TO_API   = { nuevo: 'NEW', open: 'OPEN', pending: 'PENDING', done: 'RESOLVED' };

function getInitials(name = '') {
  return name.split(' ').slice(0, 2).map(w => w[0]).join('').toUpperCase();
}

function formatTime(iso) {
  if (!iso) return '';
  const d = new Date(iso);
  const now = new Date();
  const diffDays = Math.floor((now - d) / 86400000);
  if (diffDays === 0) return d.toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit' });
  if (diffDays === 1) return 'Ayer';
  const days = ['Dom','Lun','Mar','Mié','Jue','Vie','Sáb'];
  if (diffDays < 7) return days[d.getDay()];
  return d.toLocaleDateString('es-AR', { day: '2-digit', month: '2-digit' });
}

// Convierte un objeto Conversation de la API al formato del componente
function mapConversation(c) {
  return {
    id:       c.id,
    name:     c.contact?.name ?? 'Contacto',
    initials: getInitials(c.contact?.name),
    channel:  c.channel,
    status:   STATUS_FROM_API[c.status] ?? c.status.toLowerCase(),
    time:     formatTime(c.lastMsgAt),
    preview:  c.lastMessage ?? '',
    unread:   c.unreadCount ?? 0,
    priority: c.priority === 'HIGH',
    tag:      c.tags?.[0] ?? null,
  };
}

// Convierte un Message de la API al formato del componente
function mapMessage(m, idx) {
  if (m.isInternal || m.sender === 'SYSTEM') {
    return { id: m.id ?? idx, type: 'internal', text: m.content };
  }
  return {
    id:      m.id ?? idx,
    dir:     m.sender === 'CONTACT' ? 'in' : 'out',
    bot:     m.isBot === true,
    channel: m.channel,
    text:    m.content,
    time:    m.createdAt
      ? new Date(m.createdAt).toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit' })
      : '',
    sender:  m.sender,
  };
}

// ── Datos mock (fallback sin backend) ─────────────────────────────────────────
const MOCK_CONVERSATIONS = [
  { id: 'conv1', name: 'Valentina Acosta', initials: 'VA', channel: 'WHATSAPP', status: 'nuevo', time: '10:42', preview: '¿Me hacés un descuento si llevo 3?', unread: 2, priority: true, tag: null },
  { id: 'conv2', name: 'Lucas Moreno',     initials: 'LM', channel: 'INSTAGRAM', status: 'open',  time: '09:18', preview: 'Cuánto sale el envío a Córdoba?',     unread: 0, priority: false, tag: null },
  { id: 'conv3', name: 'Sofía Ramírez',    initials: 'SR', channel: 'MESSENGER', status: 'done',  time: 'Ayer',  preview: 'Hola! Vi el post de la campera...',   unread: 0, priority: false, tag: null },
  { id: 'conv4', name: 'Mateo González',   initials: 'MG', channel: 'WHATSAPP', status: 'nuevo', time: 'Ayer',  preview: 'Necesito hablar con alguien urgente',  unread: 1, priority: true,  tag: null },
  { id: 'conv5', name: 'Paula Nieto',      initials: 'PN', channel: 'INSTAGRAM', status: 'done',  time: 'Lun',   preview: 'Ok perfecto, muchas gracias!',         unread: 0, priority: false, tag: null },
  { id: 'conv6', name: 'Juan Cabrera',     initials: 'JC', channel: 'MESSENGER', status: 'nuevo', time: 'Lun',   preview: 'El producto llegó roto :(',            unread: 0, priority: false, tag: 'reclamo' },
  { id: 'conv7', name: 'Camila Reyes',     initials: 'CR', channel: 'WHATSAPP', status: 'open',  time: 'Dom',   preview: 'Aceptan Mercado Pago en cuotas?',      unread: 0, priority: false, tag: null },
];

const MOCK_MESSAGES = {
  conv1: [
    { id: 1, type: 'day-sep',  text: '11 de mayo · 2026' },
    { id: 2, dir: 'in',  channel: 'WHATSAPP', text: 'Hola! Vi que tenés remeras de algodón. Qué precio tienen?', time: '10:35' },
    { id: 3, dir: 'out', bot: true,  text: '¡Hola Valentina! Las remeras de algodón están a <strong style="color:#8fd490;">$8.500 ARS</strong> (IVA incluido). Tenemos talles S al XL. ¿Querés que te mande el catálogo completo?', time: '10:35' },
    { id: 4, dir: 'in',  channel: 'WHATSAPP', text: '¿Me hacés un descuento si llevo 3?', time: '10:42' },
    { id: 5, type: 'internal', text: 'Bot derivó a humano — negociación de precios detectada' },
    { id: 6, dir: 'out', bot: false, text: '¡Hola Vale! Sí, podemos hacerte un 10% de descuento por 3 unidades o más. Te quedarían a $7.650 c/u. ¿Te mando los talles disponibles?', time: '10:44' },
    { id: 7, dir: 'in',  channel: 'WHATSAPP', text: 'Buenísimo!! Quiero ver los talles y colores 👀', time: '10:46' },
    { id: 8, dir: 'in',  channel: 'WHATSAPP', text: 'Escribiendo…', time: 'ahora', ghost: true },
  ],
};

// ── Store ─────────────────────────────────────────────────────────────────────
const useStore = create((set, get) => ({
  conversations:      MOCK_CONVERSATIONS,
  activeConversation: null,
  messages:           [],
  filter:             { status: null, channel: null },
  loading:            false,

  fetchConversations: async () => {
    set({ loading: true });
    try {
      const params = {};
      const f = get().filter;
      if (f.status)  params.status  = STATUS_TO_API[f.status] ?? f.status;
      if (f.channel) params.channel = f.channel;
      const data = await getConversations(params);
      set({ conversations: data.map(mapConversation) });
    } catch {
      set({ conversations: MOCK_CONVERSATIONS });
    } finally {
      set({ loading: false });
    }
  },

  selectConversation: async (conv) => {
    set({ activeConversation: conv, messages: [] });
    try {
      const msgs = await getMessages(conv.id);
      // Insertar separador de fecha si hay mensajes
      const mapped = msgs.map(mapMessage);
      if (mapped.length > 0 && msgs[0]?.createdAt) {
        const d = new Date(msgs[0].createdAt);
        const label = d.toLocaleDateString('es-AR', { day: 'numeric', month: 'long', year: 'numeric' });
        mapped.unshift({ id: 'sep-0', type: 'day-sep', text: label });
      }
      set({ messages: mapped });
    } catch {
      set({ messages: MOCK_MESSAGES[conv.id] || [] });
    }
  },

  sendMessage: async (content) => {
    const conv = get().activeConversation;
    if (!conv) return;
    const now = new Date().toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit' });
    const newMsg = { id: Date.now(), dir: 'out', bot: false, text: content, time: now };
    set(s => ({ messages: [...s.messages, newMsg] }));
    set(s => ({
      conversations: s.conversations.map(c =>
        c.id === conv.id ? { ...c, preview: content, unread: 0 } : c
      ),
    }));
    try {
      await apiSendMessage(conv.id, content, false);
    } catch { /* sin backend — ok */ }
  },

  updateStatus: async (status) => {
    const conv = get().activeConversation;
    if (!conv) return;
    set(s => ({
      activeConversation: { ...s.activeConversation, status },
      conversations: s.conversations.map(c => c.id === conv.id ? { ...c, status } : c),
    }));
    try {
      await updateConversation(conv.id, { status: STATUS_TO_API[status] ?? status });
    } catch { /* sin backend — ok */ }
  },

  setFilter: (filter) => {
    set(s => ({ filter: { ...s.filter, ...filter } }));
    get().fetchConversations();
  },
}));

export default useStore;
