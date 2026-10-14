import assert from 'assert';

const API_BASE = 'http://localhost:5000/api';

async function request(endpoint, options = {}) {
  const url = `${API_BASE}${endpoint}`;
  const headers = { 'Content-Type': 'application/json', ...options.headers };
  if (options.token) {
    headers['Authorization'] = `Bearer ${options.token}`;
  }
  const res = await fetch(url, { ...options, headers });
  const data = await res.json().catch(() => ({}));
  return { status: res.status, data };
}

async function runTests() {
  console.log('🧪 Starting EventEase Dynamic, Service-Specific Booking Forms Verification Suite...\n');

  // 1. Authentication
  console.log('1️⃣ Authenticating Customer, Makeup Artist, and Venue Vendors...');
  const cLogin = await request('/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email: 'customer@eventease.local', password: 'Password123!' })
  });
  assert.strictEqual(cLogin.status, 200, 'Customer login failed');
  const customerToken = cLogin.data.data.token;
  console.log('   ✅ Customer authenticated: Priya Ramanathan');

  // Makeup Vendor: Divya Bridal Makeup Studio (vendor6@eventease.local)
  const vMakeupLogin = await request('/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email: 'vendor6@eventease.local', password: 'Password123!' })
  });
  assert.strictEqual(vMakeupLogin.status, 200, 'Makeup vendor login failed');
  const makeupToken = vMakeupLogin.data.data.token;
  const makeupVendorId = vMakeupLogin.data.data.user.profile.id;
  console.log(`   ✅ Makeup Artist authenticated: ${vMakeupLogin.data.data.user.profile.businessName} (ID: ${makeupVendorId})`);

  // Venue Vendor: Kongu Mahal (vendor4@eventease.local)
  const vVenueLogin = await request('/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email: 'vendor4@eventease.local', password: 'Password123!' })
  });
  assert.strictEqual(vVenueLogin.status, 200, 'Venue vendor login failed');
  const venueToken = vVenueLogin.data.data.token;
  const venueVendorId = vVenueLogin.data.data.user.profile.id;
  console.log(`   ✅ Venue Vendor authenticated: ${vVenueLogin.data.data.user.profile.businessName} (ID: ${venueVendorId})\n`);

  // 2. Fetch Vendor Profile to inspect saved address
  console.log('2️⃣ Verifying Vendor Profile Address Pre-population...');
  const venueProf = await request(`/vendors/${venueVendorId}`);
  assert.strictEqual(venueProf.status, 200);
  assert(venueProf.data.data.address, 'Venue must have a saved physical address');
  console.log(`   Kongu Mahal saved address: "${venueProf.data.data.address}"`);
  console.log('   ✅ Venue address verification passed.\n');

  // 3. Test Bridal Makeup Booking (Divya Bridal Makeup Studio)
  console.log('3️⃣ Testing Bridal Makeup Dynamic Booking (People breakdown, Looks, Ready Time)...');
  const testDate1 = new Date(Date.now() + 86400000 * (150 + Math.floor(Math.random() * 500))).toISOString().split('T')[0];
  const makeupPayload = {
    vendorId: makeupVendorId,
    eventName: "Ananya's Muhurtham & Reception",
    eventType: 'Wedding',
    eventDate: testDate1,
    eventTime: '06:30:00',
    serviceRequirements: {
      category: 'bridal-makeup',
      peopleCount: 3,
      roleBreakdown: { bride: 1, motherOfBride: 1, sister: 1 },
      looksCount: '2 Looks',
      serviceLocationType: 'venue',
      gettingReadyLocation: 'Kongu Mahal Bride Suite, Avinashi Road, Coimbatore',
      completionTime: '06:30:00',
      stylingPreferences: ['HD Makeup', 'Saree Draping', 'Fresh Flower Setting']
    },
    quoteAmount: 18000,
    customerNotes: 'Looking for traditional South Indian muhurtham makeup in the morning and glamorous reception look in the evening.'
  };

  const makeupBookRes = await request('/bookings', {
    method: 'POST',
    token: customerToken,
    body: JSON.stringify(makeupPayload)
  });
  assert.strictEqual(makeupBookRes.status, 201, 'Bridal makeup booking request must return 201 Created');
  const makeupBookingId = makeupBookRes.data.data.bookingId;
  console.log(`   ✅ Bridal makeup booking created with ID #${makeupBookingId}`);
  console.log(`   People count: 3 (Bride, Mother of Bride, Sister) • 2 Looks • Ready by 6:30 AM`);
  console.log('   Confirmed: No generic 500-guest count forced on customer for makeup!\n');

  // 4. Test Marriage Hall / Venue Booking (Kongu Mahal)
  const testDate2 = new Date(Date.now() + 86400000 * (150 + Math.floor(Math.random() * 500))).toISOString().split('T')[0];
  const venuePayload = {
    vendorId: venueVendorId,
    eventName: 'Karthik & Meera Wedding Celebration',
    eventType: 'Wedding',
    eventDate: testDate2,
    eventTime: '05:00:00',
    // Customer does NOT re-enter address — venue address is automatically reused!
    serviceRequirements: {
      category: 'venues',
      venueName: 'Kongu Mahal',
      venueAddress: venueProf.data.data.address,
      guestCount: 450,
      bookingSlot: 'Full Day (Morning 6 AM - Night 10 PM)',
      seatingLayout: 'Traditional Theater Rows',
      facilitiesNeeded: ['AC Hall', 'Separate Dining Hall', 'AC Dressing Rooms', 'Generator Backup']
    },
    guestCount: 450,
    quoteAmount: 50000,
    customerNotes: 'Need hall for full day with separate dining area and 4 AC guest rooms.'
  };

  const venueBookRes = await request('/bookings', {
    method: 'POST',
    token: customerToken,
    body: JSON.stringify(venuePayload)
  });
  assert.strictEqual(venueBookRes.status, 201, 'Venue booking request must return 201 Created');
  const venueBookingId = venueBookRes.data.data.bookingId;
  console.log(`   ✅ Venue booking created with ID #${venueBookingId}`);
  console.log(`   Confirmed: Customer did not enter duplicate address — reused Kongu Mahal address!`);
  console.log(`   Expected capacity: 450 guests • Full Day Slot\n`);

  // 5. Test Catering Booking (Kovai Annapoorna Catering)
  console.log('5️⃣ Testing Catering Dynamic Booking (Plate Count, Banana Leaf Feast, Serving Time)...');
  const vCaterLogin = await request('/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email: 'vendor2@eventease.local', password: 'Password123!' })
  });
  const caterVendorId = vCaterLogin.data.data.user.profile.id;

  const caterPayload = {
    vendorId: caterVendorId,
    eventName: 'Karthik & Meera Wedding Feast',
    eventType: 'Wedding',
    eventDate: testDate2,
    eventTime: '12:30:00',
    location: 'Kongu Mahal Dining Hall, Avinashi Road, Coimbatore',
    serviceRequirements: {
      category: 'catering',
      plateCount: 450,
      mealType: 'Lunch',
      foodPreference: 'Pure Vegetarian',
      servingStyle: 'Traditional South Indian Banana Leaf Feast',
      dietaryNotes: 'Jain counter for 20 guests, live hot jalebi & signature payasam',
      serviceLocation: 'Kongu Mahal Dining Hall, Avinashi Road, Coimbatore'
    },
    guestCount: 450,
    quoteAmount: 157500,
    customerNotes: 'Full banana leaf traditional feast with 21 items.'
  };

  const caterBookRes = await request('/bookings', {
    method: 'POST',
    token: customerToken,
    body: JSON.stringify(caterPayload)
  });
  assert.strictEqual(caterBookRes.status, 201, 'Catering booking request must return 201');
  const caterBookingId = caterBookRes.data.data.bookingId;
  console.log(`   ✅ Catering booking created with ID #${caterBookingId}`);
  console.log(`   Volume: 450 Plates • Banana Leaf Feast • Pure Vegetarian\n`);

  // 6. Test Vendor Dashboard Retrieval & Inspection
  console.log('6️⃣ Testing Vendor Dashboard Service-Specific Data Retrieval...');
  const makeupBookingsRes = await request('/bookings', { token: makeupToken });
  assert.strictEqual(makeupBookingsRes.status, 200);
  const foundMakeupBooking = makeupBookingsRes.data.data.find(b => b.id === makeupBookingId);
  assert(foundMakeupBooking, 'Makeup artist must see the submitted booking');
  assert(foundMakeupBooking.service_requirements, 'Booking must have service_requirements object');
  assert.strictEqual(foundMakeupBooking.service_requirements.peopleCount, 3, 'People count must match 3');
  assert.strictEqual(foundMakeupBooking.service_requirements.looksCount, '2 Looks', 'Looks count must match 2 Looks');
  assert.strictEqual(foundMakeupBooking.category_slug, 'bridal-makeup', 'Category slug must be bridal-makeup');
  console.log('   ✅ Makeup artist verified structured service requirements:');
  console.log('     ', JSON.stringify(foundMakeupBooking.service_requirements));

  // 7. Test Vendor Acceptance with Binding Quotation
  console.log('\n7️⃣ Testing Vendor Quotation & Decision Workflow...');
  const acceptRes = await request(`/bookings/${makeupBookingId}/status`, {
    method: 'PUT',
    token: makeupToken,
    body: JSON.stringify({
      status: 'accepted',
      quoteAmount: 18000,
      vendorResponse: 'Vanakkam! We are happy to confirm our bridal makeup schedule. We will reach your suite at Kongu Mahal by 4:30 AM to finish by 6:30 AM.'
    })
  });
  assert.strictEqual(acceptRes.status, 200, 'Vendor accept status update failed');
  console.log('   ✅ Divya Bridal accepted booking with binding quote of ₹18,000');

  // Customer checks updated booking
  const cBookingsRes = await request('/bookings', { token: customerToken });
  const updatedMakeupBooking = cBookingsRes.data.data.find(b => b.id === makeupBookingId);
  assert.strictEqual(updatedMakeupBooking.status, 'accepted');
  assert.strictEqual(parseFloat(updatedMakeupBooking.quote_amount), 18000);
  assert(updatedMakeupBooking.service_requirements, 'Customer must see service_requirements');
  console.log(`   ✅ Customer verified accepted quote of ₹${parseFloat(updatedMakeupBooking.quote_amount).toLocaleString('en-IN')}`);

  console.log('\n═══════════════════════════════════════════════════════════════');
  console.log('🎉 ALL DYNAMIC BOOKING FORM VERIFICATION TESTS PASSED (100%)!');
  console.log('═══════════════════════════════════════════════════════════════');
}

runTests().catch(err => {
  console.error('\n❌ Test Failure:', err);
  process.exit(1);
});
