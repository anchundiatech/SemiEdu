'use client';

import React from 'react';
import { useSession, signOut } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { LogOut, Users, BookOpen, Clock } from 'lucide-react';

export default function TeacherDashboardPage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  if (status === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Cargando dashboard...</p>
        </div>
      </div>
    );
  }

  if (!session) {
    router.push('/login');
    return null;
  }

  const handleSignOut = async () => {
    await signOut({ callbackUrl: '/login' });
  };

  return (
    <div className="bg-gray-50 min-h-screen p-6">
      <div className="max-w-7xl mx-auto">
        <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
          <div className="flex items-center justify-between">
            <p className="text-sm text-blue-800">
              <strong>Usuario:</strong> {session.user?.email}
            </p>
            <Button
              variant="outline"
              size="sm"
              onClick={handleSignOut}
              className="text-red-600 border-red-200 hover:bg-red-50"
            >
              <LogOut className="w-4 h-4 mr-1" />
              Cerrar Sesión
            </Button>
          </div>
        </div>

        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Dashboard del Docente</h1>
            <p className="text-gray-600 mt-1">Bienvenido, {session.user?.name || session.user?.email}</p>
          </div>
        </div>

        <Card className="p-8 text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            Gestiona tus Cursos y Estudiantes
          </h2>
          <p className="text-gray-600 mb-6">
            Aquí podrás ver tus cursos, estudiantes, y el progreso de las tareas.
          </p>
          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <p className="text-green-800">
              ✅ <strong>¡Autenticación exitosa!</strong> El sistema de login está funcionando correctamente.
            </p>
          </div>
        </Card>

        {/* Aquí irían los componentes para mostrar cursos, estudiantes, etc. */}

      </div>
    </div>
  );
}
