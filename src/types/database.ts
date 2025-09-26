export interface Database {
  public: {
    Tables: {
      usuarios: {
        Row: {
          id: string;
          nombre: string;
          email: string;
          rol: 'estudiante' | 'docente' | 'coordinador';
          avatar_url?: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          nombre: string;
          email: string;
          rol: 'estudiante' | 'docente' | 'coordinador';
          avatar_url?: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          nombre?: string;
          email?: string;
          rol?: 'estudiante' | 'docente' | 'coordinador';
          avatar_url?: string;
          updated_at?: string;
        };
      };
      clases: {
        Row: {
          id: string;
          nombre: string;
          descripcion?: string;
          codigo_clase: string;
          id_usuario: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          nombre: string;
          descripcion?: string;
          codigo_clase: string;
          id_usuario: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          nombre?: string;
          descripcion?: string;
          codigo_clase?: string;
          id_usuario?: string;
          updated_at?: string;
        };
      };
      tareas: {
        Row: {
          id: string;
          clase_id: string;
          titulo: string;
          descripcion?: string;
          fecha_entrega: string;
          estado: 'activa' | 'vencida' | 'completada';
          puntos_maximos: number;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          clase_id: string;
          titulo: string;
          descripcion?: string;
          fecha_entrega: string;
          estado?: 'activa' | 'vencida' | 'completada';
          puntos_maximos: number;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          clase_id?: string;
          titulo?: string;
          descripcion?: string;
          fecha_entrega?: string;
          estado?: 'activa' | 'vencida' | 'completada';
          puntos_maximos?: number;
          updated_at?: string;
        };
      };
      entregas_tareas: {
        Row: {
          id: string;
          tarea_id: string;
          usuario_id: string;
          contenido?: string;
          archivo_url?: string;
          calificacion?: number;
          comentarios?: string;
          estado: 'pendiente' | 'entregada' | 'calificada';
          fecha_entrega?: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          tarea_id: string;
          usuario_id: string;
          contenido?: string;
          archivo_url?: string;
          calificacion?: number;
          comentarios?: string;
          estado?: 'pendiente' | 'entregada' | 'calificada';
          fecha_entrega?: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          tarea_id?: string;
          usuario_id?: string;
          contenido?: string;
          archivo_url?: string;
          calificacion?: number;
          comentarios?: string;
          estado?: 'pendiente' | 'entregada' | 'calificada';
          fecha_entrega?: string;
          updated_at?: string;
        };
      };
      notificaciones: {
        Row: {
          id: string;
          usuario_id: string;
          tipo: 'tarea' | 'calendario' | 'calificacion' | 'anuncio';
          titulo: string;
          mensaje: string;
          prioridad: 'alta' | 'media' | 'baja';
          leida: boolean;
          fecha: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          usuario_id: string;
          tipo: 'tarea' | 'calendario' | 'calificacion' | 'anuncio';
          titulo: string;
          mensaje: string;
          prioridad?: 'alta' | 'media' | 'baja';
          leida?: boolean;
          fecha?: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          usuario_id?: string;
          tipo?: 'tarea' | 'calendario' | 'calificacion' | 'anuncio';
          titulo?: string;
          mensaje?: string;
          prioridad?: 'alta' | 'media' | 'baja';
          leida?: boolean;
          fecha?: string;
        };
      };
      progreso: {
        Row: {
          id: string;
          usuario_id: string;
          clase_id: string;
          nota_promedio: number;
          asistencia: number;
          tareas_completadas: number;
          tareas_totales: number;
          ultimo_acceso: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          usuario_id: string;
          clase_id: string;
          nota_promedio?: number;
          asistencia?: number;
          tareas_completadas?: number;
          tareas_totales?: number;
          ultimo_acceso?: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          usuario_id?: string;
          clase_id?: string;
          nota_promedio?: number;
          asistencia?: number;
          tareas_completadas?: number;
          tareas_totales?: number;
          ultimo_acceso?: string;
          updated_at?: string;
        };
      };
      inscripciones: {
        Row: {
          id: string;
          usuario_id: string;
          clase_id: string;
          fecha_inscripcion: string;
          estado: 'activa' | 'inactiva' | 'completada';
          created_at: string;
        };
        Insert: {
          id?: string;
          usuario_id: string;
          clase_id: string;
          fecha_inscripcion?: string;
          estado?: 'activa' | 'inactiva' | 'completada';
          created_at?: string;
        };
        Update: {
          id?: string;
          usuario_id?: string;
          clase_id?: string;
          fecha_inscripcion?: string;
          estado?: 'activa' | 'inactiva' | 'completada';
        };
      };
    };
    Views: {
      vista_progreso_estudiantes: {
        Row: {
          usuario_id: string;
          nombre_usuario: string;
          email: string;
          clase_id: string;
          nombre_clase: string;
          nota_promedio: number;
          asistencia: number;
          progreso_general: number;
        };
      };
    };
    Functions: {
      calcular_progreso_estudiante: {
        Args: {
          p_usuario_id: string;
          p_clase_id: string;
        };
        Returns: number;
      };
    };
  };
}
