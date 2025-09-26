'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { 
  ArrowLeft, 
  Calendar, 
  Clock, 
  MapPin, 
  Users,
  AlertTriangle,
  Info,
  CheckCircle,
  Filter,
  Download,
  Bell
} from 'lucide-react';

export default function CalendarNotificationsPage() {
  const [filter, setFilter] = useState<string>('all');

  // Datos mock para cambios de calendario
  const calendarChanges = [
    {
      id: '1',
      type: 'room_change',
      title: 'Cambio de Aula - Historia Universal',
      description: 'La clase de Historia Universal se ha movido del aula 203 al aula 205',
      oldValue: 'Aula 203',
      newValue: 'Aula 205',
      date: '2024-01-15T10:00:00Z',
      affectedStudents: 28,
      priority: 'medium',
      status: 'active'
    },
    {
      id: '2',
      type: 'time_change',
      title: 'Cambio de Horario - Matemáticas Avanzadas',
      description: 'La clase de Matemáticas Avanzadas se ha movido de 9:00 AM a 10:30 AM',
      oldValue: '9:00 AM',
      newValue: '10:30 AM',
      date: '2024-01-14T08:00:00Z',
      affectedStudents: 25,
      priority: 'high',
      status: 'active'
    },
    {
      id: '3',
      type: 'cancellation',
      title: 'Clase Cancelada - Química Orgánica',
      description: 'La clase de Química Orgánica del viernes ha sido cancelada debido a una conferencia',
      oldValue: 'Programada',
      newValue: 'Cancelada',
      date: '2024-01-13T15:30:00Z',
      affectedStudents: 22,
      priority: 'high',
      status: 'cancelled'
    },
    {
      id: '4',
      type: 'new_event',
      title: 'Nueva Actividad - Taller de Literatura',
      description: 'Se ha programado un taller especial de Literatura Española para el próximo miércoles',
      oldValue: 'No programado',
      newValue: 'Miércoles 3:00 PM',
      date: '2024-01-12T12:00:00Z',
      affectedStudents: 30,
      priority: 'medium',
      status: 'scheduled'
    },
    {
      id: '5',
      type: 'room_change',
      title: 'Cambio de Aula - Física Avanzada',
      description: 'La clase de Física se realizará en el laboratorio 101 en lugar del aula 304',
      oldValue: 'Aula 304',
      newValue: 'Laboratorio 101',
      date: '2024-01-11T14:20:00Z',
      affectedStudents: 18,
      priority: 'medium',
      status: 'active'
    }
  ];

  const getChangeTypeInfo = (type: string) => {
    switch (type) {
      case 'room_change':
        return {
          label: 'Cambio de Aula',
          icon: MapPin,
          color: 'text-blue-600',
          bgColor: 'bg-blue-100'
        };
      case 'time_change':
        return {
          label: 'Cambio de Horario',
          icon: Clock,
          color: 'text-purple-600',
          bgColor: 'bg-purple-100'
        };
      case 'cancellation':
        return {
          label: 'Cancelación',
          icon: AlertTriangle,
          color: 'text-red-600',
          bgColor: 'bg-red-100'
        };
      case 'new_event':
        return {
          label: 'Nuevo Evento',
          icon: CheckCircle,
          color: 'text-green-600',
          bgColor: 'bg-green-100'
        };
      default:
        return {
          label: 'Cambio',
          icon: Info,
          color: 'text-gray-600',
          bgColor: 'bg-gray-100'
        };
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'bg-red-100 text-red-800 border-red-200';
      case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'low': return 'bg-blue-100 text-blue-800 border-blue-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      case 'scheduled': return 'bg-blue-100 text-blue-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const filteredChanges = filter === 'all' 
    ? calendarChanges 
    : calendarChanges.filter(change => change.type === filter);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('es-ES', {
      day: 'numeric',
      month: 'long',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const changeStats = {
    total: calendarChanges.length,
    roomChanges: calendarChanges.filter(c => c.type === 'room_change').length,
    timeChanges: calendarChanges.filter(c => c.type === 'time_change').length,
    cancellations: calendarChanges.filter(c => c.type === 'cancellation').length,
    newEvents: calendarChanges.filter(c => c.type === 'new_event').length,
    highPriority: calendarChanges.filter(c => c.priority === 'high').length
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
              <h1 className="text-2xl font-bold text-gray-900">Cambios de Calendario</h1>
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
        <div className="grid grid-cols-1 md:grid-cols-5 gap-6 mb-8">
          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Cambios</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">{changeStats.total}</p>
              </div>
              <Calendar className="w-8 h-8 text-blue-600" />
            </div>
          </Card>
          
          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Cambios de Aula</p>
                <p className="text-2xl font-bold text-blue-600 mt-1">{changeStats.roomChanges}</p>
              </div>
              <MapPin className="w-8 h-8 text-blue-600" />
            </div>
          </Card>
          
          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Cambios de Horario</p>
                <p className="text-2xl font-bold text-purple-600 mt-1">{changeStats.timeChanges}</p>
              </div>
              <Clock className="w-8 h-8 text-purple-600" />
            </div>
          </Card>
          
          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Cancelaciones</p>
                <p className="text-2xl font-bold text-red-600 mt-1">{changeStats.cancellations}</p>
              </div>
              <AlertTriangle className="w-8 h-8 text-red-600" />
            </div>
          </Card>
          
          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Nuevos Eventos</p>
                <p className="text-2xl font-bold text-green-600 mt-1">{changeStats.newEvents}</p>
              </div>
              <CheckCircle className="w-8 h-8 text-green-600" />
            </div>
          </Card>
        </div>

        {/* Filters */}
        <Card className="p-6 mb-8">
          <div className="flex flex-wrap gap-2">
            {[
              { key: 'all', label: 'Todos los Cambios' },
              { key: 'room_change', label: 'Cambios de Aula' },
              { key: 'time_change', label: 'Cambios de Horario' },
              { key: 'cancellation', label: 'Cancelaciones' },
              { key: 'new_event', label: 'Nuevos Eventos' }
            ].map((filterOption) => (
              <Button
                key={filterOption.key}
                variant={filter === filterOption.key ? 'primary' : 'outline'}
                size="sm"
                onClick={() => setFilter(filterOption.key)}
              >
                {filterOption.label}
              </Button>
            ))}
          </div>
        </Card>

        {/* Calendar Changes List */}
        <div className="space-y-6">
          {filteredChanges.length === 0 ? (
            <Card className="p-8 text-center">
              <Calendar className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                No hay cambios de calendario
              </h3>
              <p className="text-gray-600">
                No se encontraron cambios que coincidan con el filtro seleccionado.
              </p>
            </Card>
          ) : (
            filteredChanges.map((change) => {
              const typeInfo = getChangeTypeInfo(change.type);
              const TypeIcon = typeInfo.icon;
              
              return (
                <Card 
                  key={change.id}
                  className={`p-6 hover:shadow-lg transition-shadow ${
                    change.priority === 'high' ? 'border-l-4 border-l-red-500 bg-red-50/30' : ''
                  }`}
                >
                  <div className="flex items-start space-x-4">
                    <div className={`p-3 rounded-full ${typeInfo.bgColor}`}>
                      <TypeIcon className={`w-6 h-6 ${typeInfo.color}`} />
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-3">
                        <h3 className="text-xl font-semibold text-gray-900">
                          {change.title}
                        </h3>
                        <div className="flex items-center space-x-2">
                          <span className={`px-3 py-1 text-xs font-medium rounded-full ${getPriorityColor(change.priority)}`}>
                            {change.priority === 'high' ? 'Alta Prioridad' :
                             change.priority === 'medium' ? 'Media Prioridad' : 'Baja Prioridad'}
                          </span>
                          <span className={`px-3 py-1 text-xs font-medium rounded-full ${getStatusColor(change.status)}`}>
                            {change.status === 'active' ? 'Activo' :
                             change.status === 'cancelled' ? 'Cancelado' : 'Programado'}
                          </span>
                        </div>
                      </div>
                      
                      <p className="text-gray-700 mb-4 leading-relaxed">
                        {change.description}
                      </p>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                        <div className="bg-gray-50 p-4 rounded-lg">
                          <h4 className="text-sm font-medium text-gray-900 mb-2">Anterior:</h4>
                          <p className="text-sm text-gray-600">{change.oldValue}</p>
                        </div>
                        <div className="bg-green-50 p-4 rounded-lg">
                          <h4 className="text-sm font-medium text-gray-900 mb-2">Nuevo:</h4>
                          <p className="text-sm text-green-700 font-medium">{change.newValue}</p>
                        </div>
                      </div>
                      
                      <div className="flex items-center justify-between text-sm text-gray-500">
                        <div className="flex items-center space-x-4">
                          <span className="flex items-center">
                            <Clock className="w-4 h-4 mr-1" />
                            {formatDate(change.date)}
                          </span>
                          <span className="flex items-center">
                            <Users className="w-4 h-4 mr-1" />
                            {change.affectedStudents} estudiantes afectados
                          </span>
                        </div>
                        
                        <div className="flex items-center space-x-2">
                          <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                            change.type === 'room_change' ? 'bg-blue-100 text-blue-800' :
                            change.type === 'time_change' ? 'bg-purple-100 text-purple-800' :
                            change.type === 'cancellation' ? 'bg-red-100 text-red-800' :
                            'bg-green-100 text-green-800'
                          }`}>
                            {typeInfo.label}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </Card>
              );
            })
          )}
        </div>

        {/* Summary */}
        {filteredChanges.length > 0 && (
          <Card className="p-6 mt-8">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Resumen de Cambios
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <h4 className="font-medium text-gray-900 mb-2">Cambios de Alta Prioridad</h4>
                <p className="text-2xl font-bold text-red-600">{changeStats.highPriority}</p>
                <p className="text-sm text-gray-600">Requieren atención inmediata</p>
              </div>
              
              <div>
                <h4 className="font-medium text-gray-900 mb-2">Estudiantes Afectados</h4>
                <p className="text-2xl font-bold text-blue-600">
                  {filteredChanges.reduce((acc, change) => acc + change.affectedStudents, 0)}
                </p>
                <p className="text-sm text-gray-600">Total de estudiantes impactados</p>
              </div>
              
              <div>
                <h4 className="font-medium text-gray-900 mb-2">Cambios Recientes</h4>
                <p className="text-2xl font-bold text-green-600">
                  {filteredChanges.filter(change => {
                    const changeDate = new Date(change.date);
                    const now = new Date();
                    const diffDays = Math.ceil((now.getTime() - changeDate.getTime()) / (1000 * 60 * 60 * 24));
                    return diffDays <= 7;
                  }).length}
                </p>
                <p className="text-sm text-gray-600">En los últimos 7 días</p>
              </div>
            </div>
          </Card>
        )}
      </main>
    </div>
  );
}
