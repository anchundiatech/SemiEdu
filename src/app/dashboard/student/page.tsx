'use client';

import React, { useEffect, useState } from 'react';
import { useSession, signOut } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useNotifications } from '@/contexts/NotificationContext';
import { useGoogleClassroomData } from '@/hooks/useGoogleClassroomData';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { AlertTriangle, Users, TrendingUp, Award, LogOut, BookOpen, Clock, CheckCircle, Calendar, Bell, FileText, BarChart3 } from 'lucide-react';

export default function StudentDashboardPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const { showSuccess } = useNotifications();
  const {
    courses,
    assignments,
    userProfile,
    loading: classroomLoading,
    error: classroomError
  } = useGoogleClassroomData();

  // Mostrar notificación de bienvenida
  useEffect(() => {
    if (session?.user) {
      showSuccess(
        'Sesión iniciada',
        `Bienvenido de nuevo, ${session.user.name || 'Usuario'}.`,
        2500 // 2.5 segundos
      );
    }
  }, [session, showSuccess]);

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
    await signOut({ callbackUrl: '/landing' });
  };

  // Procesar datos de Google Classroom
  const getClassroomStats = () => {
    const activeCourses = courses?.filter(course => course.courseState === 'ACTIVE') || [];
    const pendingAssignments = assignments?.filter(assignment =>
      assignment.state === 'PUBLISHED' &&
      assignment.dueDate &&
      new Date(assignment.dueDate.year, assignment.dueDate.month - 1, assignment.dueDate.day) > new Date()
    ) || [];

    const completedAssignments = assignments?.filter(assignment =>
      assignment.state === 'TURNED_IN' || assignment.state === 'RETURNED'
    ) || [];

    const totalAssignments = assignments?.length || 0;
    const completedCount = completedAssignments?.length || 0;
    const completionRate = totalAssignments > 0 && completedCount >= 0 ? Math.round((completedCount / totalAssignments) * 100) : 0;

    return {
      activeCourses: activeCourses.length,
      pendingAssignments: pendingAssignments.length,
      completedAssignments: completedAssignments.length,
      completionRate
    };
  };

  const getUpcomingAssignments = () => {
    if (!assignments) return [];

    return assignments
      .filter(assignment =>
        assignment.state === 'PUBLISHED' &&
        assignment.dueDate &&
        new Date(assignment.dueDate.year, assignment.dueDate.month - 1, assignment.dueDate.day) > new Date()
      )
      .sort((a, b) => {
        const dateA = new Date(a.dueDate!.year, a.dueDate!.month - 1, a.dueDate!.day);
        const dateB = new Date(b.dueDate!.year, b.dueDate!.month - 1, b.dueDate!.day);
        return dateA.getTime() - dateB.getTime();
      })
      .slice(0, 3); // Solo las próximas 3
  };

  const getUpcomingClasses = () => {
    // Mock data para clases próximas (Google Classroom no tiene horarios específicos)
    const classSchedule = [
      { name: 'Matemáticas', time: 'Hoy 10:00 AM', color: 'blue' },
      { name: 'Física', time: 'Mañana 2:00 PM', color: 'green' },
      { name: 'Historia', time: 'Viernes 9:00 AM', color: 'purple' }
    ];

    return classSchedule.slice(0, 3);
  };

  const formatDueDate = (dueDate: any) => {
    if (!dueDate) return 'Sin fecha límite';

    const date = new Date(dueDate.year, dueDate.month - 1, dueDate.day);
    const now = new Date();
    const diffTime = date.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 0) return 'Hoy';
    if (diffDays === 1) return 'Mañana';
    if (diffDays < 0) return 'Vencida';
    return `En ${diffDays} días`;
  };

  const getAssignmentPriority = (dueDate: any) => {
    if (!dueDate) return 'low';

    const date = new Date(dueDate.year, dueDate.month - 1, dueDate.day);
    const now = new Date();
    const diffTime = date.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays < 0) return 'overdue';
    if (diffDays <= 1) return 'urgent';
    if (diffDays <= 3) return 'warning';
    return 'normal';
  };

  const stats = getClassroomStats();
  const upcomingAssignments = getUpcomingAssignments();
  const upcomingClasses = getUpcomingClasses();


  return (
    <div className="bg-gray-50 min-h-screen p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Dashboard del Estudiante</h1>
            <p className="text-gray-600 mt-1">Bienvenido, {session.user?.name || session.user?.email}</p>
          </div>
          <Button
            variant="outline"
            onClick={handleSignOut}
            className="text-red-600 border-red-200 hover:bg-red-50"
          >
            <LogOut className="w-4 h-4 mr-2" />
            Cerrar Sesión
          </Button>
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
                <p className="text-2xl font-semibold text-gray-900">
                  {classroomLoading ? '...' : stats.activeCourses}
                </p>
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <FileText className="h-8 w-8 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Tareas Pendientes</p>
                <p className="text-2xl font-semibold text-gray-900">
                  {classroomLoading ? '...' : stats.pendingAssignments}
                </p>
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <CheckCircle className="h-8 w-8 text-purple-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Tareas Completadas</p>
                <p className="text-2xl font-semibold text-gray-900">
                  {classroomLoading ? '...' : stats.completedAssignments}
                </p>
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <TrendingUp className="h-8 w-8 text-orange-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Tasa de Completado</p>
                <p className="text-2xl font-semibold text-gray-900">
                  {classroomLoading ? '...' : `${stats.completionRate}%`}
                </p>
              </div>
            </div>
          </Card>
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Mis Clases - Lado Izquierdo */}
          <div className="lg:col-span-2">
            <Card className="p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Mis Clases</h3>
              {classroomLoading ? (
                <div className="flex items-center justify-center py-4">
                  <LoadingSpinner size="sm" text="Cargando..." />
                </div>
              ) : courses && courses.length > 0 ? (
                <div className="space-y-3">
                  {courses.slice(0, 8).map((course, index) => {
                    const colors = ['blue', 'green', 'purple', 'orange', 'pink'];
                    const color = colors[index % colors.length];
                    const colorClasses: Record<string, string> = {
                      blue: 'text-blue-500',
                      green: 'text-green-500',
                      purple: 'text-purple-500',
                      orange: 'text-orange-500',
                      pink: 'text-pink-500'
                    };

                    return (
                      <div key={course.id} className="flex items-center text-sm">
                        <Calendar className={`h-4 w-4 ${colorClasses[color] || 'text-gray-500'} mr-2`} />
                        <div className="flex-1">
                          <p className="font-medium">{course.name}</p>
                          {course.section && (
                            <p className="text-gray-600 text-xs">{course.section}</p>
                          )}
              </div>
                <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => window.open(course.alternateLink, '_blank')}
                          className="text-xs"
                        >
                          Ver
                </Button>
                      </div>
                    );
                  })}
                  {courses.length > 8 && (
                    <div className="text-center pt-2">
                <Button
                  variant="outline"
                  size="sm"
                        onClick={() => router.push('/classes')}
                  className="text-xs"
                >
                        Ver todas ({courses.length})
                </Button>
              </div>
                )}
              </div>
            ) : (
              <div className="text-center py-4">
                  <BookOpen className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                  <p className="text-sm text-gray-500">No hay clases disponibles</p>
              </div>
            )}
          </Card>
            </div>

          {/* Tareas Próximas - Lado Derecho */}
          <div className="lg:col-span-1">
            <Card className="p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Tareas Próximas</h3>
              {classroomLoading ? (
                <div className="flex items-center justify-center py-8">
                  <LoadingSpinner size="md" text="Cargando tareas..." />
                </div>
              ) : classroomError ? (
                <div className="text-center py-8">
                  <AlertTriangle className="h-12 w-12 text-red-500 mx-auto mb-4" />
                  <p className="text-red-600 mb-2">Error al cargar las tareas</p>
                  <p className="text-sm text-gray-500">{classroomError}</p>
                  </div>
              ) : upcomingAssignments.length === 0 ? (
                <div className="text-center py-8">
                  <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-4" />
                  <p className="text-gray-600">¡No tienes tareas pendientes!</p>
                  <p className="text-sm text-gray-500">Todo al día</p>
              </div>
              ) : (
                <div className="space-y-4">
                  {upcomingAssignments.map((assignment) => {
                    const priority = getAssignmentPriority(assignment.dueDate);
                    const priorityStyles: Record<string, string> = {
                      overdue: 'bg-red-50 border-red-200',
                      urgent: 'bg-red-50 border-red-200',
                      warning: 'bg-yellow-50 border-yellow-200',
                      normal: 'bg-blue-50 border-blue-200',
                      low: 'bg-gray-50 border-gray-200'
                    };
                    const priorityIcons: Record<string, JSX.Element> = {
                      overdue: <AlertTriangle className="h-5 w-5 text-red-500 mr-3" />,
                      urgent: <AlertTriangle className="h-5 w-5 text-red-500 mr-3" />,
                      warning: <Clock className="h-5 w-5 text-yellow-500 mr-3" />,
                      normal: <Clock className="h-5 w-5 text-blue-500 mr-3" />,
                      low: <Clock className="h-5 w-5 text-gray-500 mr-3" />
                    };

                    return (
                      <div
                        key={assignment.id}
                        className={`flex items-center justify-between p-4 rounded-lg border ${priorityStyles[priority]}`}
                      >
                        <div className="flex items-center">
                          {priorityIcons[priority]}
                          <div>
                            <p className="font-medium text-gray-900">{assignment.title}</p>
                            <p className="text-sm text-gray-600">
                              {assignment.courseName} • Vence: {formatDueDate(assignment.dueDate)}
                            </p>
                            {assignment.maxPoints && (
                              <p className="text-xs text-gray-500">
                                {assignment.maxPoints} puntos
                        </p>
                      )}
                    </div>
                        </div>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => window.open(assignment.alternateLink, '_blank')}
                        >
                          Ver
                        </Button>
              </div>
                    );
                  })}
              </div>
            )}
          </Card>
          </div>
        </div>

        {/* Acciones Rápidas - Fila Inferior */}
        <div className="mt-8">
          <Card className="p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Acciones Rápidas</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
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
                onClick={() => router.push('/tasks')}
              >
                <FileText className="h-4 w-4 mr-2" />
                Ver Tareas
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
        </div>
      </div>
    </div>
  );
}