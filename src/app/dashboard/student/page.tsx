'use client';

import React from 'react';
import { useSession, signOut } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { AlertTriangle, Users, TrendingUp, Award, LogOut, BookOpen, Clock, CheckCircle } from 'lucide-react';

export default function StudentDashboardPage() {
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
            <h1 className="text-3xl font-bold text-gray-900">Dashboard del Estudiante</h1>
            <p className="text-gray-600 mt-1">Bienvenido, {session.user?.name || session.user?.email}</p>
          </div>
        </div>

        <Card className="p-8 text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            ¡Bienvenido a tu Dashboard!
          </h2>
          <p className="text-gray-600 mb-6">
            Aquí podrás ver tu progreso académico, tareas pendientes y mucho más.
          </p>
          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <p className="text-green-800">
              ✅ <strong>¡Autenticación exitosa!</strong> El sistema de login está funcionando correctamente.
            </p>
          </div>
        </Card>
      </div>
    </div>
  );
}

'use client';

import React, { useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { AlertTriangle, Users, TrendingUp, Award, LogOut, BookOpen, Clock, CheckCircle } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useGoogleClassroomData } from '@/hooks/useGoogleClassroomData';

export default function StudentDashboardPage() {
  const { user, loading, signOut, setUserFromCallback } = useAuth();
  const classroomData = useGoogleClassroomData();
  const searchParams = useSearchParams();

  // Procesar datos del usuario desde la URL (callback de OAuth)
  useEffect(() => {
    const userDataParam = searchParams.get('user_data');
    if (userDataParam && !user) {
      try {
        const userData = JSON.parse(decodeURIComponent(userDataParam));
        console.log('📥 StudentDashboard - Procesando datos del callback:', userData);
        setUserFromCallback(userData);

        // Limpiar la URL
        window.history.replaceState({}, '', '/dashboard/student');
      } catch (error) {
        console.error('❌ Error procesando datos del usuario:', error);
      }
    }
  }, [searchParams, user, setUserFromCallback]);

  console.log('🎯 StudentDashboard - PÁGINA CARGADA');
  console.log('🎯 StudentDashboard - Usuario:', user?.email, 'Cargando:', loading);
  console.log('🎯 StudentDashboard - Datos de Classroom:', classroomData);
  console.log('🎯 StudentDashboard - Error:', classroomData.error);
  console.log('🎯 StudentDashboard - Loading:', classroomData.loading);
  console.log('🎯 StudentDashboard - Cursos:', classroomData.courses);
  console.log('🎯 StudentDashboard - Timestamp:', new Date().toISOString());

  const handleSignOut = async () => {
    try {
      await signOut();
      console.log('Sesión cerrada exitosamente');
    } catch (error) {
      console.error('Error cerrando sesión:', error);
      // Forzar limpieza manual si falla
      if (typeof window !== 'undefined') {
        // Limpiar cookies manualmente
        document.cookie.split(";").forEach((c) => {
          const eqPos = c.indexOf("=");
          const name = eqPos > -1 ? c.substr(0, eqPos) : c;
          if (name.trim().includes('sb-') || name.trim().includes('supabase')) {
            document.cookie = name + "=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/";
          }
        });

        // Redirigir al login
        window.location.href = '/auth/login';
      }
    }
  };

  // Mostrar estado de carga si está cargando
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Cargando dashboard...</p>
        </div>
      </div>
    );
  }

  // Mostrar información de debug si no hay usuario
  if (!user) {
    // Redirigir a la página principal después de un breve delay
    setTimeout(() => {
      window.location.href = '/';
    }, 2000);

    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <AlertTriangle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <p className="text-gray-600">No hay usuario autenticado</p>
          <p className="text-sm text-gray-500 mt-2">Redirigiendo a la página principal en 2 segundos...</p>
          <Button
            onClick={() => window.location.href = '/'}
            className="mt-4"
          >
            Ir a Inicio Ahora
          </Button>
        </div>
      </div>
    );
  }

  // Verificar que el usuario tenga el rol correcto
  if (user.user_metadata?.rol !== 'estudiante') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <AlertTriangle className="w-12 h-12 text-yellow-500 mx-auto mb-4" />
          <p className="text-gray-600">Acceso no autorizado</p>
          <p className="text-sm text-gray-500 mt-2">
            Esta página es solo para estudiantes. Tu rol: {user.user_metadata?.rol || 'No definido'}
          </p>
          <Button
            onClick={() => window.location.href = '/dashboard'}
            className="mt-4"
          >
            Ir al Dashboard Principal
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gray-50 min-h-screen p-6">
      <div className="max-w-7xl mx-auto">
        {/* Debug Info con botón de cerrar sesión */}
        <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
          <div className="flex items-center justify-between">
            <p className="text-sm text-blue-800">
              <strong>Debug:</strong> Usuario: {user?.email} | Rol: {user?.user_metadata?.rol} | Nombre: {user?.user_metadata?.nombre}
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

        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Dashboard del Estudiante</h1>
            <p className="text-gray-600 mt-1">Bienvenido, {user?.user_metadata?.nombre || user?.email}</p>
          </div>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Clases Inscritas</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">
                  {classroomData.loading ? (
                    <span className="animate-pulse bg-gray-200 rounded w-8 h-8 block"></span>
                  ) : (
                    classroomData.totalCourses
                  )}
                </p>
              </div>
              <div className="p-3 rounded-full bg-blue-100">
                <BookOpen className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Tareas Pendientes</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">
                  {classroomData.loading ? (
                    <span className="animate-pulse bg-gray-200 rounded w-8 h-8 block"></span>
                  ) : (
                    classroomData.pendingAssignments
                  )}
                </p>
              </div>
              <div className="p-3 rounded-full bg-yellow-100">
                <AlertTriangle className="w-6 h-6 text-yellow-600" />
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Promedio General</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">
                  {classroomData.loading ? (
                    <span className="animate-pulse bg-gray-200 rounded w-12 h-8 block"></span>
                  ) : (
                    `${classroomData.averageGrade}%`
                  )}
                </p>
              </div>
              <div className="p-3 rounded-full bg-green-100">
                <Award className="w-6 h-6 text-green-600" />
              </div>
            </div>
          </Card>
        </div>

        {/* Información de Fuente de Datos */}
        {classroomData.error && (
          <Card className={`p-4 mb-6 ${
            classroomData.error === 'CONFIGURATION_REQUIRED'
              ? 'bg-yellow-50 border-yellow-200'
              : 'bg-blue-50 border-blue-200'
          }`}>
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <BookOpen className={`w-5 h-5 mr-2 ${
                  classroomData.error === 'CONFIGURATION_REQUIRED'
                    ? 'text-yellow-600'
                    : 'text-blue-600'
                }`} />
                <div>
                  <p className={`text-sm font-medium ${
                    classroomData.error === 'CONFIGURATION_REQUIRED'
                      ? 'text-yellow-800'
                      : 'text-blue-800'
                  }`}>
                    {classroomData.error === 'CONFIGURATION_REQUIRED'
                      ? 'Configuración Requerida'
                      : 'Conectar Google Classroom'
                    }
                  </p>
                  <p className={`text-xs mt-1 ${
                    classroomData.error === 'CONFIGURATION_REQUIRED'
                      ? 'text-yellow-600'
                      : 'text-blue-600'
                  }`}>
                    {classroomData.error === 'CONFIGURATION_REQUIRED'
                      ? 'El administrador necesita configurar las credenciales de Google OAuth para conectar con Google Classroom.'
                      : 'Para ver tus cursos y tareas reales, conecta tu cuenta de Google Classroom.'
                    }
                  </p>
                </div>
              </div>
              <div className="flex gap-2">
                {classroomData.error === 'CONFIGURATION_REQUIRED' ? (
                  <Button
                    onClick={() => {
                      window.location.href = '/admin/integration';
                    }}
                    className="text-sm bg-yellow-600 hover:bg-yellow-700"
                  >
                    ⚙️ Configurar
                  </Button>
                ) : (
                  <Button
                    onClick={() => {
                      window.location.href = '/connect-classroom';
                    }}
                    className="text-sm bg-blue-600 hover:bg-blue-700"
                  >
                    🔗 Conectar Google Classroom
                  </Button>
                )}
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    window.location.reload();
                  }}
                  className="text-xs"
                >
                  🔄 Recargar
                </Button>
              </div>
            </div>
          </Card>
        )}

        {/* Mis Cursos */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <Card className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Mis Cursos</h3>
              <BookOpen className="w-5 h-5 text-blue-600" />
            </div>

            {classroomData.loading ? (
              <div className="space-y-3">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="animate-pulse">
                    <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                    <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                  </div>
                ))}
              </div>
            ) : classroomData.courses.length > 0 ? (
              <div className="space-y-3">
                {classroomData.courses.slice(0, 5).map((course) => (
                  <div key={course.id} className="border-l-4 border-blue-500 pl-4 py-2">
                    <h4 className="font-medium text-gray-900">{course.name}</h4>
                    {course.section && (
                      <p className="text-sm text-gray-600">{course.section}</p>
                    )}
                    {course.room && (
                      <p className="text-xs text-gray-500">{course.room}</p>
                    )}
                  </div>
                ))}
                {classroomData.courses.length > 5 && (
                  <p className="text-sm text-gray-500 mt-2">
                    Y {classroomData.courses.length - 5} cursos más...
                  </p>
                )}
              </div>
            ) : (
              <div className="text-center py-4">
                <BookOpen className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                <p className="text-gray-500">No hay cursos disponibles</p>
              </div>
            )}
          </Card>

          {/* Tareas Pendientes */}
          <Card className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Tareas Pendientes</h3>
              <Clock className="w-5 h-5 text-yellow-600" />
            </div>

            {classroomData.loading ? (
              <div className="space-y-3">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="animate-pulse">
                    <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                    <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                  </div>
                ))}
              </div>
            ) : classroomData.assignments.length > 0 ? (
              <div className="space-y-3">
                {classroomData.assignments
                  .filter((assignment) => {
                    if (!assignment.dueDate) return true;
                    const dueDate = new Date(assignment.dueDate.year, assignment.dueDate.month - 1, assignment.dueDate.day);
                    return dueDate > new Date();
                  })
                  .slice(0, 5)
                  .map((assignment) => (
                    <div key={assignment.id} className="border-l-4 border-yellow-500 pl-4 py-2">
                      <h4 className="font-medium text-gray-900">{assignment.title}</h4>
                      <p className="text-sm text-gray-600">{assignment.courseName || 'Curso'}</p>
                      {assignment.dueDate && (
                        <p className="text-xs text-yellow-600">
                          Vence: {assignment.dueDate.day}/{assignment.dueDate.month}/{assignment.dueDate.year}
                        </p>
                      )}
                    </div>
                  ))}
              </div>
            ) : (
              <div className="text-center py-4">
                <CheckCircle className="w-8 h-8 text-green-400 mx-auto mb-2" />
                <p className="text-gray-500">¡No hay tareas pendientes!</p>
              </div>
            )}
          </Card>
        </div>

        {/* Welcome Message */}
        <Card className="p-8 text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            ¡Bienvenido a tu Dashboard!
          </h2>
          <p className="text-gray-600 mb-6">
            Aquí podrás ver tu progreso académico, tareas pendientes y mucho más.
          </p>
          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <p className="text-green-800">
              ✅ <strong>¡Autenticación exitosa!</strong> El sistema de login está funcionando correctamente.
            </p>
          </div>
        </Card>
      </div>
    </div>
  );
}
