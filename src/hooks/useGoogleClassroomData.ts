import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';

interface ClassroomCourse {
  id: string;
  name: string;
  section?: string;
  descriptionHeading?: string;
  room?: string;
  ownerId?: string;
  creationTime?: string;
  updateTime?: string;
  enrollmentCode?: string;
  courseState?: string;
  alternateLink?: string;
  teacherGroupEmail?: string;
  courseGroupEmail?: string;
  guardiansEnabled?: boolean;
  calendarId?: string;
  teacherName?: string; // Agregado para fallback
}

interface ClassroomAssignment {
  courseId: string;
  courseName?: string;
  id: string;
  title: string;
  description?: string;
  materials?: any[];
  state: string;
  alternateLink?: string;
  creationTime?: string;
  updateTime?: string;
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
  workType?: string;
  submissionModificationMode?: string;
}

interface UserProfile {
  id: string;
  name: string;
  emailAddress: string;
  photoUrl?: string;
}

interface Submission {
  courseId: string;
  courseName: string;
  courseWorkId: string;
  assignmentTitle: string;
  id: string;
  userId: string;
  state: string;
  late: boolean;
  draftGrade?: number;
  assignedGrade?: number;
  alternateLink?: string;
  creationTime?: string;
  updateTime?: string;
}

interface Statistics {
  totalCourses: number;
  totalAssignments: number;
  pendingAssignments: number;
  completedAssignments: number;
  lateSubmissions: number;
  averageGrade: number | null;
  submissionRate: number;
}

interface StudentData {
  userProfile: UserProfile | null;
  courses: ClassroomCourse[];
  assignments: ClassroomAssignment[];
  submissions: Submission[];
  statistics: Statistics;
  // Mantener compatibilidad con versión anterior
  totalCourses: number;
  pendingAssignments: number;
  completedAssignments: number;
  averageGrade: number;
  loading: boolean;
  error: string | null;
}

export function useGoogleClassroomData(): StudentData {
  const { user } = useAuth();
  const [data, setData] = useState<StudentData>({
    userProfile: null,
    courses: [],
    assignments: [],
    submissions: [],
    statistics: {
      totalCourses: 0,
      totalAssignments: 0,
      pendingAssignments: 0,
      completedAssignments: 0,
      lateSubmissions: 0,
      averageGrade: null,
      submissionRate: 0
    },
    // Mantener compatibilidad
    totalCourses: 0,
    pendingAssignments: 0,
    completedAssignments: 0,
    averageGrade: 0,
    loading: true,
    error: null
  });

  useEffect(() => {
    if (!user) return;

    const fetchGoogleClassroomData = async () => {
      try {
        console.log('🔍 Obteniendo datos reales de Google Classroom...');
        console.log('👤 Usuario actual:', { id: user.id, email: user.email, google_id: user.user_metadata?.google_id });
        setData(prev => ({ ...prev, loading: true, error: null }));

        // Obtener datos de Google Classroom usando nuestro nuevo sistema
        const response = await fetch('/api/google-classroom/student-data', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            userId: user.id,
            email: user.email,
            google_id: user.user_metadata?.google_id
          })
        });

        console.log('📡 Response status:', response.status);
        console.log('📡 Response ok:', response.ok);

        if (!response.ok) {
          throw new Error(`Error obteniendo datos: ${response.status}`);
        }

        const result = await response.json();
        console.log('📦 Resultado completo:', result);
        console.log('📦 Success:', result.success);
        console.log('📦 Source:', result.source);
        console.log('📦 Message:', result.message);

        if (result.success) {
          console.log('✅ Datos completos de Google Classroom obtenidos:', result.data);

          const courses = result.data.courses || [];
          const assignments = result.data.assignments || [];
          const submissions = result.data.submissions || [];
          const statistics = result.data.statistics || {};
          const userProfile = result.data.userProfile;

          setData({
            userProfile,
            courses,
            assignments,
            submissions,
            statistics,
            // Mantener compatibilidad con versión anterior
            totalCourses: statistics.totalCourses || courses.length,
            pendingAssignments: statistics.pendingAssignments || 0,
            completedAssignments: statistics.completedAssignments || 0,
            averageGrade: statistics.averageGrade || 0,
            loading: false,
            error: null
          });
        } else {
          if (result.error === 'CONFIGURATION_REQUIRED') {
            setData({
              userProfile: null,
              courses: result.data?.courses || [],
              assignments: result.data?.assignments || [],
              submissions: [],
              statistics: {
                totalCourses: result.data?.courses?.length || 0,
                totalAssignments: result.data?.assignments?.length || 0,
                pendingAssignments: result.data?.assignments?.length || 0,
                completedAssignments: 0,
                lateSubmissions: 0,
                averageGrade: result.data?.averageGrade || null,
                submissionRate: 0
              },
              totalCourses: result.data?.courses?.length || 0,
              pendingAssignments: result.data?.assignments?.length || 0,
              completedAssignments: 0,
              averageGrade: result.data?.averageGrade || 0,
              loading: false,
              error: 'CONFIGURATION_REQUIRED'
            });
          } else {
            throw new Error(result.error || 'Error desconocido');
          }
        }
      } catch (error) {
        console.error('❌ Error obteniendo datos de Google Classroom:', error);

        // Usar datos de fallback realistas
        setData({
          userProfile: null,
          courses: [
            {
              id: 'fallback_course',
              name: 'Clase de Prueba para API',
              section: 'Sección Principal',
              room: 'Aula Virtual',
              teacherName: 'Alejandro Anchundia',
              enrollmentCode: 'apitest2024'
            }
          ],
          assignments: [
            {
              courseId: 'fallback_course',
              courseName: 'Clase de Prueba para API',
              id: 'fallback_assignment',
              title: 'Esto es una prueba',
              description: 'Tarea de prueba para la API',
              dueDate: { year: 2024, month: 12, day: 25 },
              state: 'PUBLISHED',
              maxPoints: 100
            }
          ],
          submissions: [],
          statistics: {
            totalCourses: 1,
            totalAssignments: 1,
            pendingAssignments: 1,
            completedAssignments: 0,
            lateSubmissions: 0,
            averageGrade: 90,
            submissionRate: 0
          },
          totalCourses: 1,
          pendingAssignments: 1,
          completedAssignments: 0,
          averageGrade: 90,
          loading: false,
          error: error instanceof Error ? error.message : 'Configurando Google Classroom...'
        });
      }
    };

    fetchGoogleClassroomData();
  }, [user]);

  return data;
}
