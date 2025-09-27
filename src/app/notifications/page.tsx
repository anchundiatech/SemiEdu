'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Notification } from '@/components/ui/Notification';
import { 
  ArrowLeft, 
  Bell, 
  Calendar, 
  BookOpen, 
  MessageSquare,
  Filter,
  Check,
  Settings,
  Clock,
  AlertTriangle,
  CheckCircle,
  Info
} from 'lucide-react';
import { mockNotifications } from '@/utils/mockData';

export default function NotificationsPage() {
  const [filter, setFilter] = useState<string>('all');
  const [notifications, setNotifications] = useState(mockNotifications);

  const notificationTypes = [
    { key: 'all', label: 'Todas', icon: Bell, count: notifications.length },
    { key: 'task', label: 'Tareas', icon: BookOpen, count: notifications.filter(n => n.type === 'task').length },
    { key: 'calendar', label: 'Calendario', icon: Calendar, count: notifications.filter(n => n.type === 'calendar').length },
    { key: 'grade', label: 'Calificaciones', icon: CheckCircle, count: notifications.filter(n => n.type === 'grade').length },
    { key: 'announcement', label: 'Anuncios', icon: MessageSquare, count: notifications.filter(n => n.type === 'announcement').length }
  ];

  const filteredNotifications = filter === 'all' 
    ? notifications 
    : notifications.filter(n => n.type === filter);

  const unreadCount = notifications.filter(n => !n.read).length;

  const markAsRead = (id: string) => {
    setNotifications(prev => 
      prev.map(n => n.id === id ? { ...n, read: true } : n)
    );
  };

  const markAllAsRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'task': return BookOpen;
      case 'calendar': return Calendar;
      case 'grade': return CheckCircle;
      case 'announcement': return MessageSquare;
      default: return Bell;
    }
  };

  const getNotificationColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'border-red-200 bg-red-50';
      case 'medium': return 'border-yellow-200 bg-yellow-50';
      case 'low': return 'border-blue-200 bg-blue-50';
      default: return 'border-gray-200 bg-gray-50';
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('es-ES', {
      day: 'numeric',
      month: 'short',
      hour: '2-digit',
      minute: '2-digit'
    });
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
              <h1 className="text-2xl font-bold text-gray-900">Notificaciones</h1>
              {unreadCount > 0 && (
                <span className="bg-red-500 text-white text-xs font-bold px-2 py-1 rounded-full">
                  {unreadCount}
                </span>
              )}
            </div>
            <div className="flex items-center space-x-3">
              <Button variant="outline" size="sm" onClick={markAllAsRead}>
                <Check className="w-4 h-4 mr-2" />
                Marcar todas como leídas
              </Button>
              <Button variant="ghost" size="sm">
                <Settings className="w-4 h-4 mr-2" />
                Configurar
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Sidebar - Notification Types */}
          <div className="lg:col-span-1">
            <Card className="p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Tipos de Notificación
              </h3>
              <div className="space-y-2">
                {notificationTypes.map((type) => {
                  const Icon = type.icon;
                  return (
                    <button
                      key={type.key}
                      onClick={() => setFilter(type.key)}
                      className={`w-full flex items-center justify-between p-3 rounded-lg transition-colors ${
                        filter === type.key 
                          ? 'bg-primary text-white' 
                          : 'text-gray-700 hover:bg-gray-100'
                      }`}
                    >
                      <div className="flex items-center space-x-3">
                        <Icon className="w-5 h-5" />
                        <span className="font-medium">{type.label}</span>
                      </div>
                      <span className={`text-sm px-2 py-1 rounded-full ${
                        filter === type.key 
                          ? 'bg-white/20 text-white' 
                          : 'bg-gray-200 text-gray-600'
                      }`}>
                        {type.count}
                      </span>
                    </button>
                  );
                })}
              </div>

              {/* Quick Actions */}
              <div className="mt-8">
                <h4 className="text-md font-semibold text-gray-900 mb-3">
                  Acciones Rápidas
                </h4>
                <div className="space-y-2">
                  <Link href="/notifications/tasks">
                    <Button variant="outline" size="sm" className="w-full justify-start">
                      <BookOpen className="w-4 h-4 mr-2" />
                      Ver Tareas Pendientes
                    </Button>
                  </Link>
                  <Link href="/notifications/calendar">
                    <Button variant="outline" size="sm" className="w-full justify-start">
                      <Calendar className="w-4 h-4 mr-2" />
                      Cambios de Calendario
                    </Button>
                  </Link>
                </div>
              </div>
            </Card>
          </div>

          {/* Main Content - Notifications List */}
          <div className="lg:col-span-3">
            <div className="mb-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                {filter === 'all' ? 'Todas las Notificaciones' : 
                 notificationTypes.find(t => t.key === filter)?.label}
              </h2>
              <p className="text-gray-600">
                {filteredNotifications.length} notificaciones
                {unreadCount > 0 && ` (${unreadCount} sin leer)`}
              </p>
            </div>

            {/* Notifications List */}
            <div className="space-y-4">
              {filteredNotifications.length === 0 ? (
                <Card className="p-8 text-center">
                  <Bell className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    No hay notificaciones
                  </h3>
                  <p className="text-gray-600">
                    No tienes notificaciones de este tipo en este momento.
                  </p>
                </Card>
              ) : (
                filteredNotifications.map((notification) => {
                  const Icon = getNotificationIcon(notification.type);
                  return (
                    <Card 
                      key={notification.id} 
                      className={`p-6 cursor-pointer transition-all hover:shadow-lg ${
                        !notification.read ? 'border-l-4 border-l-primary bg-blue-50/50' : ''
                      }`}
                      onClick={() => markAsRead(notification.id)}
                    >
                      <div className="flex items-start space-x-4">
                        <div className={`p-3 rounded-full ${
                          notification.priority === 'high' ? 'bg-red-100' :
                          notification.priority === 'medium' ? 'bg-yellow-100' :
                          'bg-blue-100'
                        }`}>
                          <Icon className={`w-5 h-5 ${
                            notification.priority === 'high' ? 'text-red-600' :
                            notification.priority === 'medium' ? 'text-yellow-600' :
                            'text-blue-600'
                          }`} />
                        </div>
                        
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between mb-2">
                            <h4 className={`text-lg font-semibold ${
                              !notification.read ? 'text-gray-900' : 'text-gray-700'
                            }`}>
                              {notification.title}
                            </h4>
                            <div className="flex items-center space-x-2">
                              {notification.priority === 'high' && (
                                <AlertTriangle className="w-4 h-4 text-red-500" />
                              )}
                              {!notification.read && (
                                <div className="w-2 h-2 bg-primary rounded-full" />
                              )}
                            </div>
                          </div>
                          
                          <p className="text-gray-600 mb-3">
                            {notification.message}
                          </p>
                          
                          <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-2 text-sm text-gray-500">
                              <Clock className="w-4 h-4" />
                              <span>{formatDate(notification.date)}</span>
                            </div>
                            
                            <div className="flex items-center space-x-2">
                              <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                                notification.priority === 'high' ? 'bg-red-100 text-red-800' :
                                notification.priority === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                                'bg-blue-100 text-blue-800'
                              }`}>
                                {notification.priority === 'high' ? 'Alta' :
                                 notification.priority === 'medium' ? 'Media' : 'Baja'}
                              </span>
                              
                              <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                                notification.type === 'task' ? 'bg-green-100 text-green-800' :
                                notification.type === 'calendar' ? 'bg-purple-100 text-purple-800' :
                                notification.type === 'grade' ? 'bg-blue-100 text-blue-800' :
                                'bg-gray-100 text-gray-800'
                              }`}>
                                {notification.type === 'task' ? 'Tarea' :
                                 notification.type === 'calendar' ? 'Calendario' :
                                 notification.type === 'grade' ? 'Calificación' : 'Anuncio'}
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
          </div>
        </div>
      </main>
    </div>
  );
}
