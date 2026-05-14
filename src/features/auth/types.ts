export interface User {
  id?: string;
  name: string;
  email: string;
  username?: string;
  phone?: string;
  avatar?: string;
  bio?: string;
  role: 'admin' | 'host' | 'guest';
  createdAt?: string;
}

export interface AuthContextValue {
  isAuthenticated: boolean;
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<User>;
  signup: (
    name: string,
    email: string,
    password: string,
    phone?: string,
    role?: 'host' | 'guest'
  ) => Promise<void>;
  logout: () => void;
  refreshUser: () => Promise<void>;
}
