import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import ChatMessage from '@/models/ChatMessage';

export async function GET(req: NextRequest) {
  await dbConnect();
  const { searchParams } = new URL(req.url);
  const roomId = searchParams.get('roomId') || 'arena-lobby';
  const since = searchParams.get('since');
  const limit = Math.min(parseInt(searchParams.get('limit') || '50'), 100);

  try {
    // Only fetch messages stored within the last 1 day (24 hours = 86400s)
    const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
    // Actively delete any expired messages older than 24 hours
    ChatMessage.deleteMany({ timestamp: { $lt: oneDayAgo } }).catch(() => {});
    const query: any = { roomId };

    if (since) {
      const sinceDate = new Date(since);
      if (!isNaN(sinceDate.getTime())) {
        query.timestamp = { $gt: sinceDate };
      }
    } else {
      query.timestamp = { $gte: oneDayAgo };
    }

    const docs = await ChatMessage.find(query)
      .sort({ timestamp: since ? 1 : -1 })
      .limit(limit)
      .lean();

    const sortedDocs = since ? docs : docs.reverse();

    const messages = sortedDocs.map((m: any) => ({
      id: m._id ? m._id.toString() : (m.id || String(Date.now())),
      roomId: m.roomId,
      senderId: m.senderId,
      senderName: m.senderName,
      senderAvatar: m.senderAvatar || '',
      message: m.message,
      type: m.type || 'arena',
      timestamp: m.timestamp instanceof Date ? m.timestamp.toISOString() : (m.timestamp || new Date().toISOString()),
      isSystem: Boolean(m.isSystem),
    }));

    return NextResponse.json({ success: true, messages });
  } catch (err: any) {
    return NextResponse.json({ success: false, messages: [] });
  }
}

export async function POST(req: NextRequest) {
  await dbConnect();
  try {
    const body = await req.json();
    const { roomId, senderId, senderName, senderAvatar, message, text, type } = body;

    const rawMessage = message || text || '';
    const trimmedMessage = typeof rawMessage === 'string' ? rawMessage.trim() : '';

    if (!roomId || !senderId || !trimmedMessage) {
      return NextResponse.json({ error: 'roomId, senderId, and message are required' }, { status: 400 });
    }

    // Security: limit message length to 1000 characters
    const cleanMessage = trimmedMessage.slice(0, 1000);

    const doc = await ChatMessage.create({
      roomId: String(roomId).slice(0, 50),
      senderId: String(senderId).slice(0, 100),
      senderName: String(senderName || 'Student').slice(0, 60),
      senderAvatar: String(senderAvatar || ''),
      message: cleanMessage,
      type: type || 'arena',
      timestamp: new Date(),
    });

    const formattedMessage = {
      id: doc._id.toString(),
      roomId: doc.roomId,
      senderId: doc.senderId,
      senderName: doc.senderName,
      senderAvatar: doc.senderAvatar,
      message: doc.message,
      type: doc.type,
      timestamp: doc.timestamp.toISOString(),
      isSystem: false,
    };

    // Multicast to Socket.io if running on custom server
    const io = (global as any).io;
    if (io) {
      try {
        io.to(`chat-${roomId}`).emit('new-message', formattedMessage);
        // Only emit public chat notifications for public arena rooms, NEVER for personal DMs
        if (!roomId.startsWith('dm-')) {
          io.emit('chat-notification', {
            id: formattedMessage.id,
            roomId: formattedMessage.roomId,
            senderId: formattedMessage.senderId,
            senderName: formattedMessage.senderName,
            senderAvatar: formattedMessage.senderAvatar,
            message: formattedMessage.message.slice(0, 100),
            timestamp: formattedMessage.timestamp,
          });
        }
      } catch (e) {
        console.warn('[Chat] Socket multicast error:', e);
      }
    }

    return NextResponse.json({ success: true, message: formattedMessage });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
