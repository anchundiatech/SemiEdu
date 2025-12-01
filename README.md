# 📚 SemiEdu - Plataforma Educativa Inteligente

[![Next.js](https://img.shields.io/badge/Next.js-14-black?style=for-the-badge&logo=next.js)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)
[![NextAuth.js](https://img.shields.io/badge/NextAuth.js-000000?style=for-the-badge&logo=nextdotjs&logoColor=white)](https://next-auth.js.org/)
[![Google Classroom API](https://img.shields.io/badge/Google_Classroom_API-4285F4?style=for-the-badge&logo=google&logoColor=white)](https://developers.google.com/classroom)
[![npm](https://img.shields.io/badge/npm-CB3837?style=for-the-badge&logo=npm&logoColor=white)](https://www.npmjs.com/)

SemiEdu es una innovadora aplicación web **stateless** que se conecta directamente con **Google Classroom API**. Ofrece información en tiempo real, detección automática de roles y comunicación simplificada para estudiantes, docentes y coordinadores sin necesidad de base de datos externa.

[![License](https://img.shields.io/badge/License-Educational-green?style=for-the-badge)](LICENSE)
[![Status](https://img.shields.io/badge/Status-Active%20Development-brightgreen?style=for-the-badge)](https://github.com/tu-usuario/semiedu)
[![Version](https://img.shields.io/badge/Version-1.0.0-blue?style=for-the-badge)](https://github.com/tu-usuario/semiedu/releases)

---

## 🚀 Características Principales

### 🔐 Autenticación Inteligente

* **Google OAuth 2.0**: Autenticación segura con cuentas de Google
* **Detección Automática de Roles**: Sistema dual de roles (aplicación + Google Classroom)
* **Sesiones JWT**: Arquitectura stateless sin base de datos
* **Middleware de Protección**: Rutas protegidas automáticamente

### 📚 Integración con Google Classroom

* **Cursos en Tiempo Real**: Obtención directa de cursos activos
* **Gestión de Estudiantes**: Listado automático por curso
* **Tareas y Asignaciones**: Sincronización completa con Google Classroom
* **Roles Dinámicos**: Detección automática de profesores y estudiantes por curso

### 🎯 Sistema de Roles Avanzado

* **Roles de Aplicación**: Basados en patrones de email (estudiante, docente, coordinador)
* **Roles de Google Classroom**: Por curso específico (teacher, student)
* **Detección Automática**: Sin configuración manual requerida
* **Permisos Granulares**: Acceso basado en rol y contexto

---

## 🛠️ Stack Tecnológico

### Frontend

[![React](https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)](https://reactjs.org/)
[![Next.js](https://img.shields.io/badge/Next.js-14-black?style=for-the-badge&logo=next.js)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)

### Herramientas de Desarrollo

[![npm](https://img.shields.io/badge/npm-CB3837?style=for-the-badge&logo=npm&logoColor=white)](https://www.npmjs.com/)
[![ESLint](https://img.shields.io/badge/ESLint-4B32C3?style=for-the-badge&logo=eslint&logoColor=white)](https://eslint.org/)
[![Node.js](https://img.shields.io/badge/Node.js-43853D?style=for-the-badge&logo=node.js&logoColor=white)](https://nodejs.org/)

---

## 📁 Estructura del Proyecto
----
```
SemiEdu/
├── src/
│ ├── app/
│ │ ├── api/
│ │ │ ├── auth/[...nextauth]/ # NextAuth endpoints
│ │ │ ├── classroom/
│ │ │ │ ├── courses/ # Cursos con roles
│ │ │ │ └── coursework/ # Tareas por curso
│ │ │ └── google-classroom/
│ │ │ └── student-data/ # Estudiantes por curso
│ │ ├── login/ # Página de autenticación
│ │ └── dashboard/ # Dashboards protegidos
│ ├── components/
│ │ ├── providers/ # NextAuth provider
│ │ └── ui/ # Componentes reutilizables
│ ├── lib/
│ │ ├── auth.ts # Configuración NextAuth
│ │ └── google-classroom.ts # Cliente Google Classroom API
│ └── types/
│ └── next-auth.d.ts # Tipos de NextAuth
├── middleware.ts # Protección de rutas
├── MIGRATION_GUIDE.md # Guía de migración
└── package.json # Dependencias con npm
```

---

## 🚀 Instalación y Uso con npm

### Requisitos Previos

* **Node.js** >= 18.0.0
* **npm** (se recomienda una versión reciente)
* **Cuenta de Google Cloud** (para Google Classroom API)
* **Acceso a Google Classroom** (como profesor o estudiante)

### Configuración de Google OAuth

1.  **Crear proyecto en Google Cloud Console**:
    * Ve a [Google Cloud Console](https://console.cloud.google.com/)
    * Crea un nuevo proyecto o selecciona uno existente
    * Habilita la **Google Classroom API**

2.  **Configurar OAuth 2.0**:
    * Ve a "Credenciales" → "Crear credenciales" → "ID de cliente OAuth 2.0"
    * Tipo de aplicación: **Aplicación web**
    * URIs de redirección autorizados:
        * `http://localhost:3000/api/auth/callback/google` (desarrollo)
        * `https://tu-dominio.com/api/auth/callback/google` (producción)

3.  **Configurar variables de entorno**:

    ```bash
    # Copia el archivo de ejemplo
    cp .env.example .env.local

    # Edita .env.local con tus credenciales:
    NEXTAUTH_URL=http://localhost:3000
    NEXTAUTH_SECRET=tu-secret-key-aqui
    GOOGLE_CLIENT_ID=tu-google-client-id
    GOOGLE_CLIENT_SECRET=tu-google-client-secret
    ```

### 🚀 Instalación

1.  **Instalar dependencias**

    ```bash
    npm install
    ```

2.  **Ejecutar en modo desarrollo**:

    ```bash
    npm run dev
    ```

3.  **Otros comandos útiles**:

    ```bash
    npm run build          # Construir para producción
    npm start              # Iniciar servidor de producción
    npm run lint           # Ejecutar linter
    npm run type-check     # Verificar tipos TypeScript
    ```

### Comandos Disponibles

[![Build](https://img.shields.io/badge/Build-npm%20run%20build-blue?style=flat-square)](https://www.npmjs.com/)
[![Dev](https://img.shields.io/badge/Dev-npm%20run%20dev-green?style=flat-square)](https://www.npmjs.com/)
[![Lint](https://img.shields.io/badge/Lint-npm%20run%20lint-yellow?style=flat-square)](https://eslint.org/)
[![Type Check](https://img.shields.io/badge/Type%20Check-npm%20run%20type--check-purple?style=flat-square)](https://www.typescriptlang.org/)

4.  **Abrir en el navegador**:

    ```
    http://localhost:3000
    ```

---

## 🔒 Autenticación y Roles

La aplicación utiliza **Google OAuth 2.0** para autenticación.

### Detección Automática de Roles

* **Estudiantes**: Cualquier cuenta de Google con acceso a Google Classroom
* **Docentes**: Cuentas con permisos de profesor en Google Classroom
* **Coordinadores**: Cuentas con emails que contengan "coordinador", "admin" o "director"

Los roles de la aplicación y de Google Classroom (teacher, student) se detectan y gestionan automáticamente.

---

## 📊 Estado del Proyecto

### ✅ Completado

* Integración con Google Classroom
* Autenticación NextAuth
* Arquitectura Stateless
* Detección de Roles
* Endpoints de API
* Protección de Rutas

### 🚧 En Desarrollo

* Entrega de Tareas por Estudiantes
* Sistema de Calificaciones
* Interfaz de Usuario del Dashboard

### 🔮 Próximas Características

* Notificaciones en Tiempo Real
* Análisis Avanzado
* Soporte Multi-lenguaje
* Aplicación Móvil
* Documentación de API

---

## 🤝 Contribución

[![Contributions Welcome](https://img.shields.io/badge/Contributions-Welcome-green?style=for-the-badge)](CONTRIBUTING.md)

Este proyecto sigue las mejores prácticas de desarrollo moderno con NextAuth, TypeScript y arquitectura serverless.

### Cómo Contribuir

1.  **Fork** el repositorio
2.  **Crea** una rama para tu feature (`git checkout -b feature/AmazingFeature`)
3.  **Commit** tus cambios (`git commit -m 'Add some AmazingFeature'`)
4.  **Push** a la rama (`git push origin feature/AmazingFeature`)
5.  **Abre** un Pull Request

---

## 📄 Licencia

[![License](https://img.shields.io/badge/License-Educational-green?style=for-the-badge)](LICENSE)

Proyecto educativo desarrollado para mejorar la experiencia de aprendizaje digital.

---

<div align="center">

**¿Te gusta el proyecto? ¡Dale una ⭐!**

[![GitHub stars](https://img.shields.io/github/stars/tu-usuario/semiedu?style=social)](https://github.com/tu-usuario/semiedu)
[![GitHub forks](https://img.shields.io/github/forks/tu-usuario/semiedu?style=social)](https://github.com/tu-usuario/semiedu)
[![GitHub watchers](https://img.shields.io/github/watchers/tu-usuario/semiedu?style=social)](https://github.com/tu-usuario/semiedu)

</div>


