'use client';

import React, { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { Card } from '@/components/ui/Card';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabase';
import { CheckCircle, AlertCircle, BookOpen } from 'lucide-react';

export default function AuthCallbackPage() {
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [message, setMessage] = useState('Procesando autenticación...');
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user } = useAuth();

  useEffect(() => {
    const handleAuthCallback = async () => {
      try {
        console.log('🔄 Procesando callback de autenticación...');
        
        // Obtener el hash de la URL que contiene los tokens
        const hashParams = new URLSearchParams(window.location.hash.substring(1));
        const accessToken = hashParams.get('access_token');
        const refreshToken = hashParams.get('refresh_token');
        
        console.log('Tokens encontrados:', {
          accessToken: !!accessToken,
          refreshToken: !!refreshToken
        });

        if (accessToken) {
          // Establecer la sesión con los tokens
          let data: any = null;
          
          try {
            const result = await supabase.auth.setSession({
              access_token: accessToken,
              refresh_token: refreshToken || ''
            });
            
            data = result.data;
            const error = result.error;

            if (error) {
              console.error('Error estableciendo sesión:', error);
              
              // TEMPORAL: Si hay error de red, continuar sin sesión de Supabase
              if (error.message.includes('NetworkError') || error.message.includes('fetch')) {
                console.log('⚠️ TEMPORAL: Error de red con Supabase, continuando sin sesión');
                setStatus('success');
                setMessage('¡Autenticación exitosa! (modo sin conexión a Supabase)');
                
                // Redirigir a configuración de perfil ya que no tenemos datos del usuario
                setTimeout(() => {
                  router.push('/auth/setup-profile');
                }, 2000);
                return;
              } else {
                setStatus('error');
                setMessage('Error al establecer la sesión de autenticación');
                return;
              }
            }
          } catch (networkError) {
            console.error('❌ Error de red con Supabase:', networkError);
            console.log('⚠️ TEMPORAL: Continuando sin sesión de Supabase debido a error de red');
            setStatus('success');
            setMessage('¡Autenticación exitosa! (modo sin conexión a Supabase)');
            
            // Redirigir a configuración de perfil ya que no tenemos datos del usuario
            setTimeout(() => {
              router.push('/auth/setup-profile');
            }, 2000);
            return;
          }

          console.log('✅ Sesión establecida exitosamente');
          console.log('Usuario:', data.user?.email);
          
          setStatus('success');
          setMessage('¡Autenticación exitosa! Redirigiendo...');

          // Detectar rol automáticamente usando Google Classroom API
          setTimeout(async () => {
            let userRole = data.user?.user_metadata?.rol;
            const userName = data.user?.user_metadata?.nombre;
            
            console.log('Usuario autenticado:', {
              email: data.user?.email,
              rol: userRole,
              nombre: userName,
            });
            
            // Si no tiene rol o queremos detectarlo automáticamente
            if (!userRole) {
              console.log('🔍 Usuario sin rol, iniciando detección automática...');
              setMessage('Detectando rol automáticamente...');
              
              try {
                // Intentar detección automática de rol usando Google Classroom API
                console.log('🔍 Intentando detección completa con Google Classroom API...');
                const roleDetectionResponse = await fetch('/api/auth/detect-role', {
                  method: 'POST',
                  headers: {
                    'Content-Type': 'application/json',
                  },
                  body: JSON.stringify({
                    accessToken: accessToken,
                    refreshToken: refreshToken,
                    userId: data.user?.id,
                    email: data.user?.email
                  })
                });

                const roleDetectionResult = await roleDetectionResponse.json();
                
                if (roleDetectionResult.success) {
                  console.log('✅ Rol detectado automáticamente (método completo):', roleDetectionResult);
                  userRole = roleDetectionResult.role;
                  
                  setMessage(`Rol detectado: ${roleDetectionResult.role} (${roleDetectionResult.confidence} confianza)`);
                  
                  // Actualizar metadatos del usuario con el rol detectado
                  try {
                    const { error: updateError } = await supabase.auth.updateUser({
                      data: {
                        ...data.user.user_metadata,
                        rol: roleDetectionResult.role,
                        nombre: data.user.user_metadata?.full_name || data.user.user_metadata?.name || 'Usuario',
                        role_detection: {
                          confidence: roleDetectionResult.confidence,
                          reasoning: roleDetectionResult.reasoning,
                          detected_at: new Date().toISOString()
                        }
                      }
                    });
                    
                    if (updateError) {
                      console.error('Error actualizando metadatos con rol detectado:', updateError);
                    } else {
                      console.log('✅ Metadatos actualizados con rol detectado:', roleDetectionResult.role);
                    }
                  } catch (updateError) {
                    console.error('Error en actualización de metadatos:', updateError);
                  }
                  
                  // Usar la URL de dashboard recomendada por la detección
                  console.log('Redirigiendo a:', roleDetectionResult.dashboardUrl);
                  setTimeout(() => {
                    router.push(roleDetectionResult.dashboardUrl);
                  }, 1500);
                  return;
                } else {
                  console.warn('⚠️ Detección completa falló, intentando detección simple...');
                  
                  // Intentar detección simple como fallback
                  try {
                    const simpleDetectionResponse = await fetch('/api/auth/detect-role-simple', {
                      method: 'POST',
                      headers: {
                        'Content-Type': 'application/json',
                      },
                      body: JSON.stringify({
                        accessToken: accessToken,
                        refreshToken: refreshToken,
                        userId: data.user?.id,
                        email: data.user?.email
                      })
                    });

                    const simpleDetectionResult = await simpleDetectionResponse.json();
                    
                    if (simpleDetectionResult.success) {
                      console.log('✅ Rol detectado con método simple:', simpleDetectionResult);
                      userRole = simpleDetectionResult.role;
                      
                      setMessage(`Rol detectado (método simple): ${simpleDetectionResult.role}`);
                      
                      // Actualizar metadatos del usuario con el rol detectado
                      try {
                        const { error: updateError } = await supabase.auth.updateUser({
                          data: {
                            ...data.user.user_metadata,
                            rol: simpleDetectionResult.role,
                            nombre: data.user.user_metadata?.full_name || data.user.user_metadata?.name || 'Usuario',
                            role_detection: {
                              confidence: simpleDetectionResult.confidence,
                              reasoning: simpleDetectionResult.reasoning,
                              detected_at: new Date().toISOString(),
                              method: 'simple'
                            }
                          }
                        });
                        
                        if (updateError) {
                          console.error('Error actualizando metadatos (método simple):', updateError);
                        } else {
                          console.log('✅ Metadatos actualizados (método simple):', simpleDetectionResult.role);
                        }
                      } catch (updateError) {
                        console.error('Error en actualización de metadatos (método simple):', updateError);
                      }
                      
                      setTimeout(() => {
                        router.push(simpleDetectionResult.dashboardUrl);
                      }, 1500);
                      return;
                    }
                  } catch (simpleDetectionError) {
                    console.error('❌ Error en detección simple:', simpleDetectionError);
                  }
                  
                  // Si ambos métodos fallan, usar fallback del resultado original
                  if (roleDetectionResult.fallback) {
                    userRole = roleDetectionResult.fallback.role;
                  }
                }
              } catch (detectionError) {
                console.error('❌ Error en detección automática:', detectionError);
                // Continuar con lógica de fallback
              }
              
              // Si la detección automática falla, asignar "estudiante" por defecto
              if (!userRole) {
                console.log('Asignando "estudiante" por defecto después de fallo en detección');
                userRole = 'estudiante';
                
                // Actualizar metadatos del usuario de forma asíncrona
                supabase.auth.updateUser({
                  data: {
                    ...data.user.user_metadata,
                    rol: 'estudiante',
                    nombre: data.user.user_metadata?.full_name || data.user.user_metadata?.name || 'Estudiante'
                  }
                }).then(({ error: updateError }) => {
                  if (updateError) {
                    console.error('Error actualizando metadatos:', updateError);
                  } else {
                    console.log('✅ Rol "estudiante" asignado por defecto');
                  }
                }).catch(error => {
                  console.error('Error en actualización de metadatos:', error);
                });
              }
            }
            
            let dashboardUrl = '/dashboard/student'; // Por defecto estudiante
            
            // Determinar dashboard basado en rol
            if (userRole) {
              switch (userRole) {
                case 'coordinador':
                case 'admin':
                  dashboardUrl = '/admin';
                  break;
                case 'docente':
                case 'profesor':
                case 'teacher':
                  dashboardUrl = '/dashboard/teacher';
                  break;
                case 'estudiante':
                case 'student':
                  dashboardUrl = '/dashboard/student';
                  break;
                default:
                  console.log('⚠️ Rol no reconocido:', userRole, 'Tipo:', typeof userRole);
                  // En lugar de ir a setup-profile, usar detección por email como fallback
                  const email = data.user?.email || '';
                  console.log('Usando detección por email como fallback:', email);
                  
                  if (email.includes('admin') || email.includes('coordinador')) {
                    dashboardUrl = '/admin';
                    console.log('Rol detectado por email: coordinador');
                  } else if (email.includes('profesor') || email.includes('teacher') || email.includes('docente')) {
                    dashboardUrl = '/dashboard/teacher';
                    console.log('Rol detectado por email: docente');
                  } else {
                    dashboardUrl = '/dashboard/student';
                    console.log('Rol detectado por email: estudiante (por defecto)');
                  }
                  break;
              }
            } else {
              // Fallback: determinar por email si no hay rol (por defecto estudiante)
              const email = data.user?.email || '';
              console.log('Sin rol en metadatos, determinando por email:', email);
              
              if (email.includes('admin') || email.includes('coordinador')) {
                dashboardUrl = '/admin';
              } else if (email.includes('profesor') || email.includes('teacher') || email.includes('docente')) {
                dashboardUrl = '/dashboard/teacher';
              } else {
                // Por defecto, ir a dashboard de estudiante
                dashboardUrl = '/dashboard/student';
              }
            }
            
            console.log('Redirigiendo a:', dashboardUrl);
            router.push(dashboardUrl);
          }, 2000);

        } else {
          // Verificar si hay errores en los parámetros
          const error = searchParams.get('error');
          const errorDescription = searchParams.get('error_description');
          
          if (error) {
            console.error('Error en callback:', error, errorDescription);
            setStatus('error');
            setMessage(errorDescription || 'Error durante la autenticación');
          } else {
            console.error('No se encontraron tokens ni errores');
            setStatus('error');
            setMessage('No se recibieron datos de autenticación');
          }
        }

      } catch (error) {
        console.error('Error procesando callback:', error);
        setStatus('error');
        setMessage('Error inesperado durante la autenticación');
      }
    };

    // Ejecutar el manejo del callback
    handleAuthCallback();
  }, [router, searchParams]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo y título */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center mb-4">
            <div className="w-12 h-12 bg-primary rounded-xl flex items-center justify-center">
              <BookOpen className="w-7 h-7 text-white" />
            </div>
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">SemiEdu</h1>
          <p className="text-gray-600">Procesando autenticación</p>
        </div>

        <Card className="p-8 text-center">
          {status === 'loading' && (
            <div className="space-y-4">
              <LoadingSpinner size="lg" />
              <div>
                <h2 className="text-lg font-semibold text-gray-900 mb-2">
                  Procesando autenticación
                </h2>
                <p className="text-gray-600">{message}</p>
              </div>
            </div>
          )}

          {status === 'success' && (
            <div className="space-y-4">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto">
                <CheckCircle className="w-8 h-8 text-green-600" />
              </div>
              <div>
                <h2 className="text-lg font-semibold text-green-900 mb-2">
                  ¡Autenticación exitosa!
                </h2>
                <p className="text-green-700">{message}</p>
                {user && (
                  <p className="text-sm text-gray-600 mt-2">
                    Bienvenido, {user.email}
                  </p>
                )}
              </div>
            </div>
          )}

          {status === 'error' && (
            <div className="space-y-4">
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto">
                <AlertCircle className="w-8 h-8 text-red-600" />
              </div>
              <div>
                <h2 className="text-lg font-semibold text-red-900 mb-2">
                  Error de autenticación
                </h2>
                <p className="text-red-700 mb-4">{message}</p>
                <button
                  onClick={() => router.push('/auth/login')}
                  className="text-primary hover:underline"
                >
                  Volver al login
                </button>
              </div>
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}
