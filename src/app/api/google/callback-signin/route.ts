import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase-server';

export async function GET(request: NextRequest) {
  try {
    const { searchParams, hash } = new URL(request.url);
    const code = searchParams.get('code');
    const error = searchParams.get('error');
    
    // También verificar si hay tokens en el hash (flujo implícito)
    const accessToken = searchParams.get('access_token');
    const refreshToken = searchParams.get('refresh_token');

    console.log('🔄 Procesando callback de Google signin...');
    console.log('Code:', code ? 'Presente' : 'Ausente');
    console.log('Access Token:', accessToken ? 'Presente' : 'Ausente');
    console.log('Refresh Token:', refreshToken ? 'Presente' : 'Ausente');

    if (error && error !== 'no_code') {
      console.log('❌ Usuario canceló la autorización:', error);
      return NextResponse.redirect(new URL('/?error=cancelled', request.url));
    }

    const supabase = createClient();
    let data;

    // Si tenemos tokens directamente (flujo implícito)
    if (accessToken) {
      console.log('✅ Tokens recibidos directamente, obteniendo usuario...');
      
      // Obtener información del usuario con el token
      const { data: userData, error: userError } = await supabase.auth.getUser(accessToken);
      
      if (userError || !userData.user) {
        console.error('❌ Error obteniendo usuario:', userError);
        return NextResponse.redirect(new URL('/?error=user_fetch_failed', request.url));
      }
      
      data = userData;
      console.log('✅ Usuario obtenido exitosamente');
      console.log('Usuario:', data.user?.email);
    }
    // Si tenemos código de autorización (flujo de código)
    else if (code) {
      console.log('✅ Código recibido, intercambiando por sesión...');
      
      const { data: sessionData, error: exchangeError } = await supabase.auth.exchangeCodeForSession(code);

      if (exchangeError) {
        console.error('❌ Error intercambiando código:', exchangeError);
        return NextResponse.redirect(new URL('/?error=exchange_failed', request.url));
      }

      data = sessionData;
      console.log('✅ Sesión creada exitosamente');
      console.log('Usuario:', data.user?.email);
    }
    // Si no hay ni código ni tokens
    else {
      console.error('❌ No se recibió código ni tokens de autorización');
      return NextResponse.redirect(new URL('/?error=no_auth_data', request.url));
    }

    // Determinar rol y redirigir al dashboard apropiado
    const userEmail = data.user?.email;
    const userMetadata = data.user?.user_metadata;
    let redirectPath = '/dashboard/student'; // Por defecto estudiante

    console.log('🔍 Determinando rol del usuario...');
    console.log('Email:', userEmail);
    console.log('Metadata:', userMetadata);

    // Verificar rol en los metadatos del usuario
    if (userMetadata?.rol) {
      console.log('✅ Rol encontrado en metadatos:', userMetadata.rol);
      
      switch (userMetadata.rol) {
        case 'coordinador':
        case 'admin':
          redirectPath = '/admin';
          break;
        case 'docente':
        case 'profesor':
        case 'teacher':
          redirectPath = '/dashboard/teacher';
          break;
        case 'estudiante':
        case 'student':
        default:
          redirectPath = '/dashboard/student';
          break;
      }
    } else if (userEmail) {
      // Fallback: determinar por email si no hay rol en metadatos
      console.log('⚠️ No hay rol en metadatos, determinando por email...');
      
      if (userEmail.includes('admin') || userEmail.includes('coordinador')) {
        redirectPath = '/admin';
      } else if (userEmail.includes('profesor') || userEmail.includes('teacher') || userEmail.includes('docente')) {
        redirectPath = '/dashboard/teacher';
      }
    }

    console.log('🎯 Redirigiendo a:', redirectPath);
    
    return NextResponse.redirect(new URL(redirectPath, request.url));

  } catch (error) {
    console.error('❌ Error en callback signin:', error);
    return NextResponse.redirect(new URL('/?error=callback_failed', request.url));
  }
}
