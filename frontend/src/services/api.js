import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:3000/api',
});

// ── Interceptor de request: adjunta JWT + tenant ──────────────────────────────
api.interceptors.request.use((config) => {
  const token    = localStorage.getItem('orbis_token');
  const tenantId = localStorage.getItem('orbis_tenant')
    || import.meta.env.VITE_TENANT_ID
    || 'tenant-orbis-demo';

  if (token) config.headers['Authorization'] = `Bearer ${token}`;
  config.headers['x-tenant-id'] = tenantId;

  return config;
});

// ── Interceptor de response: si el token expiró, limpiar sesión ───────────────
api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      const isAuthEndpoint = err.config?.url?.includes('/auth/');
      if (!isAuthEndpoint) {
        localStorage.removeItem('orbis_token');
        localStorage.removeItem('orbis_tenant');
        window.location.href = '/';
      }
    }
    return Promise.reject(err);
  },
);

// ── Auth ──────────────────────────────────────────────────────────────────────
export const loginApi    = (body) => api.post('/auth/login',    body).then(r => r.data);
export const registerApi = (body) => api.post('/auth/register', body).then(r => r.data);
export const getMeApi    = ()     => api.get('/auth/me').then(r => r.data);

// ── Conversations ─────────────────────────────────────────────────────────────
export const getConversations   = (params) => api.get('/conversations',          { params }).then(r => r.data);
export const getConversation    = (id)     => api.get(`/conversations/${id}`).then(r => r.data);
export const updateConversation = (id, data) => api.patch(`/conversations/${id}`, data).then(r => r.data);

// ── Messages ──────────────────────────────────────────────────────────────────
export const getMessages = (conversationId) =>
  api.get(`/conversations/${conversationId}/messages`).then(r => r.data);

export const sendMessage = (conversationId, content, isInternal = false) =>
  api.post(`/conversations/${conversationId}/messages`, { content, isInternal }).then(r => r.data);

// ── Contacts ──────────────────────────────────────────────────────────────────
export const getContact = (id) => api.get(`/contacts/${id}`).then(r => r.data);

export default api;
