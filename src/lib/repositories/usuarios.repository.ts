import { BaseRepository, RepositoryResult } from './base.repository';
import { Database } from '@/types/database';

type Usuario = Database['public']['Tables']['usuarios']['Row'];
type UsuarioInsert = Database['public']['Tables']['usuarios']['Insert'];
type UsuarioUpdate = Database['public']['Tables']['usuarios']['Update'];

export class UsuariosRepository extends BaseRepository<Usuario> {
  constructor() {
    super('usuarios');
  }

  async findByEmail(email: string): Promise<Usuario | null> {
    const { data, error } = await this.table
      .select('*')
      .eq('email', email)
      .single();

    if (error) {
      console.error('Error finding user by email:', error);
      return null;
    }

    return data as Usuario;
  }

  async findByRole(rol: 'estudiante' | 'docente' | 'coordinador'): Promise<Usuario[]> {
    const { data, error } = await this.table
      .select('*')
      .eq('rol', rol);

    if (error) {
      console.error('Error finding users by role:', error);
      return [];
    }

    return data as Usuario[];
  }

  async createUsuario(usuario: UsuarioInsert): Promise<RepositoryResult<Usuario>> {
    try {
      // Verificar si el email ya existe
      const existingUser = await this.findByEmail(usuario.email);
      if (existingUser) {
        return {
          data: null,
          error: 'El email ya está registrado',
          success: false
        };
      }

      const { data, error } = await this.table
        .insert(usuario)
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
        data: data as Usuario,
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

  async updateUsuario(id: string, updates: UsuarioUpdate): Promise<RepositoryResult<Usuario>> {
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
        data: data as Usuario,
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

  async getEstudiantesConProgreso(): Promise<any[]> {
    const { data, error } = await this.table
      .select(`
        *,
        progreso (
          nota_promedio,
          asistencia,
          tareas_completadas,
          tareas_totales,
          clase_id,
          clases (nombre)
        )
      `)
      .eq('rol', 'estudiante');

    if (error) {
      console.error('Error getting students with progress:', error);
      return [];
    }

    return data || [];
  }

  async getDocentesConClases(): Promise<any[]> {
    const { data, error } = await this.table
      .select(`
        *,
        clases (
          id,
          nombre,
          codigo_clase,
          inscripciones (count)
        )
      `)
      .eq('rol', 'docente');

    if (error) {
      console.error('Error getting teachers with classes:', error);
      return [];
    }

    return data || [];
  }
}
