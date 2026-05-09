export interface User {
  name: string;
  email: string;
  role: 'admin' | 'host' | 'guest';
}

export interface AuthContextValue {
  isAuthenticated: boolean;
  user: User | null;
  login: (email: string, password: string) => void;
  signup: (name: string, email: string, password: string) => void;
  logout: () => void;
}
