import { NextRequest, NextResponse } from 'next/server';
import { getGoogleClassroomService } from '@/lib/googleClassroom';
import { createClient } from '@/lib/supabase-server';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const code = searchParams.get('code');
    const error = searchParams.get('error');

    console.log('🔄 Procesando callback de Google OAuth...');
    console.log('Code:', code ? 'Recibido' : 'No recibido');
    console.log('Error:', error || 'Ninguno');

    // Si el usuario canceló la autorización
    if (error) {
      console.log('❌ Usuario canceló la autorización:', error);
      return NextResponse.redirect(
        new URL('/admin/integration?error=cancelled', request.url)
      );
    }

    // Si no hay código de autorización
    if (!code) {
      console.error('❌ No se recibió código de autorización');
      return NextResponse.redirect(
        new URL('/admin/integration?error=no_code', request.url)
      );
    }

    // Obtener información del usuario de Google
    console.log('🔄 Obteniendo información del usuario de Google...');
    const classroomService = getGoogleClassroomService();
    const tokens = await classroomService.getTokens(code);
    
    // Obtener información del perfil de Google
    const { google } = require('googleapis');
    const oauth2Client = new google.auth.OAuth2();
    oauth2Client.setCredentials(tokens);
    
    const oauth2 = google.oauth2({ version: 'v2', auth: oauth2Client });
    const { data: profile } = await oauth2.userinfo.get();
    
    console.log('✅ Perfil de Google obtenido:', profile.email);

    // Verificar si el usuario ya existe en Supabase
    const supabase = createClient();
    let { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      console.log('🔄 Usuario no autenticado, creando/autenticando automáticamente...');
      
      // Intentar registrar o autenticar con Google
      const { data: authData, error: signInError } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          queryParams: {
            access_type: 'offline',
            prompt: 'consent',
          },
        }
      });

      if (signInError) {
        console.error('❌ Error autenticando con Google:', signInError);
        return NextResponse.redirect(
          new URL('/auth/login?error=google_auth_failed', request.url)
        );
      }

      // Obtener el usuario después de la autenticación
      const { data: { user: newUser }, error: newAuthError } = await supabase.auth.getUser();
      if (newAuthError || !newUser) {
        console.error('❌ Error obteniendo usuario después de auth:', newAuthError);
        return NextResponse.redirect(
          new URL('/auth/login?error=user_fetch_failed', request.url)
        );
      }
      
      user = newUser;
    }

    console.log('✅ Usuario autenticado:', user.email);

    console.log('✅ Tokens ya obtenidos anteriormente');
    console.log('Access Token:', tokens.access_token ? 'Presente' : 'Ausente');
    console.log('Refresh Token:', tokens.refresh_token ? 'Presente' : 'Ausente');

    // Guardar tokens en la base de datos
    console.log('🔄 Guardando tokens en base de datos...');
    const { error: dbError } = await supabase
      .from('google_integrations')
      .upsert({
        user_id: user.id,
        access_token: tokens.access_token,
        refresh_token: tokens.refresh_token,
        token_expiry: tokens.expiry_date ? new Date(tokens.expiry_date).toISOString() : null,
        scope: tokens.scope,
        token_type: tokens.token_type,
        is_active: true,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      });

    if (dbError) {
      console.error('❌ Error guardando tokens:', dbError);
      return NextResponse.redirect(
        new URL('/admin/integration?error=save_failed', request.url)
      );
    }

    console.log('✅ Tokens guardados exitosamente en base de datos');
    console.log('🎉 Integración con Google Classroom completada');
    
    // Redirigir de vuelta a la página de integración con éxito
    return NextResponse.redirect(
      new URL('/admin/integration?success=connected', request.url)
    );

  } catch (error) {
    console.error('❌ Error en callback de Google:', error);
    console.error('Stack trace:', error instanceof Error ? error.stack : 'No stack trace');
    
    return NextResponse.redirect(
      new URL('/admin/integration?error=callback_failed', request.url)
    );
  }
}