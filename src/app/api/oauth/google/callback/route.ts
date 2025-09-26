import { NextRequest, NextResponse } from 'next/server';
import { google } from 'googleapis';
import { tokenStore } from '@/lib/tokenStore';
import { supabase } from '@/lib/supabase';

export async function GET(request: NextRequest) {
  try {
    console.log('🔄 Procesando callback de Google OAuth...');

    const { searchParams } = new URL(request.url);
    const code = searchParams.get('code');
    const error = searchParams.get('error');
    const state = searchParams.get('state');

    if (error) {
      console.error('❌ Error en OAuth:', error);
      return NextResponse.redirect(`${process.env.NEXT_PUBLIC_APP_URL}/dashboard/student?error=oauth_error&details=${error}`);
    }

    if (!code) {
      console.error('❌ No se recibió código de autorización');
      return NextResponse.redirect(`${process.env.NEXT_PUBLIC_APP_URL}/dashboard/student?error=no_code`);
    }

    console.log('✅ Código de autorización recibido');

    // Configurar cliente OAuth2
    const clientId = process.env.GOOGLE_CLIENT_ID;
    const clientSecret = process.env.GOOGLE_CLIENT_SECRET;
    const redirectUri = 'http://localhost:3000/api/oauth/google/callback';

    const oauth2Client = new google.auth.OAuth2(
      clientId,
      clientSecret,
      redirectUri
    );

    console.log('🔄 Intercambiando código por tokens...');

    // Intercambiar código por tokens
    const { tokens } = await oauth2Client.getToken(code);
    
    if (!tokens.access_token) {
      throw new Error('No se recibió access token');
    }

    console.log('✅ Tokens obtenidos exitosamente');
    console.log('📊 Token info:', {
      hasAccessToken: !!tokens.access_token,
      hasRefreshToken: !!tokens.refresh_token,
      expiresIn: tokens.expiry_date ? new Date(tokens.expiry_date).toISOString() : 'N/A',
      scope: tokens.scope
    });

    // Obtener información del usuario
    oauth2Client.setCredentials(tokens);
    const oauth2 = google.oauth2({ version: 'v2', auth: oauth2Client });
    const { data: userInfo } = await oauth2.userinfo.get();

    console.log('👤 Información del usuario obtenida:', {
      email: userInfo.email,
      name: userInfo.name,
      id: userInfo.id
    });

    // Detectar rol basado en email
    const email = userInfo.email?.toLowerCase() || '';
    let userRole = 'estudiante'; // Por defecto
    
    if (email.includes('admin') || email.includes('coordinador') || email.includes('director')) {
      userRole = 'coordinador';
    } else if (email.includes('profesor') || email.includes('teacher') || email.includes('docente')) {
      userRole = 'docente';
    }

    // Enfoque simplificado: solo guardar tokens y redirigir
    console.log('🔄 Guardando tokens para usuario de Google...');
    
    // Usar el Google ID como identificador único
    const userId = `google_${userInfo.id}`;
    
    console.log('✅ Usando ID de usuario:', userId);

    console.log('🔗 Asociando tokens con usuario de Supabase:', userId);

    // Guardar tokens en el almacén
    tokenStore.setTokens(userId, {
      access_token: tokens.access_token,
      refresh_token: tokens.refresh_token || undefined,
      expires_at: tokens.expiry_date || undefined,
      scope: tokens.scope || undefined,
      token_type: tokens.token_type || 'Bearer'
    });

    // Guardar información del usuario en localStorage para el cliente
    console.log('💾 Preparando información del usuario para el cliente...');
    
    const userMetadata = {
      nombre: userInfo.name,
      rol: userRole,
      email: userInfo.email,
      google_id: userInfo.id,
      google_classroom: {
        connected: true,
        email: userInfo.email,
        name: userInfo.name,
        google_id: userInfo.id,
        connected_at: new Date().toISOString()
      }
    };

    console.log('✅ Información del usuario preparada:', {
      email: userMetadata.email,
      rol: userMetadata.rol,
      nombre: userMetadata.nombre
    });

    // Redirigir al dashboard basado en rol
    let dashboardUrl = '/dashboard/student';
    switch (userRole) {
      case 'coordinador':
        dashboardUrl = '/admin';
        break;
      case 'docente':
        dashboardUrl = '/dashboard/teacher';
        break;
      case 'estudiante':
        dashboardUrl = '/dashboard/student';
        break;
    }

    // Codificar información del usuario para pasarla en la URL
    const encodedUserData = encodeURIComponent(JSON.stringify({
      userId,
      email: userInfo.email,
      nombre: userInfo.name,
      rol: userRole,
      google_id: userInfo.id,
      classroom_connected: true
    }));

    console.log('🎯 Redirigiendo a:', dashboardUrl, 'para rol:', userRole);
    return NextResponse.redirect(`${process.env.NEXT_PUBLIC_APP_URL}${dashboardUrl}?user_data=${encodedUserData}`);

  } catch (error) {
    console.error('❌ Error en callback de OAuth:', error);
    return NextResponse.redirect(`${process.env.NEXT_PUBLIC_APP_URL}/dashboard/student?error=callback_error&details=${encodeURIComponent(error instanceof Error ? error.message : 'Error desconocido')}`);
  }
}
