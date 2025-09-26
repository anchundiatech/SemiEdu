import { GoogleClassroomService } from './googleClassroom';

export interface RoleDetectionResult {
  role: 'coordinador' | 'docente' | 'estudiante';
  confidence: 'high' | 'medium' | 'low';
  details: {
    coursesAsTeacher: number;
    coursesAsStudent: number;
    totalCourses: number;
    isOwnerOfMultipleCourses: boolean;
    hasTeacherPermissions: boolean;
    hasStudentPermissions: boolean;
  };
  reasoning: string;
}

export class RoleDetectionService {
  private classroomService: GoogleClassroomService;

  constructor(classroomService: GoogleClassroomService) {
    this.classroomService = classroomService;
  }

  /**
   * Detecta automáticamente el rol del usuario basándose en sus permisos en Google Classroom
   */
  async detectUserRole(): Promise<RoleDetectionResult> {
    let userProfile: any = null;
    let courses: any[] = [];

    try {
      console.log('🔍 Iniciando detección automática de rol...');

      // Obtener perfil del usuario
      try {
        userProfile = await this.classroomService.getUserProfile();
        console.log('👤 Perfil de usuario obtenido:', userProfile?.emailAddress || 'Sin email');
      } catch (profileError) {
        console.error('❌ Error obteniendo perfil de usuario:', profileError);
        throw new Error(`Error obteniendo perfil: ${profileError instanceof Error ? profileError.message : String(profileError)}`);
      }

      // Obtener todas las clases
      try {
        courses = await this.classroomService.getCourses();
        console.log('📚 Clases encontradas:', courses?.length || 0);
      } catch (coursesError) {
        console.error('❌ Error obteniendo clases:', coursesError);
        // Si no podemos obtener clases, usar fallback por email
        console.log('🔄 Usando detección por email como fallback');
        return this.fallbackRoleDetection(userProfile?.emailAddress || '');
      }

      let coursesAsTeacher = 0;
      let coursesAsStudent = 0;
      let isOwnerOfMultipleCourses = false;
      let hasTeacherPermissions = false;
      let hasStudentPermissions = false;

      // Analizar cada clase para determinar el rol del usuario
      for (const course of courses) {
        try {
          // Verificar si el usuario es el propietario/creador de la clase
          if (course.ownerId === userProfile.id) {
            coursesAsTeacher++;
            hasTeacherPermissions = true;
            console.log(`👨‍🏫 Usuario es propietario de: ${course.name}`);
          } else {
            // Verificar si es profesor en la clase
            try {
              const teachers = await this.classroomService.getTeachers(course.id);
              const isTeacher = teachers.some((teacher: any) => teacher.profile.id === userProfile.id);
              
              if (isTeacher) {
                coursesAsTeacher++;
                hasTeacherPermissions = true;
                console.log(`👨‍🏫 Usuario es profesor en: ${course.name}`);
              } else {
                // Verificar si es estudiante en la clase
                try {
                  const students = await this.classroomService.getStudents(course.id);
                  const isStudent = students.some((student: any) => student.profile.id === userProfile.id);
                  
                  if (isStudent) {
                    coursesAsStudent++;
                    hasStudentPermissions = true;
                    console.log(`👨‍🎓 Usuario es estudiante en: ${course.name}`);
                  }
                } catch (studentError) {
                  console.warn(`⚠️ No se pudo verificar estudiantes en ${course.name}:`, studentError);
                }
              }
            } catch (teacherError) {
              console.warn(`⚠️ No se pudo verificar profesores en ${course.name}:`, teacherError);
            }
          }
        } catch (courseError) {
          console.warn(`⚠️ Error analizando curso ${course.name}:`, courseError);
        }
      }

      // Determinar si es propietario de múltiples cursos (indicador de coordinador)
      isOwnerOfMultipleCourses = courses.filter(course => course.ownerId === userProfile.id).length > 1;

      const details = {
        coursesAsTeacher,
        coursesAsStudent,
        totalCourses: courses.length,
        isOwnerOfMultipleCourses,
        hasTeacherPermissions,
        hasStudentPermissions
      };

      console.log('📊 Análisis de roles completado:', details);

      // Lógica de detección de rol
      const result = this.determineRole(details, userProfile.emailAddress);
      
      console.log('🎯 Rol detectado:', result);
      return result;

    } catch (error) {
      console.error('❌ Error en detección de rol:', error);
      
      // Fallback: rol por defecto basado en email
      return this.fallbackRoleDetection(userProfile?.emailAddress || '');
    }
  }

  /**
   * Determina el rol basándose en los datos analizados
   */
  private determineRole(details: RoleDetectionResult['details'], email: string): RoleDetectionResult {
    const {
      coursesAsTeacher,
      coursesAsStudent,
      isOwnerOfMultipleCourses,
      hasTeacherPermissions,
      hasStudentPermissions
    } = details;

    // COORDINADOR: Múltiples indicadores de administración
    if (isOwnerOfMultipleCourses || coursesAsTeacher >= 3) {
      return {
        role: 'coordinador',
        confidence: 'high',
        details,
        reasoning: `Usuario es propietario de múltiples cursos (${coursesAsTeacher}) o tiene permisos de profesor en 3+ clases, indicando rol de coordinación.`
      };
    }

    // COORDINADOR: Basado en email si tiene permisos de profesor
    if (hasTeacherPermissions && this.isCoordinatorEmail(email)) {
      return {
        role: 'coordinador',
        confidence: 'medium',
        details,
        reasoning: `Email sugiere rol de coordinador y tiene permisos de profesor en al menos una clase.`
      };
    }

    // DOCENTE: Tiene permisos de profesor pero no múltiples cursos
    if (hasTeacherPermissions && coursesAsTeacher > 0) {
      return {
        role: 'docente',
        confidence: 'high',
        details,
        reasoning: `Usuario tiene permisos de profesor en ${coursesAsTeacher} clase(s) pero no indica coordinación múltiple.`
      };
    }

    // DOCENTE: Basado en email si no tiene permisos claros
    if (this.isTeacherEmail(email)) {
      return {
        role: 'docente',
        confidence: 'low',
        details,
        reasoning: `Email sugiere rol de profesor pero no se encontraron permisos claros de profesor en Google Classroom.`
      };
    }

    // ESTUDIANTE: Solo tiene permisos de estudiante
    if (hasStudentPermissions && !hasTeacherPermissions) {
      return {
        role: 'estudiante',
        confidence: 'high',
        details,
        reasoning: `Usuario solo tiene permisos de estudiante en ${coursesAsStudent} clase(s).`
      };
    }

    // ESTUDIANTE: Por defecto
    return {
      role: 'estudiante',
      confidence: 'low',
      details,
      reasoning: `No se encontraron permisos claros. Asignando rol de estudiante por defecto.`
    };
  }

  /**
   * Detección de rol de emergencia basada solo en email
   */
  private fallbackRoleDetection(email: string): RoleDetectionResult {
    console.log('🔄 Usando detección de rol de emergencia para:', email);

    const details = {
      coursesAsTeacher: 0,
      coursesAsStudent: 0,
      totalCourses: 0,
      isOwnerOfMultipleCourses: false,
      hasTeacherPermissions: false,
      hasStudentPermissions: false
    };

    if (this.isCoordinatorEmail(email)) {
      return {
        role: 'coordinador',
        confidence: 'low',
        details,
        reasoning: `Email sugiere rol de coordinador (contiene palabras clave de administración).`
      };
    }

    if (this.isTeacherEmail(email)) {
      return {
        role: 'docente',
        confidence: 'low',
        details,
        reasoning: `Email sugiere rol de profesor (contiene palabras clave de docencia).`
      };
    }

    return {
      role: 'estudiante',
      confidence: 'low',
      details,
      reasoning: `Sin acceso a Google Classroom. Asignando rol de estudiante por defecto.`
    };
  }

  /**
   * Verifica si el email sugiere rol de coordinador
   */
  private isCoordinatorEmail(email: string): boolean {
    const coordinatorKeywords = [
      'admin', 'coordinador', 'coordinator', 'director', 'jefe', 'head',
      'principal', 'supervisor', 'manager', 'administrador'
    ];
    
    const emailLower = email.toLowerCase();
    return coordinatorKeywords.some(keyword => emailLower.includes(keyword));
  }

  /**
   * Verifica si el email sugiere rol de profesor
   */
  private isTeacherEmail(email: string): boolean {
    const teacherKeywords = [
      'profesor', 'teacher', 'docente', 'instructor', 'tutor',
      'maestro', 'prof', 'educador', 'faculty'
    ];
    
    const emailLower = email.toLowerCase();
    return teacherKeywords.some(keyword => emailLower.includes(keyword));
  }
}

/**
 * Función utilitaria para crear una instancia del servicio de detección de roles
 */
export function createRoleDetectionService(classroomService: GoogleClassroomService): RoleDetectionService {
  return new RoleDetectionService(classroomService);
}
