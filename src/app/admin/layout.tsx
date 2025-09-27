'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import { useAuth } from '@/contexts/AuthContext';
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
  Shield,
  Database,
  BarChart3,
  ExternalLink
} from 'lucide-react';

interface AdminLayoutProps {
  children: React.ReactNode;
}

export default function AdminLayout({ children }: AdminLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const pathname = usePathname();
  const { user, signOut } = useAuth();

  const navigation = [
    {
      name: 'Dashboard',
      href: '/admin',
      icon: LayoutDashboard,
      current: pathname === '/admin'
    },
    {
      name: 'Usuarios',
      href: '/admin/users',
      icon: Users,
      current: pathname.startsWith('/admin/users')
    },
    {
      name: 'Clases',
      href: '/admin/classes',
      icon: BookOpen,
      current: pathname.startsWith('/admin/classes')
    },
    {
      name: 'Tareas',
      href: '/admin/tasks',
      icon: FileText,
      current: pathname.startsWith('/admin/tasks')
    },
    {
      name: 'Notificaciones',
      href: '/admin/notifications',
      icon: Bell,
      current: pathname.startsWith('/admin/notifications')
    },
    {
      name: 'Progreso',
      href: '/admin/progress',
      icon: TrendingUp,
      current: pathname.startsWith('/admin/progress')
    },
    {
      name: 'Reportes',
      href: '/admin/reports',
      icon: BarChart3,
      current: pathname.startsWith('/admin/reports')
    },
    {
      name: 'Auditoría',
      href: '/admin/audit',
      icon: Shield,
      current: pathname.startsWith('/admin/audit')
    },
    {
      name: 'Integración',
      href: '/admin/integration',
      icon: ExternalLink,
      current: pathname.startsWith('/admin/integration')
    },
    {
      name: 'Base de Datos',
      href: '/admin/database',
      icon: Database,
      current: pathname.startsWith('/admin/database')
    }
  ];

  const handleSignOut = async () => {
    await signOut();
  };

  return (
    <ProtectedRoute requiredRole="coordinador">
      <div className="min-h-screen bg-gray-50">
        {/* Sidebar móvil */}
        <div className={`fixed inset-0 z-50 lg:hidden ${sidebarOpen ? 'block' : 'hidden'}`}>
          <div className="fixed inset-0 bg-gray-600 bg-opacity-75" onClick={() => setSidebarOpen(false)}></div>
          <div className="fixed inset-y-0 left-0 flex w-64 flex-col bg-white shadow-xl">
            <div className="flex h-16 items-center justify-between px-4 border-b border-gray-200">
              <div className="flex items-center">
                <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                  <Shield className="w-5 h-5 text-white" />
                </div>
                <span className="ml-2 text-lg font-semibold text-gray-900">Admin Panel</span>
              </div>
              <button
                onClick={() => setSidebarOpen(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
            <nav className="flex-1 px-4 py-4 space-y-1">
              {navigation.map((item) => (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`group flex items-center px-2 py-2 text-sm font-medium rounded-lg transition-colors ${
                    item.current
                      ? 'bg-primary text-white'
                      : 'text-gray-700 hover:bg-gray-100 hover:text-gray-900'
                  }`}
                  onClick={() => setSidebarOpen(false)}
                >
                  <item.icon className="mr-3 h-5 w-5" />
                  {item.name}
                </Link>
              ))}
            </nav>
            <div className="border-t border-gray-200 p-4">
              <div className="flex items-center mb-3">
                <div className="w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center">
                  <Users className="w-4 h-4 text-gray-600" />
                </div>
                <div className="ml-3">
                  <p className="text-sm font-medium text-gray-900">{user?.user_metadata?.nombre}</p>
                  <p className="text-xs text-gray-500">Coordinador</p>
                </div>
              </div>
              <button
                onClick={handleSignOut}
                className="w-full flex items-center px-2 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <LogOut className="mr-3 h-4 w-4" />
                Cerrar Sesión
              </button>
            </div>
          </div>
        </div>

        {/* Sidebar desktop */}
        <div className="hidden lg:fixed lg:inset-y-0 lg:flex lg:w-64 lg:flex-col">
          <div className="flex flex-col flex-grow bg-white border-r border-gray-200 shadow-sm">
            <div className="flex h-16 items-center px-4 border-b border-gray-200">
              <div className="flex items-center">
                <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                  <Shield className="w-5 h-5 text-white" />
                </div>
                <span className="ml-2 text-lg font-semibold text-gray-900">Admin Panel</span>
              </div>
            </div>
            <nav className="flex-1 px-4 py-4 space-y-1">
              {navigation.map((item) => (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`group flex items-center px-2 py-2 text-sm font-medium rounded-lg transition-colors ${
                    item.current
                      ? 'bg-primary text-white shadow-sm'
                      : 'text-gray-700 hover:bg-gray-100 hover:text-gray-900'
                  }`}
                >
                  <item.icon className="mr-3 h-5 w-5" />
                  {item.name}
                </Link>
              ))}
            </nav>
            <div className="border-t border-gray-200 p-4">
              <div className="flex items-center mb-3">
                <div className="w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center">
                  <Users className="w-4 h-4 text-gray-600" />
                </div>
                <div className="ml-3">
                  <p className="text-sm font-medium text-gray-900">{user?.user_metadata?.nombre}</p>
                  <p className="text-xs text-gray-500">Coordinador</p>
                </div>
              </div>
              <button
                onClick={handleSignOut}
                className="w-full flex items-center px-2 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <LogOut className="mr-3 h-4 w-4" />
                Cerrar Sesión
              </button>
            </div>
          </div>
        </div>

        {/* Contenido principal */}
        <div className="lg:pl-64">
          {/* Header móvil */}
          <div className="sticky top-0 z-40 flex h-16 items-center gap-x-4 border-b border-gray-200 bg-white px-4 shadow-sm sm:gap-x-6 sm:px-6 lg:hidden">
            <button
              type="button"
              className="text-gray-700"
              onClick={() => setSidebarOpen(true)}
            >
              <Menu className="h-6 w-6" />
            </button>
            <div className="flex-1 text-sm font-semibold leading-6 text-gray-900">
              Panel de Administración
            </div>
          </div>

          {/* Contenido */}
          <main className="py-6">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
              {children}
            </div>
          </main>
        </div>
      </div>
    </ProtectedRoute>
  );
}
