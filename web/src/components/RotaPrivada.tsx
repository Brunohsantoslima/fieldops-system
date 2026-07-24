import { type ReactNode } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

interface RotaPrivadaProps {
  children: ReactNode;
}

export function RotaPrivada({ children }: RotaPrivadaProps) {
  const auth = useAuth() as any;

  // Verifica se existe sessão ativa via contexto ou localStorage
  const hasToken = auth?.token || auth?.user || auth?.isAuthenticated || localStorage.getItem('token');

  if (!hasToken) {
    return <Navigate to="/login" replace />;
  }

  return children;
}