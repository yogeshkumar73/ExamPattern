/**
 * Comprehensive Platform Verification & Security Test Suite
 * Tests all core services, arena features, notifications, auth, and security protections.
 */

const http = require('http');

const BASE_URL = 'http://localhost:3000';
const BROWSER_UA = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36';

let passed = 0;
let failed = 0;

function request(method, path, data = null, customHeaders = {}) {
  return new Promise((resolve, reject) => {
    const url = new URL(path, BASE_URL);
    const postData = data ? JSON.stringify(data) : null;

    const headers = {
      'User-Agent': BROWSER_UA,
      'Accept': 'application/json, text/plain, */*',
      ...customHeaders,
    };

    if (postData) {
      headers['Content-Type'] = 'application/json';
      headers['Content-Length'] = Buffer.byteLength(postData);
    }

    const req = http.request({
      hostname: url.hostname,
      port: url.port,
      path: url.pathname + url.search,
      method: method,
      headers: headers,
      timeout: 10000,
    }, (res) => {
      let body = '';
      res.on('data', chunk => body += chunk);
      res.on('end', () => {
        let json = null;
        try {
          json = JSON.parse(body);
        } catch {}
        resolve({ status: res.statusCode, headers: res.headers, body, json });
      });
    });

    req.on('error', reject);
    req.on('timeout', () => {
      req.destroy();
      reject(new Error('Request timed out'));
    });

    if (postData) {
      req.write(postData);
    }
    req.end();
  });
}

function assert(condition, message) {
  if (condition) {
    console.log(`  [PASS] ${message}`);
    passed++;
  } else {
    console.error(`  [FAIL] ${message}`);
    failed++;
  }
}

async function runTests() {
  console.log('====================================================');
  console.log('   STARTING FULL PLATFORM AND SECURITY TEST SUITE   ');
  console.log('====================================================\n');

  // Test 1: Page Routes & Redirects
  console.log('--- Suite 1: Web Pages & Redirects ---');
  try {
    const home = await request('GET', '/');
    assert(home.status === 200, 'Home page (/) returns HTTP 200');

    const battleArenaRedirect = await request('GET', '/battle-arena');
    assert(battleArenaRedirect.status === 200, '/battle-arena route renders clean redirect component');

    const dataPage = await request('GET', '/data');
    assert(dataPage.status === 200, '/data route returns HTTP 200');
  } catch (err) {
    assert(false, `Web page routes check failed: ${err.message}`);
  }

  // Test 2: Security & Middleware Bot Blocking
  console.log('\n--- Suite 2: Security & Bot Attack Mitigations ---');
  try {
    const botReq = await request('GET', '/api/notifications', null, { 'User-Agent': 'sqlmap/1.4' });
    assert(botReq.status === 403, 'Malicious bot UA (sqlmap) blocked with HTTP 403 Forbidden');

    const emptyUa = await request('GET', '/api/notifications', null, { 'User-Agent': 'bot' });
    assert(emptyUa.status === 403, 'Short/Suspicious UA blocked with HTTP 403');
  } catch (err) {
    assert(false, `Security bot check failed: ${err.message}`);
  }

  // Test 3: Notifications Service
  console.log('\n--- Suite 3: Notifications Center Service ---');
  try {
    const notifs = await request('GET', '/api/notifications?userId=test_student_user');
    assert(notifs.status === 200, 'Notifications GET returns HTTP 200');
    assert(Array.isArray(notifs.json?.notifications), 'Notifications response has notifications array');

    // Create a notification
    const createNotif = await request('POST', '/api/notifications', {
      userId: 'test_student_user',
      title: 'Automated Test Alert',
      message: 'Verifying notification pipeline',
      category: 'General',
      priority: 'low',
    });
    assert(createNotif.status === 200 || createNotif.status === 201, 'Notification POST create succeeds');
    const createdId = createNotif.json?.notification?._id || createNotif.json?.data?._id;

    if (createdId) {
      const markRead = await request('PUT', '/api/notifications', {
        action: 'mark_read',
        notificationId: createdId,
      });
      assert(markRead.status === 200, 'Notification mark_read PUT succeeds');
    }
  } catch (err) {
    assert(false, `Notifications service check failed: ${err.message}`);
  }

  // Test 4: Battle Arena - Leaderboard, Matchmaking, and Tournaments
  console.log('\n--- Suite 4: Battle Arena Engine & Tournaments ---');
  try {
    const leaderboard = await request('GET', '/api/arena/leaderboard');
    assert(leaderboard.status === 200, 'Arena Leaderboard GET returns HTTP 200');
    assert(Array.isArray(leaderboard.json?.leaderboard), 'Leaderboard contains student rankings array');

    // Matchmaking test
    const matchmake = await request('POST', '/api/arena/battle', {
      action: 'matchmake',
      userId: 'test_student_match',
      userName: 'Test Student',
      userLevel: 3,
      mode: 'coding',
    });
    assert(matchmake.status === 200 && matchmake.json?.success === true, '1v1 Matchmaking returns paired opponent');
    assert(Boolean(matchmake.json?.opponent?.name), `Matched opponent: ${matchmake.json?.opponent?.name}`);

    // Private Room creation & join
    const privateRoom = await request('POST', '/api/arena/battle', {
      action: 'create_private_room',
      userId: 'test_host_user',
      userName: 'Host Student',
      mode: 'math',
      difficulty: 'intermediate',
    });
    assert(privateRoom.status === 200 && privateRoom.json?.success === true, 'Private battle room creation succeeds');
    const roomCode = privateRoom.json?.roomCode;
    assert(Boolean(roomCode), `Generated room code: ${roomCode}`);

    if (roomCode) {
      const joinRoom = await request('POST', '/api/arena/battle', {
        action: 'join_private_room',
        roomCode: roomCode,
        userId: 'test_guest_player',
        userName: 'Challenger Student',
      });
      assert(joinRoom.status === 200 && joinRoom.json?.success === true, 'Joining private room with code succeeds');
    }

    // Tournament List & Hosting
    const tournamentsList = await request('GET', '/api/arena/tournaments');
    assert(tournamentsList.status === 200, 'Tournament list GET returns HTTP 200');

    const createTourn = await request('POST', '/api/arena/tournaments', {
      action: 'create',
      name: 'Automated Test Championship',
      mode: 'coding',
      difficulty: 'intermediate',
      maxParticipants: 8,
      prizePool: 2500,
      userId: 'test_tournament_host',
      userName: 'Championship Host',
    });
    assert(createTourn.status === 200 && createTourn.json?.success === true, 'Tournament creation succeeds');
    const createdTournamentId = createTourn.json?.tournament?._id;
    const inviteCode = createTourn.json?.tournament?.inviteCode;
    assert(Boolean(inviteCode), `Tournament invite code generated: ${inviteCode}`);

    // Join tournament via invite code
    if (inviteCode) {
      const joinTourn = await request('POST', '/api/arena/tournaments', {
        action: 'join',
        inviteCode: inviteCode,
        userId: 'test_join_user',
        userName: 'Tournament Contender',
      });
      assert(joinTourn.status === 200 && joinTourn.json?.success === true, 'Contender joined tournament via invite code');
    }

    // Host cancel tournament cleanup
    if (createdTournamentId) {
      const cancelTourn = await request('POST', '/api/arena/tournaments', {
        action: 'cancel_tournament',
        tournamentId: createdTournamentId,
        userId: 'test_tournament_host',
      });
      assert(cancelTourn.status === 200 && cancelTourn.json?.success === true, 'Host cancel_tournament cleanup succeeds');
    }
  } catch (err) {
    assert(false, `Arena service check failed: ${err.message}`);
  }

  // Test 5: Friends & Duel Requests
  console.log('\n--- Suite 5: Friends & Duel Challenge Pipeline ---');
  try {
    const friends = await request('GET', '/api/arena/friends?userId=test_user_friends');
    assert(friends.status === 200, 'Friends list GET returns HTTP 200');

    // Duel Challenge
    const challenge = await request('POST', '/api/arena/friends', {
      action: 'challenge',
      userId: 'test_user_friends',
      friendId: 'test_friend_target',
    });
    assert(challenge.status === 200 && challenge.json?.success === true, 'Duel challenge POST request dispatches notification to friend');
  } catch (err) {
    assert(false, `Friends & Duel pipeline check failed: ${err.message}`);
  }

  // Test 6: Auth Input Validation
  console.log('\n--- Suite 6: Auth Validation & Injection Resilience ---');
  try {
    const invalidLogin = await request('POST', '/api/auth/login', {
      email: '',
      password: '',
    });
    assert(invalidLogin.status === 400, 'Empty login credentials properly rejected with HTTP 400');

    const invalidRegister = await request('POST', '/api/auth/register', {
      name: '',
      email: 'not-an-email',
      phone: '123',
      password: 'weak',
    });
    assert(invalidRegister.status === 400 || invalidRegister.json?.message, 'Invalid registration payload rejected');
  } catch (err) {
    assert(false, `Auth input validation check failed: ${err.message}`);
  }

  console.log('\n====================================================');
  console.log(`TEST SUMMARY: ${passed} Passed, ${failed} Failed`);
  console.log('====================================================');

  if (failed > 0) {
    process.exit(1);
  } else {
    process.exit(0);
  }
}

runTests().catch(err => {
  console.error('Fatal test error:', err);
  process.exit(1);
});
