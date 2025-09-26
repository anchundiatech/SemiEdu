import { NextRequest, NextResponse } from 'next/server';
import { getGoogleClassroomService } from '@/lib/googleClassroom';
import { createServerClient } from '@/lib/supabase-server';

export async function GET(request: NextRequest) {
  console.log('🔄 Google Classroom Callback iniciado');
  console.log('- URL completa:', request.url);
  
  try {
    const { searchParams } = new URL(request.url);
    const code = searchParams.get('code');
    const error = searchParams.get('error');
    
    console.log('📋 Parámetros recibidos:');
    console.log('- code:', code ? 'Presente (' + code.substring(0, 20) + '...)' : 'Ausente');
    console.log('- error:', error || 'Ninguno');

    if (error) {
      console.error('❌ Error en parámetros de Google:', error);
      return NextResponse.redirect(
        new URL(`/admin/integration?error=${encodeURIComponent(error)}`, request.url)
      );
    }

    if (!code) {
      console.error('❌ No se recibió código de autorización');
      return NextResponse.redirect(
        new URL('/admin/integration?error=no_code', request.url)
      );
    }

    console.log('🔧 Inicializando servicio de Google Classroom...');
    const classroomService = getGoogleClassroomService();
    
    console.log('🔑 Intercambiando código por tokens...');
    const tokens = await classroomService.getTokens(code);
    console.log('✅ Tokens obtenidos:', {
      access_token: !!tokens.access_token,
      refresh_token: !!tokens.refresh_token,
      expiry_date: tokens.expiry_date
    });

    // Obtener información del usuario
    console.log('👤 Configurando credenciales y obteniendo perfil...');
    classroomService.setCredentials(tokens);
    const userProfile = await classroomService.getUserProfile();
    console.log('✅ Perfil de usuario obtenido:', {
      id: userProfile.id,
      email: userProfile.emailAddress,
      name: userProfile.name?.fullName
    });

    // Guardar tokens en la base de datos asociados al usuario actual
    const { supabase, user, error: authError } = await createServerClient();

    if (authError || !user) {
      console.error('❌ Usuario no autenticado en callback:', authError);
      console.log('el usuario no esta autenticado', user)
      
      // TEMPORAL: Guardar tokens en memoria global ANTES de redirigir
      console.log('⚠️ TEMPORAL: Guardando tokens sin autenticación para debugging');
      
      if (typeof global !== 'undefined') {
        (global as any).tempGoogleTokens = {
          access_token: tokens.access_token,
          refresh_token: tokens.refresh_token,
          expires_at: tokens.expiry_date,
          google_email: userProfile.emailAddress,
          google_name: userProfile.name?.fullName,
          saved_at: Date.now()
        };
        console.log('💾 Tokens guardados temporalmente en memoria global (sin auth)');
        console.log('- Email:', userProfile.emailAddress);
        console.log('- Nombre:', userProfile.name?.fullName);
      }
      
      // Redirigir con éxito
      console.log('🎉 Callback sin auth completado, redirigiendo...');
      return NextResponse.redirect(
        new URL('/admin/integration?success=true&temp=true', request.url)
      );
    }

    // Guardar tokens en la tabla de integraciones (solo si hay usuario autenticado)
    if (user) {
      const { error: dbError } = await supabase
        .from('google_integrations')
        .upsert({
          user_id: user.id,
          access_token: tokens.access_token,
          refresh_token: tokens.refresh_token,
          expires_at: new Date(tokens.expiry_date || Date.now() + 3600000).toISOString(),
          google_user_id: userProfile.id,
          google_email: userProfile.emailAddress,
          google_name: userProfile.name?.fullName,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        });

      if (dbError) {
        console.error('Error guardando tokens:', dbError);
        return NextResponse.redirect(
          new URL('/admin/integration?error=db_error', request.url)
        );
      }
      
      console.log('✅ Tokens guardados exitosamente para usuario:', user.email);
    } else {
      console.log('⚠️ TEMPORAL: Tokens obtenidos pero no guardados (sin usuario autenticado)');
      console.log('- Google User:', userProfile.emailAddress);
      console.log('- Tokens obtenidos:', !!tokens.access_token);
      
      // TEMPORAL: Guardar tokens en memoria global para poder usarlos
      if (typeof global !== 'undefined') {
        (global as any).tempGoogleTokens = {
          access_token: tokens.access_token,
          refresh_token: tokens.refresh_token,
          expires_at: tokens.expiry_date,
          google_email: userProfile.emailAddress,
          google_name: userProfile.name?.fullName,
          saved_at: Date.now()
        };
        console.log('💾 Tokens guardados temporalmente en memoria global');
      }
    }

    // Redirigir con éxito
    console.log('🎉 Callback completado exitosamente, redirigiendo...');
    return NextResponse.redirect(
      new URL('/admin/integration?success=true', request.url)
    );

  } catch (error) {
    console.error('❌ Error crítico en callback de Google:', error);
    console.error('- Tipo de error:', error instanceof Error ? error.constructor.name : typeof error);
    console.error('- Mensaje:', error instanceof Error ? error.message : String(error));
    console.error('- Stack:', error instanceof Error ? error.stack : 'No disponible');
    
    return NextResponse.redirect(
      new URL(`/admin/integration?error=${encodeURIComponent('callback_error')}`, request.url)
    );
  }
}
