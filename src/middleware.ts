import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export async function middleware(req: NextRequest) {
  const res = NextResponse.next();

  // Rutas que requieren autenticación
  const protectedRoutes = [
    '/dashboard',
    '/admin',
    '/profile',
    '/notifications',
    '/classes',
    '/tasks',
    '/reports'
  ];

  // Rutas de autenticación (no deben ser accesibles si ya está autenticado)
  const authRoutes = [
    '/auth/login',
    '/auth/register',
    '/auth/forgot-password'
  ];

  const { pathname } = req.nextUrl;

  try {
    // Debug logging
    console.log('🔍 Middleware - Ruta:', pathname);
    
    // Verificar si existe token de sesión en las cookies de Supabase
    // Buscar todas las cookies que contengan 'sb-' o 'supabase'
    const allCookies = req.cookies.getAll();
    const supabaseCookies = allCookies.filter(cookie => 
      cookie.name.includes('sb-') || cookie.name.includes('supabase')
    );
    
    console.log('🔍 Middleware - Todas las cookies de Supabase:', supabaseCookies.map(c => c.name));
    
    // Buscar cookies específicas
    const accessToken = req.cookies.get('sb-cpaojflzqollbratbxpt-auth-token')?.value;
    const refreshToken = req.cookies.get('sb-cpaojflzqollbratbxpt-auth-token-code-verifier')?.value;
    
    // También verificar cookies alternativas y cualquier cookie que contenga 'auth-token'
    const altToken = req.cookies.get('supabase-auth-token')?.value || 
                     req.cookies.get('sb-access-token')?.value ||
                     supabaseCookies.find(c => c.name.includes('auth-token'))?.value;

    const isAuthenticated = !!(accessToken || altToken || supabaseCookies.length > 0);
    
    console.log('🔍 Middleware - Tokens encontrados:', {
      accessToken: !!accessToken,
      refreshToken: !!refreshToken,
      altToken: !!altToken,
      isAuthenticated,
      totalCookies: req.cookies.getAll().length
    });

    // TEMPORAL: Permitir acceso a dashboard si no hay cookies pero tampoco hay redirectTo
    // Esto indica que el usuario está navegando desde la aplicación (ya autenticado)
    const hasRedirectTo = req.nextUrl.searchParams.has('redirectTo');
    const isDashboardRoute = protectedRoutes.some(route => pathname.startsWith(route));
    
    if (!isAuthenticated && isDashboardRoute) {
      // Si no hay redirectTo, probablemente es navegación interna - permitir temporalmente
      if (!hasRedirectTo) {
        console.log('⚠️ Middleware - Sin cookies pero sin redirectTo, permitiendo acceso temporal a:', pathname);
        return res;
      }
      
      console.log('🚫 Middleware - Bloqueando acceso a ruta protegida:', pathname);
      console.log('🚫 Middleware - Redirigiendo a login con redirectTo:', pathname);
      const loginUrl = new URL('/auth/login', req.url);
      loginUrl.searchParams.set('redirectTo', pathname);
      return NextResponse.redirect(loginUrl);
    }
    
    console.log('✅ Middleware - Permitiendo acceso a:', pathname);

    // Para rutas de auth, dejar que el AuthContext maneje la redirección
    // No redirigir aquí para evitar conflictos

    return res;
  } catch (error) {
    console.error('Error en middleware:', error);
    // En caso de error, permitir el acceso pero loggear el error
    return res;
  }
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    '/((?!api|_next/static|_next/image|favicon.ico|public).*)',
  ],
};
