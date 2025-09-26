import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    console.log('🧪 Test endpoint - Verificando configuración básica...');

    // 1. Verificar variables de entorno
    const clientId = process.env.GOOGLE_CLIENT_ID;
    const clientSecret = process.env.GOOGLE_CLIENT_SECRET;
    
    console.log('Variables de entorno:');
    console.log('- GOOGLE_CLIENT_ID:', clientId ? 'Presente' : 'Ausente');
    console.log('- GOOGLE_CLIENT_SECRET:', clientSecret ? 'Presente' : 'Ausente');
    
    if (!clientId || !clientSecret) {
      return NextResponse.json({
        success: false,
        error: 'Variables de entorno faltantes',
        details: {
          clientId: !!clientId,
          clientSecret: !!clientSecret
        }
      });
    }

    // 2. Verificar importación de googleapis
    let google;
    try {
      const googleapis = require('googleapis');
      google = googleapis.google;
      console.log('✅ googleapis importado correctamente');
    } catch (importError) {
      console.error('❌ Error importando googleapis:', importError);
      return NextResponse.json({
        success: false,
        error: 'Error importando googleapis',
        details: importError instanceof Error ? importError.message : String(importError)
      });
    }

    // 3. Verificar creación de OAuth2 client
    let oauth2Client;
    try {
      oauth2Client = new google.auth.OAuth2(
        clientId,
        clientSecret,
        'http://localhost:3000/api/google/callback'
      );
      console.log('✅ OAuth2 client creado correctamente');
    } catch (oauthError) {
      console.error('❌ Error creando OAuth2 client:', oauthError);
      return NextResponse.json({
        success: false,
        error: 'Error creando OAuth2 client',
        details: oauthError instanceof Error ? oauthError.message : String(oauthError)
      });
    }

    // 4. Verificar generación de URL
    let authUrl;
    try {
      authUrl = oauth2Client.generateAuthUrl({
        access_type: 'offline',
        scope: [
          'https://www.googleapis.com/auth/classroom.courses.readonly',
          'https://www.googleapis.com/auth/classroom.rosters.readonly'
        ],
        prompt: 'consent'
      });
      console.log('✅ URL de autorización generada correctamente');
      console.log('URL:', authUrl);
    } catch (urlError) {
      console.error('❌ Error generando URL:', urlError);
      return NextResponse.json({
        success: false,
        error: 'Error generando URL de autorización',
        details: urlError instanceof Error ? urlError.message : String(urlError)
      });
    }

    return NextResponse.json({
      success: true,
      message: 'Configuración de Google OAuth funcionando correctamente',
      authUrl: authUrl,
      config: {
        clientId: clientId.substring(0, 20) + '...',
        redirectUri: 'http://localhost:3000/api/google/callback'
      }
    });

  } catch (error) {
    console.error('❌ Error en test endpoint:', error);
    return NextResponse.json({
      success: false,
      error: 'Error general',
      details: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined
    });
  }
}
