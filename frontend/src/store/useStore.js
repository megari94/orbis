import { create } from 'zustand';
import {
  getConversations, getMessages,
  sendMessage, updateConversation
} from '../services/api';

const useStore = create((set, get) => ({
  conversations:       [],
  activeConversation:  null,
  messages:            [],
  filter:              { status: null, channel: null },
  loading:             false,

  // Cargar lista de conversaciones
  fetchConversations: async () => {
    set({ loading: true });
    try {
      const data = await getConversations(get().filter);
      set({ conversations: data });
    } finally {
      set({ loading: false });
    }
  },

  // Seleccionar conversación y cargar mensajes
  selectConversation: async (conv) => {
    set({ activeConversation: conv, messages: [] });
    const msgs = await getMessages(conv.id);
    set({ messages: msgs });
  },

  // Enviar mensaje
  sendMessage: async (content, isInternal = false) => {
    const conv = get().activeConversation;
    if (!conv) return;
    const msg = await sendMessage(conv.id, content, isInternal);
    set(s => ({ messages: [...s.messages, msg] }));
    // Actualizar preview en lista
    set(s => ({
      conversations: s.conversations.map(c =>
        c.id === conv.id ? { ...c, lastMessage: content, unreadCount: 0 } : c
      ),
    }));
  },

  // Cambiar estado de conversación
  updateStatus: async (status) => {
    const conv = get().activeConversation;
    if (!conv) return;
    const updated = await updateConversation(conv.id, { status });
    set(s => ({
      activeConversation: { ...s.activeConversation, status },
      conversations: s.conversations.map(c => c.id === conv.id ? updated : c),
    }));
  },

  setFilter: (filter) => {
    set(s => ({ filter: { ...s.filter, ...filter } }));
    get().fetchConversations();
  },
}));

export default useStore;