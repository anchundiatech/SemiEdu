import { supabase } from '@/lib/supabase';
import { dataService } from './data.service';
import type { User, Session } from '@supabase/supabase-js';

export interface AuthUser {
  id: string;
  email: string;
  nombre: string;
  rol: 'estudiante' | 'docente' | 'coordinador';
  avatar_url?: string;
}

export interface AuthResult {
  user: AuthUser | null;
  session: Session | null;
  error: string | null;
  success: boolean;
}

export class AuthService {
  private static instance: AuthService;

  private constructor() {}

  public static getInstance(): AuthService {
    if (!AuthService.instance) {
      AuthService.instance = new AuthService();
    }
    return AuthService.instance;
  }

  async signUp(email: string, password: string, userData: {
    nombre: string;
    rol: 'estudiante' | 'docente' | 'coordinador';
  }): Promise<AuthResult> {
    try {
      // 1. Crear usuario en Supabase Auth
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            nombre: userData.nombre,
            rol: userData.rol
          }
        }
      });

      if (authError) {
        return {
          user: null,
          session: null,
          error: authError.message,
          success: false
        };
      }

      // 2. Crear perfil de usuario en la base de datos
      if (authData.user) {
        const userProfile = await dataService.usuarios.createUsuario({
          id: authData.user.id,
          email: authData.user.email!,
          nombre: userData.nombre,
          rol: userData.rol
        });

        if (!userProfile.success) {
          // Si falla la creación del perfil, eliminar el usuario de Auth
          await supabase.auth.admin.deleteUser(authData.user.id);
          return {
            user: null,
            session: null,
            error: userProfile.error,
            success: false
          };
        }

        return {
          user: userProfile.data as AuthUser,
          session: authData.session,
          error: null,
          success: true
        };
      }

      return {
        user: null,
        session: null,
        error: 'Error al crear usuario',
        success: false
      };
    } catch (error) {
      return {
        user: null,
        session: null,
        error: 'Error interno del servidor',
        success: false
      };
    }
  }

  async signIn(email: string, password: string): Promise<AuthResult> {
    try {
      const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
        email,
        password
      });

      if (authError) {
        return {
          user: null,
          session: null,
          error: authError.message,
          success: false
        };
      }

      if (authData.user) {
        // Obtener perfil completo del usuario
        const userProfile = await dataService.usuarios.findById(authData.user.id);
        
        if (!userProfile) {
          return {
            user: null,
            session: null,
            error: 'Perfil de usuario no encontrado',
            success: false
          };
        }

        return {
          user: userProfile as AuthUser,
          session: authData.session,
          error: null,
          success: true
        };
      }

      return {
        user: null,
        session: null,
        error: 'Error al iniciar sesión',
        success: false
      };
    } catch (error) {
      return {
        user: null,
        session: null,
        error: 'Error interno del servidor',
        success: false
      };
    }
  }

  async signOut(): Promise<{ success: boolean; error: string | null }> {
    try {
      const { error } = await supabase.auth.signOut();
      
      if (error) {
        return {
          success: false,
          error: error.message
        };
      }

      return {
        success: true,
        error: null
      };
    } catch (error) {
      return {
        success: false,
        error: 'Error interno del servidor'
      };
    }
  }

  async getCurrentUser(): Promise<AuthUser | null> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        return null;
      }

      const userProfile = await dataService.usuarios.findById(user.id);
      return userProfile as AuthUser;
    } catch (error) {
      console.error('Error getting current user:', error);
      return null;
    }
  }

  async updateProfile(userId: string, updates: {
    nombre?: string;
    avatar_url?: string;
  }): Promise<AuthResult> {
    try {
      const result = await dataService.usuarios.updateUsuario(userId, updates);
      
      if (!result.success) {
        return {
          user: null,
          session: null,
          error: result.error,
          success: false
        };
      }

      return {
        user: result.data as AuthUser,
        session: null,
        error: null,
        success: true
      };
    } catch (error) {
      return {
        user: null,
        session: null,
        error: 'Error interno del servidor',
        success: false
      };
    }
  }

  async resetPassword(email: string): Promise<{ success: boolean; error: string | null }> {
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/auth/reset-password`
      });

      if (error) {
        return {
          success: false,
          error: error.message
        };
      }

      return {
        success: true,
        error: null
      };
    } catch (error) {
      return {
        success: false,
        error: 'Error interno del servidor'
      };
    }
  }

  async updatePassword(newPassword: string): Promise<{ success: boolean; error: string | null }> {
    try {
      const { error } = await supabase.auth.updateUser({
        password: newPassword
      });

      if (error) {
        return {
          success: false,
          error: error.message
        };
      }

      return {
        success: true,
        error: null
      };
    } catch (error) {
      return {
        success: false,
        error: 'Error interno del servidor'
      };
    }
  }

  // Listener para cambios en el estado de autenticación
  onAuthStateChange(callback: (user: AuthUser | null, session: Session | null) => void) {
    return supabase.auth.onAuthStateChange(async (event, session) => {
      if (session?.user) {
        const userProfile = await dataService.usuarios.findById(session.user.id);
        callback(userProfile as AuthUser, session);
      } else {
        callback(null, null);
      }
    });
  }

  // Verificar si el usuario tiene un rol específico
  hasRole(user: AuthUser | null, role: string): boolean {
    return user?.rol === role;
  }

  // Verificar si el usuario puede acceder a un recurso
  canAccess(user: AuthUser | null, resource: string): boolean {
    if (!user) return false;

    const permissions = {
      estudiante: ['dashboard', 'notifications', 'tasks', 'profile'],
      docente: ['dashboard', 'notifications', 'tasks', 'classes', 'students', 'reports', 'profile'],
      coordinador: ['dashboard', 'notifications', 'tasks', 'classes', 'students', 'reports', 'admin', 'profile']
    };

    return permissions[user.rol]?.includes(resource) || false;
  }
}

// Exportar instancia singleton
export const authService = AuthService.getInstance();
