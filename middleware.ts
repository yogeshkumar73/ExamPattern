import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export async function middleware(request: NextRequest) {
  const sessionCookie = request.cookies.get('aura_session');

  // If the cookie doesn't exist, redirect to login
  if (!sessionCookie || !sessionCookie.value) {
    const loginUrl = new URL('/login', request.url);
    loginUrl.searchParams.set('callbackUrl', request.nextUrl.pathname + request.nextUrl.search);
    return NextResponse.redirect(loginUrl);
  }

  try {
    const origin = request.nextUrl.origin;
    
    // Call our internal API to validate the session. 
    // We pass along the session cookie.
    const validateRes = await fetch(`${origin}/api/auth/session`, {
      headers: {
        Cookie: `aura_session=${sessionCookie.value}`,
      },
      // Avoid caching the auth check response
      cache: 'no-store',
    });

    if (validateRes.status !== 200) {
      // The session is invalid or expired in the database
      const loginUrl = new URL('/login', request.url);
      loginUrl.searchParams.set('callbackUrl', request.nextUrl.pathname + request.nextUrl.search);
      loginUrl.searchParams.set('expired', '1');
      
      const response = NextResponse.redirect(loginUrl);
      // Clear the cookie to prevent infinite redirect loops
      response.cookies.delete('aura_session');
      return response;
    }

    // Valid session, proceed
    return NextResponse.next();
  } catch (error) {
    console.error('Middleware session validation error:', error);
    
    // Fallback on transient connection errors:
    // Allow the request so the app remains available, 
    // or redirect to login. Redirecting to login is safer.
    const loginUrl = new URL('/login', request.url);
    loginUrl.searchParams.set('callbackUrl', request.nextUrl.pathname);
    return NextResponse.redirect(loginUrl);
  }
}

export const config = {
  matcher: [
    '/lab/:path*',
    '/arena/:path*',
    '/community/:path*',
    '/downloads/:path*',
    '/interview/:path*',
    '/dashboard/:path*',
    '/profile/:path*',
    '/admin/:path*',
  ],
};
