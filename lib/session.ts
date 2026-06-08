import crypto from 'crypto';
import dbConnect from './mongodb';
import Session from '@/models/Session';
import User from '@/models/User';

// Session timeout: 10 minutes (in milliseconds)
export const SESSION_TIMEOUT = 10 * 60 * 1000;

export interface SessionData {
  sessionId: string;
  userId: string;
  name: string;
  email: string;
  role: string;
  loginTime: Date;
  lastActivity: Date;
  expiresAt: Date;
}

/**
 * Generate a cryptographically secure random session ID
 */
export function generateSessionId(): string {
  return crypto.randomBytes(32).toString('hex');
}

/**
 * Create a new session in the database
 */
export async function createSession(userId: string): Promise<string> {
  await dbConnect();

  const sessionId = generateSessionId();
  const now = new Date();
  const expiresAt = new Date(now.getTime() + SESSION_TIMEOUT);

  await Session.create({
    sessionId,
    userId,
    loginTime: now,
    lastActivity: now,
    expiresAt,
  });

  return sessionId;
}

/**
 * Validate an existing session ID, extending its expiration if valid
 */
export async function validateSession(sessionId: string): Promise<SessionData | null> {
  if (!sessionId) return null;
  
  await dbConnect();

  const session = await Session.findOne({ sessionId });
  if (!session) return null;

  const now = new Date();

  // If the session has expired, clean it up and return null
  if (now > session.expiresAt) {
    await Session.deleteOne({ sessionId });
    return null;
  }

  // Fetch user information associated with this session
  const user = await User.findById(session.userId);
  if (!user || user.status === 'Inactive') {
    await Session.deleteOne({ sessionId });
    return null;
  }

  // Session is active. Reset the inactivity timeout.
  session.lastActivity = now;
  session.expiresAt = new Date(now.getTime() + SESSION_TIMEOUT);
  await session.save();

  return {
    sessionId: session.sessionId,
    userId: user._id.toString(),
    name: user.name,
    email: user.email,
    role: user.role || 'student',
    loginTime: session.loginTime,
    lastActivity: session.lastActivity,
    expiresAt: session.expiresAt,
  };
}

/**
 * Delete a session from the database
 */
export async function deleteSession(sessionId: string): Promise<void> {
  if (!sessionId) return;
  await dbConnect();
  await Session.deleteOne({ sessionId });
}
