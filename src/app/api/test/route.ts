import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    // Obtener información de la request
    const userAgent = request.headers.get('user-agent') || 'Unknown';
    const host = request.headers.get('host') || 'Unknown';
    const referer = request.headers.get('referer') || 'Direct';
    
    // Obtener cookies
    const cookies = request.cookies.getAll();
    const supabaseCookies = cookies.filter(cookie => 
      cookie.name.includes('sb-') || cookie.name.includes('supabase')
    );

    // Información del servidor
    const serverInfo = {
      timestamp: new Date().toISOString(),
      method: request.method,
      url: request.url,
      headers: {
        userAgent,
        host,
        referer,
        contentType: request.headers.get('content-type'),
        authorization: request.headers.get('authorization') ? 'Present' : 'Not present'
      },
      cookies: {
        total: cookies.length,
        supabase: supabaseCookies.length,
        supabaseCookieNames: supabaseCookies.map(c => c.name)
      },
      environment: {
        nodeEnv: process.env.NODE_ENV,
        nextjsVersion: process.env.npm_package_dependencies_next || 'Unknown',
        hasSupabaseUrl: !!process.env.NEXT_PUBLIC_SUPABASE_URL,
        hasSupabaseKey: !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
      }
    };

    return NextResponse.json({
      success: true,
      message: 'API Test endpoint funcionando correctamente',
      data: serverInfo
    });

  } catch (error) {
    console.error('Error en API test:', error);
    
    return NextResponse.json({
      success: false,
      message: 'Error en el endpoint de test',
      error: error instanceof Error ? error.message : 'Error desconocido'
    }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    return NextResponse.json({
      success: true,
      message: 'POST request recibida correctamente',
      receivedData: body,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    return NextResponse.json({
      success: false,
      message: 'Error procesando POST request',
      error: error instanceof Error ? error.message : 'Error desconocido'
    }, { status: 400 });
  }
}
