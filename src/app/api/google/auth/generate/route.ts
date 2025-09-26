import { NextRequest, NextResponse } from 'next/server';
import { getGoogleClassroomService } from '@/lib/googleClassroom';
import { createServerClient } from '@/lib/supabase-server';

export async function GET(request: NextRequest) {
  try {
    console.log('🔄 Generando URL de autorización de Google...');

    // Verificar variables de entorno
    const clientId = process.env.GOOGLE_CLIENT_ID;
    const clientSecret = process.env.GOOGLE_CLIENT_SECRET;
    
    if (!clientId || !clientSecret) {
      console.error('❌ Variables de entorno de Google no configuradas');
      console.error('GOOGLE_CLIENT_ID:', clientId ? 'Presente' : 'Ausente');
      console.error('GOOGLE_CLIENT_SECRET:', clientSecret ? 'Presente' : 'Ausente');
      
      return NextResponse.json(
        { success: false, error: 'Configuración de Google no disponible' },
        { status: 503 }
      );
    }

    // Verificar autenticación del usuario
    console.log('🔍 Verificando autenticación...');
    
    // Intentar obtener el token de autorización del header
    const authHeader = request.headers.get('authorization');
    console.log('- Authorization header:', authHeader ? 'Presente' : 'Ausente');
    
    // También verificar cookies manualmente
    const cookieHeader = request.headers.get('cookie');
    console.log('- Cookie header:', cookieHeader ? 'Presente' : 'Ausente');
    
    const { supabase, user, error: authError } = await createServerClient();
    
    console.log('- createServerClient resultado:', {
      user: user ? 'Presente' : 'Ausente',
      error: authError || 'Ninguno'
    });

    if (authError || !user) {
      console.log('⚠️ Usuario no autenticado, pero permitiendo OAuth para registro/login automático');
      console.log('- Error de auth:', authError);
    } else {
      console.log('✅ Usuario ya autenticado:', user.email);
    }

    // Generar URL de autorización
    console.log('🔄 Inicializando servicio de Google Classroom...');
    console.log('Variables de entorno verificadas:');
    console.log('- GOOGLE_CLIENT_ID:', clientId?.substring(0, 20) + '...');
    console.log('- GOOGLE_CLIENT_SECRET:', clientSecret?.substring(0, 10) + '...');
    
    // Verificar que googleapis se puede importar
    try {
      const { google } = require('googleapis');
      console.log('✅ Biblioteca googleapis importada correctamente');
      console.log('- google.auth disponible:', !!google.auth);
      console.log('- google.auth.OAuth2 disponible:', !!google.auth.OAuth2);
    } catch (importError) {
      console.error('❌ Error importando googleapis:', importError);
      throw new Error(`Error importando googleapis: ${importError instanceof Error ? importError.message : String(importError)}`);
    }
    
    let classroomService;
    try {
      classroomService = getGoogleClassroomService();
      console.log('✅ Servicio de Google Classroom inicializado');
    } catch (serviceError) {
      console.error('❌ Error inicializando servicio:', serviceError);
      throw new Error(`Error inicializando servicio: ${serviceError instanceof Error ? serviceError.message : String(serviceError)}`);
    }
    
    console.log('🔄 Generando URL de autorización...');
    let authUrl;
    try {
      authUrl = classroomService.generateAuthUrl();
      console.log('✅ URL de autorización generada exitosamente');
    } catch (urlError) {
      console.error('❌ Error generando URL:', urlError);
      throw new Error(`Error generando URL: ${urlError instanceof Error ? urlError.message : String(urlError)}`);
    }

    console.log('🔗 URL generada:', authUrl?.substring(0, 100) + '...');

    return NextResponse.json({
      success: true,
      authUrl: authUrl
    });

  } catch (error) {
    console.error('❌ Error generando URL de autorización:', error);
    console.error('Stack trace:', error instanceof Error ? error.stack : 'No stack trace');
    
    return NextResponse.json(
      { success: false, error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}
