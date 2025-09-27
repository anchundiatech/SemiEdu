'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import {
  ArrowLeft,
  BookOpen,
  Calendar,
  Clock,
  AlertTriangle,
  CheckCircle,
  Filter,
  Search,
  Download
} from 'lucide-react';
import { mockStudents } from '@/utils/mockData';

export default function TaskNotificationsPage() {
  const [filter, setFilter] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState<string>('');

  // Recopilar todas las tareas de todos los estudiantes
  const allTasks = mockStudents.flatMap(student =>
    student.assignments.map(assignment => ({
      ...assignment,
      studentName: student.name,
      studentId: student.id
    }))
  );

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'submitted': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'graded': return 'bg-green-100 text-green-800 border-green-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending': return AlertTriangle;
      case 'submitted': return Clock;
      case 'graded': return CheckCircle;
      default: return BookOpen;
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'pending': return 'Pendiente';
      case 'submitted': return 'Entregada';
      case 'graded': return 'Calificada';
      default: return status;
    }
  };

  const filteredTasks = allTasks.filter(task => {
    const matchesFilter = filter === 'all' || task.status === filter;
    const matchesSearch = task.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         task.course.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         task.studentName.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  const taskStats = {
    total: allTasks.length,
    pending: allTasks.filter(t => t.status === 'pending').length,
    submitted: allTasks.filter(t => t.status === 'submitted').length,
    graded: allTasks.filter(t => t.status === 'graded').length
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = date.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays < 0) {
      return `Vencida hace ${Math.abs(diffDays)} días`;
    } else if (diffDays === 0) {
      return 'Vence hoy';
    } else if (diffDays === 1) {
      return 'Vence mañana';
    } else {
      return `Vence en ${diffDays} días`;
    }
  };

  const isOverdue = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    return date < now;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-4">
              <Link href="/notifications">
                <Button variant="ghost" size="sm">
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Volver a Notificaciones
                </Button>
              </Link>
              <div className="h-6 w-px bg-gray-300" />
              <h1 className="text-2xl font-bold text-gray-900">Notificaciones de Tareas</h1>
            </div>
            <div className="flex items-center space-x-3">
              <Button variant="outline" size="sm">
                <Download className="w-4 h-4 mr-2" />
                Exportar
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Tareas</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">{taskStats.total}</p>
              </div>
              <BookOpen className="w-8 h-8 text-blue-600" />
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Pendientes</p>
                <p className="text-2xl font-bold text-yellow-600 mt-1">{taskStats.pending}</p>
              </div>
              <AlertTriangle className="w-8 h-8 text-yellow-600" />
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Entregadas</p>
                <p className="text-2xl font-bold text-blue-600 mt-1">{taskStats.submitted}</p>
              </div>
              <Clock className="w-8 h-8 text-blue-600" />
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Calificadas</p>
                <p className="text-2xl font-bold text-green-600 mt-1">{taskStats.graded}</p>
              </div>
              <CheckCircle className="w-8 h-8 text-green-600" />
            </div>
          </Card>
        </div>

        {/* Filters and Search */}
        <Card className="p-6 mb-8">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <input
                  type="text"
                  placeholder="Buscar tareas, cursos o estudiantes..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary"
                />
              </div>
            </div>
            <div className="flex gap-2">
              {['all', 'pending', 'submitted', 'graded'].map((status) => (
                <Button
                  key={status}
                  variant={filter === status ? 'primary' : 'outline'}
                  size="sm"
                  onClick={() => setFilter(status)}
                >
                  {status === 'all' ? 'Todas' :
                   status === 'pending' ? 'Pendientes' :
                   status === 'submitted' ? 'Entregadas' : 'Calificadas'}
                </Button>
              ))}
            </div>
          </div>
        </Card>

        {/* Tasks List */}
        <div className="space-y-4">
          {filteredTasks.length === 0 ? (
            <Card className="p-8 text-center">
              <BookOpen className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                No se encontraron tareas
              </h3>
              <p className="text-gray-600">
                No hay tareas que coincidan con los filtros seleccionados.
              </p>
            </Card>
          ) : (
            filteredTasks.map((task) => {
              const StatusIcon = getStatusIcon(task.status);
              const overdue = task.status === 'pending' && isOverdue(task.dueDate);

              return (
                <Card
                  key={`${task.id}-${task.studentId}`}
                  className={`p-6 hover:shadow-lg transition-shadow ${
                    overdue ? 'border-l-4 border-l-red-500 bg-red-50/30' : ''
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-start space-x-4 flex-1">
                      <div className={`p-3 rounded-full ${
                        task.status === 'pending' ? 'bg-yellow-100' :
                        task.status === 'submitted' ? 'bg-blue-100' :
                        'bg-green-100'
                      }`}>
                        <StatusIcon className={`w-5 h-5 ${
                          task.status === 'pending' ? 'text-yellow-600' :
                          task.status === 'submitted' ? 'text-blue-600' :
                          'text-green-600'
                        }`} />
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center space-x-2 mb-2">
                          <h3 className="text-lg font-semibold text-gray-900">
                            {task.title}
                          </h3>
                          {overdue && (
                            <span className="bg-red-100 text-red-800 text-xs font-medium px-2 py-1 rounded-full">
                              Vencida
                            </span>
                          )}
                        </div>

                        <div className="space-y-2">
                          <div className="flex items-center space-x-4 text-sm text-gray-600">
                            <span className="flex items-center">
                              <BookOpen className="w-4 h-4 mr-1" />
                              {task.course}
                            </span>
                            <span className="flex items-center">
                              <Calendar className="w-4 h-4 mr-1" />
                              {formatDate(task.dueDate)}
                            </span>
                          </div>

                          <p className="text-sm text-gray-600">
                            Estudiante: <span className="font-medium">{task.studentName}</span>
                          </p>

                          {task.grade && (
                            <p className="text-sm text-gray-600">
                              Calificación: <span className="font-medium text-green-600">{task.grade}/100</span>
                            </p>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="flex flex-col items-end space-y-2">
                      <span className={`px-3 py-1 text-xs font-medium rounded-full border ${getStatusColor(task.status)}`}>
                        {getStatusText(task.status)}
                      </span>

                      <div className="text-xs text-gray-500">
                        {new Date(task.dueDate).toLocaleDateString('es-ES')}
                      </div>
                    </div>
                  </div>
                </Card>
              );
            })
          )}
        </div>

        {/* Summary */}
        {filteredTasks.length > 0 && (
          <Card className="p-6 mt-8">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Resumen de Tareas
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <h4 className="font-medium text-gray-900 mb-2">Próximas a Vencer</h4>
                <p className="text-2xl font-bold text-yellow-600">
                  {filteredTasks.filter(t => {
                    const date = new Date(t.dueDate);
                    const now = new Date();
                    const diffDays = Math.ceil((date.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
                    return t.status === 'pending' && diffDays <= 3 && diffDays >= 0;
                  }).length}
                </p>
                <p className="text-sm text-gray-600">En los próximos 3 días</p>
              </div>

              <div>
                <h4 className="font-medium text-gray-900 mb-2">Vencidas</h4>
                <p className="text-2xl font-bold text-red-600">
                  {filteredTasks.filter(t => t.status === 'pending' && isOverdue(t.dueDate)).length}
                </p>
                <p className="text-sm text-gray-600">Requieren atención inmediata</p>
              </div>

              <div>
                <h4 className="font-medium text-gray-900 mb-2">Tasa de Entrega</h4>
                <p className="text-2xl font-bold text-green-600">
                  {taskStats.total > 0 ? Math.round((taskStats.submitted + taskStats.graded) / taskStats.total * 100) : 0}%
                </p>
                <p className="text-sm text-gray-600">Tareas entregadas</p>
              </div>
            </div>
          </Card>
        )}
      </main>
    </div>
  );
}
