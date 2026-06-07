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

    // Update tournament status to finished
    tournament.status = 'finished';
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

      // Set winner
      if (rankings[0]) {
        tournament.winnerId = rankings[0].userId;
        tournament.winnerName = rankings[0].userName;
      }
    }

    // Award prizes to top 3
    const prizeMultiplier = [1, 0.6, 0.3];
    const topPlaces = rankings?.slice(0, 3) || [];

    for (let i = 0; i < topPlaces.length; i++) {
      try {
        const user = await User.findById(topPlaces[i].userId);
        if (user) {
          const prizeXP = Math.floor((tournament.prizeXP || 1000) * (prizeMultiplier[i] || 0));
          user.xp = (user.xp || 0) + prizeXP;
          user.coins = (user.coins || 0) + Math.floor(prizeXP / 5);
          
          // Add badge for top 3
          const badges = ['👑', '🥈', '🥉'];
          if (!user.badges.includes(badges[i])) {
            user.badges.push(badges[i]);
          }

          // Increment wins
          if (i === 0) {
            user.wins = (user.wins || 0) + 1;
          }

          // Add to tournament history
          if (!user.battleHistory) user.battleHistory = [];
          user.battleHistory.push({
            battleId: tournamentId,
            mode: tournament.mode,
            difficulty: tournament.difficulty,
            result: i === 0 ? 'win' : 'draw',
            xpGained: prizeXP,
            pointsGained: 0,
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

    // Mark as destroyed
    tournament.isDestroyed = true;
    tournament.destroyedAt = new Date();
    await tournament.save();

    return NextResponse.json({
      success: true,
      message: 'Tournament room destroyed',
    });
  } catch (err: any) {
    console.error('DELETE /api/arena/tournaments error:', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
