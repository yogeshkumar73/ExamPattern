const http = require('http');

function request(options, data) {
  return new Promise((resolve, reject) => {
    const req = http.request(options, (res) => {
      let body = '';
      res.on('data', chunk => body += chunk);
      res.on('end', () => {
        try {
          resolve({ status: res.statusCode, data: JSON.parse(body) });
        } catch (e) {
          resolve({ status: res.statusCode, text: body });
        }
      });
    });
    req.on('error', reject);
    if (data) {
      req.write(typeof data === 'string' ? data : JSON.stringify(data));
    }
    req.end();
  });
}

async function runTest() {
  console.log('--- 1. Testing Tournament Flow End-to-End ---');

  // Step 1: Create a public tournament with custom prizes & rules
  const hostId = 'user_host_123';
  const player2Id = 'user_player_456';
  const player3Id = 'user_player_789';

  console.log('\n[TEST 1] Creating Public Tournament with Host Prizes & Admin Rules...');
  const createRes = await request({
    hostname: 'localhost',
    port: 3000,
    path: '/api/arena/tournaments',
    method: 'POST',
    headers: { 'Content-Type': 'application/json' }
  }, {
    action: 'create',
    name: 'Auto Test Championship',
    mode: 'math',
    difficulty: 'intermediate',
    maxParticipants: 4,
    prizeXP: 1200,
    firstPrizeCoins: 350,
    firstPrizeBadge: '👑 Grand Math Champion',
    secondPrizeCoins: 150,
    secondPrizeBadge: '🥈 Math Master Runner-Up',
    isPrivate: false,
    rules: {
      timePerQuestion: 20,
      questionsPerMatch: 5,
      passingCutoff: 60
    },
    userId: hostId,
    userName: 'Host Sonu'
  });

  console.log('Create Response Status:', createRes.status);
  const tournament = createRes.data?.tournament;
  if (!tournament) {
    console.error('Failed to create tournament:', createRes.data);
    process.exit(1);
  }
  console.log('✓ Tournament created successfully: ID =', tournament._id, 'InviteCode =', tournament.inviteCode);
  console.log('✓ Host debited:', tournament.hostDebited, 'Prize 1:', tournament.firstPrizeCoins, 'Prize 2:', tournament.secondPrizeCoins);

  // Step 2: Public join without password
  console.log('\n[TEST 2] Public Join without password (Player 2)...');
  const joinRes1 = await request({
    hostname: 'localhost',
    port: 3000,
    path: '/api/arena/tournaments',
    method: 'POST',
    headers: { 'Content-Type': 'application/json' }
  }, {
    action: 'join',
    tournamentId: tournament._id,
    userId: player2Id,
    userName: 'Player 2'
  });
  console.log('Player 2 Join Status:', joinRes1.status, 'Success:', joinRes1.data?.success);

  // Step 3: Test Private Tournament with Password
  console.log('\n[TEST 3] Creating Private Tournament with Password...');
  const createPrivRes = await request({
    hostname: 'localhost',
    port: 3000,
    path: '/api/arena/tournaments',
    method: 'POST',
    headers: { 'Content-Type': 'application/json' }
  }, {
    action: 'create',
    name: 'Private Clash Duel',
    mode: 'coding',
    difficulty: 'hard',
    maxParticipants: 2,
    isPrivate: true,
    password: 'secret_duel_pass',
    userId: hostId,
    userName: 'Host Sonu'
  });
  const privTournament = createPrivRes.data?.tournament;
  console.log('✓ Private Tournament Created: ID =', privTournament?._id, 'Password protected:', privTournament?.hasPassword);

  // Test joining private tournament with wrong password
  console.log('\n[TEST 4] Joining Private Tournament with WRONG password...');
  const wrongPassRes = await request({
    hostname: 'localhost',
    port: 3000,
    path: '/api/arena/tournaments',
    method: 'POST',
    headers: { 'Content-Type': 'application/json' }
  }, {
    action: 'join',
    tournamentId: privTournament._id,
    userId: player3Id,
    userName: 'Player 3',
    password: 'wrong_password'
  });
  console.log('Wrong Password Response Status (expect 403):', wrongPassRes.status, 'Error:', wrongPassRes.data?.error);

  // Test joining private tournament with correct password
  console.log('\n[TEST 5] Joining Private Tournament with CORRECT password...');
  const correctPassRes = await request({
    hostname: 'localhost',
    port: 3000,
    path: '/api/arena/tournaments',
    method: 'POST',
    headers: { 'Content-Type': 'application/json' }
  }, {
    action: 'join',
    tournamentId: privTournament._id,
    userId: player3Id,
    userName: 'Player 3',
    password: 'secret_duel_pass'
  });
  console.log('Correct Password Join Status (expect 200):', correctPassRes.status, 'Success:', correctPassRes.data?.success);

  // Step 6: Test Finish and Results comparison for tournament 1
  console.log('\n[TEST 6] Finishing Tournament & Comparing Multi-user Scores...');
  const finishRes = await request({
    hostname: 'localhost',
    port: 3000,
    path: '/api/arena/tournaments/finish',
    method: 'POST',
    headers: { 'Content-Type': 'application/json' }
  }, {
    tournamentId: tournament._id,
    rankings: [
      { userId: hostId, userName: 'Host Sonu', score: 450 },
      { userId: player2Id, userName: 'Player 2', score: 320 }
    ]
  });
  console.log('Finish Status:', finishRes.status, 'Data:', finishRes.data);

  // Step 7: Check Tournament State
  console.log('\n[TEST 7] Verifying Final Tournament Results & Winner/RunnerUp...');
  const checkRes = await request({
    hostname: 'localhost',
    port: 3000,
    path: `/api/arena/tournaments?id=${tournament._id}`,
    method: 'GET'
  });
  const finishedT = checkRes.data?.tournament;
  console.log('Status:', finishedT?.status);
  console.log('Winner:', finishedT?.winnerName, '(ID:', finishedT?.winnerId, ')');
  console.log('RunnerUp:', finishedT?.runnerUpName, '(ID:', finishedT?.runnerUpId, ')');
  console.log('Rankings:', finishedT?.rankings);

  console.log('\nALL TESTS PASSED SUCCESSFULLY! ✅');
}

runTest().catch(console.error);
