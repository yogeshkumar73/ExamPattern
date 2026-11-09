import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import ChatMessage from '@/models/ChatMessage';

export async function GET(req: NextRequest) {
  await dbConnect();
  const { searchParams } = new URL(req.url);
  const roomId = searchParams.get('roomId') || 'arena-lobby';
  const limit = Math.min(parseInt(searchParams.get('limit') || '50'), 100);

  try {
    // Only fetch messages stored within the last 12 hours
    const twelveHoursAgo = new Date(Date.now() - 12 * 60 * 60 * 1000);
    const messages = await ChatMessage.find({
      roomId,
      timestamp: { $gte: twelveHoursAgo },
    })
      .sort({ timestamp: -1 })
      .limit(limit)
      .lean();
    return NextResponse.json({ messages: messages.reverse() });
  } catch (err: any) {
    return NextResponse.json({ messages: [] });
  }
}

export async function POST(req: NextRequest) {
  await dbConnect();
  const body = await req.json();
  const { roomId, senderId, senderName, senderAvatar, message, type } = body;

  const trimmedMessage = typeof message === 'string' ? message.trim() : '';

  if (!roomId || !senderId || !trimmedMessage) {
    return NextResponse.json({ error: 'roomId, senderId, and message are required' }, { status: 400 });
  }

  // Security: limit message length to 1000 characters
  const cleanMessage = trimmedMessage.slice(0, 1000);

  try {
    // Auto-prune messages older than 12 hours
    const twelveHoursAgo = new Date(Date.now() - 12 * 60 * 60 * 1000);
    ChatMessage.deleteMany({ timestamp: { $lt: twelveHoursAgo } }).catch(() => {});

    const msg = await ChatMessage.create({
      roomId: String(roomId).slice(0, 50),
      senderId: String(senderId).slice(0, 100),
      senderName: String(senderName || 'Student').slice(0, 60),
      senderAvatar: String(senderAvatar || ''),
      message: cleanMessage,
      type: type || 'arena',
      timestamp: new Date(),
    });
    return NextResponse.json({ message: msg });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
