'use client';

import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredRole?: 'estudiante' | 'docente' | 'coordinador';
  requiredPermission?: string;
}

export function ProtectedRoute({ 
  children, 
  requiredRole, 
  requiredPermission 
}: ProtectedRouteProps) {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading) {
      // Si no hay usuario, redirigir al login
      if (!user) {
        router.push('/auth/login');
        return;
      }

      // Verificar rol requerido
      if (requiredRole && user.user_metadata?.rol !== requiredRole) {
        router.push('/unauthorized');
        return;
      }

      // Verificar permiso requerido
      if (requiredPermission && !user.user_metadata?.permissions?.includes(requiredPermission)) {
        router.push('/unauthorized');
        return;
      }
    }
  }, [user, loading, router, requiredRole, requiredPermission]);

  // Mostrar loading mientras se verifica la autenticación
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <LoadingSpinner size="lg" text="Verificando autenticación..." />
      </div>
    );
  }

  // Si no hay usuario, no mostrar nada (se redirigirá)
  if (!user) {
    return null;
  }

  // Verificar permisos
  if (requiredRole && user.user_metadata?.rol !== requiredRole) {
    return null;
  }

  return <>{children}</>;
}
