import { NextRequest, NextResponse } from 'next/server';
import { getGoogleClassroomService } from '@/lib/googleClassroom';
import { supabase } from '@/lib/supabase';
import { tokenStore } from '@/lib/tokenStore';
import { google } from 'googleapis';

export async function POST(request: NextRequest) {
  try {
    console.log('🔍 API: Obteniendo datos de estudiante de Google Classroom...');

    const body = await request.json();
    const { userId, email } = body;

    console.log('📥 Request body:', { userId, email });

    if (!userId || !email) {
      console.log('❌ Faltan datos requeridos:', { userId: !!userId, email: !!email });
      return NextResponse.json(
        { error: 'ID de usuario y email requeridos' },
        { status: 400 }
      );
    }

    console.log('📋 Obteniendo datos para usuario:', email);

    // Verificar variables de entorno
    const hasClientId = !!process.env.GOOGLE_CLIENT_ID;
    const hasClientSecret = !!process.env.GOOGLE_CLIENT_SECRET;

    if (!hasClientId || !hasClientSecret) {
      console.warn('⚠️ Variables de entorno de Google no configuradas, usando datos de fallback');

      // Retornar datos que simulan tu curso real de Google Classroom
      return NextResponse.json({
        success: false,
        error: 'CONFIGURATION_REQUIRED',
        data: {
          courses: [
            {
              id: 'clase_prueba_api_main',
              name: 'Clase de Prueba para API',
              section: 'Sección Principal',
              room: 'Aula Virtual',
              teacherName: 'Alejandro Anchundia',
              enrollmentCode: 'apitest2024'
            }
          ],
          assignments: [
            {
              courseId: 'clase_prueba_api_main',
              courseName: 'Clase de Prueba para API',
              id: 'prueba_assignment_main',
              title: 'Esto es una prueba',
              description: 'Tarea publicada por Alejandro Anchundia para probar la integración',
              dueDate: { year: 2024, month: 12, day: 25 },
              state: 'PUBLISHED',
              maxPoints: 100
            }
          ],
          averageGrade: 90,
          totalSubmissions: 1,
          pendingSubmissions: 1
        },
        source: 'realistic_fallback',
        message: 'Google Classroom no está configurado. Necesitas configurar las credenciales de Google OAuth para ver tus cursos reales.',
        configuration_required: true
      });
    }

    // Obtener la sesión actual
    console.log('🔐 Intentando obtener sesión de Supabase...');
    const { data: sessionData, error: sessionError } = await supabase.auth.getSession();

    if (sessionError || !sessionData.session) {
      console.error('❌ Error obteniendo sesión:', sessionError);
      console.log('🔍 SessionData:', sessionData);
      throw new Error('No se pudo obtener la sesión del usuario');
    }

    const currentUserId = sessionData.session.user.id;
    console.log('🔍 Buscando tokens para usuario:', currentUserId);
    console.log('👤 Usuario de sesión:', sessionData.session.user.email);

    // Obtener tokens del almacén
    const tokens = tokenStore.getTokens(currentUserId);

    if (!tokens) {
      console.warn('⚠️ No se encontraron tokens de Google Classroom');
      console.log('💡 Para conectar Google Classroom, visita: /api/oauth/google');

      // Retornar datos de fallback que simulan tu curso real
      return NextResponse.json({
        success: true,
        data: {
          courses: [
            {
              id: 'clase_prueba_api',
              name: 'Clase de Prueba para API',
              section: 'Sección Principal',
              room: 'Aula Virtual',
              teacherName: 'Alejandro Anchundia',
              enrollmentCode: 'apitest2024',
              alternateLink: 'https://classroom.google.com/c/clase_prueba_api'
            }
          ],
          assignments: [
            {
              courseId: 'clase_prueba_api',
              courseName: 'Clase de Prueba para API',
              id: 'prueba_assignment_1',
              title: 'Esto es una prueba',
              description: 'Tarea publicada por Alejandro Anchundia para probar la integración con la API',
              dueDate: { year: 2024, month: 12, day: 25 },
              state: 'PUBLISHED',
              maxPoints: 100,
              alternateLink: 'https://classroom.google.com/c/clase_prueba_api/a/prueba_assignment_1'
            }
          ],
          averageGrade: 90,
          totalSubmissions: 1,
          pendingSubmissions: 1
        },
        source: 'realistic_simulation',
        message: 'Simulación de tu curso real. Haz clic en "Conectar Google Classroom" para ver datos reales.',
        needsConnection: true
      });
    }

    console.log('🔧 Configurando servicio de Google Classroom con tokens...');
    console.log('✅ Tokens válidos encontrados para usuario:', currentUserId);

    // Configurar cliente OAuth2 de Google
    const oauth2Client = new google.auth.OAuth2(
      process.env.GOOGLE_CLIENT_ID,
      process.env.GOOGLE_CLIENT_SECRET,
      'http://localhost:3000/api/oauth/google/callback'
    );

    // Establecer credenciales
    oauth2Client.setCredentials({
      access_token: tokens.access_token,
      refresh_token: tokens.refresh_token,
      expiry_date: tokens.expires_at
    });

    console.log('📚 Obteniendo datos completos de Google Classroom...');

    // Crear cliente de Google Classroom
    const classroom = google.classroom({ version: 'v1', auth: oauth2Client });

    // 1. Obtener perfil del usuario
    let userProfile = null;
    try {
      const profileResponse = await classroom.userProfiles.get({ userId: 'me' });
      userProfile = profileResponse.data;
      console.log('👤 Perfil de usuario obtenido:', userProfile.name?.fullName);
    } catch (profileError) {
      console.warn('⚠️ Error obteniendo perfil de usuario:', profileError);
    }

    // 2. Obtener cursos donde el usuario es estudiante
    const coursesResponse = await classroom.courses.list({
      studentId: 'me',
      courseStates: ['ACTIVE'],
      pageSize: 50 // Aumentar límite según documentación
    });

    const courses = coursesResponse.data.courses || [];
    console.log('✅ Cursos obtenidos:', courses.length);

    // 3. Obtener información detallada de cada curso
    const detailedCourses = [];
    for (const course of courses) {
      try {
        // Obtener detalles del curso
        const courseDetails = await classroom.courses.get({ id: course.id! });
        
        // Obtener profesores del curso
        let teachers: any[] = [];
        try {
          const teachersResponse = await classroom.courses.teachers.list({ 
            courseId: course.id!,
            pageSize: 10
          });
          teachers = teachersResponse.data.teachers || [];
        } catch (teacherError) {
          console.warn(`⚠️ Error obteniendo profesores del curso ${course.name}:`, teacherError);
        }

        // Obtener número de estudiantes
        let studentCount = 0;
        try {
          const studentsResponse = await classroom.courses.students.list({ 
            courseId: course.id!,
            pageSize: 1 // Solo para contar
          });
          studentCount = studentsResponse.data.students?.length || 0;
        } catch (studentError) {
          console.warn(`⚠️ Error obteniendo estudiantes del curso ${course.name}:`, studentError);
        }

        detailedCourses.push({
          ...courseDetails.data,
          teacherNames: teachers.map((t: any) => t.profile?.name?.fullName).filter(Boolean),
          studentCount
        });
      } catch (courseError) {
        console.warn(`⚠️ Error obteniendo detalles del curso ${course.name}:`, courseError);
        detailedCourses.push(course);
      }
    }

    // 4. Obtener tareas de todos los cursos con más detalles
    const assignments = [];
    const submissions = [];
    
    for (const course of detailedCourses.slice(0, 5)) { // Limitar a 5 cursos para evitar rate limits
      try {
        // Obtener tareas del curso
        const courseWorkResponse = await classroom.courses.courseWork.list({
          courseId: course.id!,
          pageSize: 20,
          orderBy: 'dueDate desc'
        });

        const courseWork = courseWorkResponse.data.courseWork || [];
        
        // Para cada tarea, obtener las entregas del estudiante
        for (const work of courseWork) {
          try {
            const submissionsResponse = await classroom.courses.courseWork.studentSubmissions.list({
              courseId: course.id!,
              courseWorkId: work.id!,
              userId: 'me'
            });

            const studentSubmissions = submissionsResponse.data.studentSubmissions || [];
            
            assignments.push({
              courseId: course.id,
              courseName: course.name,
              id: work.id,
              title: work.title,
              description: work.description,
              state: work.state,
              dueDate: work.dueDate,
              dueTime: work.dueTime,
              maxPoints: work.maxPoints,
              alternateLink: work.alternateLink,
              workType: work.workType,
              creationTime: work.creationTime,
              updateTime: work.updateTime,
              materials: work.materials,
              submissionCount: studentSubmissions.length,
              hasSubmission: studentSubmissions.length > 0
            });

            // Agregar entregas a la lista
            submissions.push(...studentSubmissions.map((sub: any) => ({
              courseId: course.id,
              courseName: course.name,
              courseWorkId: work.id,
              assignmentTitle: work.title,
              id: sub.id,
              userId: sub.userId,
              state: sub.state,
              late: sub.late,
              draftGrade: sub.draftGrade,
              assignedGrade: sub.assignedGrade,
              alternateLink: sub.alternateLink,
              creationTime: sub.creationTime,
              updateTime: sub.updateTime
            })));

          } catch (submissionError) {
            console.warn(`⚠️ Error obteniendo entregas para tarea ${work.title}:`, submissionError);
          }
        }
      } catch (courseError) {
        console.warn(`⚠️ Error obteniendo tareas del curso ${course.name}:`, courseError);
      }
    }

    console.log('✅ Tareas obtenidas:', assignments.length);
    console.log('✅ Entregas obtenidas:', submissions.length);

    // Calcular estadísticas avanzadas
    const totalCourses = detailedCourses.length;
    const pendingAssignments = assignments.filter((a: any) => {
      if (!a.dueDate) return a.state === 'PUBLISHED';
      const dueDate = new Date(a.dueDate.year, a.dueDate.month - 1, a.dueDate.day);
      return dueDate > new Date() && a.state === 'PUBLISHED';
    }).length;

    const completedAssignments = assignments.filter((a: any) => a.hasSubmission).length;
    const lateSubmissions = submissions.filter((s: any) => s.late).length;
    
    // Calcular promedio de calificaciones
    const gradedSubmissions = submissions.filter((s: any) => s.assignedGrade !== null && s.assignedGrade !== undefined);
    const averageGrade = gradedSubmissions.length > 0 
      ? gradedSubmissions.reduce((sum: number, s: any) => sum + (s.assignedGrade || 0), 0) / gradedSubmissions.length
      : null;

    return NextResponse.json({
      success: true,
      data: {
        // Información del usuario
        userProfile: userProfile ? {
          id: userProfile.id,
          name: userProfile.name?.fullName,
          emailAddress: userProfile.emailAddress,
          photoUrl: userProfile.photoUrl
        } : null,

        // Cursos con información detallada
        courses: detailedCourses.map((course: any) => ({
          id: course.id,
          name: course.name,
          section: course.section,
          descriptionHeading: course.descriptionHeading,
          room: course.room,
          ownerId: course.ownerId,
          creationTime: course.creationTime,
          updateTime: course.updateTime,
          enrollmentCode: course.enrollmentCode,
          courseState: course.courseState,
          alternateLink: course.alternateLink,
          teacherGroupEmail: course.teacherGroupEmail,
          courseGroupEmail: course.courseGroupEmail,
          guardiansEnabled: course.guardiansEnabled,
          calendarId: course.calendarId,
          teacherNames: course.teacherNames || [],
          studentCount: course.studentCount || 0
        })),

        // Tareas con información completa
        assignments: assignments.map((assignment: any) => ({
          courseId: assignment.courseId,
          courseName: assignment.courseName,
          id: assignment.id,
          title: assignment.title,
          description: assignment.description,
          state: assignment.state,
          dueDate: assignment.dueDate,
          dueTime: assignment.dueTime,
          maxPoints: assignment.maxPoints,
          alternateLink: assignment.alternateLink,
          workType: assignment.workType,
          creationTime: assignment.creationTime,
          updateTime: assignment.updateTime,
          materials: assignment.materials,
          submissionCount: assignment.submissionCount,
          hasSubmission: assignment.hasSubmission
        })),

        // Entregas del estudiante
        submissions: submissions.map((submission: any) => ({
          courseId: submission.courseId,
          courseName: submission.courseName,
          courseWorkId: submission.courseWorkId,
          assignmentTitle: submission.assignmentTitle,
          id: submission.id,
          userId: submission.userId,
          state: submission.state,
          late: submission.late,
          draftGrade: submission.draftGrade,
          assignedGrade: submission.assignedGrade,
          alternateLink: submission.alternateLink,
          creationTime: submission.creationTime,
          updateTime: submission.updateTime
        })),

        // Estadísticas calculadas
        statistics: {
          totalCourses,
          totalAssignments: assignments.length,
          pendingAssignments,
          completedAssignments,
          lateSubmissions,
          averageGrade: averageGrade ? Math.round(averageGrade * 100) / 100 : null,
          submissionRate: assignments.length > 0 ? Math.round((completedAssignments / assignments.length) * 100) : 0
        }
      },
      source: 'google_classroom_api',
      message: 'Datos completos obtenidos de Google Classroom API',
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('❌ Error en API de datos de estudiante:', error);
    console.error('❌ Stack trace:', error instanceof Error ? error.stack : 'No stack trace');
    console.error('❌ Error message:', error instanceof Error ? error.message : String(error));

    // Retornar datos de fallback en caso de error
    return NextResponse.json({
      success: true,
      data: {
        courses: [
          {
            id: 'fallback_1',
            name: 'Curso de Ejemplo',
            section: 'Sección A',
            room: 'Aula Virtual',
            teacherName: 'Profesor Ejemplo',
            enrollmentCode: 'ejemplo2024'
          }
        ],
        assignments: [
          {
            courseId: 'fallback_1',
            id: 'fallback_assign_1',
            title: 'Tarea de Ejemplo',
            description: 'Esta es una tarea de ejemplo mientras configuramos Google Classroom',
            dueDate: { year: 2024, month: 12, day: 31 },
            state: 'PUBLISHED',
            maxPoints: 100
          }
        ],
        averageGrade: 85,
        totalSubmissions: 1,
        pendingSubmissions: 1
      },
      source: 'error_fallback',
      message: `Error obteniendo datos: ${error instanceof Error ? error.message : 'Error desconocido'}`,
      error: error instanceof Error ? error.message : 'Error desconocido'
    });
  }
}
