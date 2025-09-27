'use client';

import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
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
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status !== 'loading') {
      // Si no hay usuario, redirigir al login
      if (!session) {
        router.push('/login');
        return;
      }

      // Verificar rol requerido
      if (requiredRole && session?.user?.role !== requiredRole) {
        router.push('/unauthorized');
        return;
      }

      // Verificar permiso requerido
      if (requiredPermission) {
        // TODO: Implementar verificación de permisos con NextAuth
        console.log('Verificando permiso:', requiredPermission);
      }
    }
  }, [session, status, router, requiredRole, requiredPermission]);

  // Mostrar loading mientras se verifica la autenticación
  if (status === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <LoadingSpinner size="lg" text="Verificando autenticación..." />
      </div>
    );
  }

  // Si no hay usuario, no mostrar nada (se redirigirá)
  if (!session) {
    return null;
  }

  // Verificar rol
  if (requiredRole && session?.user?.role !== requiredRole) {
    return null;
  }

  return <>{children}</>;
}
