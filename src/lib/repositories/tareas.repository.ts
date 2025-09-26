import { BaseRepository, RepositoryResult } from './base.repository';
import { Database } from '@/types/database';

type Tarea = Database['public']['Tables']['tareas']['Row'];
type TareaInsert = Database['public']['Tables']['tareas']['Insert'];
type TareaUpdate = Database['public']['Tables']['tareas']['Update'];

export class TareasRepository extends BaseRepository<Tarea> {
  constructor() {
    super('tareas');
  }

  async findByClase(claseId: string): Promise<Tarea[]> {
    const { data, error } = await this.table
      .select('*')
      .eq('clase_id', claseId)
      .order('fecha_entrega', { ascending: true });

    if (error) {
      console.error('Error finding tasks by class:', error);
      return [];
    }

    return data as Tarea[];
  }

  async findTareasVencidas(): Promise<Tarea[]> {
    const { data, error } = await this.table
      .select('*')
      .lt('fecha_entrega', new Date().toISOString())
      .eq('estado', 'activa');

    if (error) {
      console.error('Error finding overdue tasks:', error);
      return [];
    }

    return data as Tarea[];
  }

  async findTareasProximasVencer(dias: number = 3): Promise<Tarea[]> {
    const fechaLimite = new Date();
    fechaLimite.setDate(fechaLimite.getDate() + dias);

    const { data, error } = await this.table
      .select('*')
      .gte('fecha_entrega', new Date().toISOString())
      .lte('fecha_entrega', fechaLimite.toISOString())
      .eq('estado', 'activa');

    if (error) {
      console.error('Error finding tasks due soon:', error);
      return [];
    }

    return data as Tarea[];
  }

  async getTareasConEntregas(claseId?: string): Promise<any[]> {
    let query = this.table
      .select(`
        *,
        clases (nombre, codigo_clase),
        entregas_tareas (
          id,
          usuario_id,
          estado,
          calificacion,
          fecha_entrega,
          usuarios (nombre, email)
        )
      `);

    if (claseId) {
      query = query.eq('clase_id', claseId);
    }

    const { data, error } = await query;

    if (error) {
      console.error('Error getting tasks with submissions:', error);
      return [];
    }

    return data || [];
  }

  async createTarea(tarea: TareaInsert): Promise<RepositoryResult<Tarea>> {
    try {
      const { data, error } = await this.table
        .insert(tarea)
        .select()
        .single();

      if (error) {
        return {
          data: null,
          error: error.message,
          success: false
        };
      }

      return {
        data: data as Tarea,
        error: null,
        success: true
      };
    } catch (error) {
      return {
        data: null,
        error: 'Error interno del servidor',
        success: false
      };
    }
  }

  async updateTarea(id: string, updates: TareaUpdate): Promise<RepositoryResult<Tarea>> {
    try {
      const { data, error } = await this.table
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) {
        return {
          data: null,
          error: error.message,
          success: false
        };
      }

      return {
        data: data as Tarea,
        error: null,
        success: true
      };
    } catch (error) {
      return {
        data: null,
        error: 'Error interno del servidor',
        success: false
      };
    }
  }

  async marcarTareasVencidas(): Promise<number> {
    const { data, error } = await this.table
      .update({ estado: 'vencida' })
      .lt('fecha_entrega', new Date().toISOString())
      .eq('estado', 'activa')
      .select();

    if (error) {
      console.error('Error marking overdue tasks:', error);
      return 0;
    }

    return data?.length || 0;
  }

  async getEstadisticasTareas(claseId?: string): Promise<any> {
    let query = this.table.select('estado');
    
    if (claseId) {
      query = query.eq('clase_id', claseId);
    }

    const { data, error } = await query;

    if (error) {
      console.error('Error getting task statistics:', error);
      return {
        total: 0,
        activas: 0,
        vencidas: 0,
        completadas: 0
      };
    }

    const stats = data?.reduce((acc, tarea) => {
      acc.total++;
      acc[tarea.estado]++;
      return acc;
    }, {
      total: 0,
      activas: 0,
      vencidas: 0,
      completadas: 0
    });

    return stats || {
      total: 0,
      activas: 0,
      vencidas: 0,
      completadas: 0
    };
  }
}
