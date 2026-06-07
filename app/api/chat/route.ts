import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import ChatMessage from '@/models/ChatMessage';

export async function GET(req: NextRequest) {
  await dbConnect();
  const { searchParams } = new URL(req.url);
  const roomId = searchParams.get('roomId') || 'arena-lobby';
  const limit = parseInt(searchParams.get('limit') || '50');

  try {
    const messages = await ChatMessage.find({ roomId })
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

  if (!roomId || !senderId || !message) {
    return NextResponse.json({ error: 'roomId, senderId, message required' }, { status: 400 });
  }

  try {
    const msg = await ChatMessage.create({
      roomId, senderId, senderName, senderAvatar, message, type: type || 'arena',
    });
    return NextResponse.json({ message: msg });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
