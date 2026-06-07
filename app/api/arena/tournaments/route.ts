import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Tournament from '@/models/Tournament';
import User from '@/models/User';

export async function GET(req: NextRequest) {
  try {
    await dbConnect();
  } catch (err) {
    console.error('DB connection failed:', err);
    // Return empty array instead of failing
    return NextResponse.json({ tournaments: [] });
  }

  const { searchParams } = new URL(req.url);
  const id = searchParams.get('id');

  try {
    if (id) {
      const tournament = await Tournament.findById(id);
      if (!tournament) return NextResponse.json({ error: 'Tournament not found' }, { status: 404 });
      return NextResponse.json({ tournament });
    }

    const tournaments = await Tournament.find({ status: { $ne: 'finished' } }).sort({ createdAt: -1 });
    return NextResponse.json({ tournaments });
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
    const { action, name, mode, difficulty, maxParticipants, userId, userName, avatar, tournamentId } = body;

    if (!action) {
      return NextResponse.json({ error: 'Action is required' }, { status: 400 });
    }

    if (action === 'create') {
      if (!name || !mode) {
        return NextResponse.json({ error: 'Name and mode are required' }, { status: 400 });
      }
      if (!userId) {
        return NextResponse.json({ error: 'User ID is required' }, { status: 400 });
      }

      try {
        const tournament = await Tournament.create({
          name,
          mode,
          difficulty: difficulty || 'intermediate',
          maxParticipants: maxParticipants || 8,
          status: 'open',
          createdBy: userId,
          participants: userId ? [{ userId, name: userName || 'Anonymous', avatar, seed: 1 }] : [],
        });
        return NextResponse.json({ success: true, tournament });
      } catch (createErr: any) {
        console.error('Tournament creation error:', createErr);
        return NextResponse.json({ error: 'Failed to create tournament: ' + createErr.message }, { status: 500 });
      }
    }

    if (action === 'join') {
      if (!tournamentId || !userId) {
        return NextResponse.json({ error: 'Tournament ID and User ID are required' }, { status: 400 });
      }

      try {
        const tournament = await Tournament.findById(tournamentId);
        if (!tournament) {
          return NextResponse.json({ error: 'Tournament not found' }, { status: 404 });
        }
        if (tournament.status !== 'open') {
          return NextResponse.json({ error: 'Tournament registration is closed' }, { status: 400 });
        }

        const isAlreadyIn = tournament.participants.some((p: any) => p.userId === userId);
        if (isAlreadyIn) {
          return NextResponse.json({ error: 'Already registered in this tournament' }, { status: 400 });
        }

        if (tournament.participants.length >= tournament.maxParticipants) {
          return NextResponse.json({ error: 'Tournament is full' }, { status: 400 });
        }

        tournament.participants.push({
          userId,
          name: userName || 'Anonymous',
          avatar,
          seed: tournament.participants.length + 1,
        });

        // If full, start the tournament and build bracket
        if (tournament.participants.length === tournament.maxParticipants) {
          tournament.status = 'active';
          tournament.startTime = new Date();

          // Generate round 1 bracket (assuming 8 participants)
          const participants = [...tournament.participants];
          const numRounds = Math.log2(participants.length); // e.g. 3 rounds for 8 players
          const bracket = [];

          // Generate Round 1 matches
          for (let i = 0; i < participants.length; i += 2) {
            bracket.push({
              round: 1,
              match: (i / 2) + 1,
              player1Id: participants[i].userId,
              player2Id: participants[i + 1]?.userId || null,
              winnerId: null,
              battleId: `battle-${Date.now()}-${i}`,
              status: 'pending',
            });
          }

          // Placeholders for round 2 & 3
          if (participants.length === 8) {
            // Round 2 matches (2 matches)
            bracket.push({ round: 2, match: 1, player1Id: null, player2Id: null, winnerId: null, status: 'pending' });
            bracket.push({ round: 2, match: 2, player1Id: null, player2Id: null, winnerId: null, status: 'pending' });
            // Round 3 match (Final)
            bracket.push({ round: 3, match: 1, player1Id: null, player2Id: null, winnerId: null, status: 'pending' });
          } else if (participants.length === 4) {
            // Round 2 match (Final)
            bracket.push({ round: 2, match: 1, player1Id: null, player2Id: null, winnerId: null, status: 'pending' });
          }

          tournament.bracket = bracket;
        }

        await tournament.save();
        return NextResponse.json({ success: true, tournament });
      } catch (joinErr: any) {
        console.error('Tournament join error:', joinErr);
        return NextResponse.json({ error: 'Failed to join tournament: ' + joinErr.message }, { status: 500 });
      }
    }

    return NextResponse.json({ error: 'Invalid action. Must be "create" or "join"' }, { status: 400 });
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
          tournament.winnerId = winnerId;
          tournament.endTime = new Date();

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

          tournament.rankings = rankings;

          // Award prizes to top 3
          const prizeMultiplier = [1, 0.6, 0.3];
          for (let i = 0; i < Math.min(3, rankings.length); i++) {
            try {
              const user = await User.findById(rankings[i].userId);
              if (user) {
                const prizeXP = Math.floor((tournament.prizeXP || 1000) * prizeMultiplier[i]);
                user.xp = (user.xp || 0) + prizeXP;
                user.coins = (user.coins || 0) + Math.floor(prizeXP / 5);
                const badges = ['👑', '🥈', '🥉'];
                if (!user.badges.includes(badges[i])) user.badges.push(badges[i]);
                if (i === 0) user.wins = (user.wins || 0) + 1;
                await user.save();
              }
            } catch (userErr) {
              console.error('Failed to award prize:', userErr);
            }
          }
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
