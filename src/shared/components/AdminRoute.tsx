import { useEffect } from 'react';
import { Navigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { useAuth } from '../../features/auth/hooks/useAuth';

function Denied() {
  useEffect(() => { toast.error('Admin access only.'); }, []);
  return <Navigate to="/login" replace />;
}

export default function AdminRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, user, loading } = useAuth();
  if (loading) return null;
  if (!isAuthenticated || user?.role !== 'admin') return <Denied />;
  return <>{children}</>;
}
