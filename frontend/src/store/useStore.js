import { create } from 'zustand';
import { getConversations, getConversation, getMessages, sendMessage as apiSendMessage, updateConversation } from '../services/api';

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
    contact:  c.contact ?? null,
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

// ── Store ─────────────────────────────────────────────────────────────────────
const useStore = create((set, get) => ({
  conversations:      [],
  activeConversation: null,
  messages:           [],
  filter:             { status: null, channel: null },
  loading:            false,
  loadingMessages:    false,

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
      set({ conversations: [] });
    } finally {
      set({ loading: false });
    }
  },

  selectConversation: async (conv) => {
    set({ activeConversation: conv, messages: [], loadingMessages: true });
    // Obtener conversación completa con contact.channels
    try {
      const full = await getConversation(conv.id);
      set({ activeConversation: mapConversation(full) });
    } catch { /* mantener conv minimal */ }
    // Obtener mensajes
    try {
      const msgs = await getMessages(conv.id);
      const mapped = msgs.map(mapMessage);
      if (mapped.length > 0 && msgs[0]?.createdAt) {
        const d = new Date(msgs[0].createdAt);
        const label = d.toLocaleDateString('es-AR', { day: 'numeric', month: 'long', year: 'numeric' });
        mapped.unshift({ id: 'sep-0', type: 'day-sep', text: label });
      }
      set({ messages: mapped });
    } catch {
      set({ messages: [] });
    } finally {
      set({ loadingMessages: false });
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

  reset: () => set({
    conversations:      [],
    activeConversation: null,
    messages:           [],
    filter:             { status: null, channel: null },
    loading:            false,
    loadingMessages:    false,
  }),
}));

export default useStore;
