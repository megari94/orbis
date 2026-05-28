import { createContext, useContext, useState, useEffect } from 'react';
import { loginApi, registerApi, getMeApi } from '../services/api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser]       = useState(null);
  const [loading, setLoading] = useState(true);

  // Al montar: si hay token guardado, recuperar el usuario
  useEffect(() => {
    const token = localStorage.getItem('orbis_token');
    if (!token) { setLoading(false); return; }

    getMeApi()
      .then(data => setUser(data))
      .catch(() => {
        localStorage.removeItem('orbis_token');
        localStorage.removeItem('orbis_tenant');
      })
      .finally(() => setLoading(false));
  }, []);

  const login = async (email, password) => {
    const data = await loginApi({ email, password });
    localStorage.setItem('orbis_token',  data.accessToken);
    localStorage.setItem('orbis_tenant', data.user.tenantId);
    setUser(data.user);
    return data;
  };

  const register = async (email, password, name, tenantName) => {
    const data = await registerApi({ email, password, name, tenantName });
    localStorage.setItem('orbis_token',  data.accessToken);
    localStorage.setItem('orbis_tenant', data.user.tenantId);
    setUser(data.user);
    return data;
  };

  const logout = () => {
    localStorage.removeItem('orbis_token');
    localStorage.removeItem('orbis_tenant');
    setUser(null);
  };

  // Permite actualizar el user en el contexto desde cualquier componente
  const updateUser = (data) => setUser(prev => ({ ...prev, ...data }));

  return (
    <AuthContext.Provider value={{ user, loading, isAuthenticated: !!user, login, register, logout, setUser: updateUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth debe usarse dentro de <AuthProvider>');
  return ctx;
};
