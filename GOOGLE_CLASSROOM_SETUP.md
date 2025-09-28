# Configuración de Google Classroom

## Problema Identificado

El sistema está mostrando "Clase de Prueba para API" en lugar de los cursos reales de Google Classroom porque **las credenciales de Google OAuth no están configuradas**.

## Solución Paso a Paso

### 1. Crear Proyecto en Google Cloud Console

1. Ve a [Google Cloud Console](https://console.cloud.google.com/)
2. Crea un nuevo proyecto o selecciona uno existente
3. Anota el **Project ID** para referencia futura

### 2. Habilitar la API de Google Classroom

1. En el menú lateral, ve a **APIs & Services** > **Library**
2. Busca "Google Classroom API"
3. Haz clic en **Enable** para habilitar la API

### 3. Crear Credenciales OAuth 2.0

1. Ve a **APIs & Services** > **Credentials**
2. Haz clic en **+ CREATE CREDENTIALS** > **OAuth client ID**
3. Selecciona **Web application** como tipo de aplicación
4. Configura las URLs de redirección:
   - `http://localhost:3000/api/oauth/google/callback`
   - `http://localhost:3000/api/google/callback`
5. Guarda las credenciales y anota:
   - **Client ID**
   - **Client Secret**

### 4. Configurar Variables de Entorno

Crea un archivo `.env.local` en la raíz del proyecto con:

```env
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=tu_supabase_url_aqui
NEXT_PUBLIC_SUPABASE_ANON_KEY=tu_supabase_anon_key_aqui
SUPABASE_SERVICE_ROLE_KEY=tu_supabase_service_role_key_aqui

# Google OAuth Configuration
GOOGLE_CLIENT_ID=tu_google_client_id_aqui
GOOGLE_CLIENT_SECRET=tu_google_client_secret_aqui

# Next.js Configuration
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=tu_nextauth_secret_aqui
```

### 5. Reiniciar el Servidor

```bash
yarn run dev
```

### 6. Probar la Integración

1. Ve a `/admin/integration` (como coordinador)
2. Haz clic en **Conectar Google Classroom**
3. Autoriza el acceso con tu cuenta de Google
4. Verifica que los cursos reales aparezcan en el dashboard

## Verificación de la Configuración

### En el Dashboard del Estudiante

- **Antes**: Muestra "Clase de Prueba para API" (datos simulados)
- **Después**: Muestra tus cursos reales de Google Classroom

### En el Panel de Administración

- **Estado**: Conectado ✅
- **Cursos**: Número real de cursos sincronizados
- **Estudiantes**: Número real de estudiantes
- **Tareas**: Número real de tareas

## Solución de Problemas

### Error: "CONFIGURATION_REQUIRED"

- **Causa**: Variables de entorno no configuradas
- **Solución**: Configurar `.env.local` y reiniciar servidor

### Error: "access_denied"

- **Causa**: Usuario no autorizó el acceso
- **Solución**: Volver a intentar la conexión

### Error: "no_code"

- **Causa**: URL de redirección incorrecta
- **Solución**: Verificar URLs en Google Cloud Console

### Los cursos no aparecen

- **Causa**: Cuenta de Google no tiene acceso a Google Classroom
- **Solución**: Usar cuenta con permisos de Google Classroom

## Estructura de Archivos Modificados

```
src/
├── app/
│   ├── api/
│   │   └── google-classroom/
│   │       └── student-data/
│   │           └── route.ts          # Mejorado manejo de errores
│   ├── admin/
│   │   └── integration/
│   │       └── page.tsx              # Panel de configuración
│   └── dashboard/
│       └── student/
│           └── page.tsx              # Mejor feedback visual
├── hooks/
│   └── useGoogleClassroomData.ts     # Manejo de errores mejorado
└── lib/
    └── googleClassroom.ts            # Servicio de Google Classroom
```

## Próximos Pasos

1. **Configurar las credenciales** siguiendo los pasos anteriores
2. **Probar la integración** con una cuenta de Google que tenga acceso a Google Classroom
3. **Verificar que los datos reales** aparezcan en el dashboard
4. **Configurar sincronización automática** si es necesario

## Soporte

Si tienes problemas con la configuración:

1. Revisa los logs del servidor en la consola
2. Verifica que todas las variables de entorno estén configuradas
3. Asegúrate de que las URLs de redirección coincidan exactamente
4. Confirma que la cuenta de Google tenga acceso a Google Classroom
