'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useSession, signOut } from 'next-auth/react';

import {
  LayoutDashboard,
  Users,
  BookOpen,
  FileText,
  Bell,
  TrendingUp,
  Settings,
  LogOut,
  Menu,
  X,
  GraduationCap,
  ClipboardList,
  Calendar,
  BarChart3,
  User
} from 'lucide-react';

interface DashboardLayoutProps {
  children: React.ReactNode;
}

export default function DashboardLayout({ children }: DashboardLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const pathname = usePathname();
  const { data: session } = useSession();

  // No mostrar sidebar en la página principal de dashboard (redirección)
  const shouldShowSidebar = pathname !== '/dashboard';

  // Configuración de navegación según el rol
  const getNavigationItems = () => {
    const userRole = session?.user?.role;

    const commonItems = [
      {
        name: 'Dashboard',
        href: userRole === 'coordinador' ? '/admin' :
              userRole === 'docente' ? '/dashboard/teacher' :
              '/dashboard/student',
        icon: LayoutDashboard,
        current: pathname === '/dashboard' ||
                pathname === '/dashboard/student' ||
                pathname === '/dashboard/teacher'
      },
      {
        name: 'Notificaciones',
        href: '/notifications',
        icon: Bell,
        current: pathname.startsWith('/notifications')
      },
      {
        name: 'Perfil',
        href: '/dashboard/profile',
        icon: User,
        current: pathname === '/dashboard/profile'
      }
    ];

    // Items específicos por rol
    const roleSpecificItems = {
      estudiante: [
        {
          name: 'Mis Clases',
          href: '/classes',
          icon: BookOpen,
          current: pathname.startsWith('/classes')
        },
        {
          name: 'Tareas',
          href: '/tasks',
          icon: ClipboardList,
          current: pathname.startsWith('/tasks')
        },
        {
          name: 'Calendario',
          href: '/calendar',
          icon: Calendar,
          current: pathname.startsWith('/calendar')
        }
      ],
      docente: [
        {
          name: 'Mis Clases',
          href: '/classes',
          icon: BookOpen,
          current: pathname.startsWith('/classes')
        },
        {
          name: 'Estudiantes',
          href: '/students',
          icon: Users,
          current: pathname.startsWith('/students')
        },
        {
          name: 'Tareas',
          href: '/tasks',
          icon: ClipboardList,
          current: pathname.startsWith('/tasks')
        },
        {
          name: 'Reportes',
          href: '/reports',
          icon: BarChart3,
          current: pathname.startsWith('/reports')
        }
      ],
      coordinador: [
        {
          name: 'Panel Admin',
          href: '/admin',
          icon: Settings,
          current: pathname.startsWith('/admin')
        }
      ]
    };

    return [
      ...commonItems,
      ...(roleSpecificItems[userRole as keyof typeof roleSpecificItems] || [])
    ];
  };

  const navigation = getNavigationItems();

  const handleSignOut = async () => {
    try {
      await signOut({ callbackUrl: '/login' });
    } catch (error) {
      console.error('Error cerrando sesión:', error);
    }
  };

  return (
   
      <div className="min-h-screen bg-gray-50">
      {/* Sidebar móvil - solo mostrar si shouldShowSidebar es true */}
      {shouldShowSidebar && (
        <div className={`fixed inset-0 z-50 lg:hidden ${sidebarOpen ? 'block' : 'hidden'}`}>
        <div className="fixed inset-0 bg-gray-600 bg-opacity-75" onClick={() => setSidebarOpen(false)} />
        <div className="fixed inset-y-0 left-0 flex w-64 flex-col bg-white">
          <div className="flex h-16 items-center justify-between px-4 border-b border-gray-200">
            <div className="flex items-center">
              <BookOpen className="h-8 w-8 text-primary" />
              <span className="ml-2 text-xl font-bold text-gray-900">SemiEdu</span>
            </div>
            <button
              onClick={() => setSidebarOpen(false)}
              className="text-gray-400 hover:text-gray-600"
            >
              <X className="h-6 w-6" />
            </button>
          </div>
          <nav className="flex-1 space-y-1 px-2 py-4">
            {navigation.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                className={`group flex items-center px-2 py-2 text-sm font-medium rounded-md ${
                  item.current
                    ? 'bg-primary text-white'
                    : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                }`}
                onClick={() => setSidebarOpen(false)}
              >
                <item.icon className="mr-3 h-6 w-6 flex-shrink-0" />
                {item.name}
              </Link>
            ))}
          </nav>
          <div className="border-t border-gray-200 p-4">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="h-8 w-8 rounded-full bg-primary flex items-center justify-center">
                  <User className="h-5 w-5 text-white" />
                </div>
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-700">
                  {session?.user?.name || session?.user?.email}
                </p>
                <p className="text-xs text-gray-500 capitalize">
                  {session?.user?.role}
                </p>
              </div>
            </div>
            <button
              onClick={handleSignOut}
              className="mt-3 w-full flex items-center px-2 py-2 text-sm font-medium text-gray-600 rounded-md hover:bg-gray-50 hover:text-gray-900"
            >
              <LogOut className="mr-3 h-5 w-5" />
              Cerrar Sesión
            </button>
          </div>
        </div>
      </div>
      )}

      {/* Sidebar desktop - solo mostrar si shouldShowSidebar es true */}
      {shouldShowSidebar && (
        <div className="hidden lg:fixed lg:inset-y-0 lg:flex lg:w-64 lg:flex-col">
        <div className="flex flex-col flex-grow bg-white border-r border-gray-200">
          <div className="flex items-center h-16 px-4 border-b border-gray-200">
            <BookOpen className="h-8 w-8 text-primary" />
            <span className="ml-2 text-xl font-bold text-gray-900">SemiEdu</span>
          </div>
          <nav className="flex-1 space-y-1 px-2 py-4">
            {navigation.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                className={`group flex items-center px-2 py-2 text-sm font-medium rounded-md ${
                  item.current
                    ? 'bg-primary text-white'
                    : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                }`}
              >
                <item.icon className="mr-3 h-6 w-6 flex-shrink-0" />
                {item.name}
              </Link>
            ))}
          </nav>
          <div className="border-t border-gray-200 p-4">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="h-8 w-8 rounded-full bg-primary flex items-center justify-center">
                  <User className="h-5 w-5 text-white" />
                </div>
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-700">
                  {session?.user?.name || session?.user?.email}
                </p>
                <p className="text-xs text-gray-500 capitalize">
                  {session?.user?.role}
                </p>
              </div>
            </div>
            <button
              onClick={handleSignOut}
              className="mt-3 w-full flex items-center px-2 py-2 text-sm font-medium text-gray-600 rounded-md hover:bg-gray-50 hover:text-gray-900"
            >
              <LogOut className="mr-3 h-5 w-5" />
              Cerrar Sesión
            </button>
          </div>
        </div>
      </div>
      )}

      {/* Contenido principal */}
      <div className={shouldShowSidebar ? "lg:pl-64" : ""}>
        {/* Header móvil - solo mostrar si shouldShowSidebar es true */}
        {shouldShowSidebar && (
          <div className="sticky top-0 z-40 lg:hidden">
          <div className="flex items-center justify-between h-16 px-4 bg-white border-b border-gray-200">
            <button
              onClick={() => setSidebarOpen(true)}
              className="text-gray-500 hover:text-gray-600"
            >
              <Menu className="h-6 w-6" />
            </button>
            <div className="flex items-center">
              <BookOpen className="h-6 w-6 text-primary" />
              <span className="ml-2 text-lg font-semibold text-gray-900">SemiEdu</span>
            </div>
            <div className="w-6" /> {/* Spacer */}
          </div>
        </div>
        )}

        {/* Contenido de la página */}
        <main className="flex-1">
          {children}
        </main>
      </div>
    </div>
   
  );
}
