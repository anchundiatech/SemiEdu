'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { useAuth } from '@/contexts/AuthContext';
import { BookOpen, AlertCircle } from 'lucide-react';

export default function LoginPage() {
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user, signOut } = useAuth();

  const handleGoogleClassroomSignIn = async () => {
    setError('');
    setLoading(true);

    try {
      // Redirigir directamente al endpoint OAuth que incluye permisos de Classroom
      window.location.href = '/api/oauth/google';
    } catch (err) {
      setError('Error interno del servidor');
      setLoading(false);
    }
  };

  const handleSignOut = async () => {
    try {
      await signOut();
      console.log('Sesión cerrada desde login');
    } catch (error) {
      console.error('Error cerrando sesión:', error);
      // Forzar limpieza manual si falla
      if (typeof window !== 'undefined') {
        // Limpiar cookies manualmente
        document.cookie.split(";").forEach((c) => {
          const eqPos = c.indexOf("=");
          const name = eqPos > -1 ? c.substr(0, eqPos) : c;
          if (name.trim().includes('sb-') || name.trim().includes('supabase')) {
            document.cookie = name + "=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/";
          }
        });
        
        // Recargar la página para limpiar el estado
        window.location.reload();
      }
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-100 via-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Debug Info - Solo mostrar si hay usuario logueado */}
        {user && (
          <div className="mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
            <div className="flex flex-col gap-2">
              <p className="text-sm text-yellow-800">
                <strong>⚠️ Ya estás logueado:</strong> {user.email}
              </p>
              <Button 
                variant="primary" 
                size="sm" 
                onClick={() => {
                  const userRole = user.user_metadata?.rol;
                  let dashboardUrl = '/dashboard/student';
                  
                  switch (userRole) {
                    case 'coordinador':
                      dashboardUrl = '/admin';
                      break;
                    case 'docente':
                      dashboardUrl = '/dashboard/teacher';
                      break;
                    case 'estudiante':
                      dashboardUrl = '/dashboard/student';
                      break;
                  }
                  
                  window.location.href = dashboardUrl;
                }}
              >
                Ir al Dashboard
              </Button>
            </div>
          </div>
        )}
        
        {/* Logo y título */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center mb-6">
            <div className="w-16 h-16 bg-blue-600 rounded-2xl flex items-center justify-center shadow-lg">
              <BookOpen className="w-8 h-8 text-white" />
            </div>
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-2">SemiEdu</h1>
          <p className="text-gray-500">Conecta con Google Classroom</p>
        </div>

        {/* Formulario de login con Google Classroom */}
        <Card className="p-8 shadow-xl bg-white/95 backdrop-blur-sm">
          <div className="space-y-6">
            {/* Descripción */}
            <div className="text-center">
              <h2 className="text-xl font-semibold text-gray-900 mb-2">
                Acceso con Google Classroom
              </h2>
              <p className="text-gray-600 text-sm">
                Inicia sesión con tu cuenta de Google para acceder automáticamente a tus clases y tareas de Google Classroom.
              </p>
            </div>

            {/* Error message */}
            {error && (
              <div className="flex items-center space-x-2 text-red-600 bg-red-50 p-4 rounded-xl border border-red-200">
                <AlertCircle className="w-4 h-4" />
                <span className="text-sm">{error}</span>
              </div>
            )}

            {/* Botón de Google Classroom */}
            <Button
              type="button"
              className="w-full bg-blue-600 hover:bg-blue-700 text-white py-4 rounded-xl font-medium text-base transition-all duration-200 shadow-lg hover:shadow-xl"
              disabled={loading}
              onClick={handleGoogleClassroomSignIn}
            >
              {loading ? (
                <LoadingSpinner size="sm" text="Conectando con Google Classroom..." />
              ) : (
                <div className="flex items-center justify-center space-x-3">
                  <svg className="w-6 h-6" viewBox="0 0 24 24">
                    <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                    <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                    <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                    <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                  </svg>
                  <span>Iniciar sesión con Google Classroom</span>
                </div>
              )}
            </Button>

            {/* Información adicional */}
            <div className="bg-blue-50 p-4 rounded-xl border border-blue-200">
              <h3 className="text-sm font-semibold text-blue-900 mb-2">¿Qué permisos necesitamos?</h3>
              <ul className="text-xs text-blue-800 space-y-1">
                <li>• Ver tus clases de Google Classroom</li>
                <li>• Ver estudiantes y profesores de tus clases</li>
                <li>• Ver tareas y entregas</li>
                <li>• Acceder a tu información de perfil</li>
              </ul>
              <p className="text-xs text-blue-700 mt-2">
                <strong>Nota:</strong> Solo leemos información, nunca modificamos tus clases o tareas.
              </p>
            </div>
          </div>
        </Card>

        {/* Información adicional */}
        <Card className="mt-6 p-6 bg-white/80 backdrop-blur-sm border border-gray-200 shadow-lg">
          <h3 className="text-sm font-semibold text-gray-900 mb-4">¿Cómo funciona?</h3>
          <div className="space-y-3 text-sm text-gray-600">
            <div className="flex items-start space-x-3">
              <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                <span className="text-blue-600 font-semibold text-xs">1</span>
              </div>
              <p>Haz clic en "Iniciar sesión con Google Classroom"</p>
            </div>
            <div className="flex items-start space-x-3">
              <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                <span className="text-blue-600 font-semibold text-xs">2</span>
              </div>
              <p>Autoriza el acceso a tu cuenta de Google Classroom</p>
            </div>
            <div className="flex items-start space-x-3">
              <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                <span className="text-blue-600 font-semibold text-xs">3</span>
              </div>
              <p>Accede automáticamente a tu dashboard personalizado</p>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
