"use client";

import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/auth-context';
import { Brain } from 'lucide-react';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

export function ProtectedRoute({ children }: ProtectedRouteProps) {
  const { isAuthenticated, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    // If not loading and not authenticated, redirect to login page.
    // Next.js middleware also guards this on the edge, but this serves as a client-side fail-safe.
    if (!loading && !isAuthenticated) {
      router.push(`/login?callbackUrl=${encodeURIComponent(window.location.pathname + window.location.search)}`);
    }
  }, [isAuthenticated, loading, router]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[70vh] w-full bg-background/50 backdrop-blur-sm">
        <div className="relative p-6 bg-card/30 rounded-3xl border border-primary/10 shadow-2xl flex flex-col items-center max-w-sm text-center">
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-primary via-indigo-500 to-primary rounded-t-3xl animate-pulse" />
          <div className="p-4 bg-primary/10 rounded-2xl mb-4 text-primary animate-bounce">
            <Brain className="w-12 h-12" />
          </div>
          <h3 className="text-xl font-bold tracking-tight mb-2">Verifying Secure Session</h3>
          <p className="text-sm text-muted-foreground mb-4">Please wait while we establish a secure connection to your dashboard...</p>
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-primary border-t-transparent" />
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null; // Prevents flashing protected content before redirect completes
  }

  return <>{children}</>;
}
