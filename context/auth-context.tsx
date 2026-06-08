"use client";

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';

export interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  expiresAt?: string;
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  loading: boolean;
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  register: (name: string, email: string, password: string, phone?: string) => Promise<{ success: boolean; error?: string }>;
  logout: (isExpired?: boolean) => Promise<void>;
  touchSession: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  // Validate session on mount
  const checkSession = useCallback(async () => {
    try {
      const response = await fetch('/api/auth/session', { cache: 'no-store' });
      if (response.ok) {
        const data = await response.json();
        if (data.authenticated && data.user) {
          setUser(data.user);
          // Sync with localStorage for legacy components that read it
          localStorage.setItem('aura_session', JSON.stringify({ user: data.user }));
        } else {
          setUser(null);
          localStorage.removeItem('aura_session');
        }
      } else {
        setUser(null);
        localStorage.removeItem('aura_session');
      }
    } catch (error) {
      console.error('Failed to verify session status:', error);
      setUser(null);
      localStorage.removeItem('aura_session');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    checkSession();
  }, [checkSession]);

  const login = async (email: string, password: string) => {
    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();
      if (response.ok && data.success) {
        setUser(data.user);
        localStorage.setItem('aura_session', JSON.stringify({ user: data.user }));
        return { success: true };
      } else {
        return { success: false, error: data.error || 'Login failed' };
      }
    } catch (error: any) {
      return { success: false, error: error.message || 'Network error' };
    }
  };

  const register = async (name: string, email: string, password: string, phone?: string) => {
    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password, phone }),
      });

      const data = await response.json();
      if (response.ok && data.success) {
        setUser(data.user);
        localStorage.setItem('aura_session', JSON.stringify({ user: data.user }));
        return { success: true };
      } else {
        return { success: false, error: data.error || 'Registration failed' };
      }
    } catch (error: any) {
      return { success: false, error: error.message || 'Network error' };
    }
  };

  const logout = useCallback(async (isExpired: boolean = false) => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
    } catch (error) {
      console.error('Failed to log out on server:', error);
    } finally {
      setUser(null);
      localStorage.removeItem('aura_session');
      if (isExpired) {
        router.push('/login?expired=1');
      } else {
        router.push('/login');
      }
    }
  }, [router]);

  const touchSession = useCallback(async () => {
    if (!user) return;
    try {
      const response = await fetch('/api/auth/session', { method: 'POST' });
      if (!response.ok) {
        // Session has expired on server
        await logout(true);
      }
    } catch (error) {
      console.error('Failed to refresh session:', error);
    }
  }, [user, logout]);

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        loading,
        login,
        register,
        logout,
        touchSession,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
