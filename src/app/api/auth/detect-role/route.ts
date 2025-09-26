import { NextRequest, NextResponse } from 'next/server';
import { getGoogleClassroomService } from '@/lib/googleClassroom';
import { createRoleDetectionService } from '@/lib/roleDetection';
import { supabase } from '@/lib/supabase';

export async function POST(request: NextRequest) {
  try {
    console.log('🔍 API: Iniciando detección automática de rol...');

    const body = await request.json();
    const { accessToken, refreshToken, userId } = body;

    console.log('📋 Datos recibidos:', {
      hasAccessToken: !!accessToken,
      hasRefreshToken: !!refreshToken,
      userId: userId,
      tokenLength: accessToken?.length || 0
    });

    if (!accessToken) {
      console.error('❌ No se proporcionó token de acceso');
      return NextResponse.json(
        { error: 'Token de acceso requerido' },
        { status: 400 }
      );
    }

    console.log('🔧 Configurando servicio de Google Classroom...');

    // Verificar variables de entorno
    const hasClientId = !!process.env.GOOGLE_CLIENT_ID;
    const hasClientSecret = !!process.env.GOOGLE_CLIENT_SECRET;
    console.log('🔧 Variables de entorno:', { hasClientId, hasClientSecret });

    if (!hasClientId || !hasClientSecret) {
      console.error('❌ Variables de entorno de Google no configuradas');
      return NextResponse.json({
        success: false,
        error: 'Configuración de Google no disponible',
        fallback: {
          role: 'estudiante',
          confidence: 'low',
          reasoning: 'Variables de entorno de Google no configuradas',
          dashboardUrl: '/dashboard/student'
        }
      }, { status: 500 });
    }

    // Crear instancia del servicio de Google Classroom
    let classroomService;
    try {
      classroomService = getGoogleClassroomService();
      console.log('✅ Servicio de Google Classroom creado');
    } catch (serviceError) {
      console.error('❌ Error creando servicio de Google Classroom:', serviceError);
      return NextResponse.json({
        success: false,
        error: 'Error configurando servicio de Google Classroom',
        fallback: {
          role: 'estudiante',
          confidence: 'low',
          reasoning: 'Error en configuración del servicio de Google',
          dashboardUrl: '/dashboard/student'
        }
      }, { status: 500 });
    }
    
    // Establecer credenciales
    try {
      classroomService.setCredentials({
        access_token: accessToken,
        refresh_token: refreshToken
      });
      console.log('✅ Credenciales establecidas');
    } catch (credentialsError) {
      console.error('❌ Error estableciendo credenciales:', credentialsError);
      return NextResponse.json({
        success: false,
        error: 'Error estableciendo credenciales de Google',
        fallback: {
          role: 'estudiante',
          confidence: 'low',
          reasoning: 'Error en credenciales de Google',
          dashboardUrl: '/dashboard/student'
        }
      }, { status: 500 });
    }

    console.log('🔍 Iniciando detección de rol...');

    // Crear servicio de detección de roles
    const roleDetectionService = createRoleDetectionService(classroomService);
    
    // Detectar rol automáticamente
    let roleResult;
    try {
      roleResult = await roleDetectionService.detectUserRole();
      console.log('✅ Detección completada:', roleResult);
    } catch (detectionError) {
      console.error('❌ Error en detección de rol:', detectionError);
      
      // Crear fallback más detallado
      return NextResponse.json({
        success: false,
        error: `Error en detección: ${detectionError instanceof Error ? detectionError.message : String(detectionError)}`,
        fallback: {
          role: 'estudiante',
          confidence: 'low',
          reasoning: `Error en detección automática: ${detectionError instanceof Error ? detectionError.message : 'Error desconocido'}`,
          dashboardUrl: '/dashboard/student'
        }
      }, { status: 500 });
    }

    console.log('✅ Rol detectado:', roleResult);

    // Si tenemos un userId, actualizar los metadatos del usuario en Supabase
    if (userId && roleResult.confidence !== 'low') {
      try {
        console.log('📝 Actualizando rol en Supabase...');
        
        const { error: updateError } = await supabase.auth.admin.updateUserById(
          userId,
          {
            user_metadata: {
              rol: roleResult.role,
              role_detection: {
                confidence: roleResult.confidence,
                reasoning: roleResult.reasoning,
                details: roleResult.details,
                detected_at: new Date().toISOString()
              }
            }
          }
        );

        if (updateError) {
          console.error('❌ Error actualizando usuario en Supabase:', updateError);
        } else {
          console.log('✅ Rol actualizado en Supabase exitosamente');
        }
      } catch (supabaseError) {
        console.error('❌ Error con Supabase:', supabaseError);
        // No fallar la detección por errores de Supabase
      }
    }

    // Determinar URL de redirección basada en el rol detectado
    let dashboardUrl = '/dashboard/student'; // Por defecto

    switch (roleResult.role) {
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

    return NextResponse.json({
      success: true,
      role: roleResult.role,
      confidence: roleResult.confidence,
      reasoning: roleResult.reasoning,
      details: roleResult.details,
      dashboardUrl,
      message: `Rol detectado: ${roleResult.role} (confianza: ${roleResult.confidence})`
    });

  } catch (error) {
    console.error('❌ Error en detección de rol:', error);

    // Respuesta de fallback
    return NextResponse.json({
      success: false,
      error: 'Error en detección automática de rol',
      fallback: {
        role: 'estudiante',
        confidence: 'low',
        reasoning: 'Error en detección automática, asignando rol por defecto',
        dashboardUrl: '/dashboard/student'
      }
    }, { status: 500 });
  }
}
