import React, { createContext, useContext, useState } from 'react';

const AuthContext = createContext(null);

// Usuários cadastrados no sistema
const USERS = [
  {
    id: 1,
    username: 'professor',
    password: 'prof2024',
    name: 'Prof. Orientador',
    role: 'professor',
    label: 'Professor',
    color: '#1b4332',
    bgColor: 'rgba(27, 67, 50, 0.12)',
    // Módulos bloqueados (nenhum)
    blockedRoutes: [],
  },
  {
    id: 2,
    username: 'bolsista',
    password: 'bols2024',
    name: 'Bolsista',
    role: 'bolsista',
    label: 'Bolsista',
    color: '#d97706',
    bgColor: 'rgba(217, 119, 6, 0.12)',
    // Módulos bloqueados
    blockedRoutes: ['/financeiro'],
  },
];

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);

  const login = (username, password) => {
    const found = USERS.find(
      (u) => u.username === username.trim() && u.password === password.trim()
    );
    if (found) {
      setUser(found);
      return { success: true, user: found };
    }
    return { success: false };
  };

  const logout = () => {
    setUser(null);
  };

  const canAccess = (route) => {
    if (!user) return false;
    return !user.blockedRoutes.includes(route);
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, canAccess }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider');
  return ctx;
}
