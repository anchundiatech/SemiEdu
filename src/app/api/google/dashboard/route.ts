import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase-server';

export async function GET(request: NextRequest) {
  try {
    console.log('🔍 API Dashboard - Obteniendo datos del dashboard...');
    
    const { supabase, user, error: authError } = await createServerClient();

    if (authError || !user) {
      console.log('⚠️ TEMPORAL: Obteniendo datos del dashboard sin autenticación');
      
      // Obtener datos de memoria global
      const classroomData = (global as any).classroomData;
      
      if (!classroomData) {
        return NextResponse.json({
          success: false,
          error: 'No hay datos disponibles. Sincroniza con Google Classroom primero.',
          data: null
        });
      }
      
      console.log('📊 Datos del dashboard encontrados en memoria global');
      console.log(`- Cursos: ${classroomData.courses?.length || 0}`);
      console.log(`- Estudiantes: ${classroomData.totalStudents || 0}`);
      console.log(`- Profesores: ${classroomData.totalTeachers || 0}`);
      console.log(`- Tareas: ${classroomData.totalAssignments || 0}`);
      
      return NextResponse.json({
        success: true,
        data: classroomData,
        message: 'Datos del dashboard cargados exitosamente'
      });
    }

    // Si hay usuario autenticado, intentar obtener datos de la base de datos
    // Por ahora, usar datos de memoria global como fallback
    const classroomData = (global as any).classroomData;
    
    if (!classroomData) {
      return NextResponse.json({
        success: false,
        error: 'No hay datos disponibles. Sincroniza con Google Classroom primero.',
        data: null
      });
    }

    return NextResponse.json({
      success: true,
      data: classroomData,
      message: 'Datos del dashboard cargados exitosamente'
    });

  } catch (error) {
    console.error('❌ Error en endpoint de dashboard:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Error interno del servidor',
      data: null
    });
  }
}
