import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import UnicastMessage from '@/models/UnicastMessage';

// In-memory fallback store when MongoDB is offline
const memoryUnicastMessages: any[] = [];

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get('userId');
    const friendId = searchParams.get('friendId');

    if (!userId || !friendId) {
      return NextResponse.json({ error: 'userId and friendId are required' }, { status: 400 });
    }

    const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);

    try {
      await dbConnect();

      // Actively purge any messages older than 24 hours (1 day)
      UnicastMessage.deleteMany({ createdAt: { $lt: oneDayAgo } }).catch(() => {});

      // Query only private unicast messages between these two specific users
      const docs = await UnicastMessage.find({
        $or: [
          { senderId: userId, recipientId: friendId },
          { senderId: friendId, recipientId: userId },
        ],
        createdAt: { $gte: oneDayAgo },
      })
        .sort({ createdAt: 1 })
        .limit(100)
        .lean();

      const messages = docs.map((m: any) => ({
        id: m._id ? m._id.toString() : String(m.id || Date.now()),
        senderId: m.senderId,
        recipientId: m.recipientId,
        senderName: m.senderName,
        senderAvatar: m.senderAvatar || '',
        recipientName: m.recipientName,
        message: m.message,
        isRead: Boolean(m.isRead),
        timestamp: m.createdAt instanceof Date ? m.createdAt.toISOString() : (m.createdAt || new Date().toISOString()),
      }));

      return NextResponse.json({ success: true, messages });
    } catch (dbErr) {
      console.warn("MongoDB unavailable for unicast chat, using in-memory store:", dbErr);

      const filtered = memoryUnicastMessages.filter((m: any) => {
        const isPair = (m.senderId === userId && m.recipientId === friendId) ||
                       (m.senderId === friendId && m.recipientId === userId);
        const isNotExpired = new Date(m.timestamp).getTime() >= oneDayAgo.getTime();
        return isPair && isNotExpired;
      });

      return NextResponse.json({ success: true, messages: filtered });
    }
  } catch (err: any) {
    console.error("GET /api/arena/unicast-chat error:", err);
    return NextResponse.json({ success: false, messages: [], error: err.message }, { status: 200 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { senderId, recipientId, senderName, senderAvatar, recipientName, message } = body;

    const trimmed = typeof message === 'string' ? message.trim() : '';

    if (!senderId || !recipientId || !trimmed) {
      return NextResponse.json({ error: 'senderId, recipientId, and message are required' }, { status: 400 });
    }

    // Sanitize message: strip null bytes and script injection tags
    const cleanMessage = trimmed
      .replace(/\0/g, '')
      .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
      .replace(/javascript:/gi, '')
      .slice(0, 1000);
    const now = new Date();

    try {
      await dbConnect();

      const doc = await UnicastMessage.create({
        senderId: String(senderId),
        recipientId: String(recipientId),
        senderName: String(senderName || 'Student').slice(0, 60),
        senderAvatar: String(senderAvatar || ''),
        recipientName: String(recipientName || 'Friend').slice(0, 60),
        message: cleanMessage,
        createdAt: now,
      });

      const formatted = {
        id: doc._id.toString(),
        senderId: doc.senderId,
        recipientId: doc.recipientId,
        senderName: doc.senderName,
        senderAvatar: doc.senderAvatar,
        recipientName: doc.recipientName,
        message: doc.message,
        isRead: false,
        timestamp: doc.createdAt.toISOString(),
      };

      // Unicast Delivery via Socket.io (strictly targeted to the recipient and sender rooms)
      const io = (global as any).io;
      if (io) {
        try {
          io.to(`unicast-${recipientId}`).emit('unicast-message', formatted);
          io.to(`unicast-${senderId}`).emit('unicast-message', formatted);
        } catch (_) {}
      }

      return NextResponse.json({ success: true, message: formatted });
    } catch (dbErr) {
      console.warn("MongoDB unavailable for unicast POST, saving in-memory:", dbErr);

      const formatted = {
        id: `unicast-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
        senderId: String(senderId),
        recipientId: String(recipientId),
        senderName: String(senderName || 'Student'),
        senderAvatar: String(senderAvatar || ''),
        recipientName: String(recipientName || 'Friend'),
        message: cleanMessage,
        isRead: false,
        timestamp: now.toISOString(),
      };
      memoryUnicastMessages.push(formatted);

      return NextResponse.json({ success: true, message: formatted });
    }
  } catch (err: any) {
    console.error("POST /api/arena/unicast-chat error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get('userId');
    const friendId = searchParams.get('friendId');

    if (!userId || !friendId) {
      return NextResponse.json({ error: 'userId and friendId required' }, { status: 400 });
    }

    try {
      await dbConnect();
      await UnicastMessage.deleteMany({
        $or: [
          { senderId: userId, recipientId: friendId },
          { senderId: friendId, recipientId: userId },
        ],
      });
    } catch {
      const idxs: number[] = [];
      memoryUnicastMessages.forEach((m, idx) => {
        if ((m.senderId === userId && m.recipientId === friendId) ||
            (m.senderId === friendId && m.recipientId === userId)) {
          idxs.push(idx);
        }
      });
      idxs.reverse().forEach(i => memoryUnicastMessages.splice(i, 1));
    }

    return NextResponse.json({ success: true, message: 'Unicast chat cleared' });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
