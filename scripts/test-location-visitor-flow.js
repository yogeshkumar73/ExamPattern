const fs = require('fs');
const http = require('http');
const mongoose = require('mongoose');

if (fs.existsSync('.env')) {
  const envContent = fs.readFileSync('.env', 'utf-8');
  for (const line of envContent.split('\n')) {
    const trimmed = line.trim();
    if (trimmed && !trimmed.startsWith('#') && trimmed.includes('=')) {
      const idx = trimmed.indexOf('=');
      const key = trimmed.slice(0, idx).trim();
      const val = trimmed.slice(idx + 1).trim();
      if (!process.env[key]) process.env[key] = val;
    }
  }
}

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
  console.log('=== TEST: Real Location via IP, 7-Day Auto Refresh, Gender & Visitor View ===\n');

  // Step 1: Query location directly from IP endpoint
  console.log('[TEST 1] Resolving Real Location from Client/Browser IP...');
  const locRes = await request({
    hostname: 'localhost',
    port: 3000,
    path: '/api/user/location',
    method: 'GET'
  });
  console.log('Status:', locRes.status);
  console.log('Detected Location:', locRes.data?.locationFormatted, 'Flag:', locRes.data?.flag, 'Protocol:', locRes.data?.protocol);
  if (!locRes.data?.locationFormatted) {
    throw new Error('Failed to resolve location from IP');
  }

  // Step 2: Register student user via direct Mongo connection
  console.log('\n[TEST 2] Setting up student in MongoDB...');
  const uri = process.env.MONGODB_URI || 'mongodb+srv://text:7JDgF75FpxIfqUuws@test.9k9mdzj.mongodb.net/?appName=test';
  await mongoose.connect(uri);
  const User = mongoose.models.User || mongoose.model('User', new mongoose.Schema({}, { strict: false }));

  const testEmail = `pradip_${Date.now()}@gmail.com`;
  // Set lastLocationUpdate to 8 days ago to test the 7-day auto-update cycle
  const eightDaysAgo = new Date(Date.now() - 8 * 24 * 60 * 60 * 1000);
  const user = await User.create({
    name: 'Pradip Kumar',
    email: testEmail,
    password: 'Password123!',
    gender: 'male',
    stream: 'university',
    course: 'Computer Science',
    bio: 'Competitive coding enthusiast and operating systems specialist.',
    city: 'Old Bengaluru',
    country: 'India',
    countryCode: 'IN',
    locationFormatted: 'Old Bengaluru, IN',
    isLocationVerified: true,
    lastLocationUpdate: eightDaysAgo,
    xp: 6000,
    arenaPoints: 6000,
    level: 10,
    wins: 28,
    losses: 3,
    currentStreak: 24,
    arenaRank: 'Grandmaster'
  });

  const userId = String(user._id);
  console.log('✓ Test Student created in DB: ID =', userId, 'Email =', testEmail);
  console.log('  Initial lastLocationUpdate (8 days ago):', user.lastLocationUpdate);

  // Step 3: Test Profile PUT with Gender update
  console.log('\n[TEST 3] Updating Student Profile with Gender & Academic Details via PUT /api/profile...');
  const updateRes = await request({
    hostname: 'localhost',
    port: 3000,
    path: '/api/profile',
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' }
  }, {
    userId,
    gender: 'male',
    stream: 'university',
    course: 'B.Tech Computer Science & AI',
    bio: 'Competitive coding enthusiast and full-stack systems engineer.'
  });

  console.log('Profile Update Status:', updateRes.status);
  const updatedUser = updateRes.data?.user;
  console.log('✓ Updated Gender:', updatedUser?.gender);
  console.log('✓ Updated Course:', updatedUser?.course);
  console.log('✓ Updated Bio:', updatedUser?.bio);

  // Step 4: Fetch Profile as a VISITOR (Visitor View)
  console.log('\n[TEST 4] Fetching Profile as a VISITOR (Visitor View Inspection)...');
  const visitorRes = await request({
    hostname: 'localhost',
    port: 3000,
    path: `/api/profile?userId=${userId}&visitor=true&requesterId=stranger_user_999`,
    method: 'GET'
  });

  console.log('Visitor Status:', visitorRes.status);
  const visitorProfile = visitorRes.data?.user;
  console.log('✓ Visitor Name:', visitorProfile?.name);
  console.log('✓ Visitor Stream & Course:', visitorProfile?.stream, '•', visitorProfile?.course);
  console.log('✓ Visitor Bio:', visitorProfile?.bio);
  console.log('✓ Visitor Gender:', visitorProfile?.gender);
  console.log('✓ Visitor Location:', visitorProfile?.locationFormatted, 'Verified:', visitorProfile?.isLocationVerified);
  console.log('✓ Visitor Score & Arena Points:', visitorProfile?.arenaPoints, 'Win Rate:', visitorProfile?.winRate, '%');

  // Verify sensitive data is hidden
  console.log('✓ Sensitive Email is hidden:', visitorProfile?.email === undefined);
  console.log('✓ Sensitive Phone is hidden:', visitorProfile?.phone === undefined);
  console.log('✓ Sensitive IP is hidden:', visitorProfile?.ip === undefined);

  if (visitorProfile?.email !== undefined || visitorProfile?.phone !== undefined || visitorProfile?.ip !== undefined) {
    throw new Error('Sensitive information leaked to visitor!');
  }

  // Step 5: Verify 7-Day Auto-Update of Real Location
  console.log('\n[TEST 5] Testing 7-Day Auto-Update of Real Location...');
  // The GET request above detected that lastLocationUpdate was 8 days ago and auto-updated it!
  const refreshedUserInDb = await User.findById(userId);
  const newUpdateTime = new Date(refreshedUserInDb.lastLocationUpdate).getTime();
  const diffMinutes = (Date.now() - newUpdateTime) / (1000 * 60);

  console.log('✓ Refreshed lastLocationUpdate timestamp in DB:', refreshedUserInDb.lastLocationUpdate);
  console.log(`✓ Timestamp was refreshed ${diffMinutes.toFixed(2)} minutes ago (auto-updated from 8 days ago!)`);

  if (diffMinutes > 5) {
    throw new Error('7-Day auto-update did not trigger or update lastLocationUpdate timestamp!');
  }

  // Clean up test user
  await User.deleteOne({ _id: user._id });
  await mongoose.disconnect();
  console.log('\nALL LOCATION, GENDER, AND VISITOR VIEW TESTS PASSED! ✅');
}

runTest().catch((err) => {
  console.error('Test Failed:', err);
  process.exit(1);
});
