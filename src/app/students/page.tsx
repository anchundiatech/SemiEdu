'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { 
  ArrowLeft, 
  Users, 
  Search, 
  Filter,
  Download,
  Mail,
  Phone,
  BookOpen,
  TrendingUp,
  AlertTriangle,
  Award,
  Eye,
  Edit,
  MoreVertical
} from 'lucide-react';
import { mockStudents } from '@/utils/mockData';

export default function StudentsPage() {
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [filterStatus, setFilterStatus] = useState<string>('all');

  const filteredStudents = mockStudents.filter(student => {
    const matchesSearch = student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         student.email.toLowerCase().includes(searchTerm.toLowerCase());
    
    let matchesFilter = true;
    if (filterStatus === 'excellent') matchesFilter = student.progress >= 90;
    else if (filterStatus === 'good') matchesFilter = student.progress >= 80 && student.progress < 90;
    else if (filterStatus === 'needs_attention') matchesFilter = student.progress < 80;
    
    return matchesSearch && matchesFilter;
  });

  const studentStats = {
    total: mockStudents.length,
    excellent: mockStudents.filter(s => s.progress >= 90).length,
    good: mockStudents.filter(s => s.progress >= 80 && s.progress < 90).length,
    needsAttention: mockStudents.filter(s => s.progress < 80).length,
    averageProgress: Math.round(mockStudents.reduce((acc, s) => acc + s.progress, 0) / mockStudents.length),
    averageAttendance: Math.round(mockStudents.reduce((acc, s) => acc + s.attendance, 0) / mockStudents.length)
  };

  const getProgressColor = (progress: number) => {
    if (progress >= 90) return 'text-green-600';
    if (progress >= 80) return 'text-blue-600';
    if (progress >= 70) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getProgressBg = (progress: number) => {
    if (progress >= 90) return 'bg-green-500';
    if (progress >= 80) return 'bg-blue-500';
    if (progress >= 70) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  const getStatusBadge = (progress: number) => {
    if (progress >= 90) return { text: 'Excelente', class: 'bg-green-100 text-green-800' };
    if (progress >= 80) return { text: 'Bueno', class: 'bg-blue-100 text-blue-800' };
    if (progress >= 70) return { text: 'Regular', class: 'bg-yellow-100 text-yellow-800' };
    return { text: 'Requiere Atención', class: 'bg-red-100 text-red-800' };
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-4">
              <Link href="/">
                <Button variant="ghost" size="sm">
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Volver al Inicio
                </Button>
              </Link>
              <div className="h-6 w-px bg-gray-300" />
              <h1 className="text-2xl font-bold text-gray-900">Gestión de Estudiantes</h1>
            </div>
            <div className="flex items-center space-x-3">
              <Button variant="outline" size="sm">
                <Download className="w-4 h-4 mr-2" />
                Exportar Lista
              </Button>
              <Button variant="primary" size="sm">
                <Users className="w-4 h-4 mr-2" />
                Agregar Estudiante
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Estudiantes</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">{studentStats.total}</p>
              </div>
              <Users className="w-8 h-8 text-blue-600" />
            </div>
          </Card>
          
          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Progreso Promedio</p>
                <p className="text-2xl font-bold text-green-600 mt-1">{studentStats.averageProgress}%</p>
              </div>
              <TrendingUp className="w-8 h-8 text-green-600" />
            </div>
          </Card>
          
          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Estudiantes Destacados</p>
                <p className="text-2xl font-bold text-green-600 mt-1">{studentStats.excellent}</p>
              </div>
              <Award className="w-8 h-8 text-green-600" />
            </div>
          </Card>
          
          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Requieren Atención</p>
                <p className="text-2xl font-bold text-red-600 mt-1">{studentStats.needsAttention}</p>
              </div>
              <AlertTriangle className="w-8 h-8 text-red-600" />
            </div>
          </Card>
        </div>

        {/* Search and Filters */}
        <Card className="p-6 mb-8">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <input
                  type="text"
                  placeholder="Buscar estudiantes por nombre o email..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary"
                />
              </div>
            </div>
            <div className="flex gap-2">
              {[
                { key: 'all', label: 'Todos' },
                { key: 'excellent', label: 'Excelentes' },
                { key: 'good', label: 'Buenos' },
                { key: 'needs_attention', label: 'Requieren Atención' }
              ].map((filter) => (
                <Button
                  key={filter.key}
                  variant={filterStatus === filter.key ? 'primary' : 'outline'}
                  size="sm"
                  onClick={() => setFilterStatus(filter.key)}
                >
                  {filter.label}
                </Button>
              ))}
            </div>
          </div>
        </Card>

        {/* Students Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
          {filteredStudents.map((student) => {
            const status = getStatusBadge(student.progress);
            
            return (
              <Card key={student.id} className="p-6 hover:shadow-lg transition-shadow">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center space-x-3">
                    <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-semibold">
                      {student.name.split(' ').map(n => n[0]).join('')}
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900">{student.name}</h3>
                      <p className="text-sm text-gray-500">{student.email}</p>
                    </div>
                  </div>
                  <button className="text-gray-400 hover:text-gray-600">
                    <MoreVertical className="w-4 h-4" />
                  </button>
                </div>

                <div className="space-y-4">
                  {/* Progress */}
                  <div>
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-sm font-medium text-gray-700">Progreso Académico</span>
                      <span className={`text-sm font-semibold ${getProgressColor(student.progress)}`}>
                        {student.progress}%
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className={`h-2 rounded-full ${getProgressBg(student.progress)}`}
                        style={{ width: `${student.progress}%` }}
                      />
                    </div>
                  </div>

                  {/* Attendance */}
                  <div>
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-sm font-medium text-gray-700">Asistencia</span>
                      <span className="text-sm font-semibold text-green-600">
                        {student.attendance}%
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className="h-2 rounded-full bg-green-500"
                        style={{ width: `${student.attendance}%` }}
                      />
                    </div>
                  </div>

                  {/* Status Badge */}
                  <div className="flex justify-between items-center">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${status.class}`}>
                      {status.text}
                    </span>
                    <span className="text-sm text-gray-500">
                      {student.assignments.length} tareas
                    </span>
                  </div>

                  {/* Recent Assignments */}
                  <div>
                    <h4 className="text-sm font-medium text-gray-700 mb-2">Tareas Recientes</h4>
                    <div className="space-y-1">
                      {student.assignments.slice(0, 2).map((assignment) => (
                        <div key={assignment.id} className="flex items-center justify-between text-xs">
                          <span className="text-gray-600 truncate">{assignment.title}</span>
                          <span className={`px-2 py-1 rounded-full ${
                            assignment.status === 'graded' ? 'bg-green-100 text-green-700' :
                            assignment.status === 'submitted' ? 'bg-blue-100 text-blue-700' :
                            'bg-yellow-100 text-yellow-700'
                          }`}>
                            {assignment.status === 'graded' ? 'Calificada' :
                             assignment.status === 'submitted' ? 'Entregada' : 'Pendiente'}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex space-x-2 pt-4 border-t border-gray-100">
                    <Button variant="outline" size="sm" className="flex-1">
                      <Eye className="w-4 h-4 mr-1" />
                      Ver Perfil
                    </Button>
                    <Button variant="outline" size="sm" className="flex-1">
                      <Mail className="w-4 h-4 mr-1" />
                      Contactar
                    </Button>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>

        {/* No Results */}
        {filteredStudents.length === 0 && (
          <Card className="p-8 text-center">
            <Users className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              No se encontraron estudiantes
            </h3>
            <p className="text-gray-600">
              No hay estudiantes que coincidan con los filtros seleccionados.
            </p>
          </Card>
        )}

        {/* Summary Footer */}
        {filteredStudents.length > 0 && (
          <Card className="p-6 mt-8">
            <div className="text-center">
              <p className="text-gray-600">
                Mostrando {filteredStudents.length} de {mockStudents.length} estudiantes
              </p>
              <div className="mt-4 flex justify-center space-x-8">
                <div className="text-center">
                  <p className="text-2xl font-bold text-green-600">{studentStats.excellent}</p>
                  <p className="text-sm text-gray-600">Excelentes</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-blue-600">{studentStats.good}</p>
                  <p className="text-sm text-gray-600">Buenos</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-red-600">{studentStats.needsAttention}</p>
                  <p className="text-sm text-gray-600">Requieren Atención</p>
                </div>
              </div>
            </div>
          </Card>
        )}
      </main>
    </div>
  );
}
