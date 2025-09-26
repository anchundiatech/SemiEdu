import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase-server';

export async function GET(request: NextRequest) {
  try {
    console.log('🚀 API Status - Iniciando verificación...');
    const { supabase, user, error: authError } = await createServerClient();

    if (authError || !user) {
      console.log('🔍 API Status - Error de autenticación:', authError);
      console.log('🔍 API Status - Usuario:', user ? 'Presente' : 'Ausente');
      
      // TEMPORAL: Verificar si hay tokens temporales en memoria
      const tempTokens = (global as any).tempGoogleTokens;
      
      if (tempTokens) {
        console.log('⚠️ TEMPORAL: Estado conectado basado en tokens temporales');
        
        return NextResponse.json({
          success: true,
          status: { 
            connected: true,
            google_email: tempTokens.google_email,
            google_name: tempTokens.google_name || 'Usuario Temporal',
            last_sync: null,
            temp_connection: true
          }
        });
      } else {
        console.log('⚠️ TEMPORAL: No hay tokens temporales - estado desconectado');
        
        return NextResponse.json({
          success: true,
          status: { 
            connected: false,
            error: 'No hay integración configurada'
          }
        });
      }
      
      // Código original comentado:
      // return NextResponse.json({
      //   success: true,
      //   status: { 
      //     connected: false,
      //     error: 'Usuario no autenticado'
      //   }
      // });
    }

    // Obtener información de la integración
    const { data: integration, error: integrationError } = await supabase
      .from('google_integrations')
      .select('*')
      .eq('user_id', user.id)
      .single();

    console.log('🔍 Verificando integración para usuario:', user.id);
    console.log('🔍 Integración encontrada:', integration);
    console.log('🔍 Error de integración:', integrationError);

    if (!integration) {
      // Si no hay integración, aún podemos mostrar las estadísticas generales
      console.log('⚠️ No hay integración configurada, mostrando datos generales');
      
      // Obtener estadísticas generales sin filtrar por Google
      console.log('📊 Obteniendo estadísticas generales...');
      
      const { count: coursesCount, error: coursesError } = await supabase
        .from('clases')
        .select('*', { count: 'exact', head: true });

      const { count: studentsCount, error: studentsError } = await supabase
        .from('usuarios')
        .select('*', { count: 'exact', head: true })
        .eq('rol', 'estudiante');

      const { count: assignmentsCount, error: assignmentsError } = await supabase
        .from('tareas')
        .select('*', { count: 'exact', head: true });

      console.log('📊 Resultados de conteo:');
      console.log('- Clases:', coursesCount, 'Error:', coursesError);
      console.log('- Estudiantes:', studentsCount, 'Error:', studentsError);
      console.log('- Tareas:', assignmentsCount, 'Error:', assignmentsError);

      const result = {
        success: true,
        status: { 
          connected: false,
          totalCourses: coursesCount || 0,
          totalStudents: studentsCount || 0,
          totalAssignments: assignmentsCount || 0,
          userRole: user.user_metadata?.rol || 'estudiante',
          userName: user.user_metadata?.nombre || user.user_metadata?.full_name || 'Usuario',
          userEmail: user.email
        }
      };

      console.log('📤 Enviando respuesta:', result);
      return NextResponse.json(result);
    }

    // Verificar si el token ha expirado
    const now = new Date();
    const expiresAt = new Date(integration.expires_at);
    const isExpired = now >= expiresAt;

    // Obtener estadísticas de sincronización (usar los mismos datos que el dashboard)
    console.log('📊 Obteniendo estadísticas con integración...');
    
    const { count: coursesCount, error: coursesError } = await supabase
      .from('clases')
      .select('*', { count: 'exact', head: true });

    const { count: studentsCount, error: studentsError } = await supabase
      .from('usuarios')
      .select('*', { count: 'exact', head: true })
      .eq('rol', 'estudiante');

    const { count: assignmentsCount, error: assignmentsError } = await supabase
      .from('tareas')
      .select('*', { count: 'exact', head: true });

    console.log('📊 Resultados con integración:');
    console.log('- Clases:', coursesCount, 'Error:', coursesError);
    console.log('- Estudiantes:', studentsCount, 'Error:', studentsError);
    console.log('- Tareas:', assignmentsCount, 'Error:', assignmentsError);

    const result = {
      success: true,
      status: {
        connected: !isExpired,
        googleEmail: integration.google_email,
        googleName: integration.google_name,
        lastSync: integration.last_sync,
        totalCourses: coursesCount || 0,
        totalStudents: studentsCount || 0,
        totalAssignments: assignmentsCount || 0,
        tokenExpired: isExpired,
        userRole: user.user_metadata?.rol || 'estudiante',
        userName: user.user_metadata?.nombre || user.user_metadata?.full_name || 'Usuario',
        userEmail: user.email
      }
    };

    console.log('📤 Enviando respuesta con integración:', result);
    return NextResponse.json(result);

  } catch (error) {
    console.error('Error verificando estado:', error);
    return NextResponse.json(
      { success: false, error: 'Error verificando estado de integración' },
      { status: 500 }
    );
  }
}
