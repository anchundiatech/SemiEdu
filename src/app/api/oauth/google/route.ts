import { NextRequest, NextResponse } from 'next/server';
import { google } from 'googleapis';

// Scopes específicos para Google Classroom
const CLASSROOM_SCOPES = [
  'https://www.googleapis.com/auth/classroom.courses.readonly',
  'https://www.googleapis.com/auth/classroom.rosters.readonly',
  'https://www.googleapis.com/auth/classroom.profile.emails',
  'https://www.googleapis.com/auth/classroom.coursework.students.readonly',
  'https://www.googleapis.com/auth/userinfo.profile',
  'https://www.googleapis.com/auth/userinfo.email'
];

export async function GET(request: NextRequest) {
  try {
    console.log('🔐 Iniciando flujo OAuth para Google Classroom...');

    // Verificar variables de entorno
    const clientId = process.env.GOOGLE_CLIENT_ID;
    const clientSecret = process.env.GOOGLE_CLIENT_SECRET;
    
    // Usar URL fija para desarrollo local
    const redirectUri = 'http://localhost:3000/api/oauth/google/callback';

    if (!clientId || !clientSecret) {
      return NextResponse.json({
        error: 'Credenciales de Google no configuradas',
        details: 'GOOGLE_CLIENT_ID y GOOGLE_CLIENT_SECRET son requeridos'
      }, { status: 500 });
    }

    console.log('🔧 Configurando cliente OAuth...');
    console.log('📍 Redirect URI:', redirectUri);
    console.log('🔍 NEXT_PUBLIC_APP_URL:', process.env.NEXT_PUBLIC_APP_URL);

    // Crear cliente OAuth2
    const oauth2Client = new google.auth.OAuth2(
      clientId,
      clientSecret,
      redirectUri
    );

    // Generar URL de autorización
    const authUrl = oauth2Client.generateAuthUrl({
      access_type: 'offline', // Para obtener refresh token
      scope: CLASSROOM_SCOPES,
      prompt: 'consent', // Forzar pantalla de consentimiento para obtener refresh token
      include_granted_scopes: true
    });

    console.log('✅ URL de autorización generada');
    console.log('🎯 Scopes solicitados:', CLASSROOM_SCOPES);

    // Redirigir a Google OAuth
    return NextResponse.redirect(authUrl);

  } catch (error) {
    console.error('❌ Error generando URL de OAuth:', error);
    return NextResponse.json({
      error: 'Error interno del servidor',
      details: error instanceof Error ? error.message : 'Error desconocido'
    }, { status: 500 });
  }
}
