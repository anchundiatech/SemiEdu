'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { 
  ArrowLeft, 
  Users, 
  Calendar, 
  Download, 
  Filter,
  Mail,
  Clock,
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  CheckCircle,
  FileText,
  Printer
} from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell } from 'recharts';
import { mockAttendanceReports, mockCourses } from '@/utils/mockData';

export default function AttendanceReportsPage() {
  const [selectedCourse, setSelectedCourse] = useState<string>('all');
  const [dateRange, setDateRange] = useState<string>('month');
  const [reportFormat, setReportFormat] = useState<string>('pdf');

  // Datos de asistencia por día de la semana
  const weeklyAttendanceData = [
    { day: 'Lunes', attendance: 88, total: 100 },
    { day: 'Martes', attendance: 92, total: 100 },
    { day: 'Miércoles', attendance: 85, total: 100 },
    { day: 'Jueves', attendance: 90, total: 100 },
    { day: 'Viernes', attendance: 78, total: 100 }
  ];

  // Datos de tendencia mensual
  const monthlyTrendData = [
    { month: 'Ago', rate: 89 },
    { month: 'Sep', rate: 91 },
    { month: 'Oct', rate: 87 },
    { month: 'Nov', rate: 93 },
    { month: 'Dic', rate: 88 },
    { month: 'Ene', rate: 92 }
  ];

  // Datos de distribución de asistencia
  const attendanceDistribution = [
    { range: '90-100%', students: 18, color: '#10B981' },
    { range: '80-89%', students: 8, color: '#3B82F6' },
    { range: '70-79%', students: 3, color: '#F59E0B' },
    { range: '60-69%', students: 1, color: '#EF4444' }
  ];

  const totalStudents = mockAttendanceReports.length;
  const averageAttendance = Math.round(
    mockAttendanceReports.reduce((acc, report) => acc + report.attendanceRate, 0) / totalStudents
  );
  const excellentAttendance = mockAttendanceReports.filter(r => r.attendanceRate >= 95).length;
  const poorAttendance = mockAttendanceReports.filter(r => r.attendanceRate < 80).length;

  const handleGenerateReport = () => {
    // Simular generación de reporte
    alert(`Generando reporte de asistencia en formato ${reportFormat.toUpperCase()}...`);
  };

  const handleEmailReport = () => {
    // Simular envío por email
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
              <h1 className="text-2xl font-bold text-gray-900">Reportes de Asistencia</h1>
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
                Curso
              </label>
              <select 
                value={selectedCourse}
                onChange={(e) => setSelectedCourse(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary"
              >
                <option value="all">Todos los cursos</option>
                {mockCourses.map(course => (
                  <option key={course.id} value={course.id}>
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
                <p className="text-sm font-medium text-gray-600">Total Estudiantes</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">{totalStudents}</p>
              </div>
              <Users className="w-8 h-8 text-blue-600" />
            </div>
          </Card>
          
          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Asistencia Promedio</p>
                <p className="text-2xl font-bold text-green-600 mt-1">{averageAttendance}%</p>
                <div className="flex items-center mt-1">
                  <TrendingUp className="w-4 h-4 text-green-500 mr-1" />
                  <span className="text-sm text-green-600">+3% vs mes anterior</span>
                </div>
              </div>
              <TrendingUp className="w-8 h-8 text-green-600" />
            </div>
          </Card>
          
          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Asistencia Excelente</p>
                <p className="text-2xl font-bold text-green-600 mt-1">{excellentAttendance}</p>
                <p className="text-sm text-gray-500 mt-1">≥95% asistencia</p>
              </div>
              <CheckCircle className="w-8 h-8 text-green-600" />
            </div>
          </Card>
          
          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Requieren Atención</p>
                <p className="text-2xl font-bold text-red-600 mt-1">{poorAttendance}</p>
                <p className="text-sm text-gray-500 mt-1">&lt;80% asistencia</p>
              </div>
              <AlertTriangle className="w-8 h-8 text-red-600" />
            </div>
          </Card>
        </div>

        {/* Charts Row */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* Weekly Attendance */}
          <Card className="p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Asistencia por Día de la Semana
            </h3>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={weeklyAttendanceData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="day" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="attendance" fill="#3B82F6" />
              </BarChart>
            </ResponsiveContainer>
          </Card>

          {/* Monthly Trend */}
          <Card className="p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Tendencia Mensual de Asistencia
            </h3>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={monthlyTrendData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Line 
                  type="monotone" 
                  dataKey="rate" 
                  stroke="#10B981" 
                  strokeWidth={3}
                  dot={{ fill: '#10B981', strokeWidth: 2, r: 4 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </Card>
        </div>

        {/* Attendance Distribution and Detailed Table */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
          {/* Attendance Distribution */}
          <Card className="p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Distribución de Asistencia
            </h3>
            <ResponsiveContainer width="100%" height={200}>
              <PieChart>
                <Pie
                  data={attendanceDistribution}
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={80}
                  dataKey="students"
                >
                  {attendanceDistribution.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
            <div className="mt-4 space-y-2">
              {attendanceDistribution.map((item, index) => (
                <div key={index} className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <div 
                      className="w-3 h-3 rounded-full" 
                      style={{ backgroundColor: item.color }}
                    />
                    <span className="text-sm text-gray-600">{item.range}</span>
                  </div>
                  <span className="text-sm font-medium">{item.students} estudiantes</span>
                </div>
              ))}
            </div>
          </Card>

          {/* Detailed Attendance Table */}
          <div className="lg:col-span-2">
            <Card className="p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Detalle de Asistencia por Estudiante
              </h3>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Estudiante
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Clases Totales
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Asistidas
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Porcentaje
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Estado
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {mockAttendanceReports.map((report, index) => (
                      <tr key={index} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900">
                            {report.studentName}
                          </div>
                          <div className="text-sm text-gray-500">
                            {report.course}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {report.totalClasses}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {report.attendedClasses}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="text-sm font-medium text-gray-900">
                              {report.attendanceRate}%
                            </div>
                            <div className="ml-2 w-16 bg-gray-200 rounded-full h-2">
                              <div 
                                className={`h-2 rounded-full ${
                                  report.attendanceRate >= 95 ? 'bg-green-500' :
                                  report.attendanceRate >= 85 ? 'bg-blue-500' :
                                  report.attendanceRate >= 75 ? 'bg-yellow-500' : 'bg-red-500'
                                }`}
                                style={{ width: `${report.attendanceRate}%` }}
                              />
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                            report.attendanceRate >= 95 ? 'bg-green-100 text-green-800' :
                            report.attendanceRate >= 85 ? 'bg-blue-100 text-blue-800' :
                            report.attendanceRate >= 75 ? 'bg-yellow-100 text-yellow-800' :
                            'bg-red-100 text-red-800'
                          }`}>
                            {report.attendanceRate >= 95 ? 'Excelente' :
                             report.attendanceRate >= 85 ? 'Buena' :
                             report.attendanceRate >= 75 ? 'Regular' : 'Requiere Atención'}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Card>
          </div>
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
              <Printer className="w-4 h-4 mr-2" />
              Imprimir
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
