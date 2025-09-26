'use client';

import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { 
  Users, 
  BookOpen, 
  GraduationCap, 
  ClipboardCheck, 
  Clock, 
  AlertTriangle,
  CheckCircle,
  RefreshCw,
  Filter,
  Search
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';

interface Student {
  userId: string;
  profile: {
    id: string;
    name: { fullName: string };
    emailAddress: string;
    photoUrl?: string;
  };
}

interface Teacher {
  userId: string;
  profile: {
    id: string;
    name: { fullName: string };
    emailAddress: string;
    photoUrl?: string;
  };
}

interface Submission {
  id: string;
  userId: string;
  courseId: string;
  courseWorkId: string;
  state: 'NEW' | 'CREATED' | 'TURNED_IN' | 'RETURNED' | 'RECLAIMED_BY_STUDENT';
  late: boolean;
  creationTime: string;
  updateTime: string;
  assignedGrade?: number;
  draftGrade?: number;
}

interface Assignment {
  id: string;
  title: string;
  description?: string;
  state: 'PUBLISHED' | 'DRAFT' | 'DELETED';
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
  submissions: Submission[];
  submissionCount: number;
}

interface Course {
  id: string;
  name: string;
  section?: string;
  description?: string;
  courseState: 'ACTIVE' | 'ARCHIVED' | 'PROVISIONED' | 'DECLINED' | 'SUSPENDED';
  students: Student[];
  teachers: Teacher[];
  assignments: Assignment[];
  studentsCount: number;
  teachersCount: number;
  assignmentsCount: number;
}

interface DashboardData {
  courses: Course[];
  totalStudents: number;
  totalTeachers: number;
  totalAssignments: number;
  lastSync: string;
  syncedBy: string;
}

export default function AdminDashboard() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);
  const [error, setError] = useState('');
  
  // Filtros
  const [selectedCourse, setSelectedCourse] = useState<string>('all');
  const [selectedTeacher, setSelectedTeacher] = useState<string>('all');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');
  
  // Modo de vista
  const [viewMode, setViewMode] = useState<'coordinator' | 'teacher'>('coordinator');
  
  // Auth y callback
  const { user, setUserFromCallback } = useAuth();
  const searchParams = useSearchParams();

  // Procesar datos del usuario desde la URL (callback de OAuth)
  useEffect(() => {
    const userDataParam = searchParams.get('user_data');
    if (userDataParam && !user) {
      try {
        const userData = JSON.parse(decodeURIComponent(userDataParam));
        console.log('📥 AdminDashboard - Procesando datos del callback:', userData);
        setUserFromCallback(userData);
        
        // Limpiar la URL
        window.history.replaceState({}, '', '/admin');
      } catch (error) {
        console.error('❌ Error procesando datos del usuario:', error);
      }
    }
  }, [searchParams, user, setUserFromCallback]);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      setError('');
      
      const response = await fetch('/api/google/dashboard');
      const result = await response.json();
      
      if (result.success) {
        setData(result.data);
      } else {
        setError(result.error || 'Error cargando datos del dashboard');
      }
    } catch (err) {
      console.error('Error cargando dashboard:', err);
      setError('Error de conexión al cargar dashboard');
    } finally {
      setLoading(false);
    }
  };

  const syncData = async () => {
    try {
      setSyncing(true);
      setError('');
      
      const response = await fetch('/api/google/sync', {
        method: 'POST'
      });
      
      const result = await response.json();
      
      if (result.success) {
        await loadDashboardData();
      } else {
        setError(result.error || 'Error sincronizando datos');
      }
    } catch (err) {
      console.error('Error sincronizando:', err);
      setError('Error de conexión al sincronizar');
    } finally {
      setSyncing(false);
    }
  };

  useEffect(() => {
    loadDashboardData();
  }, []);

  // Funciones de análisis de datos
  const getSubmissionStats = () => {
    if (!data) return { entregado: 0, atrasado: 0, faltante: 0, reentrega: 0 };
    
    let entregado = 0, atrasado = 0, faltante = 0, reentrega = 0;
    
    // Filtrar cursos según selección
    const filteredCourses = data.courses.filter(course => {
      if (selectedCourse !== 'all' && course.id !== selectedCourse) return false;
      return true;
    });
    
    filteredCourses.forEach(course => {
      // NOTA: Para estadísticas generales, NO filtramos por profesor
      // Las estadísticas muestran el estado general del curso/sistema
      
      course.assignments.forEach(assignment => {
        assignment.submissions.forEach(submission => {
          // Filtrar por búsqueda de estudiante si hay término de búsqueda
          if (searchTerm) {
            const student = course.students.find(s => s.userId === submission.userId);
            if (student && !student.profile.name.fullName.toLowerCase().includes(searchTerm.toLowerCase()) && 
                !student.profile.emailAddress.toLowerCase().includes(searchTerm.toLowerCase())) {
              return;
            }
          }
          
          switch (submission.state) {
            case 'TURNED_IN':
              if (submission.late) atrasado++;
              else entregado++;
              break;
            case 'RETURNED':
              reentrega++;
              break;
            case 'NEW':
            case 'CREATED':
              faltante++;
              break;
          }
        });
      });
    });
    
    return { entregado, atrasado, faltante, reentrega };
  };

  const getStudentProgress = () => {
    if (!data) return [];
    
    const studentMap = new Map();
    
    // Filtrar cursos según selección
    const filteredCourses = data.courses.filter(course => {
      if (selectedCourse !== 'all' && course.id !== selectedCourse) return false;
      return true;
    });
    
    filteredCourses.forEach(course => {
      course.students.forEach(student => {
        // SOLO aplicar filtro de profesor si estamos en modo teacher
        if (viewMode === 'teacher' && selectedTeacher !== 'all') {
          const hasSelectedTeacher = course.teachers.some(teacher => teacher.userId === selectedTeacher);
          if (!hasSelectedTeacher) return;
        }
        
        // Filtrar por búsqueda de texto (siempre activo)
        if (searchTerm && !student.profile.name.fullName.toLowerCase().includes(searchTerm.toLowerCase()) && 
            !student.profile.emailAddress.toLowerCase().includes(searchTerm.toLowerCase())) {
          return;
        }
        
        if (!studentMap.has(student.userId)) {
          studentMap.set(student.userId, {
            ...student,
            courses: [],
            totalAssignments: 0,
            completedAssignments: 0,
            lateAssignments: 0
          });
        }
        
        const studentData = studentMap.get(student.userId);
        studentData.courses.push(course.name);
        
        course.assignments.forEach(assignment => {
          const submission = assignment.submissions.find(s => s.userId === student.userId);
          studentData.totalAssignments++;
          
          if (submission) {
            // En modo coordinador, contar todas las tareas sin filtrar por estado
            // En modo teacher, aplicar filtro de estado si está seleccionado
            let includeSubmission = true;
            
            if (viewMode === 'teacher' && selectedStatus !== 'all') {
              switch (selectedStatus) {
                case 'entregado':
                  includeSubmission = submission.state === 'TURNED_IN' && !submission.late;
                  break;
                case 'atrasado':
                  includeSubmission = submission.state === 'TURNED_IN' && submission.late;
                  break;
                case 'faltante':
                  includeSubmission = submission.state === 'NEW' || submission.state === 'CREATED';
                  break;
                case 'reentrega':
                  includeSubmission = submission.state === 'RETURNED';
                  break;
              }
            }
            
            if (includeSubmission && (submission.state === 'TURNED_IN' || submission.state === 'RETURNED')) {
              studentData.completedAssignments++;
              if (submission.late) studentData.lateAssignments++;
            }
          }
        });
      });
    });
    
    return Array.from(studentMap.values());
  };

  const getTeacherClasses = () => {
    if (!data) return [];
    
    const teacherMap = new Map();
    
    // Filtrar cursos según selección
    const filteredCourses = data.courses.filter(course => {
      if (selectedCourse !== 'all' && course.id !== selectedCourse) return false;
      return true;
    });
    
    filteredCourses.forEach(course => {
      course.teachers.forEach(teacher => {
        // En modo coordinador, mostrar todos los profesores
        // En modo teacher, filtrar por profesor específico
        if (viewMode === 'teacher' && selectedTeacher !== 'all' && teacher.userId !== selectedTeacher) {
          return;
        }
        
        // Filtrar por búsqueda de texto en nombre del profesor (siempre activo)
        if (searchTerm && !teacher.profile.name.fullName.toLowerCase().includes(searchTerm.toLowerCase()) && 
            !teacher.profile.emailAddress.toLowerCase().includes(searchTerm.toLowerCase())) {
          return;
        }
        
        if (!teacherMap.has(teacher.userId)) {
          teacherMap.set(teacher.userId, {
            ...teacher,
            courses: [],
            totalStudents: 0,
            totalAssignments: 0
          });
        }
        
        const teacherData = teacherMap.get(teacher.userId);
        teacherData.courses.push({
          name: course.name,
          studentsCount: course.studentsCount,
          assignmentsCount: course.assignmentsCount
        });
        teacherData.totalStudents += course.studentsCount;
        teacherData.totalAssignments += course.assignmentsCount;
      });
    });
    
    return Array.from(teacherMap.values());
  };

  if (loading) {
    return (
      <div className="container mx-auto p-6">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <RefreshCw className="h-8 w-8 animate-spin mx-auto mb-4 text-blue-600" />
            <p className="text-gray-600">Cargando dashboard...</p>
          </div>
        </div>
      </div>
    );
  }

  const submissionStats = getSubmissionStats();
  const studentProgress = getStudentProgress();
  const teacherClasses = getTeacherClasses();

  return (
    <div className="container mx-auto p-6">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Dashboard Google Classroom</h1>
          <p className="text-gray-600 mt-2">
            Análisis completo de cursos, estudiantes y entregas
          </p>
          {data && (
            <p className="text-sm text-gray-500 mt-1">
              Última sincronización: {new Date(data.lastSync).toLocaleString()}
            </p>
          )}
        </div>
        <div className="flex items-center gap-3">
          {/* Selector de Modo de Vista */}
          <div className="flex items-center gap-2">
            <label className="text-sm font-medium text-gray-700">Vista:</label>
            <select
              value={viewMode}
              onChange={(e) => setViewMode(e.target.value as 'coordinator' | 'teacher')}
              className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="coordinator">👑 Coordinador (Ver Todo)</option>
              <option value="teacher">👨‍🏫 Profesor (Filtros Activos)</option>
            </select>
          </div>
          
          <Button 
            onClick={syncData} 
            disabled={syncing}
            className="flex items-center gap-2"
          >
            <RefreshCw className={`h-4 w-4 ${syncing ? 'animate-spin' : ''}`} />
            {syncing ? 'Sincronizando...' : 'Sincronizar'}
          </Button>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
          <p className="text-red-800">{error}</p>
        </div>
      )}

      {!data && !loading && (
        <div className="text-center py-12">
          <BookOpen className="h-16 w-16 mx-auto text-gray-400 mb-4" />
          <h3 className="text-xl font-semibold text-gray-900 mb-2">
            No hay datos disponibles
          </h3>
          <p className="text-gray-600 mb-4">
            Sincroniza con Google Classroom para ver el dashboard completo.
          </p>
          <Button onClick={syncData} disabled={syncing}>
            <RefreshCw className={`h-4 w-4 mr-2 ${syncing ? 'animate-spin' : ''}`} />
            {syncing ? 'Sincronizando...' : 'Sincronizar Datos'}
          </Button>
        </div>
      )}

      {data && (
        <>
          {/* Estadísticas Generales */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <Card className="p-6">
              <div className="flex items-center">
                <BookOpen className="h-8 w-8 text-blue-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">
                    {selectedCourse !== 'all' ? 'Curso Seleccionado' : 'Total Cursos'}
                  </p>
                  <p className="text-2xl font-bold text-gray-900">
                    {selectedCourse !== 'all' ? '1' : data.courses.length}
                  </p>
                  {selectedCourse !== 'all' && (
                    <p className="text-xs text-blue-600 mt-1">
                      {data.courses.find(c => c.id === selectedCourse)?.name}
                    </p>
                  )}
                </div>
              </div>
            </Card>
            
            <Card className="p-6">
              <div className="flex items-center">
                <Users className="h-8 w-8 text-green-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">
                    {selectedCourse !== 'all' ? 'Estudiantes del Curso' : 'Total Estudiantes'}
                  </p>
                  <p className="text-2xl font-bold text-gray-900">
                    {selectedCourse !== 'all' 
                      ? data.courses.find(c => c.id === selectedCourse)?.studentsCount || 0
                      : data.totalStudents
                    }
                  </p>
                  {selectedTeacher !== 'all' && (
                    <p className="text-xs text-green-600 mt-1">
                      Filtrado por profesor
                    </p>
                  )}
                </div>
              </div>
            </Card>
            
            <Card className="p-6">
              <div className="flex items-center">
                <GraduationCap className="h-8 w-8 text-purple-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Total Profesores</p>
                  <p className="text-2xl font-bold text-gray-900">{data.totalTeachers}</p>
                </div>
              </div>
            </Card>
            
            <Card className="p-6">
              <div className="flex items-center">
                <ClipboardCheck className="h-8 w-8 text-orange-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Total Tareas</p>
                  <p className="text-2xl font-bold text-gray-900">{data.totalAssignments}</p>
                </div>
              </div>
            </Card>
          </div>

          {/* Estado de Entregas */}
          <Card className="p-6 mb-8">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Estado de las Entregas</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center">
                <CheckCircle className="h-8 w-8 text-green-600 mx-auto mb-2" />
                <p className="text-2xl font-bold text-green-600">{submissionStats.entregado}</p>
                <p className="text-sm text-gray-600">Entregado</p>
              </div>
              <div className="text-center">
                <Clock className="h-8 w-8 text-yellow-600 mx-auto mb-2" />
                <p className="text-2xl font-bold text-yellow-600">{submissionStats.atrasado}</p>
                <p className="text-sm text-gray-600">Atrasado</p>
              </div>
              <div className="text-center">
                <AlertTriangle className="h-8 w-8 text-red-600 mx-auto mb-2" />
                <p className="text-2xl font-bold text-red-600">{submissionStats.faltante}</p>
                <p className="text-sm text-gray-600">Faltante</p>
              </div>
              <div className="text-center">
                <RefreshCw className="h-8 w-8 text-blue-600 mx-auto mb-2" />
                <p className="text-2xl font-bold text-blue-600">{submissionStats.reentrega}</p>
                <p className="text-sm text-gray-600">Reentrega</p>
              </div>
            </div>
          </Card>

          {/* Filtros */}
          <Card className="p-6 mb-8">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Filtros</h3>
              {(selectedCourse !== 'all' || selectedTeacher !== 'all' || selectedStatus !== 'all' || searchTerm) && (
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => {
                    setSelectedCourse('all');
                    setSelectedTeacher('all');
                    setSelectedStatus('all');
                    setSearchTerm('');
                  }}
                >
                  Limpiar Filtros
                </Button>
              )}
            </div>
            
            {viewMode === 'coordinator' && (
              <div className="bg-green-50 border border-green-200 rounded-lg p-3 mb-4">
                <p className="text-sm text-green-800">
                  <strong>👑 Modo Coordinador:</strong> Viendo todos los datos sin restricciones. 
                  Solo los filtros de "Curso" y "Buscar" están activos para análisis.
                </p>
                {(selectedTeacher !== 'all' || selectedStatus !== 'all') && (
                  <p className="text-xs text-green-700 mt-1">
                    ℹ️ Los filtros "Profesor" y "Estado" están desactivados en modo coordinador.
                  </p>
                )}
              </div>
            )}
            
            {viewMode === 'teacher' && selectedTeacher !== 'all' && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-4">
                <p className="text-sm text-blue-800">
                  <strong>👨‍🏫 Modo Profesor:</strong> Mostrando solo estudiantes de cursos donde enseña el profesor seleccionado.
                  Las estadísticas generales muestran el estado completo del sistema.
                </p>
              </div>
            )}
            
            {viewMode === 'teacher' && selectedTeacher === 'all' && (
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 mb-4">
                <p className="text-sm text-yellow-800">
                  <strong>⚠️ Modo Profesor:</strong> Selecciona un profesor específico para ver sus estudiantes, 
                  o cambia a "Modo Coordinador" para ver todos los datos.
                </p>
              </div>
            )}
            
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Curso</label>
                <select 
                  value={selectedCourse}
                  onChange={(e) => setSelectedCourse(e.target.value)}
                  className="w-full p-2 border border-gray-300 rounded-md"
                >
                  <option value="all">Todos los cursos</option>
                  {data.courses.map(course => (
                    <option key={course.id} value={course.id}>{course.name}</option>
                  ))}
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Profesor</label>
                <select 
                  value={selectedTeacher}
                  onChange={(e) => setSelectedTeacher(e.target.value)}
                  className="w-full p-2 border border-gray-300 rounded-md"
                >
                  <option value="all">Todos los profesores</option>
                  {teacherClasses.map(teacher => (
                    <option key={teacher.userId} value={teacher.userId}>
                      {teacher.profile.name.fullName}
                    </option>
                  ))}
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Estado</label>
                <select 
                  value={selectedStatus}
                  onChange={(e) => setSelectedStatus(e.target.value)}
                  className="w-full p-2 border border-gray-300 rounded-md"
                >
                  <option value="all">Todos los estados</option>
                  <option value="entregado">Entregado</option>
                  <option value="atrasado">Atrasado</option>
                  <option value="faltante">Faltante</option>
                  <option value="reentrega">Reentrega</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Buscar</label>
                <div className="relative">
                  <Search className="h-4 w-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Buscar estudiante..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 p-2 border border-gray-300 rounded-md"
                  />
                </div>
              </div>
            </div>
          </Card>

          {/* Lista de Estudiantes y Progreso */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <Card className="p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Lista de Alumnos y Progreso</h3>
              <div className="space-y-4 max-h-96 overflow-y-auto">
                {studentProgress.map((student) => (
                  <div key={student.userId} className="border-b border-gray-200 pb-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium text-gray-900">{student.profile.name.fullName}</p>
                        <p className="text-sm text-gray-600">{student.profile.emailAddress}</p>
                        <p className="text-xs text-gray-500">
                          Cursos: {student.courses.join(', ')}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-medium text-gray-900">
                          {student.completedAssignments}/{student.totalAssignments}
                        </p>
                        <p className="text-xs text-gray-600">Completadas</p>
                        {student.lateAssignments > 0 && (
                          <p className="text-xs text-red-600">{student.lateAssignments} atrasadas</p>
                        )}
                      </div>
                    </div>
                    <div className="mt-2 w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-blue-600 h-2 rounded-full" 
                        style={{ 
                          width: `${student.totalAssignments > 0 ? (student.completedAssignments / student.totalAssignments) * 100 : 0}%` 
                        }}
                      ></div>
                    </div>
                  </div>
                ))}
              </div>
            </Card>

            {/* Lista de Profesores y Clases */}
            <Card className="p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Lista de Profesores y Clases</h3>
              <div className="space-y-4 max-h-96 overflow-y-auto">
                {teacherClasses.map((teacher) => (
                  <div key={teacher.userId} className="border-b border-gray-200 pb-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium text-gray-900">{teacher.profile.name.fullName}</p>
                        <p className="text-sm text-gray-600">{teacher.profile.emailAddress}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-medium text-gray-900">{teacher.courses.length} clases</p>
                        <p className="text-xs text-gray-600">{teacher.totalStudents} estudiantes</p>
                        <p className="text-xs text-gray-600">{teacher.totalAssignments} tareas</p>
                      </div>
                    </div>
                    <div className="mt-2">
                      <div className="flex flex-wrap gap-1">
                        {teacher.courses.map((course: any, index: any) => (
                          <span 
                            key={index}
                            className="inline-block bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded"
                          >
                            {course.name}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          </div>
        </>
      )}
    </div>
  );
}
