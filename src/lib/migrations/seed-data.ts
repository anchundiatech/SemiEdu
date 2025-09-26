import { createServerSupabaseClient } from '@/lib/supabase';
import { Database } from '@/types/database';

type UsuarioInsert = Database['public']['Tables']['usuarios']['Insert'];
type ClaseInsert = Database['public']['Tables']['clases']['Insert'];
type TareaInsert = Database['public']['Tables']['tareas']['Insert'];
type InscripcionInsert = Database['public']['Tables']['inscripciones']['Insert'];
type EntregaTareaInsert = Database['public']['Tables']['entregas_tareas']['Insert'];
type NotificacionInsert = Database['public']['Tables']['notificaciones']['Insert'];
type ProgresoInsert = Database['public']['Tables']['progreso']['Insert'];

export async function seedDatabase() {
  const supabase = createServerSupabaseClient();

  try {
    console.log('🌱 Iniciando migración de datos...');

    // 1. Crear usuarios de demostración
    const demoUsers: UsuarioInsert[] = [
      {
        id: '550e8400-e29b-41d4-a716-446655440001',
        email: 'estudiante@semiedu.com',
        nombre: 'María García',
        rol: 'estudiante'
      },
      {
        id: '550e8400-e29b-41d4-a716-446655440002',
        email: 'docente@semiedu.com',
        nombre: 'Prof. Elena López',
        rol: 'docente'
      },
      {
        id: '550e8400-e29b-41d4-a716-446655440003',
        email: 'coordinador@semiedu.com',
        nombre: 'Dr. Roberto Sánchez',
        rol: 'coordinador'
      }
    ];

    // Insertar usuarios
    const { error: usersError } = await supabase
      .from('usuarios')
      .upsert(demoUsers as any);

    if (usersError) {
      console.error('Error insertando usuarios:', usersError);
      throw usersError;
    }

    console.log('✅ Usuarios creados');

    // 2. Crear clases
    const demoClases: ClaseInsert[] = [
      {
        id: '660e8400-e29b-41d4-a716-446655440001',
        nombre: 'Historia Universal',
        descripcion: 'Curso de historia desde la antigüedad hasta la era moderna',
        codigo_clase: 'HIST001',
        id_usuario: '550e8400-e29b-41d4-a716-446655440002' // Docente
      },
      {
        id: '660e8400-e29b-41d4-a716-446655440002',
        nombre: 'Matemáticas Avanzadas',
        descripcion: 'Álgebra, cálculo y geometría avanzada',
        codigo_clase: 'MATH001',
        id_usuario: '550e8400-e29b-41d4-a716-446655440002' // Docente
      },
      {
        id: '660e8400-e29b-41d4-a716-446655440003',
        nombre: 'Química Orgánica',
        descripcion: 'Fundamentos de química orgánica y laboratorio',
        codigo_clase: 'CHEM001',
        id_usuario: '550e8400-e29b-41d4-a716-446655440002' // Docente
      }
    ];

    const { error: clasesError } = await supabase
      .from('clases')
      .upsert(demoClases as any);

    if (clasesError) {
      console.error('Error insertando clases:', clasesError);
      throw clasesError;
    }

    console.log('✅ Clases creadas');

    // 3. Crear inscripciones
    const inscripciones: InscripcionInsert[] = [
      {
        usuario_id: '550e8400-e29b-41d4-a716-446655440001', // Estudiante
        clase_id: '660e8400-e29b-41d4-a716-446655440001', // Historia
        estado: 'activa'
      },
      {
        usuario_id: '550e8400-e29b-41d4-a716-446655440001', // Estudiante
        clase_id: '660e8400-e29b-41d4-a716-446655440002', // Matemáticas
        estado: 'activa'
      },
      {
        usuario_id: '550e8400-e29b-41d4-a716-446655440001', // Estudiante
        clase_id: '660e8400-e29b-41d4-a716-446655440003', // Química
        estado: 'activa'
      }
    ];

    const { error: inscripcionesError } = await supabase
      .from('inscripciones')
      .upsert(inscripciones as any);

    if (inscripcionesError) {
      console.error('Error insertando inscripciones:', inscripcionesError);
      throw inscripcionesError;
    }

    console.log('✅ Inscripciones creadas');

    // 4. Crear tareas
    const demoTareas: TareaInsert[] = [
      {
        id: '770e8400-e29b-41d4-a716-446655440001',
        clase_id: '660e8400-e29b-41d4-a716-446655440001', // Historia
        titulo: 'Ensayo sobre la Revolución Francesa',
        descripcion: 'Escribir un ensayo de 1000 palabras sobre las causas de la Revolución Francesa',
        fecha_entrega: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(), // 7 días
        estado: 'activa',
        puntos_maximos: 100
      },
      {
        id: '770e8400-e29b-41d4-a716-446655440002',
        clase_id: '660e8400-e29b-41d4-a716-446655440002', // Matemáticas
        titulo: 'Ejercicios de Cálculo Integral',
        descripcion: 'Resolver los ejercicios 1-20 del capítulo 8',
        fecha_entrega: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString(), // 5 días
        estado: 'activa',
        puntos_maximos: 100
      },
      {
        id: '770e8400-e29b-41d4-a716-446655440003',
        clase_id: '660e8400-e29b-41d4-a716-446655440003', // Química
        titulo: 'Reporte de Laboratorio',
        descripcion: 'Entregar reporte del experimento de síntesis orgánica',
        fecha_entrega: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString(), // 3 días
        estado: 'activa',
        puntos_maximos: 100
      }
    ];

    const { error: tareasError } = await supabase
      .from('tareas')
      .upsert(demoTareas as any);

    if (tareasError) {
      console.error('Error insertando tareas:', tareasError);
      throw tareasError;
    }

    console.log('✅ Tareas creadas');

    // 5. Crear entregas de tareas
    const entregas: EntregaTareaInsert[] = [
      {
        tarea_id: '770e8400-e29b-41d4-a716-446655440001', // Ensayo Historia
        usuario_id: '550e8400-e29b-41d4-a716-446655440001', // Estudiante
        estado: 'entregada',
        calificacion: 88,
        fecha_entrega: new Date().toISOString()
      },
      {
        tarea_id: '770e8400-e29b-41d4-a716-446655440002', // Matemáticas
        usuario_id: '550e8400-e29b-41d4-a716-446655440001', // Estudiante
        estado: 'pendiente'
      },
      {
        tarea_id: '770e8400-e29b-41d4-a716-446655440003', // Química
        usuario_id: '550e8400-e29b-41d4-a716-446655440001', // Estudiante
        estado: 'pendiente'
      }
    ];

    const { error: entregasError } = await supabase
      .from('entregas_tareas')
      .upsert(entregas as any);

    if (entregasError) {
      console.error('Error insertando entregas:', entregasError);
      throw entregasError;
    }

    console.log('✅ Entregas creadas');

    // 6. Crear notificaciones
    const demoNotificaciones: NotificacionInsert[] = [
      {
        usuario_id: '550e8400-e29b-41d4-a716-446655440001', // Estudiante
        tipo: 'tarea',
        titulo: 'Nueva tarea asignada',
        mensaje: 'Se ha asignado el "Ensayo sobre la Revolución Francesa" para Historia Universal',
        prioridad: 'alta',
        leida: false
      },
      {
        usuario_id: '550e8400-e29b-41d4-a716-446655440001', // Estudiante
        tipo: 'calendario',
        titulo: 'Cambio de horario',
        mensaje: 'La clase de Matemáticas se ha movido al aula 205',
        prioridad: 'media',
        leida: false
      },
      {
        usuario_id: '550e8400-e29b-41d4-a716-446655440001', // Estudiante
        tipo: 'calificacion',
        titulo: 'Nueva calificación disponible',
        mensaje: 'Tu ensayo de Historia ha sido calificado: 88/100',
        prioridad: 'media',
        leida: true
      }
    ];

    const { error: notificacionesError } = await supabase
      .from('notificaciones')
      .upsert(demoNotificaciones as any);

    if (notificacionesError) {
      console.error('Error insertando notificaciones:', notificacionesError);
      throw notificacionesError;
    }

    console.log('✅ Notificaciones creadas');

    // 7. Crear registros de progreso
    const progresoData: ProgresoInsert[] = [
      {
        usuario_id: '550e8400-e29b-41d4-a716-446655440001', // Estudiante
        clase_id: '660e8400-e29b-41d4-a716-446655440001', // Historia
        nota_promedio: 88,
        asistencia: 92,
        tareas_completadas: 1,
        tareas_totales: 1
      },
      {
        usuario_id: '550e8400-e29b-41d4-a716-446655440001', // Estudiante
        clase_id: '660e8400-e29b-41d4-a716-446655440002', // Matemáticas
        nota_promedio: 0,
        asistencia: 88,
        tareas_completadas: 0,
        tareas_totales: 1
      },
      {
        usuario_id: '550e8400-e29b-41d4-a716-446655440001', // Estudiante
        clase_id: '660e8400-e29b-41d4-a716-446655440003', // Química
        nota_promedio: 0,
        asistencia: 95,
        tareas_completadas: 0,
        tareas_totales: 1
      }
    ];

    const { error: progresoError } = await supabase
      .from('progreso')
      .upsert(progresoData as any);

    if (progresoError) {
      console.error('Error insertando progreso:', progresoError);
      throw progresoError;
    }

    console.log('✅ Progreso creado');

    console.log('🎉 Migración de datos completada exitosamente');

    return {
      success: true,
      message: 'Base de datos poblada con datos de demostración'
    };

  } catch (error) {
    console.error('❌ Error en la migración:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Error desconocido'
    };
  }
}

// Función para limpiar la base de datos
export async function clearDatabase() {
  const supabase = createServerSupabaseClient();

  try {
    console.log('🧹 Limpiando base de datos...');

    // Eliminar en orden inverso debido a las dependencias
    await supabase.from('progreso').delete().neq('id', '');
    await supabase.from('notificaciones').delete().neq('id', '');
    await supabase.from('entregas_tareas').delete().neq('id', '');
    await supabase.from('tareas').delete().neq('id', '');
    await supabase.from('inscripciones').delete().neq('id', '');
    await supabase.from('clases').delete().neq('id', '');
    await supabase.from('usuarios').delete().neq('id', '');

    console.log('✅ Base de datos limpiada');

    return {
      success: true,
      message: 'Base de datos limpiada exitosamente'
    };

  } catch (error) {
    console.error('❌ Error limpiando la base de datos:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Error desconocido'
    };
  }
}
