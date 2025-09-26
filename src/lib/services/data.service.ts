import { UsuariosRepository } from '@/lib/repositories/usuarios.repository';
import { ClasesRepository } from '@/lib/repositories/clases.repository';
import { TareasRepository } from '@/lib/repositories/tareas.repository';
import { NotificacionesRepository } from '@/lib/repositories/notificaciones.repository';

export class DataService {
  private static instance: DataService;
  
  public usuarios: UsuariosRepository;
  public clases: ClasesRepository;
  public tareas: TareasRepository;
  public notificaciones: NotificacionesRepository;

  private constructor() {
    this.usuarios = new UsuariosRepository();
    this.clases = new ClasesRepository();
    this.tareas = new TareasRepository();
    this.notificaciones = new NotificacionesRepository();
  }

  public static getInstance(): DataService {
    if (!DataService.instance) {
      DataService.instance = new DataService();
    }
    return DataService.instance;
  }

  // Métodos de utilidad que combinan múltiples repositorios
  async getDashboardData(usuarioId: string, rol: string) {
    try {
      const usuario = await this.usuarios.findById(usuarioId);
      if (!usuario) {
        throw new Error('Usuario no encontrado');
      }

      let dashboardData: any = {
        usuario,
        notificacionesNoLeidas: await this.notificaciones.contarNoLeidas(usuarioId)
      };

      switch (rol) {
        case 'estudiante':
          dashboardData = {
            ...dashboardData,
            ...(await this.getEstudianteDashboard(usuarioId))
          };
          break;
        
        case 'docente':
          dashboardData = {
            ...dashboardData,
            ...(await this.getDocenteDashboard(usuarioId))
          };
          break;
        
        case 'coordinador':
          dashboardData = {
            ...dashboardData,
            ...(await this.getCoordinadorDashboard())
          };
          break;
      }

      return dashboardData;
    } catch (error) {
      console.error('Error getting dashboard data:', error);
      throw error;
    }
  }

  private async getEstudianteDashboard(usuarioId: string) {
    const [notificaciones, tareasProximas] = await Promise.all([
      this.notificaciones.findByUsuario(usuarioId, 5),
      this.tareas.findTareasProximasVencer(7)
    ]);

    return {
      notificaciones,
      tareasProximas,
      tipo: 'estudiante'
    };
  }

  private async getDocenteDashboard(usuarioId: string) {
    const [clases, notificaciones] = await Promise.all([
      this.clases.findByDocente(usuarioId),
      this.notificaciones.findByUsuario(usuarioId, 5)
    ]);

    const tareasRecientes = await this.tareas.getTareasConEntregas();

    return {
      clases,
      notificaciones,
      tareasRecientes,
      tipo: 'docente'
    };
  }

  private async getCoordinadorDashboard() {
    const [estudiantes, docentes, clases, tareasVencidas] = await Promise.all([
      this.usuarios.findByRole('estudiante'),
      this.usuarios.findByRole('docente'),
      this.clases.findAll(),
      this.tareas.findTareasVencidas()
    ]);

    return {
      estadisticas: {
        totalEstudiantes: estudiantes.length,
        totalDocentes: docentes.length,
        totalClases: clases.length,
        tareasVencidas: tareasVencidas.length
      },
      tipo: 'coordinador'
    };
  }

  async createNotificacionTarea(tareaId: string, titulo: string, mensaje: string) {
    try {
      // Obtener la tarea y la clase
      const tarea = await this.tareas.findById(tareaId);
      if (!tarea) {
        throw new Error('Tarea no encontrada');
      }

      const clase = await this.clases.findById(tarea.clase_id);
      if (!clase) {
        throw new Error('Clase no encontrada');
      }

      // Obtener todos los estudiantes inscritos en la clase
      // Esto requeriría un repositorio de inscripciones, por ahora usamos un método simplificado
      const estudiantes = await this.usuarios.findByRole('estudiante');

      // Crear notificaciones para todos los estudiantes
      const usuarioIds = estudiantes.map(est => est.id);
      
      return await this.notificaciones.createNotificacionMasiva(usuarioIds, {
        tipo: 'tarea',
        titulo,
        mensaje,
        prioridad: 'media'
      });
    } catch (error) {
      console.error('Error creating task notification:', error);
      throw error;
    }
  }

  async syncWithGoogleClassroom() {
    // Placeholder para la sincronización con Google Classroom
    // Esta función se implementará cuando se integre la API de Google Classroom
    console.log('Sincronizando con Google Classroom...');
    
    // Aquí iría la lógica para:
    // 1. Obtener datos de Google Classroom
    // 2. Comparar con datos locales
    // 3. Actualizar base de datos local
    // 4. Crear notificaciones para cambios
    
    return {
      success: true,
      message: 'Sincronización completada'
    };
  }

  async generateReport(tipo: 'asistencia' | 'participacion' | 'rendimiento', filtros: any = {}) {
    try {
      switch (tipo) {
        case 'asistencia':
          return await this.generateAttendanceReport(filtros);
        case 'participacion':
          return await this.generateParticipationReport(filtros);
        case 'rendimiento':
          return await this.generatePerformanceReport(filtros);
        default:
          throw new Error('Tipo de reporte no válido');
      }
    } catch (error) {
      console.error('Error generating report:', error);
      throw error;
    }
  }

  private async generateAttendanceReport(filtros: any) {
    // Implementar lógica de reporte de asistencia
    const estudiantes = await this.usuarios.getEstudiantesConProgreso();
    
    return {
      tipo: 'asistencia',
      datos: estudiantes,
      fechaGeneracion: new Date().toISOString(),
      filtros
    };
  }

  private async generateParticipationReport(filtros: any) {
    // Implementar lógica de reporte de participación
    const estudiantes = await this.usuarios.getEstudiantesConProgreso();
    
    return {
      tipo: 'participacion',
      datos: estudiantes,
      fechaGeneracion: new Date().toISOString(),
      filtros
    };
  }

  private async generatePerformanceReport(filtros: any) {
    // Implementar lógica de reporte de rendimiento
    const estudiantes = await this.usuarios.getEstudiantesConProgreso();
    
    return {
      tipo: 'rendimiento',
      datos: estudiantes,
      fechaGeneracion: new Date().toISOString(),
      filtros
    };
  }
}

// Exportar instancia singleton
export const dataService = DataService.getInstance();
