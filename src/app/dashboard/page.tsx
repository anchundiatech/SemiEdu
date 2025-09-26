'use client';

import React, { useEffect } from 'react';
import Link from 'next/link';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { useAuth } from '@/contexts/AuthContext';
import { 
  Users, 
  GraduationCap, 
  BarChart3, 
  TrendingUp,
  ArrowLeft,
  ChevronRight
} from 'lucide-react';

export default function DashboardPage() {
  const { user, loading } = useAuth();

  // Redirección automática basada en rol
  useEffect(() => {
    if (!loading && user) {
      const userRole = user.user_metadata?.rol;
      console.log('🎯 Dashboard principal - Rol detectado:', userRole);
      
      switch (userRole) {
        case 'coordinador':
          console.log('🎯 Dashboard principal - Redirigiendo coordinador a /admin');
          window.location.replace('/admin');
          break;
        case 'docente':
          console.log('🎯 Dashboard principal - Redirigiendo docente a /dashboard/teacher');
          window.location.replace('/dashboard/teacher');
          break;
        case 'estudiante':
          console.log('🎯 Dashboard principal - Redirigiendo estudiante a /dashboard/student');
          window.location.replace('/dashboard/student');
          break;
        default:
          console.log('🎯 Dashboard principal - Rol no definido, iniciando detección automática...');
          
          // Intentar detección automática de rol
          const detectRole = async () => {
            try {
              // Primero intentar método simple basado en email
              const email = user.email || '';
              console.log('📧 Detectando rol por email:', email);
              
              let detectedRole = 'estudiante'; // Por defecto
              
              if (email.includes('admin') || email.includes('coordinador') || email.includes('director')) {
                detectedRole = 'coordinador';
              } else if (email.includes('profesor') || email.includes('teacher') || email.includes('docente')) {
                detectedRole = 'docente';
              }
              
              console.log('🎯 Rol detectado por email:', detectedRole);
              
              // Actualizar metadatos del usuario
              const { supabase } = await import('@/lib/supabase');
              const { error } = await supabase.auth.updateUser({
                data: {
                  ...user.user_metadata,
                  rol: detectedRole,
                  nombre: user.user_metadata?.full_name || user.user_metadata?.name || 'Usuario',
                  role_detection: {
                    method: 'email_fallback',
                    detected_at: new Date().toISOString()
                  }
                }
              });
              
              if (error) {
                console.error('Error actualizando rol:', error);
              } else {
                console.log('✅ Rol actualizado:', detectedRole);
                
                // Redirigir según el rol detectado
                switch (detectedRole) {
                  case 'coordinador':
                    window.location.replace('/admin');
                    break;
                  case 'docente':
                    window.location.replace('/dashboard/teacher');
                    break;
                  default:
                    window.location.replace('/dashboard/student');
                    break;
                }
              }
            } catch (error) {
              console.error('Error en detección automática:', error);
              // Si todo falla, ir a dashboard de estudiante por defecto
              window.location.replace('/dashboard/student');
            }
          };
          
          detectRole();
          break;
      }
    }
  }, [user, loading]);

  // Mostrar loading mientras se determina la redirección
  if (loading || (user && user.user_metadata?.rol)) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Redirigiendo al dashboard apropiado...</p>
        </div>
      </div>
    );
  }
  const dashboardOptions = [
    {
      title: 'Progreso Estudiantil',
      description: 'Visualiza el rendimiento académico individual y grupal de los estudiantes',
      icon: Users,
      color: 'text-primary',
      bgColor: 'bg-primary/10',
      href: '/dashboard/student',
      stats: {
        total: '1,247 estudiantes',
        average: '87.5% promedio',
        trend: '+5.2% este mes'
      }
    },
    {
      title: 'Progreso Docente',
      description: 'Monitorea el desempeño y efectividad de los métodos de enseñanza',
      icon: GraduationCap,
      color: 'text-secondary',
      bgColor: 'bg-secondary/10',
      href: '/dashboard/teacher',
      stats: {
        total: '48 docentes',
        average: '91.2% efectividad',
        trend: '+3.8% este mes'
      }
    }
  ];

  const quickStats = [
    {
      title: 'Estudiantes Activos',
      value: '1,247',
      change: '+12%',
      icon: Users,
      color: 'text-blue-600'
    },
    {
      title: 'Promedio General',
      value: '87.5%',
      change: '+5%',
      icon: TrendingUp,
      color: 'text-green-600'
    },
    {
      title: 'Cursos Activos',
      value: '48',
      change: '+3%',
      icon: BarChart3,
      color: 'text-purple-600'
    }
  ];

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
              <h1 className="text-2xl font-bold text-gray-900">Dashboards de Progreso</h1>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Page Title */}
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-2">
            Visualización del Progreso Académico
          </h2>
          <p className="text-lg text-gray-600">
            Accede a métricas detalladas sobre el rendimiento estudiantil y docente
          </p>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
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

        {/* Dashboard Options */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {dashboardOptions.map((option, index) => (
            <Link key={index} href={option.href}>
              <Card variant="dashboard" className="h-full group">
                <div className="flex items-start justify-between mb-6">
                  <div className={`p-4 rounded-xl ${option.bgColor} group-hover:scale-110 transition-transform duration-200`}>
                    <option.icon className={`w-8 h-8 ${option.color}`} />
                  </div>
                  <ChevronRight className="w-5 h-5 text-gray-400 group-hover:text-gray-600 transition-colors" />
                </div>
                
                <div className="mb-6">
                  <h3 className="text-2xl font-bold text-gray-900 mb-3">
                    {option.title}
                  </h3>
                  <p className="text-gray-600 leading-relaxed">
                    {option.description}
                  </p>
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-500">Total:</span>
                    <span className="text-sm font-medium text-gray-900">{option.stats.total}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-500">Promedio:</span>
                    <span className="text-sm font-medium text-gray-900">{option.stats.average}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-500">Tendencia:</span>
                    <span className="text-sm font-medium text-green-600">{option.stats.trend}</span>
                  </div>
                </div>

                <div className="mt-6 pt-4 border-t border-gray-100">
                  <span className={`text-sm font-medium ${option.color} group-hover:underline`}>
                    Ver Dashboard Completo →
                  </span>
                </div>
              </Card>
            </Link>
          ))}
        </div>

        {/* Additional Info */}
        <div className="mt-12 bg-white rounded-xl shadow-lg p-8">
          <h3 className="text-2xl font-bold text-gray-900 mb-4">
            Información Adicional
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div>
              <h4 className="text-lg font-semibold text-gray-900 mb-3">
                Progreso Estudiantil
              </h4>
              <ul className="space-y-2 text-gray-600">
                <li>• Seguimiento individual de cada estudiante</li>
                <li>• Métricas de rendimiento por materia</li>
                <li>• Identificación de estudiantes en riesgo</li>
                <li>• Análisis de tendencias de aprendizaje</li>
              </ul>
            </div>
            <div>
              <h4 className="text-lg font-semibold text-gray-900 mb-3">
                Progreso Docente
              </h4>
              <ul className="space-y-2 text-gray-600">
                <li>• Efectividad de métodos de enseñanza</li>
                <li>• Participación en clases</li>
                <li>• Feedback de estudiantes</li>
                <li>• Desarrollo profesional continuo</li>
              </ul>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
