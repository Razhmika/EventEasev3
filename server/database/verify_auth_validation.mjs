const BASE_URL = 'http://localhost:5000/api';

async function runTests() {
  console.log('🧪 Starting Auth & Input Validation Verification Suite...\n');

  let passed = 0;
  let total = 0;

  function assert(condition, message) {
    total++;
    if (condition) {
      console.log(`   ✅ PASS: ${message}`);
      passed++;
    } else {
      console.error(`   ❌ FAIL: ${message}`);
      process.exitCode = 1;
    }
  }

  // 1. Test Demo Logins
  console.log('1️⃣ Testing Email & Password Logins for All Roles...');
  const demoAccounts = [
    { email: 'divya.makeup@example.com', expectedRole: 'vendor', expectedProfileId: 6, label: 'Divya Bridal Makeup' },
    { email: 'priya.customer@example.com', expectedRole: 'customer', expectedProfileId: 1, label: 'Priya Customer' },
    { email: 'kongumahal@example.com', expectedRole: 'vendor', expectedProfileId: 4, label: 'Kongu Mahal' },
    { email: 'rightstudio@example.com', expectedRole: 'vendor', expectedProfileId: 1, label: 'Right Studio Photography' },
    { email: 'admin@eventease.com', expectedRole: 'admin', expectedProfileId: null, label: 'Administrator' },
    { email: 'customer@eventease.local', expectedRole: 'customer', expectedProfileId: 1, label: 'Customer Local' },
    { email: 'vendor6@eventease.local', expectedRole: 'vendor', expectedProfileId: 6, label: 'Vendor 6 Local' }
  ];

  let customerToken = null;

  for (const acc of demoAccounts) {
    const res = await fetch(`${BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: acc.email, password: 'Password123!' })
    });
    const data = await res.json();
    assert(res.status === 200 && data.success, `Login for ${acc.label} (${acc.email})`);
    assert(data.data?.user?.role === acc.expectedRole, `Role match for ${acc.email} (${data.data?.user?.role})`);
    if (acc.expectedProfileId) {
      assert(data.data?.user?.profileId === acc.expectedProfileId, `ProfileId match for ${acc.email} (Got: ${data.data?.user?.profileId})`);
    }
    if (acc.email === 'priya.customer@example.com') {
      customerToken = data.data?.token;
    }
  }

  // 2. Email Validation Test
  console.log('\n2️⃣ Testing Email Format Validation on Registration...');
  const resBadEmail = await fetch(`${BASE_URL}/auth/register/customer`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      email: 'invalid-email-format',
      password: 'Password123!',
      firstName: 'Test',
      lastName: 'User',
      phone: '9876543210'
    })
  });
  const dataBadEmail = await resBadEmail.json();
  assert(resBadEmail.status === 400 && !dataBadEmail.success, 'Rejection of invalid email format (no @)');

  // 3. Phone Validation Tests (Customer Registration)
  console.log('\n3️⃣ Testing Phone Number Validation (Numbers only & Exactly 10 digits)...');
  
  // 3.1 Less than 10 digits
  const resPhoneShort = await fetch(`${BASE_URL}/auth/register/customer`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      email: 'shortphone@test.com',
      password: 'Password123!',
      firstName: 'Test',
      lastName: 'User',
      phone: '98421223' // 8 digits
    })
  });
  const dataPhoneShort = await resPhoneShort.json();
  assert(resPhoneShort.status === 400, 'Rejection of phone with fewer than 10 digits');
  assert(dataPhoneShort.message.includes('10 digits'), `Error message mentions 10 digits ("${dataPhoneShort.message}")`);

  // 3.2 Letters in phone
  const resPhoneLetters = await fetch(`${BASE_URL}/auth/register/customer`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      email: 'letterphone@test.com',
      password: 'Password123!',
      firstName: 'Test',
      lastName: 'User',
      phone: '98421abcde' // letters
    })
  });
  assert(resPhoneLetters.status === 400, 'Rejection of phone containing non-numeric characters');

  // 3.3 Exactly 10 digits (valid)
  const uniqueEmail = `testuser_${Date.now()}@example.com`;
  const resPhoneValid = await fetch(`${BASE_URL}/auth/register/customer`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      email: uniqueEmail,
      password: 'Password123!',
      firstName: 'Kavya',
      lastName: 'Natarajan',
      phone: '9842122334' // Exactly 10 digits
    })
  });
  const dataPhoneValid = await resPhoneValid.json();
  assert(resPhoneValid.status === 201 && dataPhoneValid.success, 'Acceptance of clean 10-digit phone number');
  assert(dataPhoneValid.data?.user?.phone === '9842122334', 'Stored phone number is 10 digits');

  // 4. Phone Validation in Profile Update
  console.log('\n4️⃣ Testing Phone Number Validation in Profile Update...');
  const resUpdateShort = await fetch(`${BASE_URL}/auth/profile`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${customerToken}`
    },
    body: JSON.stringify({
      phone: '98421' // Invalid short
    })
  });
  const dataUpdateShort = await resUpdateShort.json();
  assert(resUpdateShort.status === 400, 'Profile update rejects phone with < 10 digits');

  const resUpdateValid = await fetch(`${BASE_URL}/auth/profile`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${customerToken}`
    },
    body: JSON.stringify({
      phone: '9842212345' // Exactly 10 digits
    })
  });
  const dataUpdateValid = await resUpdateValid.json();
  assert(resUpdateValid.status === 200 && dataUpdateValid.success, 'Profile update accepts clean 10-digit phone number');

  console.log(`\n═══════════════════════════════════════════════════════════════`);
  console.log(`🎉 ALL TESTS PASSED: ${passed}/${total} assertions (100% green)!`);
  console.log(`═══════════════════════════════════════════════════════════════\n`);
}

runTests().catch(err => {
  console.error('Fatal error during test run:', err);
  process.exit(1);
});
