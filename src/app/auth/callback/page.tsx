'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { Card } from '@/components/ui/Card';
import { CheckCircle, AlertCircle, BookOpen } from 'lucide-react';

export default function AuthCallbackPage() {
  const [status, setStatus] = useState<'loading' | 'success' | 'error' | 'redirecting'>('loading');
  const [message, setMessage] = useState('Procesando autenticación...');
  const [redirectUrl, setRedirectUrl] = useState('');
  const router = useRouter();
  const { data: session, status: sessionStatus } = useSession();

  useEffect(() => {
    if (sessionStatus === 'loading') {
      setStatus('loading');
      setMessage('Verificando autenticación...');
      return;
    }

    if (sessionStatus === 'authenticated' && session?.user) {
      setStatus('success');
      setMessage('¡Autenticación exitosa!');

      // Determinar URL de redirección
      const userRole = session.user?.role || 'estudiante';
      let dashboardUrl = '/dashboard/student'; // Por defecto

      switch (userRole) {
        case 'coordinador':
          dashboardUrl = '/admin';
          break;
        case 'docente':
          dashboardUrl = '/dashboard/teacher';
          break;
        case 'estudiante':
        default:
          // Detección por email como fallback para roles no reconocidos
          const email = session.user?.email || '';
          if (email.includes('admin') || email.includes('coordinador')) {
            dashboardUrl = '/admin';
          } else if (email.includes('profesor') || email.includes('teacher') || email.includes('docente')) {
            dashboardUrl = '/dashboard/teacher';
          } else {
            dashboardUrl = '/dashboard/student';
          }
          break;
      }

      setRedirectUrl(dashboardUrl);

      // Mostrar estado de redirección después de un breve delay
      setTimeout(() => {
        setStatus('redirecting');
        setMessage(`Redirigiendo a ${userRole === 'coordinador' ? 'Panel de Administración' : userRole === 'docente' ? 'Dashboard del Docente' : 'Dashboard del Estudiante'}...`);

        // Redirigir después de mostrar el mensaje
        setTimeout(() => {
          router.push(dashboardUrl);
        }, 1500);
      }, 1000);
    } else if (sessionStatus === 'unauthenticated') {
      setStatus('error');
      setMessage('Error: No se pudo autenticar correctamente');
    }
  }, [sessionStatus, session, router]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <Card className="w-full max-w-md p-8 text-center">
        <div className="mb-6">
          {status === 'loading' && (
            <LoadingSpinner size="lg" text="Procesando autenticación..." />
          )}
          {status === 'success' && (
            <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
          )}
          {status === 'redirecting' && (
            <LoadingSpinner size="lg" text="Redirigiendo..." />
          )}
          {status === 'error' && (
            <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          )}
        </div>

        <h2 className="text-2xl font-bold text-gray-900 mb-4">
          {status === 'loading' && 'Procesando...'}
          {status === 'success' && '¡Autenticación Exitosa!'}
          {status === 'redirecting' && 'Redirigiendo...'}
          {status === 'error' && 'Error de Autenticación'}
        </h2>

        <p className="text-gray-600 mb-6">{message}</p>

        {status === 'error' && (
          <div className="space-y-4">
            <p className="text-sm text-gray-500">
              Si el problema persiste, intenta iniciar sesión nuevamente.
            </p>
            <button
              onClick={() => router.push('/login')}
              className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors"
            >
              Volver al Login
            </button>
          </div>
        )}

        {status === 'success' && (
          <div className="flex items-center justify-center text-green-600">
            <BookOpen className="w-5 h-5 mr-2" />
            <span className="text-sm">Preparando tu dashboard...</span>
          </div>
        )}

        {status === 'redirecting' && (
          <div className="flex items-center justify-center text-blue-600">
            <BookOpen className="w-5 h-5 mr-2" />
            <span className="text-sm">Conectando con Google Classroom...</span>
          </div>
        )}
      </Card>
    </div>
  );
}