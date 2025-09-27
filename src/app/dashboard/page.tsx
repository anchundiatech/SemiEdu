'use client';

import React, { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useNotifications } from '@/contexts/NotificationContext';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import {
  BookOpen,
  Users,
  Calendar,
  TrendingUp,
  Bell,
  Clock,
  CheckCircle,
  AlertCircle,
  BarChart3,
  GraduationCap,
  FileText,
  Settings
} from 'lucide-react';

export default function DashboardPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const { showSuccess, showInfo } = useNotifications();
  const [isRedirecting, setIsRedirecting] = useState(false);

  // Mostrar notificación de bienvenida
  useEffect(() => {
    if (session?.user && !isRedirecting) {
      showSuccess(
        '¡Bienvenido!',
        `Hola ${session.user.name || session.user.email}, has iniciado sesión correctamente.`
      );
    }
  }, [session, showSuccess, isRedirecting]);

  // Redirección automática basada en rol
  useEffect(() => {
    if (status === 'loading') return;

    if (!session) {
      router.push('/login');
      return;
    }

    if (session.user && !isRedirecting) {
      const email = session.user.email || '';
      let userRole = 'estudiante'; // Por defecto

      if (email.includes('admin') || email.includes('coordinador') || email.includes('director')) {
        userRole = 'coordinador';
      } else if (email.includes('profesor') || email.includes('teacher') || email.includes('docente')) {
        userRole = 'docente';
      }

      // Mostrar información antes de redirigir
      showInfo(
        'Redirigiendo...',
        `Te estamos llevando a tu dashboard de ${userRole === 'coordinador' ? 'administrador' : userRole === 'docente' ? 'profesor' : 'estudiante'}.`
      );

      setIsRedirecting(true);

      // Redirigir después de un breve delay
      setTimeout(() => {
        switch (userRole) {
          case 'coordinador':
            router.push('/admin');
            break;
          case 'docente':
            router.push('/dashboard/teacher');
            break;
          case 'estudiante':
            router.push('/dashboard/student');
            break;
        }
      }, 2000);
    }
  }, [session, status, router, isRedirecting, showInfo]);

  // Mostrar loading mientras se determina la redirección
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
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Cargando dashboard...</p>
        </div>
      </div>
    );
  }

  if (!session) {
    return null;
  }

  // Si está redirigiendo, mostrar solo el mensaje de redirección centrado
  if (isRedirecting) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-100 via-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center max-w-md mx-auto px-6">
          <div className="flex items-center justify-center mb-8">
            <div className="w-20 h-20 bg-blue-600 rounded-3xl flex items-center justify-center shadow-xl">
              <BookOpen className="w-10 h-10 text-white" />
            </div>
          </div>

          <h1 className="text-4xl font-bold text-gray-900 mb-2">SemiEdu</h1>
          <p className="text-gray-600 mb-8">Tu plataforma educativa inteligente</p>

          {/* Spinner principal */}
          <div className="mb-8">
            <div className="relative">
              <div className="w-16 h-16 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mx-auto"></div>
              <div className="absolute inset-0 flex items-center justify-center">
                <Clock className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </div>

          {/* Mensaje de redirección */}
          <div className="bg-blue-50 border border-blue-200 rounded-xl p-6">
            <div className="flex items-center justify-center mb-4">
              <Clock className="h-8 w-8 text-blue-600" />
            </div>
            <h3 className="text-lg font-semibold text-blue-800 mb-2">
              Redirigiendo a tu dashboard personalizado...
            </h3>
            <p className="text-blue-700 text-sm">
              Te estamos llevando a la vista específica para tu rol en unos segundos.
            </p>
          </div>

          {/* Barra de progreso */}
          <div className="mt-8">
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div className="bg-blue-600 h-2 rounded-full animate-pulse" style={{ width: '75%' }}></div>
            </div>
            <p className="text-xs text-gray-500 mt-2">Preparando tu experiencia...</p>
          </div>
        </div>
      </div>
    );
  }

  // Dashboard temporal mientras se redirige (solo si no está redirigiendo)
  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">
            ¡Bienvenido a SemiEdu!
          </h1>
          <p className="mt-2 text-gray-600">
            Tu plataforma educativa inteligente conectada con Google Classroom
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card className="p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <BookOpen className="h-8 w-8 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Clases Activas</p>
                <p className="text-2xl font-semibold text-gray-900">12</p>
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <Users className="h-8 w-8 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Estudiantes</p>
                <p className="text-2xl font-semibold text-gray-900">248</p>
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <Calendar className="h-8 w-8 text-purple-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Eventos Hoy</p>
                <p className="text-2xl font-semibold text-gray-900">5</p>
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <TrendingUp className="h-8 w-8 text-orange-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Progreso</p>
                <p className="text-2xl font-semibold text-gray-900">87%</p>
              </div>
            </div>
          </Card>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          <Card className="p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Acciones Rápidas</h3>
            <div className="space-y-3">
              <Button
                className="w-full justify-start"
                onClick={() => router.push('/classes')}
              >
                <BookOpen className="h-4 w-4 mr-2" />
                Ver Mis Clases
              </Button>
              <Button
                variant="outline"
                className="w-full justify-start"
                onClick={() => router.push('/calendar')}
              >
                <Calendar className="h-4 w-4 mr-2" />
                Ver Calendario
              </Button>
              <Button
                variant="outline"
                className="w-full justify-start"
                onClick={() => router.push('/notifications')}
              >
                <Bell className="h-4 w-4 mr-2" />
                Notificaciones
              </Button>
            </div>
          </Card>

          <Card className="p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Actividad Reciente</h3>
            <div className="space-y-3">
              <div className="flex items-center text-sm">
                <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                <span className="text-gray-600">Tarea de Matemáticas completada</span>
                <span className="ml-auto text-gray-400">Hace 2 horas</span>
              </div>
              <div className="flex items-center text-sm">
                <AlertCircle className="h-4 w-4 text-yellow-500 mr-2" />
                <span className="text-gray-600">Nueva tarea en Física</span>
                <span className="ml-auto text-gray-400">Hace 4 horas</span>
              </div>
              <div className="flex items-center text-sm">
                <Bell className="h-4 w-4 text-blue-500 mr-2" />
                <span className="text-gray-600">Recordatorio de examen</span>
                <span className="ml-auto text-gray-400">Ayer</span>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
