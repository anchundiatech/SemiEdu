import { BaseRepository, RepositoryResult } from './base.repository';
import { Database } from '@/types/database';

type Notificacion = Database['public']['Tables']['notificaciones']['Row'];
type NotificacionInsert = Database['public']['Tables']['notificaciones']['Insert'];
type NotificacionUpdate = Database['public']['Tables']['notificaciones']['Update'];

export class NotificacionesRepository extends BaseRepository<Notificacion> {
  constructor() {
    super('notificaciones');
  }

  async findByUsuario(usuarioId: string, limit?: number): Promise<Notificacion[]> {
    let query = this.table
      .select('*')
      .eq('usuario_id', usuarioId)
      .order('fecha', { ascending: false });

    if (limit) {
      query = query.limit(limit);
    }

    const { data, error } = await query;

    if (error) {
      console.error('Error finding notifications by user:', error);
      return [];
    }

    return data as Notificacion[];
  }

  async findNoLeidas(usuarioId: string): Promise<Notificacion[]> {
    const { data, error } = await this.table
      .select('*')
      .eq('usuario_id', usuarioId)
      .eq('leida', false)
      .order('fecha', { ascending: false });

    if (error) {
      console.error('Error finding unread notifications:', error);
      return [];
    }

    return data as Notificacion[];
  }

  async findByTipo(usuarioId: string, tipo: 'tarea' | 'calendario' | 'calificacion' | 'anuncio'): Promise<Notificacion[]> {
    const { data, error } = await this.table
      .select('*')
      .eq('usuario_id', usuarioId)
      .eq('tipo', tipo)
      .order('fecha', { ascending: false });

    if (error) {
      console.error('Error finding notifications by type:', error);
      return [];
    }

    return data as Notificacion[];
  }

  async findByPrioridad(usuarioId: string, prioridad: 'alta' | 'media' | 'baja'): Promise<Notificacion[]> {
    const { data, error } = await this.table
      .select('*')
      .eq('usuario_id', usuarioId)
      .eq('prioridad', prioridad)
      .order('fecha', { ascending: false });

    if (error) {
      console.error('Error finding notifications by priority:', error);
      return [];
    }

    return data as Notificacion[];
  }

  async createNotificacion(notificacion: NotificacionInsert): Promise<RepositoryResult<Notificacion>> {
    try {
      const { data, error } = await this.table
        .insert(notificacion)
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
        data: data as Notificacion,
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

  async marcarComoLeida(id: string): Promise<RepositoryResult<Notificacion>> {
    return this.updateNotificacion(id, { leida: true });
  }

  async marcarTodasComoLeidas(usuarioId: string): Promise<boolean> {
    const { error } = await this.table
      .update({ leida: true })
      .eq('usuario_id', usuarioId)
      .eq('leida', false);

    if (error) {
      console.error('Error marking all notifications as read:', error);
      return false;
    }

    return true;
  }

  async updateNotificacion(id: string, updates: NotificacionUpdate): Promise<RepositoryResult<Notificacion>> {
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
        data: data as Notificacion,
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

  async contarNoLeidas(usuarioId: string): Promise<number> {
    const { count, error } = await this.table
      .select('*', { count: 'exact', head: true })
      .eq('usuario_id', usuarioId)
      .eq('leida', false);

    if (error) {
      console.error('Error counting unread notifications:', error);
      return 0;
    }

    return count || 0;
  }

  async eliminarAntiguasNotificaciones(diasAntiguedad: number = 30): Promise<number> {
    const fechaLimite = new Date();
    fechaLimite.setDate(fechaLimite.getDate() - diasAntiguedad);

    const { data, error } = await this.table
      .delete()
      .lt('fecha', fechaLimite.toISOString())
      .select();

    if (error) {
      console.error('Error deleting old notifications:', error);
      return 0;
    }

    return data?.length || 0;
  }

  async createNotificacionMasiva(
    usuarioIds: string[],
    notificacion: Omit<NotificacionInsert, 'usuario_id'>
  ): Promise<RepositoryResult<Notificacion[]>> {
    try {
      const notificaciones = usuarioIds.map(usuarioId => ({
        ...notificacion,
        usuario_id: usuarioId
      }));

      const { data, error } = await this.table
        .insert(notificaciones)
        .select();

      if (error) {
        return {
          data: null,
          error: error.message,
          success: false
        };
      }

      return {
        data: data as Notificacion[],
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
}
