'use client';

import React, { useState, useEffect } from 'react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { useSession, signOut } from 'next-auth/react';
import {
  User,
  Shield,
  Database,
  Globe,
  CheckCircle,
  XCircle,
  AlertTriangle,
  RefreshCw,
  Eye,
  EyeOff
} from 'lucide-react';

export default function TestPage() {
  const { data: session, status } = useSession();
  const user = session?.user;
  const loading = status === 'loading';
  const [testResults, setTestResults] = useState<any>({});
  const [isRunningTests, setIsRunningTests] = useState(false);
  const [showTokens, setShowTokens] = useState(false);

  // Test de autenticación
  const testAuth = async () => {
    const results: any = {};

    try {
      // Test 1: Estado de usuario
      results.userState = {
        status: user ? 'success' : 'warning',
        message: user ? `Usuario logueado: ${user.email}` : 'No hay usuario logueado',
        data: user ? {
          email: user.email,
          rol: user.role,
          nombre: user.name,
          id: user.id
        } : null
      };

      // Test 1.1: Análisis de detección de rol
      if (user?.email) {
        const emailLower = user.email.toLowerCase();
        const coordinadorKeywords = [
          "coordinador", "coordinadora", "coordinacion",
          "admin", "administrador", "administradora", "administracion",
          "director", "directora", "direccion",
          "supervisor", "supervisora", "supervision",
          "manager", "management", "gerente",
          "jefe", "jefa", "jefatura",
          "lider", "liderazgo", "liderazgo",
          "responsable", "responsabilidad",
          "head", "chief", "principal"
        ];

        const docenteKeywords = [
          "profesor", "profesora", "profesores",
          "teacher", "teachers", "teaching",
          "docente", "docentes", "docencia",
          "instructor", "instructora", "instructores",
          "educador", "educadora", "educadores",
          "maestro", "maestra", "maestros",
          "tutor", "tutora", "tutores",
          "faculty", "staff", "personal"
        ];

        const coordinadorMatches = coordinadorKeywords.filter(keyword =>
          emailLower.includes(keyword)
        );

        const docenteMatches = docenteKeywords.filter(keyword =>
          emailLower.includes(keyword)
        );

        results.roleDetection = {
          status: 'info',
          message: `Análisis de detección de rol para: ${user.email}`,
          data: {
            email: user.email,
            emailLower: emailLower,
            detectedRole: user.role,
            coordinadorMatches: coordinadorMatches,
            docenteMatches: docenteMatches,
            isCoordinador: coordinadorMatches.length > 0,
            isDocente: docenteMatches.length > 0,
            expectedRole: coordinadorMatches.length > 0 ? 'coordinador' :
                         docenteMatches.length > 0 ? 'docente' : 'estudiante'
          }
        };
      }

      // Test 2: Cookies del navegador
      const cookies = typeof window !== 'undefined' ? document.cookie : '';
      const nextAuthCookies = cookies.split(';').filter(c =>
        c.includes('next-auth') || c.includes('__Secure-next-auth')
      );

      results.cookies = {
        status: nextAuthCookies.length > 0 ? 'success' : 'error',
        message: `${nextAuthCookies.length} cookies de NextAuth encontradas`,
        data: nextAuthCookies.map(c => c.trim())
      };

      // Test 3: Local Storage
      const localStorageData = typeof window !== 'undefined' ?
        Object.keys(localStorage).filter(key => key.includes('next-auth') || key.includes('auth')) : [];

      results.localStorage = {
        status: localStorageData.length > 0 ? 'success' : 'warning',
        message: `${localStorageData.length} items de autenticación en localStorage`,
        data: localStorageData
      };

      // Test 4: Session Storage
      const sessionStorageData = typeof window !== 'undefined' ?
        Object.keys(sessionStorage).filter(key => key.includes('next-auth') || key.includes('auth')) : [];

      results.sessionStorage = {
        status: sessionStorageData.length > 0 ? 'success' : 'warning',
        message: `${sessionStorageData.length} items de autenticación en sessionStorage`,
        data: sessionStorageData
      };

    } catch (error) {
      results.error = {
        status: 'error',
        message: 'Error ejecutando tests',
        data: error
      };
    }

    return results;
  };

  // Test de navegación
  const testNavigation = () => {
    const results: any = {};

    results.currentUrl = {
      status: 'info',
      message: `URL actual: ${window.location.href}`,
      data: {
        pathname: window.location.pathname,
        search: window.location.search,
        hash: window.location.hash
      }
    };

    results.userAgent = {
      status: 'info',
      message: 'Información del navegador',
      data: {
        userAgent: navigator.userAgent,
        platform: navigator.platform,
        language: navigator.language
      }
    };

    return results;
  };

  // Test de API
  const testAPI = async () => {
    const results: any = {};

    try {
      // Test de conexión básica
      const response = await fetch('/api/test', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        results.apiConnection = {
          status: 'success',
          message: 'Conexión API exitosa',
          data: await response.json()
        };
      } else {
        results.apiConnection = {
          status: 'warning',
          message: `API respondió con status ${response.status}`,
          data: response.statusText
        };
      }
    } catch (error) {
      results.apiConnection = {
        status: 'error',
        message: 'Error conectando con API',
        data: error
      };
    }

    return results;
  };

  // Ejecutar todos los tests
  const runAllTests = async () => {
    setIsRunningTests(true);

    const authResults = await testAuth();
    const navResults = testNavigation();
    const apiResults = await testAPI();

    setTestResults({
      ...authResults,
      ...navResults,
      ...apiResults,
      timestamp: new Date().toISOString()
    });

    setIsRunningTests(false);
  };

  // Ejecutar tests al cargar la página
  useEffect(() => {
    runAllTests();
  }, [user]);

  // Función para obtener el ícono según el status
  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'success':
        return <CheckCircle className="w-5 h-5 text-green-600" />;
      case 'warning':
        return <AlertTriangle className="w-5 h-5 text-yellow-600" />;
      case 'error':
        return <XCircle className="w-5 h-5 text-red-600" />;
      default:
        return <Globe className="w-5 h-5 text-blue-600" />;
    }
  };

  // Función para obtener el color de fondo según el status
  const getStatusBg = (status: string) => {
    switch (status) {
      case 'success':
        return 'bg-green-50 border-green-200';
      case 'warning':
        return 'bg-yellow-50 border-yellow-200';
      case 'error':
        return 'bg-red-50 border-red-200';
      default:
        return 'bg-blue-50 border-blue-200';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">🧪 Página de Test API</h1>
            <p className="text-gray-600 mt-1">Diagnóstico completo del sistema de autenticación</p>
          </div>
          <div className="flex gap-3">
            <Button
              onClick={runAllTests}
              disabled={isRunningTests}
              className="flex items-center gap-2"
            >
              <RefreshCw className={`w-4 h-4 ${isRunningTests ? 'animate-spin' : ''}`} />
              {isRunningTests ? 'Ejecutando...' : 'Ejecutar Tests'}
            </Button>
          </div>
        </div>

        {/* Estado de carga */}
        {loading && (
          <Card className="p-6 mb-6 bg-blue-50 border-blue-200">
            <div className="flex items-center gap-3">
              <RefreshCw className="w-5 h-5 text-blue-600 animate-spin" />
              <p className="text-blue-800">Cargando estado de autenticación...</p>
            </div>
          </Card>
        )}

        {/* Información del usuario */}
        <Card className="p-6 mb-6">
          <div className="flex items-center gap-3 mb-4">
            <User className="w-6 h-6 text-blue-600" />
            <h2 className="text-xl font-semibold">Estado del Usuario</h2>
          </div>

          {user ? (
            <div className="space-y-3">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-medium text-gray-600">Email</p>
                  <p className="text-gray-900">{user.email}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-600">Rol</p>
                  <p className="text-gray-900">{user.role || 'No definido'}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-600">Nombre</p>
                  <p className="text-gray-900">{user.name || 'No definido'}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-600">ID</p>
                  <p className="text-gray-900 font-mono text-sm">{user.id}</p>
                </div>
              </div>

              <div className="flex gap-3 pt-3">
                <Button
                  variant="outline"
                  onClick={() => setShowTokens(!showTokens)}
                  className="flex items-center gap-2"
                >
                  {showTokens ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  {showTokens ? 'Ocultar' : 'Mostrar'} Tokens
                </Button>
                <Button
                  variant="outline"
                  onClick={() => window.location.reload()}
                  className="text-blue-600 border-blue-200 hover:bg-blue-50"
                >
                  <RefreshCw className="w-4 h-4 mr-2" />
                  Actualizar Rol
                </Button>
                <Button
                  variant="outline"
                  onClick={() => signOut({ callbackUrl: '/landing' })}
                  className="text-red-600 border-red-200 hover:bg-red-50"
                >
                  Cerrar Sesión
                </Button>
              </div>

              {showTokens && (
                <div className="mt-4 p-4 bg-gray-100 rounded-lg">
                  <p className="text-sm font-medium text-gray-600 mb-2">Información de Sesión:</p>
                  <pre className="text-xs text-gray-800 overflow-x-auto">
                    {JSON.stringify(session, null, 2)}
                  </pre>
                </div>
              )}
            </div>
          ) : (
            <div className="text-center py-8">
              <AlertTriangle className="w-12 h-12 text-yellow-500 mx-auto mb-4" />
              <p className="text-gray-600 mb-4">No hay usuario autenticado</p>
              <Button onClick={() => window.location.href = '/auth/login'}>
                Ir al Login
              </Button>
            </div>
          )}
        </Card>

        {/* Resultados de Tests */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {Object.entries(testResults).map(([key, result]: [string, any]) => {
            if (key === 'timestamp') return null;

            return (
              <Card key={key} className={`p-6 ${getStatusBg(result.status)}`}>
                <div className="flex items-center gap-3 mb-3">
                  {getStatusIcon(result.status)}
                  <h3 className="font-semibold capitalize">{key.replace(/([A-Z])/g, ' $1')}</h3>
                </div>

                <p className="text-sm text-gray-700 mb-3">{result.message}</p>

                {result.data && (
                  <div className="bg-white bg-opacity-50 rounded p-3">
                    <pre className="text-xs text-gray-800 overflow-x-auto">
                      {typeof result.data === 'object'
                        ? JSON.stringify(result.data, null, 2)
                        : result.data
                      }
                    </pre>
                  </div>
                )}
              </Card>
            );
          })}
        </div>

        {/* Acciones de Navegación */}
        <Card className="p-6 mt-6">
          <div className="flex items-center gap-3 mb-4">
            <Globe className="w-6 h-6 text-blue-600" />
            <h2 className="text-xl font-semibold">Tests de Navegación</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Button
              onClick={() => window.location.href = '/dashboard/student'}
              className="w-full"
            >
              Dashboard Estudiante
            </Button>
            <Button
              onClick={() => window.location.href = '/admin'}
              variant="outline"
              className="w-full"
            >
              Panel Admin
            </Button>
            <Button
              onClick={() => window.location.href = '/auth/login'}
              variant="outline"
              className="w-full"
            >
              Página Login
            </Button>
          </div>
        </Card>

        {/* Footer con timestamp */}
        {testResults.timestamp && (
          <div className="text-center text-sm text-gray-500 mt-6">
            Última actualización: {new Date(testResults.timestamp).toLocaleString()}
          </div>
        )}
      </div>
    </div>
  );
}
