"use client";

import { useEffect, useRef, useCallback } from 'react';
import { useAuth } from '@/context/auth-context';

// Inactivity timeout: 10 minutes (600,000ms)
const INACTIVITY_TIMEOUT = 10 * 60 * 1000;
// Throttle session refresh calls to the backend: 30 seconds (30,000ms)
const TOUCH_THROTTLE = 30 * 1000;

export function InactivityTracker() {
  const { user, logout, touchSession } = useAuth();
  const idleTimerRef = useRef<NodeJS.Timeout | null>(null);
  const lastTouchRef = useRef<number>(0);

  const resetIdleTimer = useCallback(() => {
    if (idleTimerRef.current) {
      clearTimeout(idleTimerRef.current);
    }

    // Client-side auto-logout after INACTIVITY_TIMEOUT
    idleTimerRef.current = setTimeout(() => {
      console.warn("Client side inactivity limit reached. Logging out...");
      logout(true);
    }, INACTIVITY_TIMEOUT);

    // Refresh session on the server-side, but throttle requests
    const now = Date.now();
    if (user && now - lastTouchRef.current > TOUCH_THROTTLE) {
      lastTouchRef.current = now;
      touchSession();
    }
  }, [user, logout, touchSession]);

  useEffect(() => {
    if (!user) {
      if (idleTimerRef.current) {
        clearTimeout(idleTimerRef.current);
      }
      return;
    }

    // Set initial timer
    resetIdleTimer();

    // Listen to user interactions
    const events = ['mousemove', 'keydown', 'scroll', 'click', 'mousedown', 'touchstart'];
    
    const activityHandler = () => {
      resetIdleTimer();
    };

    events.forEach(event => {
      window.addEventListener(event, activityHandler, { passive: true });
    });

    // Cleanup listeners and timers
    return () => {
      events.forEach(event => {
        window.removeEventListener(event, activityHandler);
      });
      if (idleTimerRef.current) {
        clearTimeout(idleTimerRef.current);
      }
    };
  }, [user, resetIdleTimer]);

  return null; // This is a headless utility component
}
