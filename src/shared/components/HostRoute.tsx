import { useEffect } from 'react';
import { Navigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { useAuth } from '../../features/auth/hooks/useAuth';

function Denied() {
  useEffect(() => {
    toast.error('Host access only.');
  }, []);
  return <Navigate to="/dashboard" replace />;
}

export default function HostRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, user, loading } = useAuth();
  if (loading) return null;
  if (!isAuthenticated || user?.role !== 'host') return <Denied />;
  return <>{children}</>;
}
