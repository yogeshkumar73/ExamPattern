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
    // Rate limit: 3 registration attempts per minute
    const rl = checkRateLimit(`register:${ip}`, 3, 60 * 1000);
    if (!rl.allowed) {
      return NextResponse.json(
        { error: `Too many registration attempts. Please try again in ${rl.resetIn}s.` },
        { status: 429 }
      );
    }

    const { name, email, password, phone } = await req.json();

    if (!name || !email || !password) {
      return NextResponse.json(
        { error: 'Name, email, and password are required' },
        { status: 400 }
      );
    }

    await dbConnect();

    // Check if email already exists
    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      return NextResponse.json(
        { error: 'An account with this email already exists' },
        { status: 409 }
      );
    }

    // Hash the password
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);

    // Create new User
    const user = await User.create({
      name,
      email: email.toLowerCase(),
      password: passwordHash,
      phone: phone || '',
      role: 'student', // Default role
      status: 'Active',
      profileComplete: false,
    });

    // Create session (Auto-login after registration)
    const sessionId = await createSession(user._id.toString());

    // Create session cookie
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
        role: user.role,
      },
    });
  } catch (error: any) {
    console.error('Registration error:', error);
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    );
  }
}
