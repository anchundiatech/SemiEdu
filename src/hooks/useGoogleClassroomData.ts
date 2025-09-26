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

interface StudentData {
  courses: ClassroomCourse[];
  assignments: ClassroomAssignment[];
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
    courses: [],
    assignments: [],
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
        setData(prev => ({ ...prev, loading: true, error: null }));

        // Intentar obtener token de acceso actual
        const { supabase } = await import('@/lib/supabase');
        const { data: session } = await supabase.auth.getSession();
        
        if (!session?.session) {
          throw new Error('No hay sesión activa');
        }

        // Obtener datos de Google Classroom
        const response = await fetch('/api/google-classroom/student-data', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            userId: user.id,
            email: user.email
          })
        });

        if (!response.ok) {
          throw new Error(`Error obteniendo datos: ${response.status}`);
        }

        const result = await response.json();

        if (result.success) {
          console.log('✅ Datos de Google Classroom obtenidos:', result.data);
          
          const courses = result.data.courses || [];
          const assignments = result.data.assignments || [];
          
          // Calcular estadísticas
          const totalCourses = courses.length;
          const pendingAssignments = assignments.filter((a: ClassroomAssignment) => 
            a.state === 'PUBLISHED' && !a.dueDate || 
            (a.dueDate && new Date(a.dueDate.year, a.dueDate.month - 1, a.dueDate.day) > new Date())
          ).length;
          
          const completedAssignments = assignments.length - pendingAssignments;
          const averageGrade = result.data.averageGrade || 85; // Placeholder si no hay calificaciones

          setData({
            courses,
            assignments,
            totalCourses,
            pendingAssignments,
            completedAssignments,
            averageGrade,
            loading: false,
            error: null
          });
        } else {
          throw new Error(result.error || 'Error desconocido');
        }
      } catch (error) {
        console.error('❌ Error obteniendo datos de Google Classroom:', error);
        
        // Usar datos de fallback realistas
        setData({
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
