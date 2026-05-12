import axios from 'axios';

const TENANT_ID = import.meta.env.VITE_TENANT_ID || 'tenant-orbis-demo';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:3000/api',
  headers: { 'x-tenant-id': TENANT_ID },
});

export const getConversations = (params) =>
  api.get('/conversations', { params }).then(r => r.data);

export const getConversation = (id) =>
  api.get(`/conversations/${id}`).then(r => r.data);

export const getMessages = (conversationId) =>
  api.get(`/conversations/${conversationId}/messages`).then(r => r.data);

export const sendMessage = (conversationId, content, isInternal = false) =>
  api.post(`/conversations/${conversationId}/messages`, { content, isInternal }).then(r => r.data);

export const updateConversation = (id, data) =>
  api.patch(`/conversations/${id}`, data).then(r => r.data);

export const getContact = (id) =>
  api.get(`/contacts/${id}`).then(r => r.data);