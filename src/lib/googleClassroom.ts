import { google } from 'googleapis';

// Configuración de Google Classroom API
const SCOPES = [
  'https://www.googleapis.com/auth/classroom.courses.readonly',
  'https://www.googleapis.com/auth/classroom.rosters.readonly',
  'https://www.googleapis.com/auth/classroom.coursework.students.readonly',
  'https://www.googleapis.com/auth/classroom.coursework.me.readonly',
  'https://www.googleapis.com/auth/classroom.announcements.readonly',
  'https://www.googleapis.com/auth/classroom.profile.emails',
  'https://www.googleapis.com/auth/classroom.profile.photos'
];

interface GoogleClassroomConfig {
  clientId: string;
  clientSecret: string;
  redirectUri: string;
}

interface SyncError {
  courseId: string;
  courseName: string;
  error: string;
}

interface SyncResults {
  courses: number;
  students: number;
  assignments: number;
  errors: SyncError[];
}

interface ClassroomCourse {
  id: string;
  name: string;
  section?: string;
  description?: string;
  room?: string;
  ownerId: string;
  creationTime: string;
  updateTime: string;
  enrollmentCode?: string;
  courseState: 'ACTIVE' | 'ARCHIVED' | 'PROVISIONED' | 'DECLINED' | 'SUSPENDED';
  alternateLink: string;
  teacherGroupEmail?: string;
  courseGroupEmail?: string;
  guardiansEnabled: boolean;
  calendarId?: string;
}

interface ClassroomStudent {
  courseId: string;
  userId: string;
  profile: {
    id: string;
    name: {
      givenName: string;
      familyName: string;
      fullName: string;
    };
    emailAddress: string;
    photoUrl?: string;
  };
}

interface ClassroomAssignment {
  courseId: string;
  id: string;
  title: string;
  description?: string;
  materials?: any[];
  state: 'PUBLISHED' | 'DRAFT' | 'DELETED';
  alternateLink: string;
  creationTime: string;
  updateTime: string;
  dueDate?: {
    year: number;
    month: number;
    day: number;
  };
  dueTime?: {
    hours: number;
    minutes: number;
  };
  maxPoints?: number;
  workType: 'ASSIGNMENT' | 'SHORT_ANSWER_QUESTION' | 'MULTIPLE_CHOICE_QUESTION';
}

class GoogleClassroomService {
  private oauth2Client: any;
  private classroom: any;

  constructor(config: GoogleClassroomConfig) {
    console.log('🔧 Inicializando GoogleClassroomService...');
    console.log('- clientId:', config.clientId?.substring(0, 20) + '...');
    console.log('- clientSecret:', config.clientSecret?.substring(0, 10) + '...');
    console.log('- redirectUri:', config.redirectUri);

    try {
      this.oauth2Client = new google.auth.OAuth2(
        config.clientId,
        config.clientSecret,
        config.redirectUri
      );
      console.log('✅ OAuth2 client creado exitosamente');
    } catch (oauthError) {
      console.error('❌ Error creando OAuth2 client:', oauthError);
      throw oauthError;
    }

    try {
      this.classroom = google.classroom({ version: 'v1', auth: this.oauth2Client });
      console.log('✅ Google Classroom API client creado exitosamente');
    } catch (classroomError) {
      console.error('❌ Error creando Classroom client:', classroomError);
      throw classroomError;
    }
  }

  // Generar URL de autorización
  generateAuthUrl(): string {
    console.log('🔧 Generando URL de autorización...');
    console.log('- oauth2Client disponible:', !!this.oauth2Client);
    console.log('- SCOPES:', SCOPES);

    try {
      const authUrl = this.oauth2Client.generateAuthUrl({
        access_type: 'offline',
        scope: SCOPES,
        prompt: 'consent'
      });
      console.log('✅ URL generada exitosamente');
      return authUrl;
    } catch (error) {
      console.error('❌ Error en generateAuthUrl:', error);
      throw error;
    }
  }

  // Intercambiar código de autorización por tokens
  async getTokens(code: string) {
    try {
      const { tokens } = await this.oauth2Client.getToken(code);
      this.oauth2Client.setCredentials(tokens);
      return tokens;
    } catch (error) {
      console.error('Error obteniendo tokens:', error);
      throw new Error('Error en la autorización de Google Classroom');
    }
  }

  // Establecer tokens de acceso
  setCredentials(tokens: any) {
    this.oauth2Client.setCredentials(tokens);
  }

  // Obtener perfil del usuario
  async getUserProfile() {
    try {
      const response = await this.classroom.userProfiles.get({
        userId: 'me'
      });
      return response.data;
    } catch (error) {
      console.error('Error obteniendo perfil:', error);
      throw new Error('Error obteniendo perfil de usuario');
    }
  }

  // Obtener todas las clases
  async getCourses(): Promise<ClassroomCourse[]> {
    try {
      const response = await this.classroom.courses.list({
        pageSize: 100,
        courseStates: ['ACTIVE']
      });

      return response.data.courses || [];
    } catch (error) {
      console.error('Error obteniendo clases:', error);
      throw new Error('Error obteniendo clases de Google Classroom');
    }
  }

  // Obtener detalles de una clase específica
  async getCourse(courseId: string): Promise<ClassroomCourse> {
    try {
      const response = await this.classroom.courses.get({
        id: courseId
      });
      return response.data;
    } catch (error) {
      console.error('Error obteniendo clase:', error);
      throw new Error('Error obteniendo detalles de la clase');
    }
  }

  // Obtener estudiantes de una clase
  async getStudents(courseId: string): Promise<ClassroomStudent[]> {
    try {
      const response = await this.classroom.courses.students.list({
        courseId: courseId,
        pageSize: 100
      });

      return response.data.students || [];
    } catch (error) {
      console.error('Error obteniendo estudiantes:', error);
      throw new Error('Error obteniendo estudiantes de la clase');
    }
  }

  // Obtener profesores de una clase
  async getTeachers(courseId: string) {
    try {
      const response = await this.classroom.courses.teachers.list({
        courseId: courseId,
        pageSize: 100
      });

      return response.data.teachers || [];
    } catch (error) {
      console.error('Error obteniendo profesores:', error);
      throw new Error('Error obteniendo profesores de la clase');
    }
  }

  // Obtener tareas de una clase
  async getAssignments(courseId: string): Promise<ClassroomAssignment[]> {
    try {
      const response = await this.classroom.courses.courseWork.list({
        courseId: courseId,
        pageSize: 100,
        courseWorkStates: ['PUBLISHED']
      });

      return response.data.courseWork || [];
    } catch (error) {
      console.error('Error obteniendo tareas:', error);
      throw new Error('Error obteniendo tareas de la clase');
    }
  }

  // Obtener entregas de una tarea
  async getSubmissions(courseId: string, courseWorkId: string) {
    try {
      const response = await this.classroom.courses.courseWork.studentSubmissions.list({
        courseId: courseId,
        courseWorkId: courseWorkId,
        pageSize: 100
      });

      return response.data.studentSubmissions || [];
    } catch (error) {
      console.error('Error obteniendo entregas:', error);
      throw new Error('Error obteniendo entregas de la tarea');
    }
  }

  // Obtener anuncios de una clase
  async getAnnouncements(courseId: string) {
    try {
      const response = await this.classroom.courses.announcements.list({
        courseId: courseId,
        pageSize: 100,
        announcementStates: ['PUBLISHED']
      });

      return response.data.announcements || [];
    } catch (error) {
      console.error('Error obteniendo anuncios:', error);
      throw new Error('Error obteniendo anuncios de la clase');
    }
  }

  // Sincronizar datos con la base de datos local
  async syncWithDatabase(): Promise<SyncResults> {
    try {
      const courses = await this.getCourses();
      const syncResults: SyncResults = {
        courses: 0,
        students: 0,
        assignments: 0,
        errors: []
      };

      for (const course of courses) {
        try {
          // Sincronizar curso
          // Aquí integrarías con tu base de datos Supabase
          syncResults.courses++;

          // Sincronizar estudiantes
          const students = await this.getStudents(course.id);
          syncResults.students += students.length;

          // Sincronizar tareas
          const assignments = await this.getAssignments(course.id);
          syncResults.assignments += assignments.length;

        } catch (error) {
          syncResults.errors.push({
            courseId: course.id,
            courseName: course.name,
            error: error instanceof Error ? error.message : String(error)
          });
        }
      }

      return syncResults;
    } catch (error) {
      console.error('Error en sincronización:', error);
      throw new Error('Error durante la sincronización con Google Classroom');
    }
  }
}

// Instancia singleton del servicio
let classroomService: GoogleClassroomService | null = null;

export function getGoogleClassroomService(): GoogleClassroomService {
  console.log('🔧 getGoogleClassroomService llamado');
  console.log('- classroomService existente:', !!classroomService);

  if (!classroomService) {
    console.log('🔧 Creando nueva instancia de GoogleClassroomService');

    const config: GoogleClassroomConfig = {
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
      redirectUri: `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/api/google/callback`
    };

    console.log('🔧 Configuración preparada:', {
      clientId: config.clientId?.substring(0, 20) + '...',
      clientSecret: config.clientSecret?.substring(0, 10) + '...',
      redirectUri: config.redirectUri
    });

    try {
      classroomService = new GoogleClassroomService(config);
      console.log('✅ GoogleClassroomService creado exitosamente');
    } catch (error) {
      console.error('❌ Error creando GoogleClassroomService:', error);
      throw error;
    }
  }

  return classroomService;
}

export type {
  ClassroomCourse,
  ClassroomStudent,
  ClassroomAssignment,
  GoogleClassroomConfig
};

export { GoogleClassroomService };
