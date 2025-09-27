# 🚀 Guía de Migración: De Supabase a Google Classroom API

Esta guía documenta la migración de SemiEdu desde una arquitectura basada en Supabase hacia una implementación que utiliza únicamente Google Classroom API.

## 📋 Resumen de Cambios

### ❌ **Eliminado**
- Supabase como base de datos
- Repositorios y capa de persistencia
- Scripts de seed de base de datos
- Tipos de base de datos personalizados
- Gestión de usuarios local

### ✅ **Agregado**
- NextAuth para autenticación OAuth2
- Cliente de Google Classroom API
- Detección de roles basada en Google Classroom
- Middleware de protección de rutas
- Arquitectura stateless

## 🏗️ **Nueva Arquitectura**

```
┌─────────────────┐    ┌──────────────────┐    ┌─────────────────┐
│   Frontend      │    │   NextAuth       │    │  Google APIs    │
│   (Next.js)     │◄──►│   (OAuth2)       │◄──►│  (Classroom)    │
└─────────────────┘    └──────────────────┘    └─────────────────┘
                                │
                                ▼
                       ┌──────────────────┐
                       │   JWT Session    │
                       │   (Stateless)    │
                       └──────────────────┘
```

## 🔧 **Configuración Requerida**

### 1. Variables de Entorno

Crea un archivo `.env.local` con:

```bash
# NextAuth.js Configuration
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your-secret-key-here

# Google OAuth Configuration
GOOGLE_CLIENT_ID=your-google-client-id-here
GOOGLE_CLIENT_SECRET=your-google-client-secret-here
```

### 2. Configuración de Google OAuth

1. Ve a [Google Cloud Console](https://console.cloud.google.com/)
2. Crea un nuevo proyecto o selecciona uno existente
3. Habilita la Google Classroom API
4. Crea credenciales OAuth 2.0
5. Configura las URLs de redirección:
   - `http://localhost:3000/api/auth/callback/google` (desarrollo)
   - `https://tu-dominio.com/api/auth/callback/google` (producción)

### 3. Scopes de Google Classroom

La aplicación solicita los siguientes permisos:

- `classroom.courses.readonly` - Leer cursos
- `classroom.coursework.me.readonly` - Leer tareas del usuario
- `classroom.student-submissions.me.readonly` - Leer entregas del usuario
- `classroom.coursework.students.readonly` - Leer tareas de estudiantes (profesores)
- `classroom.rosters.readonly` - Leer listas de clase
- `classroom.profile.emails` - Acceder a emails de perfiles
- `classroom.profile.photos` - Acceder a fotos de perfiles
- `classroom.announcements.readonly` - Leer anuncios

## 🔄 **Sistema de Roles**

### Roles de Aplicación (basados en email)
- **estudiante**: Rol por defecto
- **docente**: Emails que contengan "profesor", "teacher", o "docente"
- **coordinador**: Emails que contengan "coordinador", "admin", o "director"

### Roles de Google Classroom (por curso)
- **teacher**: Usuario es profesor del curso
- **student**: Usuario es estudiante del curso

## 📡 **Nuevos Endpoints API**

### `/api/classroom/courses`
- **Método**: GET
- **Descripción**: Obtiene todos los cursos del usuario con sus roles
- **Respuesta**: Lista de cursos con información detallada

### `/api/classroom/coursework?courseId=ID`
- **Método**: GET
- **Descripción**: Obtiene las tareas de un curso específico
- **Parámetros**: `courseId` (requerido)

### `/api/google-classroom/student-data?courseId=ID`
- **Método**: GET
- **Descripción**: Obtiene los estudiantes de un curso
- **Parámetros**: `courseId` (requerido)

## 🚀 **Instalación y Ejecución**

### 1. Instalar Dependencias

```bash
npm install
# o
pnpm install
```

### 2. Configurar Variables de Entorno

```bash
cp .env.example .env.local
# Edita .env.local con tus credenciales
```

### 3. Ejecutar en Desarrollo

```bash
npm run dev
# o
pnpm dev
```

## 🔐 **Flujo de Autenticación**

1. Usuario accede a `/dashboard`
2. Middleware redirige a `/login` si no está autenticado
3. Usuario se autentica con Google OAuth
4. NextAuth obtiene tokens de acceso
5. Tokens se almacenan en sesión JWT
6. APIs utilizan tokens para consultar Google Classroom

## 📊 **Funcionalidades Disponibles**

### ✅ **Implementado**
- Autenticación con Google OAuth
- Detección de roles por email y por curso
- Obtención de cursos con roles
- Listado de estudiantes por curso
- Obtención de tareas por curso
- Protección de rutas

### 🔄 **En Desarrollo**
- Entregas de tareas
- Calificaciones
- Anuncios
- Métricas y estadísticas

## 🐛 **Troubleshooting**

### Error: "Cannot find module 'next-auth'"
```bash
npm install next-auth
```

### Error: "Invalid client_id"
- Verifica que `GOOGLE_CLIENT_ID` esté configurado correctamente
- Asegúrate de que el proyecto de Google Cloud tenga la Classroom API habilitada

### Error: "NEXTAUTH_SECRET missing"
```bash
# Genera un secret aleatorio
openssl rand -base64 32
```

### Error: "Insufficient permissions"
- Verifica que el usuario haya aceptado todos los scopes requeridos
- Revisa que el usuario tenga acceso a Google Classroom

## 📚 **Recursos Adicionales**

- [NextAuth.js Documentation](https://next-auth.js.org/)
- [Google Classroom API](https://developers.google.com/classroom)
- [Google Cloud Console](https://console.cloud.google.com/)

## 🎯 **Próximos Pasos**

1. Implementar componentes frontend para la nueva arquitectura
2. Agregar funcionalidades de entregas y calificaciones
3. Implementar sistema de notificaciones
4. Optimizar rendimiento con caché
5. Agregar tests unitarios e integración