'use client';

import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { BookOpen } from 'lucide-react';

export default function HomePage() {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading) {
      if (user) {
        // Usuario autenticado, redirigir según rol
        const userRole = user.user_metadata?.rol;
        
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
      } else {
        // Usuario no autenticado, redirigir a login
        router.push('/auth/login');
      }
    }
  }, [user, loading, router]);

  // Mostrar loading mientras se determina la redirección
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-100 via-blue-50 to-indigo-100 flex items-center justify-center">
      <div className="text-center">
        <div className="flex items-center justify-center mb-6">
          <div className="w-16 h-16 bg-blue-600 rounded-2xl flex items-center justify-center shadow-lg">
            <BookOpen className="w-8 h-8 text-white" />
          </div>
        </div>
        <h1 className="text-4xl font-bold text-gray-900 mb-4">SemiEdu</h1>
        <LoadingSpinner size="lg" text="Conectando con Google Classroom..." />
        <p className="text-gray-500 mt-4 text-sm">
          Redirigiendo a tu dashboard personalizado
        </p>
      </div>
    </div>
  );
}
