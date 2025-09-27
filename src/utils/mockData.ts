// Datos mock para simular la integración con Google Classroom

export interface Student {
  id: string;
  name: string;
  email: string;
  progress: number;
  attendance: number;
  assignments: Assignment[];
}

export interface Assignment {
  id: string;
  title: string;
  dueDate: string;
  status: 'pending' | 'submitted' | 'graded';
  grade?: number;
  course: string;
}

export interface Course {
  id: string;
  name: string;
  teacher: string;
  students: number;
  averageGrade: number;
  assignments: Assignment[];
}

export interface Notification {
  id: string;
  type: 'task' | 'calendar' | 'grade' | 'announcement';
  title: string;
  message: string;
  date: string;
  read: boolean;
  priority: 'high' | 'medium' | 'low';
}

export interface AttendanceReport {
  studentId: string;
  studentName: string;
  totalClasses: number;
  attendedClasses: number;
  attendanceRate: number;
  course: string;
}

export const mockStudents: Student[] = [
  {
    id: '1',
    name: 'María García',
    email: 'maria.garcia@estudiante.edu',
    progress: 85,
    attendance: 92,
    assignments: [
      {
        id: '1',
        title: 'Ensayo de Historia',
        dueDate: '2024-01-15',
        status: 'submitted',
        grade: 88,
        course: 'Historia Universal'
      },
      {
        id: '2',
        title: 'Proyecto de Matemáticas',
        dueDate: '2024-01-20',
        status: 'pending',
        course: 'Matemáticas Avanzadas'
      }
    ]
  },
  {
    id: '2',
    name: 'Carlos Rodríguez',
    email: 'carlos.rodriguez@estudiante.edu',
    progress: 78,
    attendance: 88,
    assignments: [
      {
        id: '3',
        title: 'Laboratorio de Química',
        dueDate: '2024-01-18',
        status: 'graded',
        grade: 92,
        course: 'Química Orgánica'
      }
    ]
  },
  {
    id: '3',
    name: 'Ana Martínez',
    email: 'ana.martinez@estudiante.edu',
    progress: 91,
    attendance: 95,
    assignments: [
      {
        id: '4',
        title: 'Presentación de Literatura',
        dueDate: '2024-01-22',
        status: 'pending',
        course: 'Literatura Española'
      }
    ]
  }
];

export const mockCourses: Course[] = [
  {
    id: '1',
    name: 'Historia Universal',
    teacher: 'Prof. Elena López',
    students: 28,
    averageGrade: 82,
    assignments: [
      {
        id: '1',
        title: 'Ensayo de Historia',
        dueDate: '2024-01-15',
        status: 'graded',
        grade: 88,
        course: 'Historia Universal'
      }
    ]
  },
  {
    id: '2',
    name: 'Matemáticas Avanzadas',
    teacher: 'Prof. Roberto Sánchez',
    students: 25,
    averageGrade: 79,
    assignments: [
      {
        id: '2',
        title: 'Proyecto de Matemáticas',
        dueDate: '2024-01-20',
        status: 'pending',
        course: 'Matemáticas Avanzadas'
      }
    ]
  },
  {
    id: '3',
    name: 'Química Orgánica',
    teacher: 'Prof. Laura Fernández',
    students: 22,
    averageGrade: 86,
    assignments: []
  }
];

export const mockNotifications: Notification[] = [
  {
    id: '1',
    type: 'task',
    title: 'Nueva tarea asignada',
    message: 'Se ha asignado el "Proyecto de Matemáticas" para el 20 de enero',
    date: '2024-01-10T10:30:00Z',
    read: false,
    priority: 'high'
  },
  {
    id: '2',
    type: 'calendar',
    title: 'Cambio en el horario',
    message: 'La clase de Historia se ha movido al aula 205',
    date: '2024-01-09T14:15:00Z',
    read: false,
    priority: 'medium'
  },
  {
    id: '3',
    type: 'grade',
    title: 'Nueva calificación disponible',
    message: 'Tu ensayo de Historia ha sido calificado: 88/100',
    date: '2024-01-08T16:45:00Z',
    read: true,
    priority: 'medium'
  },
  {
    id: '4',
    type: 'announcement',
    title: 'Recordatorio de examen',
    message: 'El examen de Química Orgánica será el próximo viernes',
    date: '2024-01-07T09:00:00Z',
    read: true,
    priority: 'high'
  }
];

export const mockAttendanceReports: AttendanceReport[] = [
  {
    studentId: '1',
    studentName: 'María García',
    totalClasses: 25,
    attendedClasses: 23,
    attendanceRate: 92,
    course: 'Historia Universal'
  },
  {
    studentId: '2',
    studentName: 'Carlos Rodríguez',
    totalClasses: 25,
    attendedClasses: 22,
    attendanceRate: 88,
    course: 'Historia Universal'
  },
  {
    studentId: '3',
    studentName: 'Ana Martínez',
    totalClasses: 25,
    attendedClasses: 24,
    attendanceRate: 96,
    course: 'Historia Universal'
  }
];

export const getProgressData = () => [
  { name: 'Ene', estudiantes: 82, docentes: 89 },
  { name: 'Feb', estudiantes: 85, docentes: 91 },
  { name: 'Mar', estudiantes: 88, docentes: 87 },
  { name: 'Abr', estudiantes: 91, docentes: 93 },
  { name: 'May', estudiantes: 89, docentes: 95 },
  { name: 'Jun', estudiantes: 93, docentes: 92 }
];

export const getParticipationData = () => [
  { name: 'Lun', participacion: 78 },
  { name: 'Mar', participacion: 85 },
  { name: 'Mié', participacion: 92 },
  { name: 'Jue', participacion: 88 },
  { name: 'Vie', participacion: 95 }
];
