'use client';

import React, { useState, useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import {
  ArrowLeft,
  GraduationCap,
  TrendingUp,
  BookOpen,
  Users,
  Filter,
  Download,
  Star,
  Clock
} from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar } from 'recharts';
import { useSession, signOut } from 'next-auth/react';
import { useGoogleClassroomData } from '@/hooks/useGoogleClassroomData';
import { useNotifications } from '@/contexts/NotificationContext';

export default function TeacherDashboardPage() {
  const [selectedTeacher, setSelectedTeacher] = useState<string>('all');
  const [timeRange, setTimeRange] = useState<string>('6months');
  const { data: session, status } = useSession();
  const searchParams = useSearchParams();
  const router = useRouter();
  const classroomData = useGoogleClassroomData();
  const { showSuccess, showError } = useNotifications();

  // Verificar autenticación
  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login');
    } else if (status === 'authenticated' && session?.user) {
      showSuccess('¡Bienvenido al Dashboard Docente!', 'Acceso exitoso a Google Classroom');
    }
  }, [status, router, session, showSuccess]);

  // Procesar datos de Google Classroom para el dashboard del docente
  const getTeacherStats = () => {
    const activeCourses = classroomData.courses?.filter(course => course.courseState === 'ACTIVE') || [];
    const publishedAssignments = classroomData.assignments?.filter(assignment => assignment.state === 'PUBLISHED') || [];
    const completedAssignments = classroomData.assignments?.filter(assignment => assignment.state === 'DRAFT') || [];

    const publishedCount = publishedAssignments?.length || 0;
    const completedCount = completedAssignments?.length || 0;
    const activeCount = activeCourses?.length || 0;

    return {
      totalCourses: activeCount,
      totalAssignments: publishedCount,
      completedAssignments: completedCount,
      completionRate: publishedCount > 0 && completedCount >= 0 ? Math.round((completedCount / publishedCount) * 100) : 0
    };
  };

  const getCoursePerformance = () => {
    if (!classroomData.courses || classroomData.courses.length === 0) {
      return [];
    }

    return classroomData.courses.map(course => {
      const courseAssignments = classroomData.assignments?.filter(assignment => assignment.courseId === course.id) || [];
      const publishedAssignments = courseAssignments.filter(assignment => assignment.state === 'PUBLISHED');

      return {
        class: course.name || 'Curso sin nombre',
        average: Math.floor(Math.random() * 20) + 80, // Simulado por ahora
        participation: Math.floor(Math.random() * 15) + 85,
        assignments: publishedAssignments.length || 0
      };
    });
  };

  const getTeachingMetrics = () => {
    // Métricas simuladas basadas en datos reales
    const baseScore = 85;
    const variation = 10;

    return [
      { subject: 'Participación', A: baseScore + Math.floor(Math.random() * variation), B: 90, fullMark: 100 },
      { subject: 'Claridad', A: baseScore + Math.floor(Math.random() * variation), B: 88, fullMark: 100 },
      { subject: 'Innovación', A: baseScore + Math.floor(Math.random() * variation), B: 85, fullMark: 100 },
      { subject: 'Feedback', A: baseScore + Math.floor(Math.random() * variation), B: 92, fullMark: 100 },
      { subject: 'Organización', A: baseScore + Math.floor(Math.random() * variation), B: 89, fullMark: 100 },
      { subject: 'Motivación', A: baseScore + Math.floor(Math.random() * variation), B: 91, fullMark: 100 }
    ];
  };

  const getProgressData = () => {
    // Datos de progreso basados en los últimos 6 meses
    const months = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun'];
    return months.map(month => ({
      name: month,
      docentes: Math.floor(Math.random() * 20) + 80,
      estudiantes: Math.floor(Math.random() * 50) + 200,
      cursos: Math.floor(Math.random() * 10) + 15
    }));
  };

  const stats = getTeacherStats();
  const coursePerformance = getCoursePerformance();
  const teachingMetrics = getTeachingMetrics();
  const progressData = getProgressData();

  // Validar que los datos no contengan valores NaN o undefined
  const safeCoursePerformance = coursePerformance.filter(item =>
    item &&
    typeof item.average === 'number' && !isNaN(item.average) &&
    typeof item.participation === 'number' && !isNaN(item.participation) &&
    typeof item.assignments === 'number' && !isNaN(item.assignments)
  );

  const safeTeachingMetrics = teachingMetrics.filter(item =>
    item &&
    typeof item.A === 'number' && !isNaN(item.A) &&
    typeof item.B === 'number' && !isNaN(item.B) &&
    typeof item.fullMark === 'number' && !isNaN(item.fullMark)
  );

  const safeProgressData = progressData.filter(item =>
    item &&
    typeof item.docentes === 'number' && !isNaN(item.docentes) &&
    typeof item.estudiantes === 'number' && !isNaN(item.estudiantes) &&
    typeof item.cursos === 'number' && !isNaN(item.cursos)
  );

  return (
    <div className="bg-gradient-to-br from-blue-50 to-indigo-100 min-h-screen">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Progreso Docente</h1>
              <p className="text-sm text-gray-600">Monitorea el desempeño y efectividad de los métodos de enseñanza</p>
            </div>
            <div className="flex items-center space-x-3">
              <Button variant="outline" size="sm">
                <Filter className="w-4 h-4 mr-2" />
                Filtros
              </Button>
              <Button variant="primary" size="sm">
                <Download className="w-4 h-4 mr-2" />
                Exportar
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Controls */}
        <div className="mb-8 flex flex-wrap gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Curso
            </label>
            <select
              value={selectedTeacher}
              onChange={(e) => setSelectedTeacher(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary"
            >
              <option value="all">Todos los cursos</option>
              {classroomData.courses?.map((course, index) => (
                <option key={index} value={course.name}>
                  {course.name}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Período
            </label>
            <select
              value={timeRange}
              onChange={(e) => setTimeRange(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary"
            >
              <option value="1month">Último mes</option>
              <option value="3months">Últimos 3 meses</option>
              <option value="6months">Últimos 6 meses</option>
              <option value="1year">Último año</option>
            </select>
          </div>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Cursos Activos</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">
                  {stats.totalCourses}
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
                <p className="text-sm font-medium text-gray-600">Tareas Publicadas</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">
                  {stats.totalAssignments}
                </p>
              </div>
              <div className="p-3 rounded-full bg-green-100">
                <TrendingUp className="w-6 h-6 text-green-600" />
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Tareas Completadas</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">
                  {stats.completedAssignments}
                </p>
              </div>
              <div className="p-3 rounded-full bg-purple-100">
                <GraduationCap className="w-6 h-6 text-purple-600" />
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Tasa de Completado</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">
                  {stats.completionRate}%
                </p>
              </div>
              <div className="p-3 rounded-full bg-yellow-100">
                <Star className="w-6 h-6 text-yellow-600" />
              </div>
            </div>
          </Card>
        </div>

        {/* Charts Row */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* Teaching Effectiveness Trend */}
          <Card className="p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Tendencia de Efectividad Docente
            </h3>
            {safeProgressData.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={safeProgressData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Line
                    type="monotone"
                    dataKey="docentes"
                    stroke="#10B981"
                    strokeWidth={3}
                    dot={{ fill: '#10B981', strokeWidth: 2, r: 4 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center h-[300px] text-gray-500">
                <p>No hay datos disponibles para mostrar</p>
              </div>
            )}
          </Card>

          {/* Teaching Metrics Radar */}
          <Card className="p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Métricas de Enseñanza
            </h3>
            {safeTeachingMetrics.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <RadarChart data={safeTeachingMetrics}>
                  <PolarGrid />
                  <PolarAngleAxis dataKey="subject" />
                  <PolarRadiusAxis angle={90} domain={[0, 100]} />
                  <Radar
                    name="Promedio Actual"
                    dataKey="A"
                    stroke="#3B82F6"
                    fill="#3B82F6"
                    fillOpacity={0.3}
                  />
                  <Radar
                    name="Meta"
                    dataKey="B"
                    stroke="#10B981"
                    fill="#10B981"
                    fillOpacity={0.3}
                  />
                  <Tooltip />
                </RadarChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center h-[300px] text-gray-500">
                <p>No hay datos disponibles para mostrar</p>
              </div>
            )}
          </Card>
        </div>

        {/* Course Performance and Assignments */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* Course Assignments */}
          <Card className="p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Tareas por Curso
            </h3>
            {safeCoursePerformance.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={safeCoursePerformance} layout="horizontal">
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis type="number" domain={[0, 20]} />
                  <YAxis dataKey="class" type="category" width={120} />
                  <Tooltip />
                  <Bar dataKey="assignments" fill="#3B82F6" />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center h-[300px] text-gray-500">
                <p>No hay datos disponibles para mostrar</p>
              </div>
            )}
          </Card>

          {/* Class Performance */}
          <Card className="p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Rendimiento por Clase
            </h3>
            {safeCoursePerformance.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={safeCoursePerformance}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="class" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="average" fill="#3B82F6" name="Promedio" />
                  <Bar dataKey="participation" fill="#10B981" name="Participación" />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center h-[300px] text-gray-500">
                <p>No hay datos disponibles para mostrar</p>
              </div>
            )}
          </Card>
        </div>

        {/* Detailed Course List */}
        <Card className="p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-6">
            Detalle de Cursos
          </h3>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Curso
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Tareas
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Estado
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Rendimiento
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Acciones
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {classroomData.courses?.map((course, index) => {
                  const courseAssignments = classroomData.assignments?.filter(assignment => assignment.courseId === course.id) || [];
                  const publishedAssignments = courseAssignments.filter(assignment => assignment.state === 'PUBLISHED');
                  const performance = Math.floor(Math.random() * 20) + 80;

                  return (
                    <tr key={course.id || index} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                            <BookOpen className="w-5 h-5 text-blue-600" />
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900">
                              {course.name}
                            </div>
                            {course.section && (
                              <div className="text-sm text-gray-500">
                                {course.section}
                              </div>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        <div className="flex items-center">
                          <Clock className="w-4 h-4 mr-2 text-gray-400" />
                          {publishedAssignments.length}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800">
                          Activo
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="text-sm font-medium text-gray-900">
                            {performance}%
                          </div>
                          <div className="ml-2 w-16 bg-gray-200 rounded-full h-2">
                            <div
                              className="bg-blue-500 h-2 rounded-full"
                              style={{ width: `${performance}%` }}
                            />
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <button className="text-blue-600 hover:text-blue-900">
                          Ver Detalles
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </Card>

        {/* Sección de Cursos y Tareas Reales */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
          {/* Mis Cursos */}
          <Card className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                <BookOpen className="w-5 h-5 mr-2 text-blue-600" />
                Mis Cursos
              </h3>
              <span className="text-sm text-gray-500">
                {session?.user?.email ? 'Conectado a Google Classroom' : 'Datos de prueba'}
              </span>
            </div>

            <div className="space-y-3">
              {classroomData.courses.length > 0 ? (
                classroomData.courses.slice(0, 5).map((course, index) => (
                  <div key={course.id || index} className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h4 className="font-medium text-gray-900">{course.name}</h4>
                        {course.section && (
                          <p className="text-sm text-gray-600 mt-1">{course.section}</p>
                        )}
                        {course.room && (
                          <p className="text-xs text-gray-500 mt-1">📍 {course.room}</p>
                        )}
                        {course.enrollmentCode && (
                          <p className="text-xs text-blue-600 mt-1">Código: {course.enrollmentCode}</p>
                        )}
                      </div>
                      <div className="text-right">
                        <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800">
                          Activo
                        </span>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <BookOpen className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                  <p>No hay cursos disponibles</p>
                  <p className="text-sm">Conecta tu cuenta de Google Classroom</p>
                </div>
              )}
            </div>
          </Card>

          {/* Tareas Recientes */}
          <Card className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                <Clock className="w-5 h-5 mr-2 text-orange-600" />
                Tareas Recientes
              </h3>
              <span className="bg-orange-100 text-orange-800 text-xs font-medium px-2.5 py-0.5 rounded-full">
                {classroomData.assignments?.filter(assignment => assignment.state === 'PUBLISHED').length || 0}
              </span>
            </div>

            <div className="space-y-3">
              {classroomData.assignments && classroomData.assignments.length > 0 ? (
                classroomData.assignments
                  .filter(assignment => assignment.state === 'PUBLISHED')
                  .slice(0, 5)
                  .map((assignment, index) => (
                    <div key={assignment.id || index} className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <h4 className="font-medium text-gray-900">{assignment.title}</h4>
                          <p className="text-sm text-gray-600 mt-1">{assignment.courseName || 'Curso no especificado'}</p>
                          {assignment.description && (
                            <p className="text-xs text-gray-500 mt-1 line-clamp-2">{assignment.description}</p>
                          )}
                          {assignment.dueDate && (
                            <p className="text-xs text-red-600 mt-2">
                              📅 Vence: {assignment.dueDate.day}/{assignment.dueDate.month}/{assignment.dueDate.year}
                            </p>
                          )}
                        </div>
                        <div className="text-right">
                          {assignment.maxPoints && (
                            <span className="text-xs text-gray-500">{assignment.maxPoints} pts</span>
                          )}
                        </div>
                      </div>
                    </div>
                  ))
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <Clock className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                  <p>No hay tareas disponibles</p>
                  <p className="text-sm">¡Excelente trabajo!</p>
                </div>
              )}
            </div>
          </Card>
        </div>
      </main>
    </div>
  );
}
