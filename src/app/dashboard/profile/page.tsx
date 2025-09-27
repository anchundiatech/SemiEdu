'use client';

import React, { useState, useEffect } from 'react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import { useSession, signOut } from 'next-auth/react';
import {
  User,
  Mail,
  Shield,
  Edit3,
  Save,
  X,
  AlertCircle,
  CheckCircle,
  Camera,
  Lock,
  LogOut
} from 'lucide-react';

export default function ProfilePage() {
  const { data: session } = useSession();

  const handleSignOut = () => {
    signOut({ callbackUrl: '/login' });
  };
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const [formData, setFormData] = useState({
    nombre: '',
    email: ''
  });

  useEffect(() => {
    if (session?.user) {
      setFormData({
        nombre: session?.user?.name || '',
        email: session?.user?.email || ''
      });
    }
  }, [session]);

  const handleSave = async () => {
    setError('');
    setSuccess('');
    setLoading(true);

    try {
      // TODO: Implementar actualización de perfil con NextAuth
      console.log('Actualizando perfil:', formData);
      setSuccess('Perfil actualizado exitosamente');
      setIsEditing(false);
    } catch (err) {
      setError('Error interno del servidor');
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    if (session?.user) {
      setFormData({
        nombre: session?.user?.name || '',
        email: session?.user?.email || ''
      });
    }
    setIsEditing(false);
    setError('');
    setSuccess('');
  };

  const getRoleDisplayName = (role: string) => {
    switch (role) {
      case 'estudiante':
        return 'Estudiante';
      case 'docente':
        return 'Docente';
      case 'coordinador':
        return 'Coordinador';
      default:
        return 'Usuario';
    }
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'estudiante':
        return 'bg-blue-100 text-blue-800';
      case 'docente':
        return 'bg-green-100 text-green-800';
      case 'coordinador':
        return 'bg-purple-100 text-purple-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (!session?.user) {
    return (
      <div className="flex items-center justify-center h-64">
        <LoadingSpinner size="lg" text="Cargando perfil..." />
      </div>
    );
  }

  return (
    <ProtectedRoute>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Mi Perfil</h1>
          <p className="text-gray-600 mt-1">Gestiona tu información personal y configuración de cuenta</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Información Personal */}
          <div className="lg:col-span-2">
            <Card className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg font-semibold text-gray-900">Información Personal</h2>
                {!isEditing && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setIsEditing(true)}
                  >
                    <Edit3 className="w-4 h-4 mr-2" />
                    Editar
                  </Button>
                )}
              </div>

              {success && (
                <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-lg flex items-center">
                  <CheckCircle className="w-4 h-4 text-green-600 mr-2" />
                  <span className="text-green-800 text-sm">{success}</span>
                </div>
              )}

              {error && (
                <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg flex items-center">
                  <AlertCircle className="w-4 h-4 text-red-600 mr-2" />
                  <span className="text-red-800 text-sm">{error}</span>
                </div>
              )}

              {/* Avatar */}
              <div className="flex items-center mb-6">
                <div className="w-20 h-20 bg-primary rounded-full flex items-center justify-center text-white text-2xl font-bold">
                  {session?.user?.name ? session.user.name.charAt(0).toUpperCase() : session?.user?.email?.charAt(0).toUpperCase()}
                </div>
                <div className="ml-4">
                  <h3 className="text-lg font-medium text-gray-900">
                    {session?.user?.name || 'Usuario'}
                  </h3>
                  <p className="text-gray-600">{session?.user?.email}</p>
                  <div className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium mt-1 ${getRoleColor(session?.user?.role || 'usuario')}`}>
                    <Shield className="w-3 h-3 mr-1" />
                    {getRoleDisplayName(session?.user?.role || 'usuario')}
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                {/* Nombre completo */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Nombre completo
                  </label>
                  {isEditing ? (
                    <div className="relative">
                      <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                      <input
                        type="text"
                        value={formData.nombre}
                        onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
                        className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary"
                        placeholder="Tu nombre completo"
                      />
                    </div>
                  ) : (
                    <div className="flex items-center p-3 bg-gray-50 rounded-lg">
                      <User className="w-5 h-5 text-gray-400 mr-3" />
                      <span className="text-gray-900">{session?.user?.name || 'No especificado'}</span>
                    </div>
                  )}
                </div>

                {/* Correo electrónico */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Correo electrónico
                  </label>
                  <div className="flex items-center p-3 bg-gray-50 rounded-lg">
                    <Mail className="w-5 h-5 text-gray-400 mr-3" />
                    <span className="text-gray-900">{session?.user?.email}</span>
                    <span className="ml-auto text-xs text-gray-500">No editable</span>
                  </div>
                </div>

                {/* Tipo de usuario */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Tipo de usuario
                  </label>
                  <div className="flex items-center p-3 bg-gray-50 rounded-lg">
                    <Shield className="w-5 h-5 text-gray-400 mr-3" />
                    <span className="text-gray-900">{getRoleDisplayName(session?.user?.role || 'usuario')}</span>
                    <span className="ml-auto text-xs text-gray-500">Asignado por administrador</span>
                  </div>
                </div>

                {/* Miembro desde */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Miembro desde
                  </label>
                  <div className="flex items-center p-3 bg-gray-50 rounded-lg">
                    <span className="text-gray-900">
                      {new Date().toLocaleDateString('es-ES', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                      })}
                    </span>
                  </div>
                </div>
              </div>

              {/* Botones de acción */}
              {isEditing && (
                <div className="flex space-x-3 mt-6 pt-6 border-t border-gray-200">
                  <Button
                    variant="primary"
                    onClick={handleSave}
                    disabled={loading}
                  >
                    {loading ? (
                      <LoadingSpinner size="sm" text="Guardando..." />
                    ) : (
                      <>
                        <Save className="w-4 h-4 mr-2" />
                        Guardar cambios
                      </>
                    )}
                  </Button>
                  <Button
                    variant="outline"
                    onClick={handleCancel}
                    disabled={loading}
                  >
                    <X className="w-4 h-4 mr-2" />
                    Cancelar
                  </Button>
                </div>
              )}
            </Card>
          </div>

          {/* Sidebar de seguridad */}
          <div className="space-y-6">
            {/* Seguridad */}
            <Card className="p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Seguridad</h3>

              <Button
                variant="outline"
                className="w-full mb-4"
                onClick={() => {
                  // Aquí podrías implementar cambio de contraseña
                  alert('Funcionalidad de cambio de contraseña próximamente');
                }}
              >
                <Lock className="w-4 h-4 mr-2" />
                Cambiar contraseña
              </Button>

              <Button
                variant="outline"
                className="w-full text-red-600 border-red-200 hover:bg-red-50"
                onClick={handleSignOut}
              >
                <LogOut className="w-4 h-4 mr-2" />
                Cerrar sesión
              </Button>
            </Card>

            {/* Estadísticas */}
            <Card className="p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Estadísticas</h3>

              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Último acceso</span>
                  <span className="text-sm font-medium text-gray-900">
                    {new Date().toLocaleDateString('es-ES')}
                  </span>
                </div>

                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Estado</span>
                  <span className="text-sm font-medium text-green-600">Activo</span>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
}
