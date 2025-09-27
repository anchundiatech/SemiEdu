'use client';

import React, { useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';

export default function DashboardPage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  // Redirección automática basada en rol
  useEffect(() => {
    if (status === 'loading') return;

    if (!session) {
      router.push('/login');
      return;
    }

    if (session.user) {
      const email = session.user.email || '';
      console.log('🎯 Dashboard principal - Email:', email);

      // Detectar rol basado en email
      let userRole = 'estudiante'; // Por defecto

      if (email.includes('admin') || email.includes('coordinador') || email.includes('director')) {
        userRole = 'coordinador';
      } else if (email.includes('profesor') || email.includes('teacher') || email.includes('docente')) {
        userRole = 'docente';
      }

      console.log('🎯 Dashboard principal - Rol detectado:', userRole);

      // Redirigir según el rol
      switch (userRole) {
        case 'coordinador':
          console.log('🎯 Dashboard principal - Redirigiendo coordinador a /admin');
          router.push('/admin');
          break;
        case 'docente':
          console.log('🎯 Dashboard principal - Redirigiendo docente a /dashboard/teacher');
          router.push('/dashboard/teacher');
          break;
        case 'estudiante':
          console.log('🎯 Dashboard principal - Redirigiendo estudiante a /dashboard/student');
          router.push('/dashboard/student');
          break;
      }
    }
  }, [session, status, router]);

  // Mostrar loading mientras se determina la redirección
  if (status === 'loading' || session) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Redirigiendo al dashboard apropiado...</p>
        </div>
      </div>
    );
  }

  return null;
}
