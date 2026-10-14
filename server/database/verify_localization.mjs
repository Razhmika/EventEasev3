import assert from 'assert';

const BASE_URL = 'http://localhost:5000/api';

async function request(endpoint, options = {}) {
  const url = `${BASE_URL}${endpoint}`;
  const res = await fetch(url, {
    headers: {
      'Content-Type': 'application/json',
      ...(options.token ? { Authorization: `Bearer ${options.token}` } : {})
    },
    ...options
  });
  const data = await res.json();
  return { status: res.status, ok: res.ok, data };
}

async function runTests() {
  console.log('🧪 Starting EventEase Localization & Marketplace Test Suite...\n');

  // Test 1: Categories
  console.log('1️⃣ Testing Service Categories...');
  const catRes = await request('/categories');
  assert.strictEqual(catRes.status, 200, 'Categories endpoint must return 200');
  assert.strictEqual(catRes.data.success, true);
  console.log(`   Found ${catRes.data.data.length} categories:`, catRes.data.data.map(c => c.name).join(', '));
  assert(catRes.data.data.length >= 6, 'Must have at least 6 localized categories');
  const catSlugs = catRes.data.data.map(c => c.slug);
  assert(catSlugs.includes('catering'), 'Must include catering category');
  assert(catSlugs.includes('photography'), 'Must include photography category');
  assert(catSlugs.includes('venues'), 'Must include venues category');
  assert(catSlugs.includes('decor-floral'), 'Must include decor-floral category');
  console.log('   ✅ Categories verified successfully.\n');

  // Test 2: Vendor Discovery & Listings
  console.log('2️⃣ Testing Localized Vendor Directory & Starting Prices...');
  const vRes = await request('/vendors');
  assert.strictEqual(vRes.status, 200);
  const vendors = vRes.data.data.vendors;
  console.log(`   Total vendors found: ${vendors.length}`);
  assert.strictEqual(vendors.length, 12, 'Must have exactly 12 seeded vendors');

  // Verify all 12 localized vendor names
  const expectedVendorNames = [
    'Right Studio Photography',
    'Kovai Annapoorna Catering Services',
    'Sri Murugan Wedding Decorations',
    'Kongu Mahal',
    'Kovai Event Planners',
    'Divya Bridal Makeup Studio',
    'Beatbox DJ and Sound Services',
    'Pixel Moments Photography',
    'Sri Lakshmi Catering Services',
    'Malar Wedding Decorators',
    'Happy Moments Event Decor',
    'Royal Stage Decorations'
  ];

  const actualNames = vendors.map(v => v.business_name);
  for (const exp of expectedVendorNames) {
    assert(actualNames.includes(exp), `Vendor list must include "${exp}"`);
  }
  console.log('   ✅ All 12 localized Indian vendors verified in directory.');

  // Verify cities
  const cities = [...new Set(vendors.map(v => v.city))];
  console.log(`   Vendor cities: ${cities.join(', ')}`);
  assert(cities.includes('Coimbatore'), 'Must include Coimbatore');
  assert(cities.includes('Tiruppur'), 'Must include Tiruppur');
  assert(cities.includes('Erode'), 'Must include Erode');
  assert(cities.includes('Salem'), 'Must include Salem');
  console.log('   ✅ Cities verified.\n');

  // Test 3: Search Queries
  console.log('3️⃣ Testing Search Filtering Across Localized Keywords...');
  
  // 3a: "wedding"
  const sWed = await request('/vendors?search=wedding');
  console.log(`   Search "wedding": ${sWed.data.data.vendors.length} vendors matched`);
  assert(sWed.data.data.vendors.length > 0, 'Must match vendors for "wedding"');

  // 3b: "catering"
  const sCat = await request('/vendors?search=catering');
  console.log(`   Search "catering": ${sCat.data.data.vendors.map(v => v.business_name).join(', ')}`);
  assert(sCat.data.data.vendors.some(v => v.business_name.includes('Catering')), 'Must match catering vendors');

  // 3c: "photography"
  const sPhoto = await request('/vendors?search=photography');
  console.log(`   Search "photography": ${sPhoto.data.data.vendors.map(v => v.business_name).join(', ')}`);
  assert(sPhoto.data.data.vendors.some(v => v.business_name.includes('Photography')), 'Must match photography vendors');

  // 3d: "decoration"
  const sDecor = await request('/vendors?search=decoration');
  console.log(`   Search "decoration": ${sDecor.data.data.vendors.map(v => v.business_name).join(', ')}`);
  assert(sDecor.data.data.vendors.some(v => v.business_name.includes('Decoration')), 'Must match decoration vendors');

  // 3e: "marriage hall"
  const sHall = await request('/vendors?search=marriage+hall');
  console.log(`   Search "marriage hall": ${sHall.data.data.vendors.map(v => v.business_name).join(', ')}`);
  assert(sHall.data.data.vendors.some(v => v.business_name.includes('Kongu Mahal')), 'Must match Kongu Mahal');

  // 3f: "Coimbatore"
  const sCbe = await request('/vendors?city=Coimbatore');
  console.log(`   Filter city=Coimbatore: ${sCbe.data.data.vendors.length} vendors`);
  assert.strictEqual(sCbe.data.data.vendors.length, 9, 'Must have 9 vendors in Coimbatore');

  // 3g: "Tiruppur"
  const sTup = await request('/vendors?city=Tiruppur');
  console.log(`   Filter city=Tiruppur: ${sTup.data.data.vendors.map(v => v.business_name).join(', ')}`);
  assert(sTup.data.data.vendors.some(v => v.business_name.includes('Pixel Moments')), 'Must match Pixel Moments in Tiruppur');

  // 3h: "Erode"
  const sErd = await request('/vendors?city=Erode');
  console.log(`   Filter city=Erode: ${sErd.data.data.vendors.map(v => v.business_name).join(', ')}`);
  assert(sErd.data.data.vendors.some(v => v.business_name.includes('Sri Lakshmi')), 'Must match Sri Lakshmi in Erode');

  // 3i: "Salem"
  const sSlm = await request('/vendors?city=Salem');
  console.log(`   Filter city=Salem: ${sSlm.data.data.vendors.map(v => v.business_name).join(', ')}`);
  assert(sSlm.data.data.vendors.some(v => v.business_name.includes('Royal Stage')), 'Must match Royal Stage in Salem');
  console.log('   ✅ Search and city filters verified.\n');

  // Test 4: Vendor Profile Details & Portfolio
  console.log('4️⃣ Testing Vendor Profile, Services, and Portfolio Captions...');
  const rightStudio = vendors.find(v => v.business_name === 'Right Studio Photography');
  assert(rightStudio, 'Right Studio Photography must exist');
  const profRes = await request(`/vendors/${rightStudio.id}`);
  assert.strictEqual(profRes.status, 200);
  const vendorDetail = profRes.data.data;
  console.log(`   Vendor: ${vendorDetail.business_name} (${vendorDetail.city})`);
  console.log(`   Bio: ${vendorDetail.bio}`);
  console.log(`   Services count: ${vendorDetail.services?.length}`);
  console.log(`   Services:`, vendorDetail.services?.map(s => `${s.title} (₹${s.price}/${s.pricing_unit})`).join(', '));
  console.log(`   Portfolio captions:`, vendorDetail.portfolio?.map(p => p.caption).join(', '));

  assert(vendorDetail.services.some(s => s.title === 'Wedding Photography'), 'Must have Wedding Photography service');
  assert(vendorDetail.services.some(s => s.title === 'Candid Photography'), 'Must have Candid Photography service');
  assert(vendorDetail.portfolio.some(p => p.caption === 'Traditional Wedding Photography'), 'Must have Traditional Wedding Photography caption');
  console.log('   ✅ Vendor profile and portfolio verified.\n');

  // Test 5: Authentication (Customer, Vendor, Admin)
  console.log('5️⃣ Testing Authentication with Localized Accounts...');
  const cLogin = await request('/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email: 'customer@eventease.local', password: 'Password123!' })
  });
  assert.strictEqual(cLogin.status, 200, 'Customer login must succeed');
  assert.strictEqual(cLogin.data.data.user.role, 'customer');
  const customerToken = cLogin.data.data.token;
  console.log(`   Customer authenticated: ${cLogin.data.data.user.firstName} ${cLogin.data.data.user.lastName}`);

  const vLogin = await request('/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email: 'vendor1@eventease.local', password: 'Password123!' })
  });
  assert.strictEqual(vLogin.status, 200, 'Vendor login must succeed');
  assert.strictEqual(vLogin.data.data.user.role, 'vendor');
  const vendorToken = vLogin.data.data.token;
  console.log(`   Vendor authenticated: ${vLogin.data.data.user.profile.businessName}`);

  const aLogin = await request('/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email: 'admin@eventease.local', password: 'Password123!' })
  });
  assert.strictEqual(aLogin.status, 200, 'Admin login must succeed');
  assert.strictEqual(aLogin.data.data.user.role, 'admin');
  console.log(`   Admin authenticated: ${aLogin.data.data.user.firstName} ${aLogin.data.data.user.lastName}`);
  console.log('   ✅ All roles authenticated successfully.\n');

  // Test 6: Direct Booking Request Workflow
  console.log('6️⃣ Testing Direct Booking Request & Acceptance Workflow...');
  const bookingPayload = {
    vendorId: rightStudio.id,
    serviceId: vendorDetail.services[0].id,
    categoryId: vendorDetail.services[0].category_id,
    eventName: "Divya's Engagement Ceremony",
    eventType: 'Engagement',
    eventDate: '2026-12-15',
    eventTime: '10:00:00',
    location: 'Residency Towers, Avinashi Road',
    city: 'Coimbatore',
    guestCount: 150,
    estimatedBudget: 25000,
    quoteAmount: 25000,
    customerNotes: 'Looking for traditional photo and video coverage for family engagement ceremony.'
  };

  const bookRes = await request('/bookings', {
    method: 'POST',
    token: customerToken,
    body: JSON.stringify(bookingPayload)
  });
  assert.strictEqual(bookRes.status, 201, 'Direct booking request must return 201');
  const newBookingId = bookRes.data.data.bookingId;
  console.log(`   Direct booking created with ID #${newBookingId} for "${bookingPayload.eventName}"`);

  // Vendor 1 reviews bookings
  const vBookings = await request('/bookings/my-bookings', { token: vendorToken });
  assert.strictEqual(vBookings.status, 200);
  const foundBooking = vBookings.data.data.find(b => b.id === newBookingId);
  assert(foundBooking, 'Vendor must see the newly submitted booking request');
  assert.strictEqual(foundBooking.status, 'pending');
  console.log(`   Vendor verified pending booking #${newBookingId} for "${foundBooking.event_title}"`);

  // Vendor accepts booking with custom quote in INR (₹28,000)
  const acceptRes = await request(`/bookings/${newBookingId}/status`, {
    method: 'PUT',
    token: vendorToken,
    body: JSON.stringify({
      status: 'accepted',
      quoteAmount: 28000,
      vendorResponse: 'Vanakkam! We are happy to confirm our photography coverage for your engagement. We will bring our dual camera crew.'
    })
  });
  assert.strictEqual(acceptRes.status, 200, 'Vendor accept status update must succeed');
  console.log('   Vendor accepted booking with custom quote of ₹28,000');

  // Customer checks bookings
  const cBookings = await request('/bookings/my-bookings', { token: customerToken });
  const updatedBooking = cBookings.data.data.find(b => b.id === newBookingId);
  assert.strictEqual(updatedBooking.status, 'accepted');
  assert.strictEqual(parseFloat(updatedBooking.quote_amount), 28000);
  console.log(`   Customer verified booking #${newBookingId} is accepted with quote ₹${parseFloat(updatedBooking.quote_amount).toLocaleString('en-IN')}`);
  console.log('   ✅ Direct booking and vendor decision workflow verified.\n');

  // Test 7: AI Event Planner
  console.log('7️⃣ Testing AI Event Planning Studio (Local Tamil Nadu Planner)...');
  const planRes = await request('/ai/plan', {
    method: 'POST',
    token: customerToken,
    body: JSON.stringify({
      eventType: 'Traditional Tamil Wedding',
      guestCount: 300,
      totalBudget: 350000,
      location: 'Coimbatore, Tamil Nadu',
      themeStyle: 'Traditional Tamil Wedding & Floral Decor',
      notes: 'South Indian banana leaf feast, wedding stage fresh flower decor, and candid photography.'
    })
  });
  assert.strictEqual(planRes.status, 200);
  const plan = planRes.data.data;
  console.log(`   Plan summary: ${plan.summary}`);
  assert(!plan.summary.includes('$'), 'Plan summary must not contain dollar signs');
  assert(plan.summary.includes('₹'), 'Plan summary must contain rupee symbol ₹');
  console.log(`   Budget categories:`, plan.budgetBreakdown?.map(b => `${b.category}: ₹${b.amount}`).join(' | '));
  console.log('   ✅ Localized AI Planner verified.\n');

  console.log('═══════════════════════════════════════════════════════════════');
  console.log('🎉 ALL 7 TEST SUITES PASSED! LOCALIZATION VERIFIED 100%!');
  console.log('═══════════════════════════════════════════════════════════════');
}

runTests().catch(err => {
  console.error('\n❌ Test Failure:', err);
  process.exit(1);
});
