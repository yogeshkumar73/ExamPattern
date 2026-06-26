// server.js — Custom Next.js server with Socket.IO for real-time Battle Arena
const { createServer } = require('http');
const { parse } = require('url');
const next = require('next');
const { Server } = require('socket.io');

const dev = process.env.NODE_ENV !== 'production';
const hostname = 'localhost';
const port = process.env.PORT || 3000;

const app = next({ dev, hostname, port, dir: __dirname });
const handle = app.getRequestHandler();

// In-memory battle rooms and matchmaking queues
const matchmakingQueues = {}; // { mode_difficulty: [{ socketId, userId, name, avatar }] }
const battleRooms = {};       // { roomId: { players, scores, status, questions, currentQ } }
const voiceRooms = {};        // { roomId: [socketId] }
const chatRooms = {};         // { roomId: [{ socketId, userId, name }] }

app.prepare().then(() => {
  const httpServer = createServer((req, res) => {
    const parsedUrl = parse(req.url, true);
    handle(req, res, parsedUrl);
  });

  const io = new Server(httpServer, {
    cors: { origin: '*', methods: ['GET', 'POST'] },
    path: '/socket.io',
  });

  // Expose io globally for API routes
  global.io = io;

  io.on('connection', (socket) => {
    console.log(`[Arena] Client connected: ${socket.id}`);

    // ---- JOIN ARENA LOBBY ----
    socket.on('join-lobby', ({ userId, name, avatar }) => {
      socket.data.userId = userId;
      socket.data.name = name;
      socket.data.avatar = avatar;
      socket.join('arena-lobby');
      
      const onlineCount = io.sockets.adapter.rooms.get('arena-lobby')?.size || 0;
      io.to('arena-lobby').emit('lobby-update', { onlineCount });
      console.log(`[Lobby] ${name} joined. Online: ${onlineCount}`);
    });

    // ---- MATCHMAKING ----
    socket.on('find-match', ({ userId, name, avatar, mode, difficulty, battleType }) => {
      const queueKey = `${mode}_${difficulty}`;
      if (!matchmakingQueues[queueKey]) matchmakingQueues[queueKey] = [];
      
      // Remove if already in queue
      matchmakingQueues[queueKey] = matchmakingQueues[queueKey].filter(p => p.userId !== userId);
      
      const player = { socketId: socket.id, userId, name, avatar, mode, difficulty };
      matchmakingQueues[queueKey].push(player);
      socket.emit('matchmaking-status', { status: 'searching', queueSize: matchmakingQueues[queueKey].length });
      
      // Try to match
      if (matchmakingQueues[queueKey].length >= 2) {
        const p1 = matchmakingQueues[queueKey].shift();
        const p2 = matchmakingQueues[queueKey].shift();
        const roomId = `battle-${Date.now()}-${Math.random().toString(36).substr(2,6)}`;
        
        battleRooms[roomId] = {
          players: [p1, p2],
          scores: { [p1.userId]: 0, [p2.userId]: 0 },
          correct: { [p1.userId]: 0, [p2.userId]: 0 },
          status: 'active',
          mode,
          difficulty,
          startTime: Date.now(),
          currentQuestion: 0,
          answers: {},
        };

        // Notify both players
        [p1, p2].forEach((p, i) => {
          const opponent = i === 0 ? p2 : p1;
          io.to(p.socketId).emit('match-found', {
            roomId,
            opponent: { userId: opponent.userId, name: opponent.name, avatar: opponent.avatar },
            mode,
            difficulty,
          });
          const s = io.sockets.sockets.get(p.socketId);
          if (s) s.join(roomId);
        });

        console.log(`[Battle] Room ${roomId} created: ${p1.name} vs ${p2.name}`);
      }
    });

    // ---- CANCEL MATCHMAKING ----
    socket.on('cancel-matchmaking', ({ userId }) => {
      Object.keys(matchmakingQueues).forEach(key => {
        matchmakingQueues[key] = matchmakingQueues[key].filter(p => p.userId !== userId);
      });
    });

    // ---- PVE BATTLE (vs AI — instant start) ----
    socket.on('start-pve', ({ userId, name, avatar, mode, difficulty }) => {
      const roomId = `pve-${Date.now()}-${socket.id.substr(0,6)}`;
      battleRooms[roomId] = {
        players: [{ socketId: socket.id, userId, name, avatar }],
        scores: { [userId]: 0, AI_BOT: 0 },
        correct: { [userId]: 0, AI_BOT: 0 },
        status: 'active',
        mode,
        difficulty,
        startTime: Date.now(),
        isPvE: true,
      };
      socket.join(roomId);
      socket.emit('pve-started', {
        roomId,
        opponent: { userId: 'AI_BOT', name: 'AI Overlord', avatar: '' },
        mode,
        difficulty,
      });
    });

    // ---- SUBMIT ANSWER ----
    socket.on('submit-answer', ({ roomId, userId, isCorrect, score, accuracy, questionIndex }) => {
      const room = battleRooms[roomId];
      if (!room) return;

      room.scores[userId] = (room.scores[userId] || 0) + (isCorrect ? score : 0);
      if (isCorrect) room.correct[userId] = (room.correct[userId] || 0) + 1;
      
      // Broadcast updated scores to room
      io.to(roomId).emit('score-update', {
        userId,
        score: room.scores[userId],
        correct: room.correct[userId],
        accuracy,
        questionIndex,
      });
    });

    // ---- BATTLE FINISHED ----
    socket.on('battle-complete', ({ roomId, userId, finalScore, accuracy, timeTaken }) => {
      const room = battleRooms[roomId];
      if (!room) return;
      
      if (!room.results) room.results = {};
      room.results[userId] = { finalScore, accuracy, timeTaken, finishedAt: Date.now() };
      
      const allDone = room.players.every(p => room.results[p.userId]);
      if (allDone || room.isPvE) {
        // Determine winner
        let winnerId = null;
        let maxScore = -1;
        Object.entries(room.scores).forEach(([uid, sc]) => {
          if (uid !== 'AI_BOT' && sc > maxScore) {
            maxScore = sc;
            winnerId = uid;
          }
        });
        
        io.to(roomId).emit('battle-ended', {
          winnerId,
          scores: room.scores,
          results: room.results,
        });
        
        // Cleanup after 30s
        setTimeout(() => { delete battleRooms[roomId]; }, 30000);
      }
    });

    // ---- ARENA CHAT ----
    socket.on('join-chat-room', ({ roomId, userId, name }) => {
      socket.join(`chat-${roomId}`);
      if (!chatRooms[roomId]) chatRooms[roomId] = [];
      chatRooms[roomId] = chatRooms[roomId].filter(u => u.userId !== userId);
      chatRooms[roomId].push({ socketId: socket.id, userId, name });
    });

    socket.on('send-message', ({ roomId, userId, name, avatar, message, type }) => {
      const msg = {
        id: Date.now().toString(),
        senderId: userId,
        senderName: name,
        senderAvatar: avatar,
        message,
        type,
        roomId,
        timestamp: new Date().toISOString(),
      };
      io.to(`chat-${roomId}`).emit('new-message', msg);
    });

    socket.on('leave-chat-room', ({ roomId, userId }) => {
      socket.leave(`chat-${roomId}`);
      if (chatRooms[roomId]) {
        chatRooms[roomId] = chatRooms[roomId].filter(u => u.userId !== userId);
      }
    });

    // ---- VOICE ROOM (WebRTC Signaling) ----
    socket.on('join-voice-room', ({ roomId, userId }) => {
      socket.join(`voice-${roomId}`);
      if (!voiceRooms[roomId]) voiceRooms[roomId] = {};
      voiceRooms[roomId][socket.id] = userId;

      // Notify others in the room about the new user
      socket.to(`voice-${roomId}`).emit('user-joined', socket.id);
      console.log(`[Voice] User ${userId} (${socket.id}) joined room ${roomId}`);

      // For existing users in the room, send offers to the new user
      Object.keys(voiceRooms[roomId]).forEach(otherSocketId => {
        if (otherSocketId !== socket.id) {
          const otherSocket = io.sockets.sockets.get(otherSocketId);
          if (otherSocket) {
            otherSocket.emit('create-offer', socket.id); // Ask existing peer to create offer for new user
          }
        }
      });
    });

    socket.on('offer', ({ targetId, offer }) => {
      io.to(targetId).emit('offer', socket.id, offer);
    });

    socket.on('answer', ({ targetId, answer }) => {
      io.to(targetId).emit('answer', socket.id, answer);
    });

    socket.on('candidate', ({ targetId, candidate }) => {
      io.to(targetId).emit('candidate', socket.id, candidate);
    });

    socket.on('leave-voice-room', ({ roomId, userId }) => {
      socket.leave(`voice-${roomId}`);
      if (voiceRooms[roomId]) {
        delete voiceRooms[roomId][socket.id];
        if (Object.keys(voiceRooms[roomId]).length === 0) {
          delete voiceRooms[roomId];
        }
      }
      // Notify others in the room about the user leaving
      socket.to(`voice-${roomId}`).emit('user-left', socket.id);
      console.log(`[Voice] User ${userId} (${socket.id}) left room ${roomId}`);
    });

    // ---- DISCONNECT ----
    socket.on('disconnect', () => {
      const userId = socket.data.userId;
      console.log(`[Arena] Client disconnected: ${socket.id} (${socket.data.name || 'unknown'})`);
      
      // Clean up matchmaking queues
      Object.keys(matchmakingQueues).forEach(key => {
        matchmakingQueues[key] = matchmakingQueues[key].filter(p => p.socketId !== socket.id);
      });
      
      // Clean up voice rooms
      Object.keys(voiceRooms).forEach(roomId => {
        if (voiceRooms[roomId] && voiceRooms[roomId][socket.id]) {
          delete voiceRooms[roomId][socket.id];
          socket.to(`voice-${roomId}`).emit('user-left', socket.id);
          if (Object.keys(voiceRooms[roomId]).length === 0) {
            delete voiceRooms[roomId];
          }
        }
      });

      // Update lobby count
      setTimeout(() => {
        const onlineCount = io.sockets.adapter.rooms.get('arena-lobby')?.size || 0;
        io.to('arena-lobby').emit('lobby-update', { onlineCount });
      }, 500);
    });
  });

  httpServer.listen(port, () => {
    console.log(`\n🚀 Smart Lab Battle Arena server ready on http://${hostname}:${port}`);
    console.log(`⚡ Socket.IO real-time engine active\n`);
  });
});
