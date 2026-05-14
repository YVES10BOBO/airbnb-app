import { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
import axios from 'axios';
import type { AuthContextValue, User } from '../types';
import { authService, TOKEN_KEY } from '../../../api';

const AuthContext = createContext<AuthContextValue | null>(null);

function apiRoleToLocal(role: string): User['role'] {
  if (role === 'ADMIN') return 'admin';
  if (role === 'HOST')  return 'host';
  return 'guest';
}

function mapApiUser(apiUser: import('../../../api/types').ApiUser): User {
  return {
    id: apiUser.id,
    name: apiUser.name,
    email: apiUser.email,
    username: apiUser.username,
    phone: apiUser.phone,
    avatar: apiUser.avatar,
    bio: apiUser.bio,
    role: apiRoleToLocal(apiUser.role),
    createdAt: apiUser.createdAt,
  };
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser]       = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  // Restore session on mount
  useEffect(() => {
    let mounted = true;
    const token = localStorage.getItem(TOKEN_KEY);
    if (!token) { setLoading(false); return; }

    authService.me()
      .then((apiUser) => {
        if (mounted) setUser(mapApiUser(apiUser));
      })
      .catch(() => {
        if (mounted) localStorage.removeItem(TOKEN_KEY);
      })
      .finally(() => { if (mounted) setLoading(false); });

    return () => { mounted = false; };
  }, []);

  async function login(email: string, password: string): Promise<User> {
    try {
      const { user: apiUser } = await authService.login(email, password);
      const mapped = mapApiUser(apiUser);
      setUser(mapped);
      return mapped;
    } catch (err) {
      if (axios.isAxiosError(err)) {
        const apiError = err.response?.data?.error;
        if (typeof apiError === 'string') throw new Error(apiError);
        if (!err.response) throw new Error('Cannot reach server. Please try again.');
      }
      throw new Error('Invalid email or password.');
    }
  }

  async function signup(
    name: string,
    email: string,
    password: string,
    phone?: string,
    role: 'host' | 'guest' = 'guest',
  ) {
    const { user: apiUser } = await authService.register(
      name,
      email,
      password,
      phone,
      undefined,
      role === 'host' ? 'HOST' : 'GUEST',
    );
    setUser(mapApiUser(apiUser));
  }

  async function refreshUser(): Promise<void> {
    const token = localStorage.getItem(TOKEN_KEY);
    if (!token) return;
    const apiUser = await authService.me();
    setUser(mapApiUser(apiUser));
  }

  function logout() {
    localStorage.removeItem(TOKEN_KEY);
    setUser(null);
  }

  return (
    <AuthContext.Provider value={{ isAuthenticated: user !== null, user, loading, login, signup, logout, refreshUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuthContext(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuthContext must be used within AuthProvider');
  return ctx;
}
