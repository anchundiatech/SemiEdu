'use client';

import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { BookOpen } from 'lucide-react';
import LandingPage from './landing/page';

export default function HomePage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (session?.user) {
      const userRole = session.user.role;
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
    }
  }, [session, router]);

  // Mientras se resuelve la sesión, muestra loader
  if (status === 'loading') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-100 via-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <div className="flex items-center justify-center mb-6">
            <div className="w-16 h-16 bg-blue-600 rounded-2xl flex items-center justify-center shadow-lg">
              <BookOpen className="w-8 h-8 text-white" />
            </div>
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-4">SemiEdu</h1>
          <LoadingSpinner size="lg" text="Cargando SemiEdu..." />
          <p className="text-gray-500 mt-4 text-sm">
            Preparando tu experiencia educativa
          </p>
        </div>
      </div>
    );
  }

  // Si hay sesión, se dispara el redirect y mostramos loader breve
  if (session?.user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-100 via-blue-50 to-indigo-100 flex items-center justify-center">
        <LoadingSpinner size="lg" text="Redirigiendo a tu panel..." />
      </div>
    );
  }

  // Sin sesión, mostramos la landing en la raíz para verificación
  return <LandingPage />;
}
