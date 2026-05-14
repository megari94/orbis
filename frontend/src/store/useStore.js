import { create } from 'zustand';
import { getConversations, getMessages, sendMessage as apiSendMessage, updateConversation } from '../services/api';

const MOCK_CONVERSATIONS = [
  { id: 1, name: 'Valentina Acosta', initials: 'VA', channel: 'WHATSAPP', status: 'nuevo', time: '10:42', preview: '¿Me hacés un descuento si llevo 3?', unread: 2, priority: true },
  { id: 2, name: 'Lucas Moreno',     initials: 'LM', channel: 'INSTAGRAM', status: 'open',  time: '09:18', preview: 'Cuánto sale el envío a Córdoba?',     unread: 0 },
  { id: 3, name: 'Sofía Ramírez',    initials: 'SR', channel: 'MESSENGER', status: 'done',  time: 'Ayer',  preview: 'Hola! Vi el post de la campera...',   unread: 0 },
  { id: 4, name: 'Mateo González',   initials: 'MG', channel: 'WHATSAPP', status: 'nuevo', time: 'Ayer',  preview: 'Necesito hablar con alguien urgente',  unread: 1 },
  { id: 5, name: 'Paula Nieto',      initials: 'PN', channel: 'INSTAGRAM', status: 'done',  time: 'Lun',   preview: 'Ok perfecto, muchas gracias!',         unread: 0 },
  { id: 6, name: 'Juan Cabrera',     initials: 'JC', channel: 'MESSENGER', status: 'nuevo', time: 'Lun',   preview: 'El producto llegó roto :(',            unread: 0, tag: 'reclamo' },
  { id: 7, name: 'Camila Reyes',     initials: 'CR', channel: 'WHATSAPP', status: 'open',  time: 'Dom',   preview: 'Aceptan Mercado Pago en cuotas?',      unread: 0 },
];

const MOCK_MESSAGES = {
  1: [
    { id: 1,  type: 'day-sep',  text: '11 de mayo · 2026' },
    { id: 2,  dir: 'in',  channel: 'WHATSAPP', text: 'Hola! Vi que tenés remeras de algodón. Qué precio tienen?', time: '10:35', sender: 'VA' },
    { id: 3,  dir: 'out', bot: true,  text: '¡Hola Valentina! Las remeras de algodón están a <strong style="color:#8fd490;">$8.500 ARS</strong> (IVA incluido). Tenemos talles S al XL. ¿Querés que te mande el catálogo completo?', time: '10:35' },
    { id: 4,  dir: 'in',  channel: 'WHATSAPP', text: '¿Me hacés un descuento si llevo 3?', time: '10:42', sender: 'VA' },
    { id: 5,  type: 'internal', text: 'Bot derivó a humano — negociación de precios detectada' },
    { id: 6,  dir: 'out', bot: false, text: '¡Hola Vale! Sí, podemos hacerte un 10% de descuento por 3 unidades o más. Te quedarían a $7.650 c/u. ¿Te mando los talles disponibles?', time: '10:44' },
    { id: 7,  dir: 'in',  channel: 'WHATSAPP', text: 'Buenísimo!! Quiero ver los talles y colores 👀', time: '10:46', sender: 'VA' },
    { id: 8,  dir: 'in',  channel: 'WHATSAPP', text: 'Escribiendo…', time: 'ahora', sender: 'VA', ghost: true },
  ],
  2: [
    { id: 1, type: 'day-sep', text: '14 de mayo · 2026' },
    { id: 2, dir: 'in', channel: 'INSTAGRAM', text: 'Cuánto sale el envío a Córdoba?', time: '09:18', sender: 'LM' },
  ],
  3: [
    { id: 1, type: 'day-sep', text: '13 de mayo · 2026' },
    { id: 2, dir: 'in', channel: 'MESSENGER', text: 'Hola! Vi el post de la campera...', time: '18:30', sender: 'SR' },
  ],
};

const useStore = create((set, get) => ({
  conversations:      MOCK_CONVERSATIONS,
  activeConversation: null,
  messages:           [],
  filter:             { status: null, channel: null },
  loading:            false,

  fetchConversations: async () => {
    set({ loading: true });
    try {
      const data = await getConversations(get().filter);
      set({ conversations: data });
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
      set({ messages: msgs });
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
      await updateConversation(conv.id, { status });
    } catch { /* sin backend — ok */ }
  },

  setFilter: (filter) => {
    set(s => ({ filter: { ...s.filter, ...filter } }));
    get().fetchConversations();
  },
}));

export default useStore;
