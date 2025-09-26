import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase-server';

export async function GET(request: NextRequest) {
  try {
    console.log('🔄 Iniciando autenticación con Google...');

    const supabase = createClient();
    
    // Configurar la autenticación con Google OAuth
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${request.nextUrl.origin}/auth/callback?next=/admin`,
        queryParams: {
          access_type: 'offline',
          prompt: 'consent',
          scope: 'https://www.googleapis.com/auth/classroom.courses.readonly https://www.googleapis.com/auth/classroom.rosters.readonly https://www.googleapis.com/auth/classroom.coursework.students.readonly https://www.googleapis.com/auth/userinfo.email https://www.googleapis.com/auth/userinfo.profile'
        }
      }
    });

    if (error) {
      console.error('❌ Error iniciando OAuth:', error);
      return NextResponse.json(
        { success: false, error: 'Error iniciando autenticación' },
        { status: 500 }
      );
    }

    console.log('✅ URL de OAuth generada');
    
    // Redirigir directamente a Google
    return NextResponse.redirect(data.url);

  } catch (error) {
    console.error('❌ Error en signin:', error);
    return NextResponse.json(
      { success: false, error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}
