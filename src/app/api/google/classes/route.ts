import { NextRequest, NextResponse } from 'next/server';
import { getGoogleClassroomService } from '@/lib/googleClassroom';
import { createServerClient } from '@/lib/supabase-server';

export async function GET(request: NextRequest) {
  try {
    console.log('🔍 API Classes - Obteniendo clases de Google Classroom...');
    
    const { supabase, user, error: authError } = await createServerClient();

    if (authError || !user) {
      console.log('⚠️ TEMPORAL: Obteniendo clases sin autenticación usando tokens temporales');
      
      // Obtener tokens temporales de memoria global
      const tempTokens = (global as any).tempGoogleTokens;
      
      if (!tempTokens) {
        return NextResponse.json({
          success: false,
          error: 'No hay tokens disponibles. Conecta con Google Classroom primero.',
          classes: []
        });
      }
      
      console.log('🔑 Usando tokens temporales para obtener clases...');
      console.log('- Email:', tempTokens.google_email);
      
      try {
        const classroomService = getGoogleClassroomService();
        
        // Configurar tokens
        classroomService.setCredentials({
          access_token: tempTokens.access_token,
          refresh_token: tempTokens.refresh_token,
          expiry_date: tempTokens.expires_at
        });
        
        console.log('📚 Obteniendo cursos de Google Classroom...');
        const courses = await classroomService.getCourses();
        console.log(`✅ ${courses.length} cursos obtenidos de Google Classroom`);
        
        // Obtener información adicional de cada curso
        const classesWithDetails = await Promise.all(
          courses.map(async (course) => {
            try {
              // Obtener estudiantes del curso
              const students = await classroomService.getStudents(course.id);
              
              // Obtener tareas del curso
              const assignments = await classroomService.getAssignments(course.id);
              
              return {
                ...course,
                studentsCount: students.length,
                assignmentsCount: assignments.length
              };
            } catch (error) {
              console.warn(`⚠️ Error obteniendo detalles del curso ${course.name}:`, error);
              return {
                ...course,
                studentsCount: 0,
                assignmentsCount: 0
              };
            }
          })
        );
        
        console.log('✅ Clases con detalles preparadas:', classesWithDetails.length);
        
        return NextResponse.json({
          success: true,
          classes: classesWithDetails,
          message: `${classesWithDetails.length} clases cargadas exitosamente`
        });
        
      } catch (error) {
        console.error('❌ Error obteniendo clases de Google:', error);
        return NextResponse.json({
          success: false,
          error: error instanceof Error ? error.message : 'Error obteniendo clases',
          classes: []
        });
      }
    }

    // Si hay usuario autenticado, usar tokens de la base de datos
    const { data: integration } = await supabase
      .from('google_integrations')
      .select('*')
      .eq('user_id', user.id)
      .single();

    if (!integration) {
      return NextResponse.json({
        success: false,
        error: 'No hay integración con Google Classroom configurada',
        classes: []
      });
    }

    console.log('🔑 Usando tokens de base de datos...');
    
    const classroomService = getGoogleClassroomService();
    classroomService.setCredentials({
      access_token: integration.access_token,
      refresh_token: integration.refresh_token,
      expiry_date: new Date(integration.expires_at).getTime()
    });

    const courses = await classroomService.getCourses();
    
    const classesWithDetails = await Promise.all(
      courses.map(async (course) => {
        try {
          const students = await classroomService.getStudents(course.id);
          const assignments = await classroomService.getAssignments(course.id);
          
          return {
            ...course,
            studentsCount: students.length,
            assignmentsCount: assignments.length
          };
        } catch (error) {
          return {
            ...course,
            studentsCount: 0,
            assignmentsCount: 0
          };
        }
      })
    );

    return NextResponse.json({
      success: true,
      classes: classesWithDetails,
      message: `${classesWithDetails.length} clases cargadas exitosamente`
    });

  } catch (error) {
    console.error('❌ Error en endpoint de clases:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Error interno del servidor',
      classes: []
    });
  }
}
