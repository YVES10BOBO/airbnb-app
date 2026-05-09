import { createContext, useContext, useState, type ReactNode } from 'react';
import type { AuthContextValue, User } from '../types';

const AuthContext = createContext<AuthContextValue | null>(null);

// Simulate roles until backend API is connected.
// admin@liston.com  → admin
// alice@example.com / clara@example.com → host
// anything else     → guest
function resolveRole(email: string): User['role'] {
  if (email === 'admin@liston.com') return 'admin';
  if (['alice@example.com', 'clara@example.com'].includes(email)) return 'host';
  return 'guest';
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);

  function login(email: string, _password: string) {
    setUser({ name: email === 'admin@liston.com' ? 'Admin Liston' : 'John Doe', email, role: resolveRole(email) });
  }

  function signup(name: string, email: string, _password: string) {
    setUser({ name, email, role: 'guest' });
  }

  function logout() {
    setUser(null);
  }

  return (
    <AuthContext.Provider value={{ isAuthenticated: user !== null, user, login, signup, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuthContext(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuthContext must be used within AuthProvider');
  return ctx;
}
