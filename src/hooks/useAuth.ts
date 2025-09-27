'use client';

import { useState, useEffect, createContext, useContext } from 'react';
import { authService, AuthUser } from '@/lib/services/auth.service';
import type { Session } from '@supabase/supabase-js';

interface AuthContextType {
  user: AuthUser | null;
  session: Session | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<any>;
  signUp: (email: string, password: string, userData: any) => Promise<any>;
  signOut: () => Promise<any>;
  updateProfile: (updates: any) => Promise<any>;
  resetPassword: (email: string) => Promise<any>;
  hasRole: (role: string) => boolean;
  canAccess: (resource: string) => boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

export function useAuthProvider() {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Obtener usuario actual al cargar
    const getCurrentUser = async () => {
      try {
        const currentUser = await authService.getCurrentUser();
        setUser(currentUser);
      } catch (error) {
        console.error('Error getting current user:', error);
      } finally {
        setLoading(false);
      }
    };

    getCurrentUser();

    // Escuchar cambios en el estado de autenticación
    const { data: { subscription } } = authService.onAuthStateChange((user, session) => {
      setUser(user);
      setSession(session);
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const signIn = async (email: string, password: string) => {
    setLoading(true);
    try {
      const result = await authService.signIn(email, password);
      if (result.success) {
        setUser(result.user);
        setSession(result.session);
      }
      return result;
    } finally {
      setLoading(false);
    }
  };

  const signUp = async (email: string, password: string, userData: any) => {
    setLoading(true);
    try {
      const result = await authService.signUp(email, password, userData);
      if (result.success) {
        setUser(result.user);
        setSession(result.session);
      }
      return result;
    } finally {
      setLoading(false);
    }
  };

  const signOut = async () => {
    setLoading(true);
    try {
      const result = await authService.signOut();
      if (result.success) {
        setUser(null);
        setSession(null);
      }
      return result;
    } finally {
      setLoading(false);
    }
  };

  const updateProfile = async (updates: any) => {
    if (!user) return { success: false, error: 'No user logged in' };
    
    const result = await authService.updateProfile(user.id, updates);
    if (result.success) {
      setUser(result.user);
    }
    return result;
  };

  const resetPassword = async (email: string) => {
    return await authService.resetPassword(email);
  };

  const hasRole = (role: string) => {
    return authService.hasRole(user, role);
  };

  const canAccess = (resource: string) => {
    return authService.canAccess(user, resource);
  };

  return {
    user,
    session,
    loading,
    signIn,
    signUp,
    signOut,
    updateProfile,
    resetPassword,
    hasRole,
    canAccess
  };
}

export { AuthContext };
