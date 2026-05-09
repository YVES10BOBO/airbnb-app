import { useEffect } from 'react';
import { Navigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { useAuth } from '../../features/auth/hooks/useAuth';

interface Props {
  children: React.ReactNode;
}

function RedirectToLogin() {
  useEffect(() => {
    toast.error('Please log in to access this page');
  }, []);
  return <Navigate to="/login" replace />;
}

export default function ProtectedRoute({ children }: Props) {
  const { isAuthenticated } = useAuth();
  if (!isAuthenticated) return <RedirectToLogin />;
  return <>{children}</>;
}
