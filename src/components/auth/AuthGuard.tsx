'use client';

import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { BookOpen, AlertCircle } from 'lucide-react';

interface AuthGuardProps {
  children: React.ReactNode;
  requiredRole?: 'estudiante' | 'docente' | 'coordinador';
  fallbackUrl?: string;
}

export default function AuthGuard({
  children,
  requiredRole,
  fallbackUrl = '/landing'
}: AuthGuardProps) {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [isRedirecting, setIsRedirecting] = useState(false);

  useEffect(() => {
    if (status === 'loading') return;

    if (status === 'unauthenticated') {
      setIsRedirecting(true);
      router.push(fallbackUrl);
      return;
    }

    if (session?.user && requiredRole) {
      const userRole = session.user.role;

      // Verificar si el usuario tiene el rol requerido
      if (userRole !== requiredRole) {
        setIsRedirecting(true);
        // Redirigir según el rol del usuario
        switch (userRole) {
          case 'coordinador':
            router.push('/admin');
            break;
          case 'docente':
            router.push('/dashboard/teacher');
            break;
          case 'estudiante':
          default:
            router.push('/dashboard/student');
            break;
        }
        return;
      }
    }

    setIsRedirecting(false);
  }, [session, status, router, requiredRole, fallbackUrl]);

  // Mostrar loading mientras se verifica la autenticación
  if (status === 'loading' || isRedirecting) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-100 via-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <div className="flex items-center justify-center mb-6">
            <div className="w-16 h-16 bg-blue-600 rounded-2xl flex items-center justify-center shadow-lg">
              <BookOpen className="w-8 h-8 text-white" />
            </div>
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-4">SemiEdu</h1>
          <LoadingSpinner size="lg" text="Verificando autenticación..." />
          <p className="text-gray-500 mt-4 text-sm">
            {isRedirecting ? 'Redirigiendo...' : 'Preparando tu experiencia educativa'}
          </p>
        </div>
      </div>
    );
  }

  // Mostrar error si no está autenticado
  if (status === 'unauthenticated') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-100 via-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <div className="flex items-center justify-center mb-6">
            <div className="w-16 h-16 bg-red-600 rounded-2xl flex items-center justify-center shadow-lg">
              <AlertCircle className="w-8 h-8 text-white" />
            </div>
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Acceso No Autorizado</h1>
          <p className="text-gray-600 mb-6">Necesitas iniciar sesión para acceder a esta página</p>
          <button
            onClick={() => router.push('/login')}
            className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
          >
            Ir al Login
          </button>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
