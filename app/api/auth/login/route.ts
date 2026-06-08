import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import bcrypt from 'bcryptjs';
import dbConnect from '@/lib/mongodb';
import User from '@/models/User';
import { createSession } from '@/lib/session';
import { checkRateLimit, getClientIp } from '@/lib/ratelimit';

export async function POST(req: NextRequest) {
  try {
    const ip = getClientIp(req);
    // Rate limit: 5 login attempts per minute
    const rl = checkRateLimit(`login:${ip}`, 5, 60 * 1000);
    if (!rl.allowed) {
      return NextResponse.json(
        { error: `Too many login attempts. Please try again in ${rl.resetIn}s.` },
        { status: 429 }
      );
    }

    const { email, password } = await req.json();

    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email and password are required' },
        { status: 400 }
      );
    }

    await dbConnect();

    // Find user by email
    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
      return NextResponse.json(
        { error: 'Invalid email or password' },
        { status: 401 }
      );
    }

    if (user.status === 'Inactive') {
      return NextResponse.json(
        { error: 'Your account has been deactivated. Please contact support.' },
        { status: 403 }
      );
    }

    // Compare passwords
    const isMatch = await bcrypt.compare(password, user.password || '');
    if (!isMatch) {
      return NextResponse.json(
        { error: 'Invalid email or password' },
        { status: 401 }
      );
    }

    // Regenerate session ID (Security best practice: prevents session fixation)
    const sessionId = await createSession(user._id.toString());

    // Create session cookie
    // Note: Do not specify maxAge or expires so it acts as a session cookie,
    // which the browser deletes automatically when the browser/tab is closed.
    const cookieStore = await cookies();
    cookieStore.set('aura_session', sessionId, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
    });

    return NextResponse.json({
      success: true,
      user: {
        id: user._id.toString(),
        name: user.name,
        email: user.email,
        role: user.role || 'student',
      },
    });
  } catch (error: any) {
    console.error('Login error:', error);
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    );
  }
}
