'use client';

import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
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
import { mockCourses, getProgressData } from '@/utils/mockData';
import { useAuth } from '@/contexts/AuthContext';
import { useGoogleClassroomData } from '@/hooks/useGoogleClassroomData';

export default function TeacherDashboardPage() {
  const [selectedTeacher, setSelectedTeacher] = useState<string>('all');
  const [timeRange, setTimeRange] = useState<string>('6months');
  const { user, setUserFromCallback } = useAuth();
  const searchParams = useSearchParams();
  const classroomData = useGoogleClassroomData();

  // Procesar datos del usuario desde la URL (callback de OAuth)
  useEffect(() => {
    const userDataParam = searchParams.get('user_data');
    if (userDataParam && !user) {
      try {
        const userData = JSON.parse(decodeURIComponent(userDataParam));
        console.log('📥 TeacherDashboard - Procesando datos del callback:', userData);
        setUserFromCallback(userData);
        
        // Limpiar la URL
        window.history.replaceState({}, '', '/dashboard/teacher');
      } catch (error) {
        console.error('❌ Error procesando datos del usuario:', error);
      }
    }
  }, [searchParams, user, setUserFromCallback]);

  const progressData = getProgressData();
  
  const teacherEffectiveness = [
    { name: 'Prof. Elena López', effectiveness: 94, students: 28, satisfaction: 4.8 },
    { name: 'Prof. Roberto Sánchez', effectiveness: 89, students: 25, satisfaction: 4.6 },
    { name: 'Prof. Laura Fernández', effectiveness: 92, students: 22, satisfaction: 4.7 },
    { name: 'Prof. Carlos Mendoza', effectiveness: 87, students: 30, satisfaction: 4.5 },
    { name: 'Prof. Ana Torres', effectiveness: 91, students: 26, satisfaction: 4.8 }
  ];

  const teachingMetrics = [
    { subject: 'Participación', A: 85, B: 90, fullMark: 100 },
    { subject: 'Claridad', A: 92, B: 88, fullMark: 100 },
    { subject: 'Innovación', A: 78, B: 85, fullMark: 100 },
    { subject: 'Feedback', A: 88, B: 92, fullMark: 100 },
    { subject: 'Organización', A: 94, B: 89, fullMark: 100 },
    { subject: 'Motivación', A: 87, B: 91, fullMark: 100 }
  ];

  const classPerformance = [
    { class: 'Historia Universal', average: 87, participation: 92, assignments: 15 },
    { class: 'Matemáticas Avanzadas', average: 82, participation: 88, assignments: 18 },
    { class: 'Química Orgánica', average: 89, participation: 85, assignments: 12 },
    { class: 'Literatura Española', average: 91, participation: 94, assignments: 14 }
  ];

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
              Docente
            </label>
            <select 
              value={selectedTeacher}
              onChange={(e) => setSelectedTeacher(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary"
            >
              <option value="all">Todos los docentes</option>
              {teacherEffectiveness.map((teacher, index) => (
                <option key={index} value={teacher.name}>
                  {teacher.name}
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
                <p className="text-sm font-medium text-gray-600">Total Docentes</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">
                  {teacherEffectiveness.length}
                </p>
              </div>
              <div className="p-3 rounded-full bg-blue-100">
                <GraduationCap className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Efectividad Promedio</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">
                  {Math.round(teacherEffectiveness.reduce((acc, t) => acc + t.effectiveness, 0) / teacherEffectiveness.length)}%
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
                <p className="text-sm font-medium text-gray-600">Cursos Activos</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">
                  {mockCourses.length}
                </p>
              </div>
              <div className="p-3 rounded-full bg-purple-100">
                <BookOpen className="w-6 h-6 text-purple-600" />
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Satisfacción Promedio</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">
                  {(teacherEffectiveness.reduce((acc, t) => acc + t.satisfaction, 0) / teacherEffectiveness.length).toFixed(1)}
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
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={progressData}>
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
          </Card>

          {/* Teaching Metrics Radar */}
          <Card className="p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Métricas de Enseñanza
            </h3>
            <ResponsiveContainer width="100%" height={300}>
              <RadarChart data={teachingMetrics}>
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
          </Card>
        </div>

        {/* Teacher Performance and Class Performance */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* Teacher Effectiveness */}
          <Card className="p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Efectividad por Docente
            </h3>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={teacherEffectiveness} layout="horizontal">
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis type="number" domain={[0, 100]} />
                <YAxis dataKey="name" type="category" width={120} />
                <Tooltip />
                <Bar dataKey="effectiveness" fill="#3B82F6" />
              </BarChart>
            </ResponsiveContainer>
          </Card>

          {/* Class Performance */}
          <Card className="p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Rendimiento por Clase
            </h3>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={classPerformance}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="class" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="average" fill="#3B82F6" name="Promedio" />
                <Bar dataKey="participation" fill="#10B981" name="Participación" />
              </BarChart>
            </ResponsiveContainer>
          </Card>
        </div>

        {/* Detailed Teacher List */}
        <Card className="p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-6">
            Detalle de Docentes
          </h3>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Docente
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Efectividad
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Estudiantes
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Satisfacción
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Estado
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {teacherEffectiveness.map((teacher, index) => (
                  <tr key={index} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center">
                          <GraduationCap className="w-5 h-5 text-gray-600" />
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">
                            {teacher.name}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="text-sm font-medium text-gray-900">
                          {teacher.effectiveness}%
                        </div>
                        <div className="ml-2 w-16 bg-gray-200 rounded-full h-2">
                          <div 
                            className="bg-green-500 h-2 rounded-full" 
                            style={{ width: `${teacher.effectiveness}%` }}
                          />
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      <div className="flex items-center">
                        <Users className="w-4 h-4 mr-2 text-gray-400" />
                        {teacher.students}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      <div className="flex items-center">
                        <Star className="w-4 h-4 mr-1 text-yellow-400 fill-current" />
                        {teacher.satisfaction}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                        teacher.effectiveness >= 90 
                          ? 'bg-green-100 text-green-800' 
                          : teacher.effectiveness >= 80 
                          ? 'bg-yellow-100 text-yellow-800'
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {teacher.effectiveness >= 90 ? 'Excelente' : teacher.effectiveness >= 80 ? 'Bueno' : 'Necesita Mejora'}
                      </span>
                    </td>
                  </tr>
                ))}
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
                {user?.user_metadata?.google_classroom?.connected ? 'Conectado a Google Classroom' : 'Datos de prueba'}
              </span>
            </div>
            
            <div className="space-y-3">
              {classroomData.courses.length > 0 ? (
                classroomData.courses.map((course, index) => (
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
                        <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800">
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

          {/* Tareas Pendientes */}
          <Card className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                <Clock className="w-5 h-5 mr-2 text-orange-600" />
                Tareas Pendientes
              </h3>
              <span className="bg-orange-100 text-orange-800 text-xs font-medium px-2.5 py-0.5 rounded-full">
                {classroomData.pendingAssignments}
              </span>
            </div>
            
            <div className="space-y-3">
              {classroomData.assignments.length > 0 ? (
                classroomData.assignments
                  .filter(assignment => assignment.state === 'PUBLISHED')
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
                  <p>No hay tareas pendientes</p>
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
