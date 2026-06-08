import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { validateSession } from '@/lib/session';

export async function GET(req: NextRequest) {
  try {
    const cookieStore = await cookies();
    const sessionCookie = cookieStore.get('aura_session');

    if (!sessionCookie || !sessionCookie.value) {
      return NextResponse.json(
        { authenticated: false, error: 'No active session found' },
        { status: 401 }
      );
    }

    const sessionData = await validateSession(sessionCookie.value);

    if (!sessionData) {
      // Session is expired or invalid. Clear cookie.
      cookieStore.delete('aura_session');
      return NextResponse.json(
        { authenticated: false, error: 'Session expired' },
        { status: 401 }
      );
    }

    return NextResponse.json({
      authenticated: true,
      user: {
        id: sessionData.userId,
        name: sessionData.name,
        email: sessionData.email,
        role: sessionData.role,
        lastActivity: sessionData.lastActivity,
        expiresAt: sessionData.expiresAt,
      },
    });
  } catch (error: any) {
    console.error('Session API error:', error);
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    );
  }
}

// POST endpoint to allow client-side activity tracker to "touch" or refresh session
export async function POST(req: NextRequest) {
  try {
    const cookieStore = await cookies();
    const sessionCookie = cookieStore.get('aura_session');

    if (!sessionCookie || !sessionCookie.value) {
      return NextResponse.json(
        { authenticated: false, error: 'No active session found' },
        { status: 401 }
      );
    }

    const sessionData = await validateSession(sessionCookie.value);

    if (!sessionData) {
      cookieStore.delete('aura_session');
      return NextResponse.json(
        { authenticated: false, error: 'Session expired' },
        { status: 401 }
      );
    }

    return NextResponse.json({
      authenticated: true,
      message: 'Session refreshed successfully',
      expiresAt: sessionData.expiresAt,
    });
  } catch (error: any) {
    console.error('Session touch API error:', error);
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    );
  }
}
