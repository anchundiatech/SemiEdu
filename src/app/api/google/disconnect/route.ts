import { NextRequest, NextResponse } from 'next/server';
import { createServerClient, isCoordinator } from '@/lib/supabase-server';

export async function POST(request: NextRequest) {
  try {
    const { supabase, user, error: authError } = await createServerClient();

    if (authError || !user) {
      console.log('⚠️ TEMPORAL: Desconexión sin autenticación - limpiando tokens temporales');
      
      // TEMPORAL: Limpiar tokens de memoria global
      if (typeof global !== 'undefined') {
        delete (global as any).tempGoogleTokens;
        console.log('🗑️ Tokens temporales eliminados de memoria global');
      }
      
      return NextResponse.json({
        success: true,
        message: 'Integración desconectada exitosamente (modo temporal)'
      });
    }

    // Verificar que el usuario sea coordinador
    if (!isCoordinator(user)) {
      return NextResponse.json(
        { success: false, error: 'Permisos insuficientes' },
        { status: 403 }
      );
    }

    // Eliminar la integración de Google Classroom
    const { error } = await supabase
      .from('google_integrations')
      .delete()
      .eq('user_id', user.id);

    if (error) {
      console.error('Error eliminando integración:', error);
      return NextResponse.json(
        { success: false, error: 'Error desconectando la integración' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Integración desconectada exitosamente'
    });

  } catch (error) {
    console.error('Error desconectando integración:', error);
    return NextResponse.json(
      { success: false, error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}
