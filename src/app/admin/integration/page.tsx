'use client';

import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import {
  ExternalLink,
  RefreshCw,
  CheckCircle,
  AlertCircle,
  Users,
  BookOpen,
  FileText,
  Calendar,
  Settings,
  Link as LinkIcon,
  Unlink,
  Info,
  Shield,
  Clock,
  Zap,
  Activity,
  Globe,
  Database
} from 'lucide-react';

interface IntegrationStatus {
  connected: boolean;
  googleEmail?: string;
  googleName?: string;
  lastSync?: string;
  totalCourses?: number;
  totalStudents?: number;
  totalAssignments?: number;
  userRole?: string;
  userName?: string;
  userEmail?: string;
}

interface SyncResult {
  courses: number;
  students: number;
  assignments: number;
  errors: any[];


}

export default function GoogleClassroomIntegration() {
  const [status, setStatus] = useState<IntegrationStatus>({ connected: false });
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);
  const [syncResult, setSyncResult] = useState<SyncResult | null>(null);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const searchParams = useSearchParams();

  useEffect(() => {
    checkIntegrationStatus();

    // Manejar parámetros de URL (callback de Google)
    const urlError = searchParams.get('error');
    const urlSuccess = searchParams.get('success');

    if (urlError) {
      setError(getErrorMessage(urlError));
    }

    if (urlSuccess) {
      setSuccess('¡Integración con Google Classroom configurada exitosamente!');
      checkIntegrationStatus();
    }
  }, [searchParams]);

  const getErrorMessage = (errorCode: string) => {
    switch (errorCode) {
      case 'access_denied':
        return 'Acceso denegado. Debes autorizar el acceso a Google Classroom.';
      case 'no_code':
        return 'No se recibió código de autorización.';
      case 'no_session':
        return 'Sesión expirada. Por favor, inicia sesión nuevamente.';
      case 'db_error':
        return 'Error guardando la configuración. Intenta nuevamente.';
      case 'callback_error':
        return 'Error durante la autorización. Intenta nuevamente.';
      default:
        return 'Error desconocido durante la integración.';
    }
  };

  const checkIntegrationStatus = async () => {
    try {
      setLoading(true);

      const response = await fetch('/api/google/status');

      // Si el servicio está desactivado (503), no es un error crítico
      if (response.status === 503) {
        console.log('Servicio de Google temporalmente desactivado');
        setStatus({ connected: false });
        return;
      }

      const data = await response.json();

      if (data.success) {
        setStatus(data.status);
      } else {
        setStatus({ connected: false });
      }
    } catch (error) {
      console.error('Error verificando estado:', error);
      // Establecer estado desconectado en caso de error
      setStatus({ connected: false });
    } finally {
      setLoading(false);
    }
  };

  const handleConnect = async () => {
    try {
      setError('');
      const response = await fetch('/api/google/auth/generate');

      // Si el servicio está desactivado (503), mostrar mensaje
      if (response.status === 503) {
        setError('Integración con Google temporalmente desactivada');
        return;
      }

      const data = await response.json();

      if (data.success) {
        window.location.href = data.authUrl;
      } else {
        setError('Error generando URL de autorización');
      }
    } catch (error) {
      setError('Error conectando con Google Classroom');
    }
  };

  const handleSync = async () => {
    try {
      setSyncing(true);
      setError('');
      setSyncResult(null);

      const response = await fetch('/api/google/sync', {
        method: 'POST'
      });

      const data = await response.json();

      if (data.success) {
        setSyncResult(data.results);
        setSuccess('Sincronización completada exitosamente');
        checkIntegrationStatus();
      } else {
        setError(data.error || 'Error durante la sincronización');
      }
    } catch (error) {
      setError('Error durante la sincronización');
    } finally {
      setSyncing(false);
    }
  };

  const handleDisconnect = async () => {
    if (!confirm('¿Estás seguro de que quieres desconectar Google Classroom?')) {
      return;
    }

    try {
      const response = await fetch('/api/google/disconnect', {
        method: 'POST'
      });

      const data = await response.json();

      if (data.success) {
        setStatus({ connected: false });
        setSuccess('Integración desconectada exitosamente');
      } else {
        setError('Error desconectando la integración');
      }
    } catch (error) {
      setError('Error desconectando la integración');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <LoadingSpinner size="lg" text="Verificando integración..." />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header Mejorado con detección de rol */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl p-8 text-white mb-8">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center backdrop-blur-sm">
              <Globe className="w-8 h-8 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold mb-2">Google Classroom</h1>
              <p className="text-blue-100 text-lg">
                {status.userRole === 'coordinador' ? 'Panel de Administración' :
                 status.userRole === 'docente' ? 'Panel de Profesor' :
                 'Capa de reportería inteligente'}
              </p>
              {status.userName && (
                <p className="text-blue-200 text-sm mt-1">
                  Bienvenido, {status.userName} ({status.userRole})
                </p>
              )}
            </div>
          </div>
          <div className="hidden md:flex items-center space-x-6">
            <div className="text-center">
              <div className="text-2xl font-bold">{status.totalCourses || 0}</div>
              <div className="text-blue-100 text-sm">Cursos</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold">{status.totalStudents || 0}</div>
              <div className="text-blue-100 text-sm">Estudiantes</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold">{status.totalAssignments || 0}</div>
              <div className="text-blue-100 text-sm">Tareas</div>
            </div>
          </div>
        </div>

        {/* Estado y acciones */}
        <div className="flex items-center justify-between mt-6 pt-6 border-t border-white/20">
          <div className="flex items-center space-x-3">
            <div className={`flex items-center px-4 py-2 rounded-full text-sm font-medium backdrop-blur-sm ${
              status.connected
                ? 'bg-green-500/20 text-green-100 border border-green-400/30'
                : 'bg-red-500/20 text-red-100 border border-red-400/30'
            }`}>
              {status.connected ? (
                <>
                  <CheckCircle className="w-4 h-4 mr-2" />
                  Conectado
                </>
              ) : (
                <>
                  <AlertCircle className="w-4 h-4 mr-2" />
                  Desconectado
                </>
              )}
            </div>
            {status.connected && status.lastSync && (
              <div className="text-blue-100 text-sm">
                <Clock className="w-4 h-4 inline mr-1" />
                Última sync: {new Date(status.lastSync).toLocaleString('es-ES', {
                  day: '2-digit',
                  month: '2-digit',
                  hour: '2-digit',
                  minute: '2-digit'
                })}
              </div>
            )}
          </div>

          <div className="flex items-center space-x-3">
            {/* Solo coordinadores pueden gestionar la integración */}
            {status.userRole === 'coordinador' ? (
              status.connected ? (
                <>
                  <Button
                    variant="secondary"
                    onClick={handleSync}
                    disabled={syncing}
                    className="bg-white/20 hover:bg-white/30 text-white border-white/30 backdrop-blur-sm"
                  >
                    {syncing ? (
                      <LoadingSpinner size="sm" />
                    ) : (
                      <RefreshCw className="w-4 h-4 mr-2" />
                    )}
                    {syncing ? 'Sincronizando...' : 'Sincronizar'}
                  </Button>
                  <Button
                    variant="outline"
                    onClick={handleDisconnect}
                    className="bg-red-500/20 hover:bg-red-500/30 text-white border-red-400/30 backdrop-blur-sm"
                  >
                    <Unlink className="w-4 h-4 mr-2" />
                    Desconectar
                  </Button>
                </>
              ) : (
                <Button
                  variant="secondary"
                  onClick={handleConnect}
                  className="bg-white text-blue-600 hover:bg-blue-50 font-semibold px-6 py-3"
                >
                  <LinkIcon className="w-5 h-5 mr-2" />
                  Conectar con Google Classroom
                </Button>
              )
            ) : (
              <div className="bg-white/20 px-4 py-2 rounded-lg backdrop-blur-sm">
                <p className="text-blue-100 text-sm">
                  {status.userRole === 'docente' ? 'Vista de profesor' : 'Vista de estudiante'}
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Mensajes de estado */}
      {error && (
        <Card className="p-4 bg-red-50 border-red-200">
          <div className="flex items-center">
            <AlertCircle className="w-5 h-5 text-red-600 mr-2" />
            <span className="text-red-800">{error}</span>
          </div>
        </Card>
      )}

      {success && (
        <Card className="p-4 bg-green-50 border-green-200">
          <div className="flex items-center">
            <CheckCircle className="w-5 h-5 text-green-600 mr-2" />
            <span className="text-green-800">{success}</span>
          </div>
        </Card>
      )}

      {status.connected ? (
        <>
          {/* Panel de información del usuario */}
          <Card className="p-6 mb-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center">
                  <Users className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">
                    {status.googleName || 'Usuario de Google'}
                  </h3>
                  <p className="text-gray-600">{status.googleEmail}</p>
                </div>
              </div>
              <div className="flex items-center space-x-4">
                <div className="text-right">
                  <div className="text-sm text-gray-500">Cuenta conectada</div>
                  <div className="flex items-center text-green-600">
                    <Shield className="w-4 h-4 mr-1" />
                    <span className="text-sm font-medium">Verificada</span>
                  </div>
                </div>
              </div>
            </div>
          </Card>

          {/* Métricas mejoradas */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
            <Card className="p-6 bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-blue-600 text-sm font-medium mb-1">Cursos Sincronizados</p>
                  <p className="text-3xl font-bold text-blue-900">{status.totalCourses || 0}</p>
                  <p className="text-blue-700 text-sm mt-1">Clases activas</p>
                </div>
                <div className="w-12 h-12 bg-blue-500 rounded-xl flex items-center justify-center">
                  <BookOpen className="w-6 h-6 text-white" />
                </div>
              </div>
            </Card>

            <Card className="p-6 bg-gradient-to-br from-green-50 to-green-100 border-green-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-green-600 text-sm font-medium mb-1">Estudiantes</p>
                  <p className="text-3xl font-bold text-green-900">{status.totalStudents || 0}</p>
                  <p className="text-green-700 text-sm mt-1">Usuarios activos</p>
                </div>
                <div className="w-12 h-12 bg-green-500 rounded-xl flex items-center justify-center">
                  <Users className="w-6 h-6 text-white" />
                </div>
              </div>
            </Card>

            <Card className="p-6 bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-purple-600 text-sm font-medium mb-1">Tareas</p>
                  <p className="text-3xl font-bold text-purple-900">{status.totalAssignments || 0}</p>
                  <p className="text-purple-700 text-sm mt-1">Assignments</p>
                </div>
                <div className="w-12 h-12 bg-purple-500 rounded-xl flex items-center justify-center">
                  <FileText className="w-6 h-6 text-white" />
                </div>
              </div>
            </Card>
          </div>
        </>
      ) : (
        <>
          {/* Estado desconectado mejorado */}
          <Card className="p-12 text-center">
            <div className="w-24 h-24 bg-gradient-to-br from-gray-100 to-gray-200 rounded-2xl flex items-center justify-center mx-auto mb-6">
              <ExternalLink className="w-12 h-12 text-gray-400" />
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-3">
              Conecta tu Google Classroom
            </h3>
            <p className="text-gray-600 mb-8 max-w-md mx-auto">
              Importa automáticamente tus cursos, estudiantes y tareas para tener una vista completa de tu aula digital.
            </p>
            <Button
              variant="primary"
              onClick={handleConnect}
              className="px-8 py-3 text-lg"
            >
              <LinkIcon className="w-5 h-5 mr-2" />
              Conectar Google Classroom
            </Button>
          </Card>

          {/* Panel de configuración de variables de entorno */}
          <Card className="p-6 bg-yellow-50 border-yellow-200">
            <div className="flex items-start">
              <Settings className="w-6 h-6 text-yellow-600 mr-3 mt-1" />
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-yellow-800 mb-2">
                  Configuración Requerida
                </h3>
                <p className="text-yellow-700 mb-4">
                  Para conectar con Google Classroom, necesitas configurar las siguientes variables de entorno:
                </p>

                <div className="bg-white p-4 rounded-lg border border-yellow-200 mb-4">
                  <h4 className="font-medium text-gray-900 mb-2">Variables de entorno necesarias:</h4>
                  <div className="space-y-2 text-sm font-mono">
                    <div className="flex items-center">
                      <span className="text-green-600 mr-2">✓</span>
                      <span className="text-gray-700">GOOGLE_CLIENT_ID</span>
                    </div>
                    <div className="flex items-center">
                      <span className="text-green-600 mr-2">✓</span>
                      <span className="text-gray-700">GOOGLE_CLIENT_SECRET</span>
                    </div>
                    <div className="flex items-center">
                      <span className="text-green-600 mr-2">✓</span>
                      <span className="text-gray-700">NEXT_PUBLIC_SUPABASE_URL</span>
                    </div>
                    <div className="flex items-center">
                      <span className="text-green-600 mr-2">✓</span>
                      <span className="text-gray-700">NEXT_PUBLIC_SUPABASE_ANON_KEY</span>
                    </div>
                  </div>
                </div>

                <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                  <h4 className="font-medium text-blue-900 mb-2">Pasos para configurar:</h4>
                  <ol className="text-sm text-blue-800 space-y-1 list-decimal list-inside">
                    <li>Crear un proyecto en Google Cloud Console</li>
                    <li>Habilitar la API de Google Classroom</li>
                    <li>Crear credenciales OAuth 2.0</li>
                    <li>Configurar las URLs de redirección</li>
                    <li>Agregar las variables al archivo .env.local</li>
                  </ol>
                </div>

                <div className="mt-4 p-3 bg-gray-100 rounded-lg">
                  <p className="text-sm text-gray-600">
                    <strong>Nota:</strong> Una vez configuradas las variables de entorno, reinicia el servidor de desarrollo para que los cambios surtan efecto.
                  </p>
                </div>
              </div>
            </div>
          </Card>
        </>
      )}

      {/* Resultado de sincronización */}
      {syncResult && (
        <Card className="p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Resultado de la Sincronización
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div className="bg-blue-50 p-4 rounded-lg">
              <div className="text-2xl font-bold text-blue-900">{syncResult.courses}</div>
              <div className="text-sm text-blue-700">Clases sincronizadas</div>
            </div>

            <div className="bg-green-50 p-4 rounded-lg">
              <div className="text-2xl font-bold text-green-900">{syncResult.students}</div>
              <div className="text-sm text-green-700">Estudiantes sincronizados</div>
            </div>

            <div className="bg-yellow-50 p-4 rounded-lg">
              <div className="text-2xl font-bold text-yellow-900">{syncResult.assignments}</div>
              <div className="text-sm text-yellow-700">Tareas sincronizadas</div>
            </div>
          </div>

          {syncResult.errors.length > 0 && (
            <div className="bg-red-50 p-4 rounded-lg">
              <h4 className="text-sm font-medium text-red-900 mb-2">
                Errores durante la sincronización:
              </h4>
              <ul className="text-sm text-red-800 space-y-1">
                {syncResult.errors.map((error, index) => (
                  <li key={index}>
                    • {error.courseName}: {error.error}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </Card>
      )}

      {/* Información específica por rol */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="p-6">
          <div className="flex items-center mb-4">
            <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center mr-3">
              <Zap className="w-5 h-5 text-blue-600" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900">
              {status.userRole === 'coordinador' ? 'Gestión Completa' :
               status.userRole === 'docente' ? 'Vista de Profesor' :
               'Vista de Estudiante'}
            </h3>
          </div>
          <ul className="text-sm text-gray-600 space-y-2">
            {status.userRole === 'coordinador' ? (
              <>
                <li className="flex items-start">
                  <CheckCircle className="w-4 h-4 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                  Gestión completa de integración
                </li>
                <li className="flex items-start">
                  <CheckCircle className="w-4 h-4 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                  Sincronización manual y automática
                </li>
                <li className="flex items-start">
                  <CheckCircle className="w-4 h-4 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                  Administración de todos los cursos
                </li>
              </>
            ) : status.userRole === 'docente' ? (
              <>
                <li className="flex items-start">
                  <CheckCircle className="w-4 h-4 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                  Vista de tus cursos asignados
                </li>
                <li className="flex items-start">
                  <CheckCircle className="w-4 h-4 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                  Estadísticas de tus estudiantes
                </li>
                <li className="flex items-start">
                  <CheckCircle className="w-4 h-4 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                  Seguimiento de tareas
                </li>
              </>
            ) : (
              <>
                <li className="flex items-start">
                  <CheckCircle className="w-4 h-4 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                  Vista de tus cursos inscritos
                </li>
                <li className="flex items-start">
                  <CheckCircle className="w-4 h-4 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                  Seguimiento de tus tareas
                </li>
                <li className="flex items-start">
                  <CheckCircle className="w-4 h-4 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                  Progreso académico
                </li>
              </>
            )}
          </ul>
        </Card>

        <Card className="p-6">
          <div className="flex items-center mb-4">
            <div className="w-10 h-10 bg-green-100 rounded-xl flex items-center justify-center mr-3">
              <Database className="w-5 h-5 text-green-600" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900">
              Datos Sincronizados
            </h3>
          </div>
          <ul className="text-sm text-gray-600 space-y-2">
            <li className="flex items-start">
              <CheckCircle className="w-4 h-4 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
              Información actualizada de Google Classroom
            </li>
            <li className="flex items-start">
              <CheckCircle className="w-4 h-4 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
              Fechas de entrega y enlaces originales
            </li>
            <li className="flex items-start">
              <CheckCircle className="w-4 h-4 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
              Metadatos completos preservados
            </li>
          </ul>
        </Card>
      </div>

      {/* Panel de actividad reciente */}
      {status.connected && (
        <Card className="p-6 mt-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center">
              <Activity className="w-5 h-5 text-gray-600 mr-2" />
              <h3 className="text-lg font-semibold text-gray-900">Estado de la Integración</h3>
            </div>
            <div className="text-sm text-gray-500">
              Última actualización: {status.lastSync ? new Date(status.lastSync).toLocaleString('es-ES') : 'Nunca'}
            </div>
          </div>

          <div className="bg-gradient-to-r from-green-50 to-blue-50 p-4 rounded-xl border border-green-200">
            <div className="flex items-center">
              <CheckCircle className="w-6 h-6 text-green-600 mr-3" />
              <div>
                <p className="font-medium text-gray-900">Integración activa y funcionando</p>
                <p className="text-sm text-gray-600">Todos los datos se están sincronizando correctamente con Google Classroom</p>
              </div>
            </div>
          </div>
        </Card>
      )}
    </div>
    
  );
}
