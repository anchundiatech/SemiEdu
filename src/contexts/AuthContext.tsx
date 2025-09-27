'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

// Tipos simplificados para nuestro sistema de autenticación
interface CustomUser {
  id: string;
  email: string;
  user_metadata?: {
    nombre?: string;
    rol?: string;
    google_id?: string;
    google_classroom?: any;
  };
}

interface AuthContextType {
  user: CustomUser | null;
  loading: boolean;
  signOut: () => Promise<void>;
  setUserFromCallback: (userData: any) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: React.ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<CustomUser | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  // Función para establecer usuario desde callback
  const setUserFromCallback = (userData: any) => {
    console.log('🔄 AuthContext - Estableciendo usuario desde callback:', userData);
    
    const customUser: CustomUser = {
      id: userData.userId,
      email: userData.email,
      user_metadata: {
        nombre: userData.nombre,
        rol: userData.rol,
        google_id: userData.google_id,
        google_classroom: {
          connected: userData.classroom_connected || false
        }
      }
    };

    setUser(customUser);
    
    // Guardar en localStorage para persistencia
    if (typeof window !== 'undefined') {
      localStorage.setItem('semiedu_user', JSON.stringify(customUser));
    }
    
    console.log('✅ AuthContext - Usuario establecido:', customUser);
  };

  // Función para cerrar sesión
  const signOut = async (): Promise<void> => {
    try {
      console.log('🔄 AuthContext - Cerrando sesión...');
      
      setUser(null);
      
      // Limpiar localStorage
      if (typeof window !== 'undefined') {
        localStorage.removeItem('semiedu_user');
      }
      
      // Redirigir a login
      router.push('/auth/login');
      
      console.log('✅ AuthContext - Sesión cerrada');
    } catch (error) {
      console.error('❌ Error cerrando sesión:', error);
    }
  };

  useEffect(() => {
    // Verificar si hay datos de usuario en localStorage
    const checkStoredUser = () => {
      try {
        if (typeof window !== 'undefined') {
          const storedUser = localStorage.getItem('semiedu_user');
          if (storedUser) {
            const userData = JSON.parse(storedUser);
            setUser(userData);
            console.log('✅ AuthContext - Usuario cargado desde localStorage:', userData);
          }
        }
      } catch (error) {
        console.error('❌ Error cargando usuario desde localStorage:', error);
        if (typeof window !== 'undefined') {
          localStorage.removeItem('semiedu_user');
        }
      } finally {
        setLoading(false);
      }
    };

    checkStoredUser();
  }, []);

  const value: AuthContextType = {
    user,
    loading,
    signOut,
    setUserFromCallback
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextType {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth debe ser usado dentro de un AuthProvider');
  }
  return context;
}