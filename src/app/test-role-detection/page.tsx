'use client';

import React, { useState } from 'react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { CheckCircle, AlertCircle, Users, BookOpen, GraduationCap } from 'lucide-react';

interface RoleDetectionResult {
  success: boolean;
  role?: 'coordinador' | 'docente' | 'estudiante';
  confidence?: 'high' | 'medium' | 'low';
  reasoning?: string;
  details?: {
    coursesAsTeacher: number;
    coursesAsStudent: number;
    totalCourses: number;
    isOwnerOfMultipleCourses: boolean;
    hasTeacherPermissions: boolean;
    hasStudentPermissions: boolean;
  };
  dashboardUrl?: string;
  message?: string;
  error?: string;
  fallback?: any;
}

export default function TestRoleDetectionPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<RoleDetectionResult | null>(null);
  const [accessToken, setAccessToken] = useState('');
  const [email, setEmail] = useState('');
  const [useSimpleDetection, setUseSimpleDetection] = useState(false);

  const testRoleDetection = async () => {
    if (!accessToken.trim() && !email.trim()) {
      alert('Por favor ingresa un token de acceso de Google o un email para probar');
      return;
    }

    setIsLoading(true);
    setResult(null);

    try {
      const endpoint = useSimpleDetection ? '/api/auth/detect-role-simple' : '/api/auth/detect-role';
      
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          accessToken: accessToken.trim() || undefined,
          refreshToken: '', // Opcional para pruebas
          userId: 'test-user-id',
          email: email.trim() || undefined
        })
      });

      const data = await response.json();
      setResult(data);
    } catch (error) {
      console.error('Error:', error);
      setResult({
        success: false,
        error: 'Error de conexión con el servidor'
      });
    } finally {
      setIsLoading(false);
    }
  };

  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'coordinador':
        return <Users className="w-8 h-8 text-blue-600" />;
      case 'docente':
        return <BookOpen className="w-8 h-8 text-green-600" />;
      case 'estudiante':
        return <GraduationCap className="w-8 h-8 text-purple-600" />;
      default:
        return <AlertCircle className="w-8 h-8 text-gray-600" />;
    }
  };

  const getConfidenceColor = (confidence: string) => {
    switch (confidence) {
      case 'high':
        return 'text-green-600 bg-green-100';
      case 'medium':
        return 'text-yellow-600 bg-yellow-100';
      case 'low':
        return 'text-red-600 bg-red-100';
      default:
        return 'text-gray-600 bg-gray-100';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Prueba de Detección Automática de Roles
          </h1>
          <p className="text-gray-600">
            Prueba el sistema de detección de roles basado en Google Classroom API
          </p>
        </div>

        {/* Input para configuración */}
        <Card className="p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">Configuración</h2>
          <div className="space-y-4">
            {/* Selector de método */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Método de Detección
              </label>
              <div className="flex gap-4">
                <label className="flex items-center">
                  <input
                    type="radio"
                    checked={!useSimpleDetection}
                    onChange={() => setUseSimpleDetection(false)}
                    className="mr-2"
                  />
                  <span className="text-sm">Completa (Google Classroom API)</span>
                </label>
                <label className="flex items-center">
                  <input
                    type="radio"
                    checked={useSimpleDetection}
                    onChange={() => setUseSimpleDetection(true)}
                    className="mr-2"
                  />
                  <span className="text-sm">Simple (Solo Email)</span>
                </label>
              </div>
            </div>

            {/* Campo de email */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Email para Prueba
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="ejemplo@institucion.edu"
                className="w-full p-3 border border-gray-300 rounded-lg"
              />
              <p className="text-xs text-gray-500 mt-1">
                Prueba con emails como: admin@escuela.edu, profesor@colegio.edu, estudiante@uni.edu
              </p>
            </div>

            {/* Token de Google (opcional para detección simple) */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Token de Acceso de Google (OAuth) {useSimpleDetection && <span className="text-gray-400">(Opcional)</span>}
              </label>
              <textarea
                value={accessToken}
                onChange={(e) => setAccessToken(e.target.value)}
                placeholder="Pega aquí tu token de acceso de Google..."
                className="w-full p-3 border border-gray-300 rounded-lg resize-none h-20"
              />
              <p className="text-xs text-gray-500 mt-1">
                {useSimpleDetection 
                  ? "Opcional: Solo se usa para validar el token, no para análisis de permisos"
                  : "Requerido: Obtén este token desde Google OAuth Playground o desde una autenticación exitosa"
                }
              </p>
            </div>

            <Button 
              onClick={testRoleDetection}
              disabled={isLoading || (!accessToken.trim() && !email.trim())}
              className="w-full"
            >
              {isLoading ? (
                <>
                  <LoadingSpinner size="sm" className="mr-2" />
                  Detectando rol...
                </>
              ) : (
                `Detectar Rol ${useSimpleDetection ? '(Simple)' : '(Completo)'}`
              )}
            </Button>
          </div>
        </Card>

        {/* Resultados */}
        {result && (
          <Card className="p-6">
            <h2 className="text-xl font-semibold mb-4">Resultados de la Detección</h2>
            
            {result.success ? (
              <div className="space-y-6">
                {/* Rol detectado */}
                <div className="flex items-center justify-center p-6 bg-green-50 rounded-lg">
                  <div className="text-center">
                    <div className="flex justify-center mb-4">
                      {getRoleIcon(result.role!)}
                    </div>
                    <h3 className="text-2xl font-bold text-gray-900 mb-2">
                      {result.role?.toUpperCase()}
                    </h3>
                    <div className={`inline-flex px-3 py-1 rounded-full text-sm font-medium ${getConfidenceColor(result.confidence!)}`}>
                      Confianza: {result.confidence}
                    </div>
                  </div>
                </div>

                {/* Detalles */}
                {result.details && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="bg-blue-50 p-4 rounded-lg">
                      <h4 className="font-semibold text-blue-900 mb-2">Como Profesor</h4>
                      <p className="text-blue-700">
                        Clases: {result.details.coursesAsTeacher}
                      </p>
                      <p className="text-blue-700">
                        Permisos: {result.details.hasTeacherPermissions ? 'Sí' : 'No'}
                      </p>
                      <p className="text-blue-700">
                        Múltiples cursos: {result.details.isOwnerOfMultipleCourses ? 'Sí' : 'No'}
                      </p>
                    </div>
                    
                    <div className="bg-purple-50 p-4 rounded-lg">
                      <h4 className="font-semibold text-purple-900 mb-2">Como Estudiante</h4>
                      <p className="text-purple-700">
                        Clases: {result.details.coursesAsStudent}
                      </p>
                      <p className="text-purple-700">
                        Permisos: {result.details.hasStudentPermissions ? 'Sí' : 'No'}
                      </p>
                      <p className="text-purple-700">
                        Total clases: {result.details.totalCourses}
                      </p>
                    </div>
                  </div>
                )}

                {/* Razonamiento */}
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h4 className="font-semibold text-gray-900 mb-2">Razonamiento</h4>
                  <p className="text-gray-700">{result.reasoning}</p>
                </div>

                {/* Dashboard recomendado */}
                <div className="bg-indigo-50 p-4 rounded-lg">
                  <h4 className="font-semibold text-indigo-900 mb-2">Dashboard Recomendado</h4>
                  <p className="text-indigo-700">{result.dashboardUrl}</p>
                </div>
              </div>
            ) : (
              <div className="text-center p-6 bg-red-50 rounded-lg">
                <AlertCircle className="w-12 h-12 text-red-600 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-red-900 mb-2">Error en la Detección</h3>
                <p className="text-red-700 mb-4">{result.error}</p>
                
                {result.fallback && (
                  <div className="bg-yellow-50 p-4 rounded-lg mt-4">
                    <h4 className="font-semibold text-yellow-900 mb-2">Fallback Aplicado</h4>
                    <p className="text-yellow-700">
                      Rol asignado: {result.fallback.role} ({result.fallback.confidence})
                    </p>
                    <p className="text-yellow-700 text-sm mt-1">
                      {result.fallback.reasoning}
                    </p>
                  </div>
                )}
              </div>
            )}
          </Card>
        )}

        {/* Instrucciones */}
        <Card className="p-6 mt-6">
          <h2 className="text-xl font-semibold mb-4">Instrucciones</h2>
          <div className="space-y-2 text-sm text-gray-600">
            <p>1. Obtén un token de acceso de Google OAuth con permisos de Google Classroom</p>
            <p>2. Pega el token en el campo de arriba</p>
            <p>3. Haz clic en "Detectar Rol Automáticamente"</p>
            <p>4. El sistema analizará tus permisos en Google Classroom y determinará tu rol</p>
          </div>
        </Card>
      </div>
    </div>
  );
}
