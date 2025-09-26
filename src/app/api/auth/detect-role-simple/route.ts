import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    console.log('🔍 API: Iniciando detección simple de rol...');

    const body = await request.json();
    const { accessToken, refreshToken, userId, email } = body;

    console.log('📋 Datos recibidos:', {
      hasAccessToken: !!accessToken,
      hasRefreshToken: !!refreshToken,
      userId: userId,
      email: email,
      tokenLength: accessToken?.length || 0
    });

    if (!accessToken && !email) {
      console.error('❌ Se requiere token de acceso o email');
      return NextResponse.json(
        { error: 'Token de acceso o email requerido' },
        { status: 400 }
      );
    }

    // Detección simple basada en email como fallback principal
    const detectedRole = detectRoleByEmail(email || '');
    
    console.log('✅ Rol detectado por email:', detectedRole);

    // Si tenemos token, intentar validación básica con Google
    let googleValidation = null;
    if (accessToken) {
      try {
        googleValidation = await validateGoogleToken(accessToken);
        console.log('✅ Token de Google validado:', googleValidation);
      } catch (tokenError) {
        console.warn('⚠️ No se pudo validar token de Google:', tokenError);
      }
    }

    // Determinar URL de dashboard
    let dashboardUrl = '/dashboard/student';
    switch (detectedRole.role) {
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

    return NextResponse.json({
      success: true,
      role: detectedRole.role,
      confidence: detectedRole.confidence,
      reasoning: detectedRole.reasoning,
      details: {
        coursesAsTeacher: 0,
        coursesAsStudent: 0,
        totalCourses: 0,
        isOwnerOfMultipleCourses: false,
        hasTeacherPermissions: false,
        hasStudentPermissions: false,
        emailBasedDetection: true,
        googleTokenValid: !!googleValidation
      },
      dashboardUrl,
      message: `Rol detectado: ${detectedRole.role} (confianza: ${detectedRole.confidence})`
    });

  } catch (error) {
    console.error('❌ Error en detección simple de rol:', error);

    return NextResponse.json({
      success: false,
      error: `Error en detección: ${error instanceof Error ? error.message : String(error)}`,
      fallback: {
        role: 'estudiante',
        confidence: 'low',
        reasoning: 'Error en detección, asignando rol por defecto',
        dashboardUrl: '/dashboard/student'
      }
    }, { status: 500 });
  }
}

/**
 * Detecta rol basándose únicamente en el email
 */
function detectRoleByEmail(email: string) {
  console.log('📧 Analizando email para detección de rol:', email);

  const emailLower = email.toLowerCase();

  // Palabras clave para coordinador/admin
  const coordinatorKeywords = [
    'admin', 'coordinador', 'coordinator', 'director', 'jefe', 'head',
    'principal', 'supervisor', 'manager', 'administrador'
  ];

  // Palabras clave para profesor/docente
  const teacherKeywords = [
    'profesor', 'teacher', 'docente', 'instructor', 'tutor',
    'maestro', 'prof', 'educador', 'faculty'
  ];

  // Verificar coordinador
  for (const keyword of coordinatorKeywords) {
    if (emailLower.includes(keyword)) {
      return {
        role: 'coordinador' as const,
        confidence: 'medium' as const,
        reasoning: `Email contiene palabra clave de coordinador: "${keyword}"`
      };
    }
  }

  // Verificar profesor
  for (const keyword of teacherKeywords) {
    if (emailLower.includes(keyword)) {
      return {
        role: 'docente' as const,
        confidence: 'medium' as const,
        reasoning: `Email contiene palabra clave de profesor: "${keyword}"`
      };
    }
  }

  // Por defecto: estudiante
  return {
    role: 'estudiante' as const,
    confidence: 'low' as const,
    reasoning: 'No se encontraron palabras clave específicas en el email, asignando rol de estudiante por defecto'
  };
}

/**
 * Validación básica del token de Google
 */
async function validateGoogleToken(accessToken: string) {
  try {
    const response = await fetch(`https://www.googleapis.com/oauth2/v1/tokeninfo?access_token=${accessToken}`);
    
    if (!response.ok) {
      throw new Error(`Token inválido: ${response.status}`);
    }

    const tokenInfo = await response.json();
    
    return {
      valid: true,
      scope: tokenInfo.scope,
      audience: tokenInfo.audience,
      expires_in: tokenInfo.expires_in
    };
  } catch (error) {
    console.error('Error validando token:', error);
    return {
      valid: false,
      error: error instanceof Error ? error.message : String(error)
    };
  }
}
