"use client";

import React, { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '@/context/auth-context';
import { Brain, Lock, Mail, AlertTriangle, ArrowRight, UserCheck } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

export default function LoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { login, isAuthenticated, loading } = useAuth();
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const [redirectMsg, setRedirectMsg] = useState<string | null>(null);

  const callbackUrl = searchParams.get('callbackUrl') || '/dashboard';
  const isExpired = searchParams.get('expired') === '1';

  // Redirect if already authenticated
  useEffect(() => {
    if (!loading && isAuthenticated) {
      router.push(callbackUrl);
    }
  }, [isAuthenticated, loading, router, callbackUrl]);

  // Handle messages depending on how the user got here
  useEffect(() => {
    if (isExpired) {
      setRedirectMsg('Your session has expired. Please log in again.');
    } else if (callbackUrl && callbackUrl !== '/dashboard') {
      setRedirectMsg('Please login to access this feature.');
    }
  }, [isExpired, callbackUrl]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      setErrorMsg('Please enter both email and password.');
      return;
    }

    setErrorMsg(null);
    setIsLoggingIn(true);

    try {
      const result = await login(email, password);
      if (result.success) {
        // Redirection handled by useEffect, but push immediately just in case
        router.push(callbackUrl);
      } else {
        setErrorMsg(result.error || 'Invalid email or password.');
      }
    } catch (err) {
      setErrorMsg('An unexpected error occurred. Please try again.');
    } finally {
      setIsLoggingIn(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="animate-spin rounded-full h-8 w-8 border-4 border-primary border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="min-h-screen relative flex items-center justify-center px-4 overflow-hidden py-12">
      {/* Dynamic Background Gradients */}
      <div className="absolute top-1/4 left-1/4 w-[500px] h-[500px] bg-primary/10 rounded-full blur-[140px] -z-10" />
      <div className="absolute bottom-1/4 right-1/4 w-[500px] h-[500px] bg-indigo-500/10 rounded-full blur-[140px] -z-10" />

      <Card className="w-full max-w-md border-2 border-primary/10 shadow-2xl glass-morphism relative overflow-hidden backdrop-blur-md bg-card/50">
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-primary via-indigo-500 to-primary" />
        
        <CardHeader className="text-center pt-8 pb-4">
          <div className="flex justify-center mb-4">
            <div className="p-3 bg-primary/10 rounded-2xl text-primary animate-pulse">
              <Brain className="w-10 h-10" />
            </div>
          </div>
          <CardTitle className="text-3xl font-extrabold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-foreground via-primary to-indigo-500">
            Aura Study Auth
          </CardTitle>
          <CardDescription className="text-sm font-semibold text-muted-foreground mt-1">
            Access secure learning resources
          </CardDescription>
        </CardHeader>
        
        <CardContent className="space-y-4">
          {/* Actionable / Redirect messages */}
          {redirectMsg && (
            <div className="p-3.5 bg-yellow-500/10 border border-yellow-500/20 text-yellow-500 text-xs font-bold rounded-xl flex items-center gap-2.5 animate-in slide-in-from-top-2">
              <AlertTriangle className="w-4 h-4 flex-shrink-0" />
              <span>{redirectMsg}</span>
            </div>
          )}

          {/* Error alerts */}
          {errorMsg && (
            <div className="p-3.5 bg-destructive/10 border border-destructive/20 text-destructive text-xs font-bold rounded-xl flex items-center gap-2.5 animate-in shake">
              <AlertTriangle className="w-4 h-4 flex-shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email" className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Email Address</Label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-3.5 w-4 h-4 text-muted-foreground" />
                <Input
                  id="email"
                  type="email"
                  placeholder="student@aura.ai"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="pl-10 h-12 bg-muted/20 border-2 rounded-xl focus-visible:ring-primary focus-visible:border-primary font-medium"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="password" className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Password</Label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-3.5 w-4 h-4 text-muted-foreground" />
                <Input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="pl-10 h-12 bg-muted/20 border-2 rounded-xl focus-visible:ring-primary focus-visible:border-primary font-medium"
                  required
                />
              </div>
            </div>

            <Button
              type="submit"
              disabled={isLoggingIn}
              className="w-full h-12 rounded-xl font-bold bg-primary hover:bg-primary/95 text-base flex items-center justify-center gap-2 mt-4"
            >
              {isLoggingIn ? (
                <>Establishing Session...</>
              ) : (
                <>
                  Log In <ArrowRight className="w-4 h-4" />
                </>
              )}
            </Button>
          </form>
        </CardContent>

        <CardFooter className="flex flex-col gap-3 pb-8 pt-2">
          <div className="text-xs font-semibold text-muted-foreground text-center">
            New here?{' '}
            <Link
              href={`/register?callbackUrl=${encodeURIComponent(callbackUrl)}`}
              className="text-primary hover:underline font-bold"
            >
              Create an account
            </Link>
          </div>
        </CardFooter>
      </Card>
    </div>
  );
}
