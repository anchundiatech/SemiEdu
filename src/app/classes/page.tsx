'use client';

import React, { useState } from 'react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { useSession } from 'next-auth/react';
import {
  BookOpen,
  Users,
  Calendar,
  Clock,
  Plus,
  Search,
  Filter,
  MoreVertical,
  ExternalLink,
  User,
  GraduationCap
} from 'lucide-react';
import { useGoogleClassroomData } from '@/hooks/useGoogleClassroomData';
import AuthGuard from '@/components/auth/AuthGuard';
import ClassroomLoading from '@/components/ui/ClassroomLoading';
import DashboardSidebar from '../dashboard/layout';

export default function ClassesPage() {
  const { data: session } = useSession();
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const classroomData = useGoogleClassroomData(); //Datos reales de la api de google classroom
  const { loading, error } = classroomData;

  //Datos reales de la api de google classroom
  const ClassData = classroomData.courses || [];


  const userRole = session?.user?.role;

  const filteredClasses = ClassData.filter((cls: any) => {
    const matchesSearch = cls.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         cls.section?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         cls.teacherName?.toLowerCase().includes(searchTerm.toLowerCase());

    // Mapear el estado de Google Classroom a nuestros filtros
    const getStatus = (courseState: string) => {
      switch (courseState) {
        case 'ACTIVE': return 'active';
        case 'ARCHIVED': return 'completed';
        case 'PROVISIONED': return 'pending';
        default: return 'active';
      }
    };

    const matchesFilter = filterStatus === 'all' || getStatus(cls.courseState || 'ACTIVE') === filterStatus;

    return matchesSearch && matchesFilter;
  });

  const getStatusBadge = (status: string) => {
    const styles = {
      active: 'bg-green-100 text-green-800',
      completed: 'bg-blue-100 text-blue-800',
      pending: 'bg-yellow-100 text-yellow-800'
    };

    const labels = {
      active: 'Activa',
      completed: 'Completada',
      pending: 'Pendiente'
    };

    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${styles[status as keyof typeof styles]}`}>
        {labels[status as keyof typeof labels]}
      </span>
    );
  };

  const formatNextClass = (dateString: string | null) => {
    if (!dateString) return 'Curso finalizado';

    const date = new Date(dateString);
    const now = new Date();
    const diffHours = Math.abs(date.getTime() - now.getTime()) / (1000 * 60 * 60);

    if (diffHours < 24) {
      return `Hoy ${date.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })}`;
    } else if (diffHours < 48) {
      return `Mañana ${date.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })}`;
    } else {
      return date.toLocaleDateString('es-ES', {
        weekday: 'short',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    }
  };

  return (
    <AuthGuard>
      <div className="p-6">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold text-gray-900">
                  {userRole === 'docente' ? 'Mis Clases' : 'Clases'}
                </h1>
                <p className="text-gray-600 mt-1">
                  {userRole === 'docente'
                    ? 'Gestiona tus clases y estudiantes'
                    : 'Explora tus clases inscritas'
                  }
                </p>
              </div>
              {userRole === 'docente' && (
                <Button className="flex items-center gap-2">
                  <Plus className="w-4 h-4" />
                  Nueva Clase
                </Button>
              )}
            </div>
          </div>


        {/* Filtros y búsqueda */}
        <div className="mb-6 flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                placeholder="Buscar clases, códigos o profesores..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary"
              />
            </div>
          </div>
          <div className="flex gap-2">
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary"
            >
              <option value="all">Todas las clases</option>
              <option value="active">Activas</option>
              <option value="completed">Completadas</option>
              <option value="pending">Pendientes</option>
            </select>
            <Button variant="outline" size="sm">
              <Filter className="w-4 h-4 mr-2" />
              Filtros
            </Button>
          </div>
        </div>

        {/* Estadísticas rápidas */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Clases</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">{ClassData.length}</p>
              </div>
              <div className="p-3 rounded-full bg-blue-100">
                <BookOpen className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Clases Activas</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">
                  {ClassData.filter((c: any) => c.courseState === 'ACTIVE').length}
                </p>
              </div>
              <div className="p-3 rounded-full bg-green-100">
                <GraduationCap className="w-6 h-6 text-green-600" />
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">
                  {userRole === 'docente' ? 'Total Tareas' : 'Tareas Asignadas'}
                </p>
                <p className="text-2xl font-bold text-gray-900 mt-1">
                  {classroomData.assignments?.length || 0}
                </p>
              </div>
              <div className="p-3 rounded-full bg-purple-100">
                <Users className="w-6 h-6 text-purple-600" />
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Tareas Completadas</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">
                  {classroomData.completedAssignments || 0}
                </p>
              </div>
              <div className="p-3 rounded-full bg-yellow-100">
                <Clock className="w-6 h-6 text-yellow-600" />
              </div>
            </div>
          </Card>
        </div>

        {/* Loading State */}
        {loading && (
          <ClassroomLoading
            message="Cargando tus cursos de Google Classroom..."
            showSteps={true}
          />
        )}

        {/* Error State */}
        {error && (
          <div className="text-center py-12">
            <BookOpen className="w-12 h-12 text-red-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">Error al cargar cursos</h3>
            <p className="text-gray-600">{error}</p>
          </div>
        )}

        {/* Lista de clases */}
        {!loading && !error && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {filteredClasses.map((cls: any) => {
              const getStatus = (courseState: string) => {
                switch (courseState) {
                  case 'ACTIVE': return 'active';
                  case 'ARCHIVED': return 'completed';
                  case 'PROVISIONED': return 'pending';
                  default: return 'active';
                }
              };

              const status = getStatus(cls.courseState || 'ACTIVE');
              const courseAssignments = classroomData.assignments?.filter((assignment: any) => assignment.courseId === cls.id) || [];
              const publishedAssignments = courseAssignments.filter((assignment: any) => assignment.state === 'PUBLISHED');

              return (
                <Card key={cls.id} className="p-6 hover:shadow-lg transition-shadow">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-lg font-semibold text-gray-900">{cls.name}</h3>
                        {getStatusBadge(status)}
                      </div>
                      {cls.section && (
                        <p className="text-sm text-gray-600 mb-1">Sección: {cls.section}</p>
                      )}
                      {cls.descriptionHeading && (
                        <p className="text-sm text-gray-600">{cls.descriptionHeading}</p>
                      )}
                    </div>
                    <Button variant="ghost" size="sm">
                      <MoreVertical className="w-4 h-4" />
                    </Button>
                  </div>

                  <div className="space-y-3">
                    {cls.teacherName && (
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <User className="w-4 h-4" />
                        <span>{cls.teacherName}</span>
                      </div>
                    )}

                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <BookOpen className="w-4 h-4" />
                      <span>{publishedAssignments.length} tareas publicadas</span>
                    </div>

                    {cls.room && (
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <Calendar className="w-4 h-4" />
                        <span>Aula: {cls.room}</span>
                      </div>
                    )}

                    {cls.enrollmentCode && (
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <Clock className="w-4 h-4" />
                        <span>Código: {cls.enrollmentCode}</span>
                      </div>
                    )}

                    {status === 'active' && publishedAssignments.length > 0 && (
                      <div>
                        <div className="flex items-center justify-between text-sm text-gray-600 mb-1">
                          <span>Progreso del curso</span>
                          <span>{Math.round((classroomData.completedAssignments || 0) / (classroomData.assignments?.length || 1) * 100)}%</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div
                            className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                            style={{ width: `${Math.round((classroomData.completedAssignments || 0) / (classroomData.assignments?.length || 1) * 100)}%` }}
                          />
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="flex gap-2 mt-6">
                    <Button
                      variant="primary"
                      size="sm"
                      className="flex-1"
                      onClick={() => window.open(cls.alternateLink, '_blank')}
                    >
                      <ExternalLink className="w-4 h-4 mr-2" />
                      Ver en Classroom
                    </Button>
                    {userRole === 'docente' && (
                      <Button variant="outline" size="sm">
                        Gestionar
                      </Button>
                    )}
                  </div>
                </Card>
              );
            })}
          </div>
        )}

        {!loading && !error && filteredClasses.length === 0 && (
          <div className="text-center py-12">
            <BookOpen className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No se encontraron clases</h3>
            <p className="text-gray-600">
              {searchTerm
                ? 'Intenta con otros términos de búsqueda'
                : ClassData.length === 0
                  ? 'No tienes clases en Google Classroom'
                  : 'No hay clases que coincidan con el filtro seleccionado'
              }
            </p>
          </div>
        )}
        </div>
      </div>
    </AuthGuard>
  );
}
