'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { 
  ArrowLeft, 
  Activity, 
  MessageSquare, 
  BookOpen, 
  Download, 
  Filter,
  Mail,
  Clock,
  TrendingUp,
  Users,
  Award,
  AlertTriangle,
  Target,
  BarChart3
} from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, PieChart, Pie, Cell } from 'recharts';
import { getParticipationData, mockStudents } from '@/utils/mockData';

export default function ParticipationReportsPage() {
  const [selectedMetric, setSelectedMetric] = useState<string>('all');
  const [dateRange, setDateRange] = useState<string>('month');
  const [reportFormat, setReportFormat] = useState<string>('pdf');

  const participationData = getParticipationData();

  // Datos de participación por tipo de actividad
  const activityParticipation = [
    { activity: 'Clases Presenciales', participation: 92, target: 95 },
    { activity: 'Foros de Discusión', participation: 78, target: 85 },
    { activity: 'Entrega de Tareas', participation: 88, target: 90 },
    { activity: 'Proyectos Grupales', participation: 85, target: 90 },
    { activity: 'Evaluaciones', participation: 94, target: 95 }
  ];

  // Datos de participación por estudiante (top y bottom performers)
  const studentParticipation = [
    { name: 'María García', overall: 95, classes: 98, forums: 92, assignments: 96 },
    { name: 'Ana Martínez', overall: 91, classes: 94, forums: 88, assignments: 91 },
    { name: 'Carlos Rodríguez', overall: 78, classes: 82, forums: 74, assignments: 78 },
    { name: 'Luis Fernández', overall: 85, classes: 88, forums: 82, assignments: 85 },
    { name: 'Sofia López', overall: 89, classes: 92, forums: 86, assignments: 89 }
  ];

  // Datos de radar para métricas de participación
  const participationMetrics = [
    { metric: 'Asistencia', value: 92, fullMark: 100 },
    { metric: 'Puntualidad', value: 88, fullMark: 100 },
    { metric: 'Participación Oral', value: 76, fullMark: 100 },
    { metric: 'Entrega de Tareas', value: 89, fullMark: 100 },
    { metric: 'Trabajo en Equipo', value: 84, fullMark: 100 },
    { metric: 'Iniciativa', value: 71, fullMark: 100 }
  ];

  // Distribución de niveles de participación
  const participationLevels = [
    { level: 'Excelente (90-100%)', students: 12, color: '#10B981' },
    { level: 'Buena (80-89%)', students: 8, color: '#3B82F6' },
    { level: 'Regular (70-79%)', students: 6, color: '#F59E0B' },
    { level: 'Baja (<70%)', students: 4, color: '#EF4444' }
  ];

  const totalStudents = studentParticipation.length;
  const averageParticipation = Math.round(
    studentParticipation.reduce((acc, student) => acc + student.overall, 0) / totalStudents
  );
  const highParticipation = studentParticipation.filter(s => s.overall >= 90).length;
  const lowParticipation = studentParticipation.filter(s => s.overall < 75).length;

  const handleGenerateReport = () => {
    alert(`Generando reporte de participación en formato ${reportFormat.toUpperCase()}...`);
  };

  const handleEmailReport = () => {
    alert('Reporte enviado por correo electrónico exitosamente');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-4">
              <Link href="/reports">
                <Button variant="ghost" size="sm">
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Volver a Reportes
                </Button>
              </Link>
              <div className="h-6 w-px bg-gray-300" />
              <h1 className="text-2xl font-bold text-gray-900">Reportes de Participación</h1>
            </div>
            <div className="flex items-center space-x-3">
              <Button variant="outline" size="sm" onClick={handleEmailReport}>
                <Mail className="w-4 h-4 mr-2" />
                Enviar por Email
              </Button>
              <Button variant="primary" size="sm" onClick={handleGenerateReport}>
                <Download className="w-4 h-4 mr-2" />
                Generar Reporte
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Controls */}
        <Card className="p-6 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Métrica
              </label>
              <select 
                value={selectedMetric}
                onChange={(e) => setSelectedMetric(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary"
              >
                <option value="all">Todas las métricas</option>
                <option value="classes">Participación en clases</option>
                <option value="forums">Foros de discusión</option>
                <option value="assignments">Entrega de tareas</option>
                <option value="projects">Proyectos grupales</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Período
              </label>
              <select 
                value={dateRange}
                onChange={(e) => setDateRange(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary"
              >
                <option value="week">Esta semana</option>
                <option value="month">Este mes</option>
                <option value="quarter">Este trimestre</option>
                <option value="year">Este año</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Formato
              </label>
              <select 
                value={reportFormat}
                onChange={(e) => setReportFormat(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary"
              >
                <option value="pdf">PDF</option>
                <option value="excel">Excel</option>
                <option value="csv">CSV</option>
              </select>
            </div>
            
            <div className="flex items-end">
              <Button variant="outline" className="w-full">
                <Filter className="w-4 h-4 mr-2" />
                Filtros Avanzados
              </Button>
            </div>
          </div>
        </Card>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Estudiantes Evaluados</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">{totalStudents}</p>
              </div>
              <Users className="w-8 h-8 text-blue-600" />
            </div>
          </Card>
          
          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Participación Promedio</p>
                <p className="text-2xl font-bold text-green-600 mt-1">{averageParticipation}%</p>
                <div className="flex items-center mt-1">
                  <TrendingUp className="w-4 h-4 text-green-500 mr-1" />
                  <span className="text-sm text-green-600">+5% vs mes anterior</span>
                </div>
              </div>
              <Activity className="w-8 h-8 text-green-600" />
            </div>
          </Card>
          
          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Alta Participación</p>
                <p className="text-2xl font-bold text-green-600 mt-1">{highParticipation}</p>
                <p className="text-sm text-gray-500 mt-1">≥90% participación</p>
              </div>
              <Award className="w-8 h-8 text-green-600" />
            </div>
          </Card>
          
          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Requieren Apoyo</p>
                <p className="text-2xl font-bold text-red-600 mt-1">{lowParticipation}</p>
                <p className="text-sm text-gray-500 mt-1">&lt;75% participación</p>
              </div>
              <AlertTriangle className="w-8 h-8 text-red-600" />
            </div>
          </Card>
        </div>

        {/* Charts Row 1 */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* Weekly Participation Trend */}
          <Card className="p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Tendencia Semanal de Participación
            </h3>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={participationData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Line 
                  type="monotone" 
                  dataKey="participacion" 
                  stroke="#10B981" 
                  strokeWidth={3}
                  dot={{ fill: '#10B981', strokeWidth: 2, r: 4 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </Card>

          {/* Activity Participation */}
          <Card className="p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Participación por Tipo de Actividad
            </h3>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={activityParticipation}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="activity" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="participation" fill="#3B82F6" name="Actual" />
                <Bar dataKey="target" fill="#10B981" opacity={0.6} name="Meta" />
              </BarChart>
            </ResponsiveContainer>
          </Card>
        </div>

        {/* Charts Row 2 */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* Participation Metrics Radar */}
          <Card className="p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Métricas de Participación
            </h3>
            <ResponsiveContainer width="100%" height={300}>
              <RadarChart data={participationMetrics}>
                <PolarGrid />
                <PolarAngleAxis dataKey="metric" />
                <PolarRadiusAxis angle={90} domain={[0, 100]} />
                <Radar
                  name="Participación"
                  dataKey="value"
                  stroke="#3B82F6"
                  fill="#3B82F6"
                  fillOpacity={0.3}
                />
                <Tooltip />
              </RadarChart>
            </ResponsiveContainer>
          </Card>

          {/* Participation Levels Distribution */}
          <Card className="p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Distribución de Niveles de Participación
            </h3>
            <ResponsiveContainer width="100%" height={200}>
              <PieChart>
                <Pie
                  data={participationLevels}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={100}
                  dataKey="students"
                >
                  {participationLevels.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
            <div className="mt-4 space-y-2">
              {participationLevels.map((item, index) => (
                <div key={index} className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <div 
                      className="w-3 h-3 rounded-full" 
                      style={{ backgroundColor: item.color }}
                    />
                    <span className="text-sm text-gray-600">{item.level}</span>
                  </div>
                  <span className="text-sm font-medium">{item.students} estudiantes</span>
                </div>
              ))}
            </div>
          </Card>
        </div>

        {/* Student Participation Details */}
        <Card className="p-6 mb-8">
          <h3 className="text-lg font-semibold text-gray-900 mb-6">
            Detalle de Participación por Estudiante
          </h3>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Estudiante
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Participación General
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Clases
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Foros
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Tareas
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Nivel
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {studentParticipation.map((student, index) => (
                  <tr key={index} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center">
                          <Users className="w-5 h-5 text-gray-600" />
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">
                            {student.name}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="text-sm font-medium text-gray-900">
                          {student.overall}%
                        </div>
                        <div className="ml-2 w-16 bg-gray-200 rounded-full h-2">
                          <div 
                            className={`h-2 rounded-full ${
                              student.overall >= 90 ? 'bg-green-500' :
                              student.overall >= 80 ? 'bg-blue-500' :
                              student.overall >= 70 ? 'bg-yellow-500' : 'bg-red-500'
                            }`}
                            style={{ width: `${student.overall}%` }}
                          />
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {student.classes}%
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {student.forums}%
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {student.assignments}%
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                        student.overall >= 90 ? 'bg-green-100 text-green-800' :
                        student.overall >= 80 ? 'bg-blue-100 text-blue-800' :
                        student.overall >= 70 ? 'bg-yellow-100 text-yellow-800' :
                        'bg-red-100 text-red-800'
                      }`}>
                        {student.overall >= 90 ? 'Excelente' :
                         student.overall >= 80 ? 'Buena' :
                         student.overall >= 70 ? 'Regular' : 'Requiere Apoyo'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>

        {/* Insights and Recommendations */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          <Card className="p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Insights Clave
            </h3>
            <div className="space-y-4">
              <div className="flex items-start space-x-3">
                <TrendingUp className="w-5 h-5 text-green-600 mt-1" />
                <div>
                  <h4 className="font-medium text-gray-900">Tendencia Positiva</h4>
                  <p className="text-sm text-gray-600">La participación general ha aumentado un 5% este mes</p>
                </div>
              </div>
              <div className="flex items-start space-x-3">
                <Target className="w-5 h-5 text-blue-600 mt-1" />
                <div>
                  <h4 className="font-medium text-gray-900">Área de Oportunidad</h4>
                  <p className="text-sm text-gray-600">Los foros de discusión tienen el menor nivel de participación (78%)</p>
                </div>
              </div>
              <div className="flex items-start space-x-3">
                <Award className="w-5 h-5 text-yellow-600 mt-1" />
                <div>
                  <h4 className="font-medium text-gray-900">Fortaleza</h4>
                  <p className="text-sm text-gray-600">Excelente participación en evaluaciones (94%)</p>
                </div>
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Recomendaciones
            </h3>
            <div className="space-y-4">
              <div className="p-3 bg-blue-50 rounded-lg">
                <h4 className="font-medium text-blue-900 mb-1">Mejorar Foros</h4>
                <p className="text-sm text-blue-700">Implementar gamificación en foros de discusión para aumentar participación</p>
              </div>
              <div className="p-3 bg-green-50 rounded-lg">
                <h4 className="font-medium text-green-900 mb-1">Reconocimiento</h4>
                <p className="text-sm text-green-700">Reconocer públicamente a estudiantes con alta participación</p>
              </div>
              <div className="p-3 bg-yellow-50 rounded-lg">
                <h4 className="font-medium text-yellow-900 mb-1">Apoyo Personalizado</h4>
                <p className="text-sm text-yellow-700">Brindar apoyo adicional a estudiantes con baja participación</p>
              </div>
            </div>
          </Card>
        </div>

        {/* Action Buttons */}
        <Card className="p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Acciones del Reporte
          </h3>
          <div className="flex flex-wrap gap-4">
            <Button variant="primary" onClick={handleGenerateReport}>
              <Download className="w-4 h-4 mr-2" />
              Descargar Reporte Completo
            </Button>
            <Button variant="secondary" onClick={handleEmailReport}>
              <Mail className="w-4 h-4 mr-2" />
              Enviar por Correo
            </Button>
            <Button variant="outline">
              <BarChart3 className="w-4 h-4 mr-2" />
              Crear Dashboard Personalizado
            </Button>
            <Button variant="outline">
              <Clock className="w-4 h-4 mr-2" />
              Programar Envío Automático
            </Button>
          </div>
        </Card>
      </main>
    </div>
  );
}
