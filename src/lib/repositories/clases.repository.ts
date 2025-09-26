import { BaseRepository, RepositoryResult } from './base.repository';
import { Database } from '@/types/database';

type Clase = Database['public']['Tables']['clases']['Row'];
type ClaseInsert = Database['public']['Tables']['clases']['Insert'];
type ClaseUpdate = Database['public']['Tables']['clases']['Update'];

export class ClasesRepository extends BaseRepository<Clase> {
  constructor() {
    super('clases');
  }

  async findByDocente(docenteId: string): Promise<Clase[]> {
    const { data, error } = await this.table
      .select('*')
      .eq('id_usuario', docenteId);

    if (error) {
      console.error('Error finding classes by teacher:', error);
      return [];
    }

    return data as Clase[];
  }

  async findByCodigoClase(codigoClase: string): Promise<Clase | null> {
    const { data, error } = await this.table
      .select('*')
      .eq('codigo_clase', codigoClase)
      .single();

    if (error) {
      console.error('Error finding class by code:', error);
      return null;
    }

    return data as Clase;
  }

  async getClasesConEstudiantes(): Promise<any[]> {
    const { data, error } = await this.table
      .select(`
        *,
        usuarios!clases_id_usuario_fkey (nombre, email),
        inscripciones (
          usuario_id,
          usuarios (nombre, email, rol)
        ),
        tareas (count)
      `);

    if (error) {
      console.error('Error getting classes with students:', error);
      return [];
    }

    return data || [];
  }

  async getEstadisticasClase(claseId: string): Promise<any> {
    const { data, error } = await this.table
      .select(`
        *,
        inscripciones (count),
        tareas (count),
        progreso (
          nota_promedio,
          asistencia,
          tareas_completadas,
          tareas_totales
        )
      `)
      .eq('id', claseId)
      .single();

    if (error) {
      console.error('Error getting class statistics:', error);
      return null;
    }

    return data;
  }

  async createClase(clase: ClaseInsert): Promise<RepositoryResult<Clase>> {
    try {
      // Verificar si el código de clase ya existe
      const existingClass = await this.findByCodigoClase(clase.codigo_clase);
      if (existingClass) {
        return {
          data: null,
          error: 'El código de clase ya existe',
          success: false
        };
      }

      const { data, error } = await this.table
        .insert(clase)
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
        data: data as Clase,
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

  async updateClase(id: string, updates: ClaseUpdate): Promise<RepositoryResult<Clase>> {
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
        data: data as Clase,
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
