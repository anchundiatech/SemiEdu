# SemiEdu - Plataforma Educativa Inteligente

SemiEdu es una innovadora aplicación web que mejora la participación educativa al conectar de manera fluida con Google Classroom. Ofrece información en tiempo real y comunicación simplificada para estudiantes, docentes y coordinadores.

## 🚀 Características Principales

### 📊 Dashboards de Progreso
- **Visualización del Progreso Estudiantil**: Seguimiento detallado del rendimiento académico individual y grupal
- **Visualización del Progreso Docente**: Monitoreo de la efectividad de los métodos de enseñanza
- Gráficos interactivos y métricas en tiempo real
- Identificación de estudiantes en riesgo y destacados

### 🔔 Notificaciones Centralizadas
- **Notificaciones de Tareas**: Alertas sobre asignaciones y fechas de entrega
- **Notificaciones de Cambios de Calendario**: Actualizaciones sobre horarios y aulas
- Sistema de prioridades y filtros avanzados
- Historial completo de notificaciones

### 📈 Reportes Automáticos
- **Reportes de Asistencia**: Análisis detallado de la asistencia estudiantil
- **Reportes de Participación**: Evaluación del compromiso y participación
- Exportación en múltiples formatos (PDF, Excel, CSV)
- Programación de envíos automáticos

## 🎨 Sistema de Diseño

### Paleta de Colores
- **Color Principal**: #3B82F6 (Azul)
- **Color Secundario**: #10B981 (Verde)
- **Fondo**: #FFFFFF (Blanco)
- **Texto**: #1F2937 (Gris Oscuro)

### Tipografía
- **Fuente Principal**: Inter
- **Texto Normal**: 16px
- **Encabezados**: 20px
- **Texto Secundario**: 14px

## 🛠️ Tecnologías Utilizadas

- **Frontend**: Next.js 14 con TypeScript
- **Estilos**: Tailwind CSS
- **Gráficos**: Recharts
- **Iconos**: Lucide React
- **Componentes**: Componentes personalizados reutilizables

## 📁 Estructura del Proyecto

```
/src
  /app
    /dashboard
      /student     # Dashboard de progreso estudiantil
      /teacher     # Dashboard de progreso docente
    /notifications
      /tasks       # Notificaciones de tareas
      /calendar    # Notificaciones de calendario
    /reports
      /attendance      # Reportes de asistencia
      /participation   # Reportes de participación
  /components
    /ui            # Componentes base reutilizables
  /utils           # Utilidades y datos mock
```

## 🚀 Instalación y Uso

### Requisitos Previos
- Node.js >= 18.0.0
- pnpm >= 8.0.0
- Cuenta de Supabase (para base de datos)

### Configuración de la Base de Datos

1. **Crear proyecto en Supabase**:
   - Ve a [supabase.com](https://supabase.com)
   - Crea una nueva cuenta o inicia sesión
   - Crea un nuevo proyecto

2. **Configurar variables de entorno**:
   ```bash
   # Copia el archivo de ejemplo
   cp .env.example .env.local
   
   # Edita .env.local con tus credenciales de Supabase:
   NEXT_PUBLIC_SUPABASE_URL=tu_url_de_supabase
   NEXT_PUBLIC_SUPABASE_ANON_KEY=tu_clave_anonima
   SUPABASE_SERVICE_ROLE_KEY=tu_clave_de_servicio
   ```

3. **Ejecutar el esquema de base de datos**:
   - En el panel de Supabase, ve a SQL Editor
   - Ejecuta el contenido del archivo `supabase/schema.sql`

### Instalación con pnpm

1. **Instalar pnpm globalmente** (si no lo tienes):
   ```bash
   npm install -g pnpm
   ```

2. **Instalar dependencias**:
   ```bash
   cd "c:\Users\HP CORE I3\Desktop\SemiEdu"
   pnpm install
   ```

3. **Poblar la base de datos con datos de demostración**:
   ```bash
   pnpm db:seed
   ```

4. **Ejecutar en modo desarrollo**:
   ```bash
   pnpm dev
   ```

5. **Otros comandos útiles**:
   ```bash
   pnpm build          # Construir para producción
   pnpm start          # Iniciar servidor de producción
   pnpm lint           # Ejecutar linter
   pnpm type-check     # Verificar tipos TypeScript
   pnpm db:clear       # Limpiar base de datos
   pnpm db:reset       # Reiniciar base de datos
   ```

6. **Abrir en el navegador**:
   ```
   http://localhost:3000
   ```

### Cuentas de Demostración

Después de ejecutar `pnpm db:seed`, puedes usar estas cuentas:

- **Estudiante**: estudiante@semiedu.com / password123
- **Docente**: docente@semiedu.com / password123  
- **Coordinador**: coordinador@semiedu.com / password123

## 📋 Flujo de Usuario

1. **Pantalla de Inicio**: Acceso a las principales funcionalidades
2. **Dashboards de Progreso**: Visualización de métricas estudiantiles y docentes
3. **Notificaciones**: Centro de alertas y actualizaciones
4. **Reportes**: Generación automática de informes detallados

## 🎯 Usuarios Objetivo

- **Estudiantes**: Seguimiento de progreso y notificaciones claras
- **Docentes**: Visión consolidada del rendimiento de sus clases
- **Coordinadores**: Métricas rápidas para toma de decisiones

## 🔮 Próximas Características

- Integración real con Google Classroom API
- Sistema de autenticación y autorización
- Base de datos para persistencia de información
- Chat en tiempo real entre usuarios
- Personalización de notificaciones
- Acceso offline y sincronización
- Soporte multiidioma

## 🤝 Contribución

Este proyecto está diseñado para ser escalable y mantenible. Sigue las mejores prácticas de desarrollo y está preparado para integración con servicios externos.

## 📄 Licencia

Proyecto educativo desarrollado para mejorar la experiencia de aprendizaje digital.
