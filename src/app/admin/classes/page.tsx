'use client';

import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { BookOpen, Users, Calendar, ExternalLink, RefreshCw } from 'lucide-react';

interface ClassroomClass {
  id: string;
  name: string;
  section?: string;
  description?: string;
  room?: string;
  enrollmentCode?: string;
  courseState: 'ACTIVE' | 'ARCHIVED' | 'PROVISIONED' | 'DECLINED' | 'SUSPENDED';
  creationTime: string;
  updateTime: string;
  alternateLink?: string;
  teacherFolder?: {
    id: string;
    title: string;
    alternateLink: string;
  };
  studentsCount?: number;
  assignmentsCount?: number;
}

export default function AdminClassesPage() {
  const [classes, setClasses] = useState<ClassroomClass[]>([]);
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);
  const [error, setError] = useState('');

  const loadClasses = async () => {
    try {
      setLoading(true);
      setError('');
      
      const response = await fetch('/api/google/classes');
      const data = await response.json();
      
      if (data.success) {
        setClasses(data.classes || []);
      } else {
        setError(data.error || 'Error cargando clases');
      }
    } catch (err) {
      console.error('Error cargando clases:', err);
      setError('Error de conexión al cargar clases');
    } finally {
      setLoading(false);
    }
  };

  const syncClasses = async () => {
    try {
      setSyncing(true);
      setError('');
      
      const response = await fetch('/api/google/sync', {
        method: 'POST'
      });
      
      const data = await response.json();
      
      if (data.success) {
        await loadClasses();
      } else {
        setError(data.error || 'Error sincronizando clases');
      }
    } catch (err) {
      console.error('Error sincronizando:', err);
      setError('Error de conexión al sincronizar');
    } finally {
      setSyncing(false);
    }
  };

  useEffect(() => {
    loadClasses();
  }, []);

  const getStateColor = (state: string) => {
    switch (state) {
      case 'ACTIVE': return 'bg-green-100 text-green-800 px-2 py-1 rounded-full text-xs font-medium';
      case 'ARCHIVED': return 'bg-gray-100 text-gray-800 px-2 py-1 rounded-full text-xs font-medium';
      case 'PROVISIONED': return 'bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-xs font-medium';
      default: return 'bg-yellow-100 text-yellow-800 px-2 py-1 rounded-full text-xs font-medium';
    }
  };

  const getStateText = (state: string) => {
    switch (state) {
      case 'ACTIVE': return 'Activo';
      case 'ARCHIVED': return 'Archivado';
      case 'PROVISIONED': return 'Provisionado';
      case 'DECLINED': return 'Rechazado';
      case 'SUSPENDED': return 'Suspendido';
      default: return state;
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto p-6">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <RefreshCw className="h-8 w-8 animate-spin mx-auto mb-4 text-blue-600" />
            <p className="text-gray-600">Cargando clases...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Mis Clases</h1>
          <p className="text-gray-600 mt-2">
            Gestiona tus clases sincronizadas desde Google Classroom
          </p>
        </div>
        <Button 
          onClick={syncClasses} 
          disabled={syncing}
          className="flex items-center gap-2"
        >
          <RefreshCw className={`h-4 w-4 ${syncing ? 'animate-spin' : ''}`} />
          {syncing ? 'Sincronizando...' : 'Sincronizar'}
        </Button>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
          <p className="text-red-800">{error}</p>
        </div>
      )}

      {classes.length === 0 && !loading && (
        <div className="text-center py-12">
          <BookOpen className="h-16 w-16 mx-auto text-gray-400 mb-4" />
          <h3 className="text-xl font-semibold text-gray-900 mb-2">
            No hay clases disponibles
          </h3>
          <p className="text-gray-600 mb-4">
            Sincroniza tus clases desde Google Classroom para comenzar.
          </p>
          <Button onClick={syncClasses} disabled={syncing}>
            <RefreshCw className={`h-4 w-4 mr-2 ${syncing ? 'animate-spin' : ''}`} />
            {syncing ? 'Sincronizando..' : 'Sincronizar Clases'}
          </Button>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {classes.map((classItem) => (
          <Card key={classItem.id} className="hover:shadow-lg transition-shadow p-6">
            <div className="flex justify-between items-start mb-4">
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-gray-900 mb-1">
                  {classItem.name}
                </h3>
                {classItem.section && (
                  <p className="text-sm text-gray-600">
                    {classItem.section}
                  </p>
                )}
              </div>
              <span className={getStateColor(classItem.courseState)}>
                {getStateText(classItem.courseState)}
              </span>
            </div>
            
            {classItem.description && (
              <p className="text-sm text-gray-600 mb-4 line-clamp-3">
                {classItem.description}
              </p>
            )}
            
            <div className="space-y-2 mb-4">
              {classItem.room && (
                <div className="flex items-center text-sm text-gray-600">
                  <Calendar className="h-4 w-4 mr-2" />
                  Aula: {classItem.room}
                </div>
              )}
              
              {classItem.enrollmentCode && (
                <div className="flex items-center text-sm text-gray-600">
                  <BookOpen className="h-4 w-4 mr-2" />
                  Código: {classItem.enrollmentCode}
                </div>
              )}
              
              <div className="flex items-center text-sm text-gray-600">
                <Users className="h-4 w-4 mr-2" />
                {classItem.studentsCount || 0} estudiantes
              </div>
            </div>
            
            {classItem.alternateLink && (
              <Button 
                variant="outline" 
                size="sm" 
                className="w-full"
                onClick={() => window.open(classItem.alternateLink, '_blank')}
              >
                <ExternalLink className="h-4 w-4 mr-2" />
                Ver en Google Classroom
              </Button>
            )}
          </Card>
        ))}
      </div>
      
      {classes.length > 0 && (
        <div className="mt-8 text-center text-sm text-gray-500">
          Mostrando {classes.length} clase{classes.length !== 1 ? 's' : ''}
        </div>
      )}
    </div>
  );
}
