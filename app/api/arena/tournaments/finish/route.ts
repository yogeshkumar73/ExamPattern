import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Tournament from '@/models/Tournament';
import User from '@/models/User';

export async function POST(req: NextRequest) {
  try {
    await dbConnect();
  } catch (err) {
    console.error('DB connection failed:', err);
    return NextResponse.json({ error: 'Database connection failed' }, { status: 500 });
  }

  try {
    const body = await req.json();
    const { tournamentId, rankings } = body;

    if (!tournamentId) {
      return NextResponse.json({ error: 'Tournament ID is required' }, { status: 400 });
    }

    const tournament = await Tournament.findById(tournamentId);
    if (!tournament) {
      return NextResponse.json({ error: 'Tournament not found' }, { status: 404 });
    }

    // Update tournament status to finished and mark destroyed
    tournament.status = 'finished';
    tournament.isDestroyed = true;
    tournament.destroyedAt = new Date();
    tournament.endTime = new Date();

    // Calculate rankings if provided
    if (rankings && rankings.length > 0) {
      tournament.rankings = rankings;
      
      // Update participant places and scores
      rankings.forEach((rank: any, index: number) => {
        const participant = tournament.participants.find((p: any) => p.userId === rank.userId);
        if (participant) {
          participant.place = index + 1;
          participant.score = rank.score || 0;
        }
      });

      // Set winner and runner up
      if (rankings[0]) {
        tournament.winnerId = rankings[0].userId;
        tournament.winnerName = rankings[0].userName;
      }
      if (rankings[1]) {
        tournament.runnerUpId = rankings[1].userId;
        tournament.runnerUpName = rankings[1].userName;
      }
    }

    // Award prizes: 1st Winner and 2nd Runner-up coins & badges + XP
    const firstCoins = tournament.firstPrizeCoins || 200;
    const firstBadge = tournament.firstPrizeBadge || '👑 Tournament Grand Champion';
    const secondCoins = tournament.secondPrizeCoins || 100;
    const secondBadge = tournament.secondPrizeBadge || '🥈 Elite Runner-Up';

    const prizeMultiplier = [1, 0.6, 0.3];
    const topPlaces = rankings?.slice(0, 3) || [];

    for (let i = 0; i < topPlaces.length; i++) {
      try {
        if (!topPlaces[i].userId || topPlaces[i].userId.startsWith('bot-')) continue;
        const user = await User.findById(topPlaces[i].userId);
        if (user) {
          const prizeXP = Math.floor((tournament.prizeXP || 1000) * (prizeMultiplier[i] || 0));
          user.xp = (user.xp || 0) + prizeXP;
          
          if (i === 0) {
            user.coins = (user.coins || 0) + firstCoins;
            if (!user.badges) user.badges = [];
            if (!user.badges.includes(firstBadge)) user.badges.push(firstBadge);
            if (!user.badges.includes('👑')) user.badges.push('👑');
            user.wins = (user.wins || 0) + 1;
          } else if (i === 1) {
            user.coins = (user.coins || 0) + secondCoins;
            if (!user.badges) user.badges = [];
            if (!user.badges.includes(secondBadge)) user.badges.push(secondBadge);
            if (!user.badges.includes('🥈')) user.badges.push('🥈');
          } else {
            user.coins = (user.coins || 0) + Math.floor(prizeXP / 5);
            if (!user.badges) user.badges = [];
            if (!user.badges.includes('🥉')) user.badges.push('🥉');
          }

          // Add to tournament history
          if (!user.battleHistory) user.battleHistory = [];
          user.battleHistory.push({
            battleId: tournamentId,
            mode: tournament.mode,
            difficulty: tournament.difficulty,
            result: i === 0 ? 'win' : (i === 1 ? 'draw' : 'loss'),
            xpGained: prizeXP,
            pointsGained: i === 0 ? 50 : 25,
            opponentName: 'Tournament',
            score: topPlaces[i].score || 0,
            accuracy: 100,
            timestamp: new Date(),
          });

          await user.save();
        }
      } catch (userErr) {
        console.error(`Failed to award prize to user ${topPlaces[i].userId}:`, userErr);
      }
    }

    await tournament.save();

    // Clean up notifications for this finished tournament
    try {
      const Notification = (await import('@/models/Notification')).default;
      await Notification.deleteMany({
        $or: [
          { actionUrl: { $regex: tournamentId } },
          { title: { $regex: tournament.name } },
        ],
      });
    } catch (_) {}

    return NextResponse.json({
      success: true,
      tournament,
      message: 'Tournament finished successfully',
      winner: tournament.winnerName,
      rankings: tournament.rankings,
    });
  } catch (err: any) {
    console.error('POST /api/arena/tournaments/finish error:', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

// DELETE - Destroy tournament room after timeout
export async function DELETE(req: NextRequest) {
  try {
    await dbConnect();
  } catch (err) {
    console.error('DB connection failed:', err);
    return NextResponse.json({ error: 'Database connection failed' }, { status: 500 });
  }

  try {
    const { searchParams } = new URL(req.url);
    const tournamentId = searchParams.get('id');

    if (!tournamentId) {
      return NextResponse.json({ error: 'Tournament ID is required' }, { status: 400 });
    }

    const tournament = await Tournament.findById(tournamentId);
    if (!tournament) {
      return NextResponse.json({ error: 'Tournament not found' }, { status: 404 });
    }

    // Mark as destroyed and finished
    tournament.isDestroyed = true;
    tournament.status = 'finished';
    tournament.destroyedAt = new Date();
    await tournament.save();

    // Clean up notifications for this finished tournament
    try {
      const Notification = (await import('@/models/Notification')).default;
      await Notification.deleteMany({
        $or: [
          { actionUrl: { $regex: tournamentId } },
          { title: { $regex: tournament.name } },
        ],
      });
    } catch (_) {}

    return NextResponse.json({
      success: true,
      message: 'Tournament room destroyed',
    });
  } catch (err: any) {
    console.error('DELETE /api/arena/tournaments error:', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
