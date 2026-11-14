import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Tournament from '@/models/Tournament';
import User from '@/models/User';
import { createNotification } from '@/lib/services/notificationService';

export async function GET(req: NextRequest) {
  try {
    await dbConnect();
  } catch (err) {
    console.error('DB connection failed:', err);
    return NextResponse.json({ tournaments: [] });
  }

  const { searchParams } = new URL(req.url);
  const id = searchParams.get('id');
  const invite = searchParams.get('invite');
  const requesterId = searchParams.get('userId');

  try {
    if (invite) {
      const tournament = await Tournament.findOne({ inviteCode: invite.trim().toUpperCase() });
      if (!tournament) return NextResponse.json({ error: 'Tournament not found with this invite code' }, { status: 404 });
      return NextResponse.json({ tournament });
    }

    if (id) {
      const tournament = await Tournament.findById(id);
      if (!tournament) return NextResponse.json({ error: 'Tournament not found' }, { status: 404 });
      return NextResponse.json({ tournament });
    }

    const tournaments = await Tournament.find({
      status: { $ne: 'finished' },
      isDestroyed: { $ne: true }
    }).sort({ createdAt: -1 });

    // Format tournaments and protect password for non-hosts
    const sanitized = tournaments.map((t: any) => {
      const doc = t.toObject ? t.toObject() : { ...t };
      const isHost = requesterId && doc.createdBy === requesterId;
      doc.hasPassword = Boolean(doc.password && doc.password.trim());
      if (!isHost) {
        delete doc.password;
      }
      return doc;
    });

    return NextResponse.json({ tournaments: sanitized });
  } catch (err: any) {
    console.error('GET /api/arena/tournaments error:', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    await dbConnect();
  } catch (err) {
    console.error('DB connection failed, continuing with fallback:', err);
  }

  try {
    const body = await req.json();
    const {
      action,
      name,
      mode,
      difficulty,
      maxParticipants,
      prizePool,
      prizeXP,
      startTime,
      scheduledStartTime,
      password,
      userId,
      userName,
      avatar,
      tournamentId,
      inviteCode,
      matchDuration,
      expiryHours,
      expiresAt,
      questionsPerMatch,
      rules,
    } = body;

    if (!action) {
      return NextResponse.json({ error: 'Action is required' }, { status: 400 });
    }

    if (action === 'create') {
      if (!name || !mode) {
        return NextResponse.json({ error: 'Name and game mode are required' }, { status: 400 });
      }
      if (!userId) {
        return NextResponse.json({ error: 'User ID is required' }, { status: 400 });
      }

      try {
        const pool = Number(prizePool || prizeXP || 1000);
        const eventStartTime = scheduledStartTime ? new Date(scheduledStartTime) : (startTime ? new Date(startTime) : new Date());
        const generatedCode = `TRN-${Math.random().toString(36).substring(2, 8).toUpperCase()}`;
        const isPrivateFlag = Boolean(body.isPrivate);
        const hasPwd = Boolean(isPrivateFlag && password && password.trim());
        const durationSec = Number(matchDuration) || 300;
        const expHours = Number(expiryHours) || 24;
        const calculatedExpiresAt = expiresAt ? new Date(expiresAt) : new Date(Date.now() + expHours * 3600 * 1000);
        const qCount = Number(questionsPerMatch) || 10;

        const firstPrizeCoins = Number(body.firstPrizeCoins) || Math.floor(pool * 0.6 / 5) || 200;
        const firstPrizeBadge = body.firstPrizeBadge || '👑 Tournament Grand Champion';
        const secondPrizeCoins = Number(body.secondPrizeCoins) || Math.floor(pool * 0.3 / 5) || 100;
        const secondPrizeBadge = body.secondPrizeBadge || '🥈 Elite Runner-Up';
        const totalPrizeCoins = firstPrizeCoins + secondPrizeCoins;

        // Debit host coins for prize pool
        let hostDebited = false;
        try {
          const hostUser = await User.findById(userId);
          if (hostUser) {
            if ((hostUser.coins || 0) >= totalPrizeCoins) {
              hostUser.coins = (hostUser.coins || 0) - totalPrizeCoins;
            } else {
              hostUser.coins = Math.max(0, (hostUser.coins || 0) - Math.floor(totalPrizeCoins / 2));
            }
            await hostUser.save();
            hostDebited = true;
          }
        } catch (hErr) {
          console.warn("Host debit warning:", hErr);
        }

        let cleanTournamentName = (name || '').trim();
        if (!cleanTournamentName || cleanTournamentName.includes('@')) {
          const modeLabel = typeof mode === 'string' ? (mode.charAt(0).toUpperCase() + mode.slice(1)) : 'Battle';
          cleanTournamentName = `${modeLabel} Championship`;
        }

        let normalizedDifficulty = (difficulty || 'intermediate').toLowerCase();
        if (normalizedDifficulty === 'hard') normalizedDifficulty = 'advanced';
        if (normalizedDifficulty === 'easy') normalizedDifficulty = 'beginner';
        if (!['beginner', 'intermediate', 'advanced', 'expert', 'master', 'grandmaster'].includes(normalizedDifficulty)) {
          normalizedDifficulty = 'intermediate';
        }

        const tournament = await Tournament.create({
          name: cleanTournamentName,
          mode: mode || 'math',
          difficulty: normalizedDifficulty,
          maxParticipants: Number(maxParticipants) || 8,
          matchDuration: durationSec,
          expiryHours: expHours,
          expiresAt: calculatedExpiresAt,
          questionsPerMatch: qCount,
          rules: rules || {
            timePerQuestion: 30,
            pointsPerCorrect: 100,
            penaltyPerWrong: 0,
            allowBots: true,
            passingCutoff: 50,
            customRules: '',
          },
          prizeXP: pool,
          prizePool: pool,
          firstPrizeCoins,
          firstPrizeBadge,
          secondPrizeCoins,
          secondPrizeBadge,
          hostDebited,
          startTime: eventStartTime,
          scheduledStartTime: eventStartTime,
          status: 'open',
          createdBy: userId,
          hostName: userName || 'Host',
          password: hasPwd ? password.trim() : '',
          inviteCode: generatedCode,
          isPrivate: hasPwd,
          participants: [{
            userId,
            name: userName || 'Host',
            avatar: avatar || '',
            seed: 1,
            score: 0,
          }],
        });

        // Broadcast tournament notification to ALL users
        try {
          const Notification = (await import('@/models/Notification')).default;
          const otherUsers = await User.find(
            userId ? { _id: { $ne: userId } } : {},
            '_id email name'
          ).limit(500).lean();

          const isPublic = !hasPwd;
          const notifs = otherUsers.map((u: any) => ({
            userId: u._id.toString(),
            recipientEmail: u.email || '',
            recipientName: u.name || 'Student',
            senderId: userId,
            senderName: userName || 'Tournament Host',
            senderPhotoUrl: avatar || '',
            title: isPublic ? `🏆 Live Tournament: ${cleanTournamentName}` : `🔒 Private Tournament: ${cleanTournamentName}`,
            message: isPublic
              ? `${userName || 'Host'} hosted public tournament "${cleanTournamentName}"! Code: ${generatedCode}. Join live now without password! 1st: ${firstPrizeCoins} Coins + 👑 | 2nd: ${secondPrizeCoins} Coins + 🥈!`
              : `${userName || 'Host'} hosted private tournament "${cleanTournamentName}"! Code: ${generatedCode}. Enter password to join! 1st: ${firstPrizeCoins} Coins | 2nd: ${secondPrizeCoins} Coins.`,
            category: 'battle_challenge',
            priority: 'high',
            actionUrl: `/?step=arena&tab=tournament&tournamentId=${tournament._id}&invite=${generatedCode}&roomCode=${generatedCode}&isPublic=${isPublic}&isPrivate=${!isPublic}`,
            isRead: false,
            createdAt: new Date(),
          }));

          // Also include a broadcast record
          notifs.push({
            userId: 'all',
            recipientEmail: '',
            recipientName: 'All Students',
            senderId: userId,
            senderName: userName || 'Tournament Host',
            senderPhotoUrl: avatar || '',
            title: isPublic ? `🏆 Live Tournament: ${cleanTournamentName}` : `🔒 Private Tournament: ${cleanTournamentName}`,
            message: isPublic
              ? `${userName || 'Host'} hosted public tournament "${cleanTournamentName}"! Code: ${generatedCode}. Join live now without password! 1st: ${firstPrizeCoins} Coins + 👑 | 2nd: ${secondPrizeCoins} Coins + 🥈!`
              : `${userName || 'Host'} hosted private tournament "${cleanTournamentName}"! Code: ${generatedCode}. Enter password to join! 1st: ${firstPrizeCoins} Coins | 2nd: ${secondPrizeCoins} Coins.`,
            category: 'battle_challenge',
            priority: 'high',
            actionUrl: `/?step=arena&tab=tournament&tournamentId=${tournament._id}&invite=${generatedCode}&roomCode=${generatedCode}&isPublic=${isPublic}&isPrivate=${!isPublic}`,
            isRead: false,
            createdAt: new Date(),
          } as any);

          if (notifs.length > 0) {
            await Notification.insertMany(notifs);
          }
        } catch (notifErr) {
          console.error('Failed to broadcast tournament notification:', notifErr);
        }

        return NextResponse.json({ success: true, tournament });
      } catch (createErr: any) {
        console.error('Tournament creation error:', createErr);
        return NextResponse.json({ error: 'Failed to create tournament: ' + createErr.message }, { status: 500 });
      }
    }

    if (action === 'join') {
      if ((!tournamentId && !inviteCode) || !userId) {
        return NextResponse.json({ error: 'Tournament identifier and User ID are required' }, { status: 400 });
      }

      try {
        let tournament = null;
        if (tournamentId) {
          tournament = await Tournament.findById(tournamentId);
        } else if (inviteCode) {
          tournament = await Tournament.findOne({ inviteCode: inviteCode.trim().toUpperCase() });
        }

        if (!tournament) {
          return NextResponse.json({ error: 'Tournament not found' }, { status: 404 });
        }

        if (tournament.status !== 'open') {
          return NextResponse.json({ error: 'Tournament registration is closed' }, { status: 400 });
        }

        // Verify password ONLY if tournament is private and has non-empty password, and user is not host
        const isPrivateTournament = Boolean(tournament.isPrivate && tournament.password && tournament.password.trim());
        if (isPrivateTournament && tournament.createdBy !== userId) {
          const suppliedPassword = (body.password || '').trim();
          if (suppliedPassword !== tournament.password.trim()) {
            return NextResponse.json({ error: 'Incorrect tournament password' }, { status: 403 });
          }
        }

        const isAlreadyIn = tournament.participants.some((p: any) => p.userId === userId);
        if (isAlreadyIn) {
          return NextResponse.json({ success: true, message: 'Already registered in this tournament', tournament });
        }

        if (tournament.participants.length >= tournament.maxParticipants) {
          return NextResponse.json({ error: 'Tournament is already full' }, { status: 400 });
        }

        tournament.participants.push({
          userId,
          name: userName || 'Anonymous',
          avatar: avatar || '',
          seed: tournament.participants.length + 1,
          score: 0,
        });

        // If full, start the tournament and build bracket
        if (tournament.participants.length >= tournament.maxParticipants) {
          tournament.status = 'active';
          tournament.startTime = new Date();

          const participants = [...tournament.participants];
          const bracket: any[] = [];

          // Generate Round 1 matches
          for (let i = 0; i < participants.length; i += 2) {
            bracket.push({
              round: 1,
              match: Math.floor(i / 2) + 1,
              player1Id: participants[i].userId,
              player1Name: participants[i].name,
              player2Id: participants[i + 1]?.userId || null,
              player2Name: participants[i + 1]?.name || null,
              winnerId: null,
              battleId: `battle-${Date.now()}-${i}`,
              status: 'pending',
            });
          }

          if (participants.length === 8) {
            bracket.push({ round: 2, match: 1, player1Id: null, player2Id: null, winnerId: null, status: 'pending' });
            bracket.push({ round: 2, match: 2, player1Id: null, player2Id: null, winnerId: null, status: 'pending' });
            bracket.push({ round: 3, match: 1, player1Id: null, player2Id: null, winnerId: null, status: 'pending' });
          } else if (participants.length === 4) {
            bracket.push({ round: 2, match: 1, player1Id: null, player2Id: null, winnerId: null, status: 'pending' });
          }

          tournament.bracket = bracket as any;
        }

        await tournament.save();
        return NextResponse.json({ success: true, tournament });
      } catch (joinErr: any) {
        console.error('Tournament join error:', joinErr);
        return NextResponse.json({ error: 'Failed to join tournament: ' + joinErr.message }, { status: 500 });
      }
    }

    // Host Control: Manually start tournament early or fill empty slots with bots
    if (action === 'start_tournament' || action === 'fill_bots') {
      const { tournamentId, userId } = body;
      const tournament = await Tournament.findById(tournamentId);
      if (!tournament) return NextResponse.json({ error: 'Tournament not found' }, { status: 404 });

      if (tournament.createdBy !== userId) {
        return NextResponse.json({ error: 'Only the hosting user can start this tournament' }, { status: 403 });
      }

      const BOT_POOL = [
        'Pradip [AI Bot]', 'Nova [AI Bot]', 'CyberFalcon [AI Bot]', 'QuantumMind [AI Bot]',
        'Viper [AI Bot]', 'AlphaCode [AI Bot]', 'ChromaKnight [AI Bot]', 'LogicMaster [AI Bot]',
        'MatrixPro [AI Bot]', 'ShadowRival [AI Bot]', 'ByteStriker [AI Bot]', 'ApexPredator [AI Bot]'
      ];

      // Auto-fill remaining empty slots with AI bots if requested or if slots remain
      if (action === 'fill_bots' || tournament.participants.length < (tournament.maxParticipants || 8)) {
        const targetCount = tournament.maxParticipants || 8;
        const currentCount = tournament.participants.length;
        const needed = Math.max(0, targetCount - currentCount);

        for (let i = 0; i < needed; i++) {
          const botName = BOT_POOL[(currentCount + i) % BOT_POOL.length];
          tournament.participants.push({
            userId: `bot-${Date.now()}-${i}-${Math.random().toString(36).substring(2, 6)}`,
            name: botName,
            avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(botName)}&background=6366f1&color=fff`,
            seed: currentCount + i + 1,
            score: 0,
            eliminated: false,
          });
        }
      }

      if (tournament.participants.length < 2) {
        return NextResponse.json({ error: 'At least 2 players are required to start the tournament' }, { status: 400 });
      }

      tournament.status = 'active';
      tournament.startTime = new Date();

      const participants = [...tournament.participants];
      const bracket: any[] = [];
      for (let i = 0; i < participants.length; i += 2) {
        bracket.push({
          round: 1,
          match: Math.floor(i / 2) + 1,
          player1Id: participants[i].userId,
          player1Name: participants[i].name,
          player2Id: participants[i + 1]?.userId || null,
          player2Name: participants[i + 1]?.name || null,
          player1Score: 0,
          player2Score: 0,
          winnerId: null,
          battleId: `battle-${Date.now()}-${i}`,
          status: 'pending',
        });
      }
      tournament.bracket = bracket as any;
      tournament.currentRound = 1;
      await tournament.save();

      return NextResponse.json({ success: true, tournament });
    }

    // Host Control: Cancel / Delete tournament
    if (action === 'cancel_tournament' || action === 'delete_tournament') {
      const { tournamentId, userId } = body;
      const tournament = await Tournament.findById(tournamentId);
      if (!tournament) return NextResponse.json({ error: 'Tournament not found' }, { status: 404 });

      if (tournament.createdBy !== userId) {
        return NextResponse.json({ error: 'Only the hosting user can cancel this tournament' }, { status: 403 });
      }

      tournament.status = 'finished';
      tournament.isDestroyed = true;
      tournament.destroyedAt = new Date();
      await tournament.save();

      // Automatically delete all notifications for this tournament
      try {
        const Notification = (await import('@/models/Notification')).default;
        await Notification.deleteMany({
          $or: [
            { actionUrl: { $regex: tournamentId } },
            { title: { $regex: tournament.name } },
          ],
        });
      } catch (delErr) {
        console.error('Failed to delete tournament notifications:', delErr);
      }

      return NextResponse.json({ success: true, message: 'Tournament cancelled and removed successfully' });
    }

    return NextResponse.json({ error: 'Invalid action. Must be create, join, start_tournament, or cancel_tournament' }, { status: 400 });
  } catch (err: any) {
    console.error('POST /api/arena/tournaments error:', err);
    return NextResponse.json({ error: 'Invalid request: ' + err.message }, { status: 400 });
  }
}

export async function PUT(req: NextRequest) {
  try {
    await dbConnect();
  } catch (err) {
    console.error('DB connection failed:', err);
    return NextResponse.json({ error: 'Database connection failed' }, { status: 500 });
  }

  try {
    const body = await req.json();
    const { tournamentId, round, match, winnerId, player1Score, player2Score, action } = body;

    if (!tournamentId || round === undefined || match === undefined) {
      return NextResponse.json({ error: 'Missing required parameters' }, { status: 400 });
    }

    const tournament = await Tournament.findById(tournamentId);
    if (!tournament) return NextResponse.json({ error: 'Tournament not found' }, { status: 404 });

    // Find the current match
    const matchObj = tournament.bracket.find((m: any) => m.round === round && m.match === match);
    if (!matchObj) return NextResponse.json({ error: 'Match not found' }, { status: 404 });

    // Update match scores and timing
    matchObj.player1Score = player1Score || 0;
    matchObj.player2Score = player2Score || 0;
    if (action === 'start' && matchObj.status === 'pending') {
      matchObj.status = 'active';
      matchObj.startTime = new Date();
    }

    if (winnerId) {
      matchObj.winnerId = winnerId;
      matchObj.status = 'done';
      matchObj.endTime = new Date();

      // Get player names
      const player1 = tournament.participants.find((p: any) => p.userId === matchObj.player1Id);
      const player2 = tournament.participants.find((p: any) => p.userId === matchObj.player2Id);
      
      matchObj.player1Name = player1?.name;
      matchObj.player2Name = player2?.name;

      // Update participant scores
      if (player1) player1.score = (player1.score || 0) + (player1Score || 0);
      if (player2) player2.score = (player2.score || 0) + (player2Score || 0);

      // Reward match winner if not a bot
      if (winnerId && !winnerId.startsWith('bot-')) {
        try {
          const winnerUser = await User.findById(winnerId);
          if (winnerUser) {
            const winXP = 300;
            const winCoins = 100;
            winnerUser.xp = (winnerUser.xp || 0) + winXP;
            winnerUser.coins = (winnerUser.coins || 0) + winCoins;
            winnerUser.arenaPoints = (winnerUser.arenaPoints || 0) + 50;
            winnerUser.wins = (winnerUser.wins || 0) + 1;
            await winnerUser.save();
          }
        } catch (uErr) {
          console.error('Failed to update winner user in tournament match:', uErr);
        }
      }

      // Mark loser as eliminated
      const loserId = matchObj.player1Id === winnerId ? matchObj.player2Id : matchObj.player1Id;
      const loser = tournament.participants.find((p: any) => p.userId === loserId);
      if (loser) loser.eliminated = true;

      // Check if round is finished
      const roundMatches = tournament.bracket.filter((m: any) => m.round === round);
      const roundFinished = roundMatches.every((m: any) => m.status === 'done');

      if (roundFinished) {
        const nextRound = round + 1;
        const nextRoundMatches = tournament.bracket.filter((m: any) => m.round === nextRound);

        if (nextRoundMatches.length > 0) {
          // Advance winners to next round
          for (let i = 0; i < nextRoundMatches.length; i++) {
            const m1 = roundMatches[i * 2];
            const m2 = roundMatches[i * 2 + 1];
            if (m1?.winnerId && m2?.winnerId) {
              nextRoundMatches[i].player1Id = m1.winnerId;
              nextRoundMatches[i].player2Id = m2.winnerId;
              nextRoundMatches[i].status = 'pending';
            }
          }
          tournament.currentRound = nextRound;
        } else {
          // Tournament is finished
          tournament.status = 'finished';
          tournament.isDestroyed = true;
          tournament.destroyedAt = new Date();
          tournament.winnerId = winnerId;
          tournament.endTime = new Date();

          // Clean up notifications for this finished tournament
          try {
            const Notification = (await import('@/models/Notification')).default;
            await Notification.deleteMany({
              $or: [
                { actionUrl: { $regex: tournamentId } },
                { title: { $regex: tournament.name } },
              ],
            });
          } catch (notifErr) {
            console.error('Failed to clean up tournament notifications on finish:', notifErr);
          }

          // Create final rankings
          const rankings = tournament.participants
            .sort((a: any, b: any) => (b.score || 0) - (a.score || 0))
            .map((p: any, index: number) => ({
              rank: index + 1,
              userId: p.userId,
              userName: p.name,
              userAvatar: p.avatar,
              finalScore: p.score || 0,
              place: index + 1,
            }));

          tournament.rankings = rankings as any;

          // Award 1st Winner Prize and 2nd Runner-Up Prize
          const firstCoins = tournament.firstPrizeCoins || 200;
          const firstBadge = tournament.firstPrizeBadge || '👑 Tournament Grand Champion';
          const secondCoins = tournament.secondPrizeCoins || 100;
          const secondBadge = tournament.secondPrizeBadge || '🥈 Elite Runner-Up';

          // 1st Winner Award
          if (rankings[0] && !rankings[0].userId?.startsWith('bot-')) {
            try {
              const winnerUser = await User.findById(rankings[0].userId);
              if (winnerUser) {
                winnerUser.coins = (winnerUser.coins || 0) + firstCoins;
                winnerUser.xp = (winnerUser.xp || 0) + (tournament.prizeXP || 1000);
                winnerUser.wins = (winnerUser.wins || 0) + 1;
                if (!winnerUser.badges) winnerUser.badges = [];
                if (!winnerUser.badges.includes(firstBadge)) winnerUser.badges.push(firstBadge);
                if (!winnerUser.badges.includes('👑')) winnerUser.badges.push('👑');
                await winnerUser.save();
              }
            } catch (wErr) {
              console.error('Failed to award 1st prize:', wErr);
            }
          }

          // 2nd Runner-Up Award
          if (rankings[1] && !rankings[1].userId?.startsWith('bot-')) {
            try {
              const runnerUpUser = await User.findById(rankings[1].userId);
              if (runnerUpUser) {
                runnerUpUser.coins = (runnerUpUser.coins || 0) + secondCoins;
                runnerUpUser.xp = (runnerUpUser.xp || 0) + Math.floor((tournament.prizeXP || 1000) * 0.5);
                if (!runnerUpUser.badges) runnerUpUser.badges = [];
                if (!runnerUpUser.badges.includes(secondBadge)) runnerUpUser.badges.push(secondBadge);
                if (!runnerUpUser.badges.includes('🥈')) runnerUpUser.badges.push('🥈');
                await runnerUpUser.save();
              }
            } catch (rErr) {
              console.error('Failed to award 2nd prize:', rErr);
            }
          }

          tournament.winnerId = rankings[0]?.userId || null;
          tournament.winnerName = rankings[0]?.userName || null;
          tournament.runnerUpId = rankings[1]?.userId || null;
          tournament.runnerUpName = rankings[1]?.userName || null;
        }
      }
    }

    await tournament.save();
    return NextResponse.json({ success: true, tournament });
  } catch (err: any) {
    console.error('PUT /api/arena/tournaments error:', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
