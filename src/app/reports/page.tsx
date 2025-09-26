'use client';

import React from 'react';
import Link from 'next/link';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { 
  ArrowLeft, 
  FileText, 
  Users, 
  Calendar, 
  TrendingUp,
  Download,
  Clock,
  BarChart3,
  PieChart,
  Activity,
  ChevronRight
} from 'lucide-react';

export default function ReportsPage() {
  const reportTypes = [
    {
      title: 'Reportes de Asistencia',
      description: 'Genera reportes detallados sobre la asistencia de estudiantes por clase, período y docente',
      icon: Users,
      color: 'text-primary',
      bgColor: 'bg-primary/10',
      href: '/reports/attendance',
      features: [
        'Asistencia por estudiante',
        'Asistencia por clase',
        'Tendencias mensuales',
        'Exportación a PDF/Excel'
      ],
      lastGenerated: '2024-01-10',
      frequency: 'Semanal'
    },
    {
      title: 'Reportes de Participación',
      description: 'Analiza el nivel de participación y compromiso de los estudiantes en las actividades académicas',
      icon: Activity,
      color: 'text-secondary',
      bgColor: 'bg-secondary/10',
      href: '/reports/participation',
      features: [
        'Participación en clases',
        'Entrega de tareas',
        'Interacción en foros',
        'Métricas de compromiso'
      ],
      lastGenerated: '2024-01-08',
      frequency: 'Mensual'
    },
    {
      title: 'Reportes de Rendimiento',
      description: 'Evalúa el rendimiento académico general y por materias de estudiantes y grupos',
      icon: TrendingUp,
      color: 'text-purple-600',
      bgColor: 'bg-purple-100',
      href: '/reports/performance',
      features: [
        'Calificaciones promedio',
        'Progreso por materia',
        'Comparativas temporales',
        'Identificación de riesgos'
      ],
      lastGenerated: '2024-01-09',
      frequency: 'Quincenal'
    },
    {
      title: 'Reportes Personalizados',
      description: 'Crea reportes customizados combinando diferentes métricas según tus necesidades específicas',
      icon: BarChart3,
      color: 'text-orange-600',
      bgColor: 'bg-orange-100',
      href: '/reports/custom',
      features: [
        'Filtros avanzados',
        'Múltiples métricas',
        'Visualizaciones personalizadas',
        'Programación automática'
      ],
      lastGenerated: '2024-01-07',
      frequency: 'Bajo demanda'
    }
  ];

  const quickStats = [
    {
      title: 'Reportes Generados',
      value: '156',
      change: '+23%',
      icon: FileText,
      color: 'text-blue-600'
    },
    {
      title: 'Descargas del Mes',
      value: '89',
      change: '+15%',
      icon: Download,
      color: 'text-green-600'
    },
    {
      title: 'Reportes Programados',
      value: '12',
      change: '+2',
      icon: Clock,
      color: 'text-purple-600'
    },
    {
      title: 'Usuarios Activos',
      value: '34',
      change: '+8%',
      icon: Users,
      color: 'text-orange-600'
    }
  ];

  const recentReports = [
    {
      name: 'Asistencia Semanal - Enero 2024',
      type: 'Asistencia',
      generated: '2024-01-10T09:30:00Z',
      size: '2.3 MB',
      downloads: 15
    },
    {
      name: 'Participación Mensual - Diciembre 2023',
      type: 'Participación',
      generated: '2024-01-08T14:15:00Z',
      size: '1.8 MB',
      downloads: 23
    },
    {
      name: 'Rendimiento por Curso - Q4 2023',
      type: 'Rendimiento',
      generated: '2024-01-05T11:45:00Z',
      size: '3.1 MB',
      downloads: 31
    }
  ];

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
              <h1 className="text-2xl font-bold text-gray-900">Reportes Automáticos</h1>
            </div>
            <div className="flex items-center space-x-3">
              <Button variant="outline" size="sm">
                <Clock className="w-4 h-4 mr-2" />
                Programar Reporte
              </Button>
              <Button variant="primary" size="sm">
                <Download className="w-4 h-4 mr-2" />
                Ver Descargas
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Page Title */}
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-2">
            Centro de Reportes
          </h2>
          <p className="text-lg text-gray-600">
            Genera reportes automáticos de asistencia, participación y rendimiento académico
          </p>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          {quickStats.map((stat, index) => (
            <Card key={index} className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">{stat.title}</p>
                  <p className="text-2xl font-bold text-gray-900 mt-1">{stat.value}</p>
                  <p className={`text-sm mt-1 ${stat.change.startsWith('+') ? 'text-green-600' : 'text-red-600'}`}>
                    {stat.change} vs mes anterior
                  </p>
                </div>
                <div className="p-3 rounded-full bg-gray-100">
                  <stat.icon className={`w-6 h-6 ${stat.color}`} />
                </div>
              </div>
            </Card>
          ))}
        </div>

        {/* Report Types Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {reportTypes.map((report, index) => (
            <Link key={index} href={report.href}>
              <Card variant="dashboard" className="h-full group">
                <div className="flex items-start justify-between mb-6">
                  <div className={`p-4 rounded-xl ${report.bgColor} group-hover:scale-110 transition-transform duration-200`}>
                    <report.icon className={`w-8 h-8 ${report.color}`} />
                  </div>
                  <ChevronRight className="w-5 h-5 text-gray-400 group-hover:text-gray-600 transition-colors" />
                </div>
                
                <div className="mb-6">
                  <h3 className="text-2xl font-bold text-gray-900 mb-3">
                    {report.title}
                  </h3>
                  <p className="text-gray-600 leading-relaxed mb-4">
                    {report.description}
                  </p>
                  
                  <div className="space-y-2">
                    <h4 className="font-medium text-gray-900">Características:</h4>
                    <ul className="space-y-1">
                      {report.features.map((feature, idx) => (
                        <li key={idx} className="text-sm text-gray-600 flex items-center">
                          <div className="w-1.5 h-1.5 bg-gray-400 rounded-full mr-2" />
                          {feature}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                <div className="space-y-2 pt-4 border-t border-gray-100">
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-gray-500">Último generado:</span>
                    <span className="font-medium text-gray-900">{report.lastGenerated}</span>
                  </div>
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-gray-500">Frecuencia:</span>
                    <span className="font-medium text-gray-900">{report.frequency}</span>
                  </div>
                </div>

                <div className="mt-6">
                  <span className={`text-sm font-medium ${report.color} group-hover:underline`}>
                    Generar Reporte →
                  </span>
                </div>
              </Card>
            </Link>
          ))}
        </div>

        {/* Recent Reports and Quick Actions */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Recent Reports */}
          <Card className="p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-gray-900">
                Reportes Recientes
              </h3>
              <Button variant="outline" size="sm">
                Ver Todos
              </Button>
            </div>
            
            <div className="space-y-4">
              {recentReports.map((report, index) => (
                <div key={index} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                  <div className="flex items-center space-x-3">
                    <div className="p-2 bg-white rounded-lg">
                      <FileText className="w-5 h-5 text-gray-600" />
                    </div>
                    <div>
                      <h4 className="font-medium text-gray-900">{report.name}</h4>
                      <div className="flex items-center space-x-2 text-sm text-gray-500">
                        <span>{report.type}</span>
                        <span>•</span>
                        <span>{report.size}</span>
                        <span>•</span>
                        <span>{formatDate(report.generated)}</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className="text-sm text-gray-500">{report.downloads} descargas</span>
                    <Button variant="ghost" size="sm">
                      <Download className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </Card>

          {/* Quick Actions */}
          <Card className="p-6">
            <h3 className="text-xl font-bold text-gray-900 mb-6">
              Acciones Rápidas
            </h3>
            
            <div className="space-y-4">
              <Link href="/reports/attendance">
                <Button variant="primary" className="w-full justify-start" size="lg">
                  <Users className="w-5 h-5 mr-3" />
                  <div className="text-left">
                    <div className="font-medium">Generar Reporte de Asistencia</div>
                    <div className="text-sm opacity-90">Asistencia semanal automática</div>
                  </div>
                </Button>
              </Link>
              
              <Link href="/reports/participation">
                <Button variant="secondary" className="w-full justify-start" size="lg">
                  <Activity className="w-5 h-5 mr-3" />
                  <div className="text-left">
                    <div className="font-medium">Generar Reporte de Participación</div>
                    <div className="text-sm opacity-90">Participación mensual automática</div>
                  </div>
                </Button>
              </Link>
              
              <Link href="/reports/performance">
                <Button variant="outline" className="w-full justify-start" size="lg">
                  <TrendingUp className="w-5 h-5 mr-3" />
                  <div className="text-left">
                    <div className="font-medium">Generar Reporte de Rendimiento</div>
                    <div className="text-sm text-gray-600">Rendimiento quincenal automático</div>
                  </div>
                </Button>
              </Link>
              
              <Link href="/reports/custom">
                <Button variant="ghost" className="w-full justify-start" size="lg">
                  <BarChart3 className="w-5 h-5 mr-3" />
                  <div className="text-left">
                    <div className="font-medium">Crear Reporte Personalizado</div>
                    <div className="text-sm text-gray-600">Configura métricas específicas</div>
                  </div>
                </Button>
              </Link>
            </div>
          </Card>
        </div>
      </main>
    </div>
  );
}
