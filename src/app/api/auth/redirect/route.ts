import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase-server';

export async function GET(request: NextRequest) {
  try {
    console.log('🔄 Verificando sesión y redirigiendo...');

    const supabase = createClient();
    const { data: { user }, error } = await supabase.auth.getUser();

    if (error || !user) {
      console.error('❌ Usuario no autenticado:', error);
      return NextResponse.redirect(new URL('/?error=not_authenticated', request.url));
    }

    console.log('✅ Usuario autenticado:', user.email);
    console.log('Metadatos:', user.user_metadata);

    // Determinar rol y redirigir
    const userMetadata = user.user_metadata;
    let redirectPath = '/dashboard/student'; // Por defecto estudiante

    if (userMetadata?.rol) {
      console.log('✅ Rol encontrado:', userMetadata.rol);
      
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
    } else {
      // Fallback por email
      const email = user.email || '';
      if (email.includes('admin') || email.includes('coordinador')) {
        redirectPath = '/admin';
      } else if (email.includes('profesor') || email.includes('teacher') || email.includes('docente')) {
        redirectPath = '/dashboard/teacher';
      }
    }

    console.log('🎯 Redirigiendo a:', redirectPath);
    return NextResponse.redirect(new URL(redirectPath, request.url));

  } catch (error) {
    console.error('❌ Error en redirección:', error);
    return NextResponse.redirect(new URL('/?error=redirect_failed', request.url));
  }
}
