import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function GET(request: NextRequest) {
  try {
    console.log('🔍 DEBUG: Verificando tokens disponibles...');

    // Obtener la sesión actual
    const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
    
    if (sessionError) {
      return NextResponse.json({
        error: 'Error obteniendo sesión',
        details: sessionError.message
      }, { status: 500 });
    }

    if (!sessionData.session) {
      return NextResponse.json({
        error: 'No hay sesión activa'
      }, { status: 401 });
    }

    const session = sessionData.session;
    const user = session.user;

    // Información de debug (sin exponer tokens completos por seguridad)
    const debugInfo = {
      user: {
        id: user.id,
        email: user.email,
        provider: user.app_metadata?.provider,
        providers: user.app_metadata?.providers
      },
      session: {
        hasAccessToken: !!session.access_token,
        hasRefreshToken: !!session.refresh_token,
        hasProviderToken: !!session.provider_token,
        hasProviderRefreshToken: !!session.provider_refresh_token,
        providerTokenLength: session.provider_token?.length || 0,
        providerRefreshTokenLength: session.provider_refresh_token?.length || 0
      },
      userMetadata: {
        keys: Object.keys(user.user_metadata || {}),
        hasGoogleTokens: !!(user.user_metadata as any)?.google_tokens,
        fullName: user.user_metadata?.full_name,
        name: user.user_metadata?.name,
        rol: user.user_metadata?.rol
      },
      appMetadata: {
        keys: Object.keys(user.app_metadata || {}),
        provider: user.app_metadata?.provider,
        providers: user.app_metadata?.providers
      }
    };

    return NextResponse.json({
      success: true,
      debug: debugInfo,
      message: 'Información de tokens y sesión obtenida'
    });

  } catch (error) {
    console.error('❌ Error en debug de tokens:', error);
    return NextResponse.json({
      error: 'Error interno del servidor',
      details: error instanceof Error ? error.message : 'Error desconocido'
    }, { status: 500 });
  }
}
