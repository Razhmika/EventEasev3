import pool from '../config/db.js';

/**
 * Rule-Based Multi-Criteria Recommendation Engine
 * Evaluates candidate vendors against a specific event's requirements
 */
export async function calculateVendorRecommendations(eventId) {
  // 1. Fetch Event Details and Requirements
  const [eventRows] = await pool.execute(
    `SELECT id, customer_id, title, event_type, DATE_FORMAT(event_date, '%Y-%m-%d') as event_date, location, city, guest_count, total_budget
     FROM events WHERE id = ?`,
    [eventId]
  );

  if (eventRows.length === 0) {
    throw new Error('Event not found.');
  }

  const event = eventRows[0];

  const [reqRows] = await pool.execute(
    `SELECT er.id, er.category_id, er.allocated_budget, sc.name as category_name, sc.slug as category_slug
     FROM event_requirements er
     JOIN service_categories sc ON er.category_id = sc.id
     WHERE er.event_id = ?`,
    [eventId]
  );

  const requestedCategoryIds = reqRows.map((r) => r.category_id);
  const categoryBudgetMap = {};
  reqRows.forEach((r) => {
    categoryBudgetMap[r.category_id] = {
      name: r.category_name,
      allocatedBudget: r.allocated_budget ? parseFloat(r.allocated_budget) : null
    };
  });

  // 2. Fetch all verified vendors with their services, availability, and ratings
  const [vendorRows] = await pool.execute(
    `SELECT 
      vp.id,
      vp.business_name,
      vp.bio,
      vp.city,
      vp.service_radius_km,
      vp.starting_price,
      vp.average_rating,
      vp.review_count,
      vp.avatar_url,
      vp.banner_url
     FROM vendor_profiles vp
     JOIN users u ON vp.user_id = u.id
     WHERE vp.verification_status = 'verified' AND u.is_active = TRUE`
  );

  if (vendorRows.length === 0) {
    return [];
  }

  // Fetch all active services for these vendors
  const [serviceRows] = await pool.execute(
    `SELECT vs.vendor_id, vs.category_id, vs.title, vs.price, sc.name as category_name, sc.slug as category_slug
     FROM vendor_services vs
     JOIN service_categories sc ON vs.category_id = sc.id
     WHERE vs.is_active = TRUE`
  );

  // Group services by vendor
  const vendorServicesMap = {};
  serviceRows.forEach((s) => {
    if (!vendorServicesMap[s.vendor_id]) {
      vendorServicesMap[s.vendor_id] = [];
    }
    vendorServicesMap[s.vendor_id].push(s);
  });

  // Check vendor availability on the event date
  const [availabilityRows] = await pool.execute(
    `SELECT vendor_id, status FROM vendor_availability WHERE date = ?`,
    [event.event_date]
  );
  const blockedVendorSet = new Set(
    availabilityRows.filter((a) => a.status === 'blocked' || a.status === 'booked').map((a) => a.vendor_id)
  );

  // Check existing bookings for this event to avoid duplicate recommendations
  const [existingBookings] = await pool.execute(
    `SELECT vendor_id, status FROM bookings WHERE event_id = ?`,
    [eventId]
  );
  const bookedVendorMap = {};
  existingBookings.forEach((b) => {
    bookedVendorMap[b.vendor_id] = b.status;
  });

  // 3. Compute Rule-Based Scoring for Each Vendor
  const evaluatedVendors = [];

  for (const vendor of vendorRows) {
    const services = vendorServicesMap[vendor.id] || [];
    const vendorCategoryIds = [...new Set(services.map((s) => s.category_id))];

    // --- RULE 1: CATEGORY COMPATIBILITY (35 Points Max) ---
    // If event has requested categories, vendor MUST offer at least one requested category
    let matchedCategories = [];
    if (requestedCategoryIds.length > 0) {
      matchedCategories = vendorCategoryIds.filter((catId) => requestedCategoryIds.includes(catId));
      if (matchedCategories.length === 0) {
        // Exclude vendor completely if they don't fulfill any requested service
        continue;
      }
    } else {
      matchedCategories = vendorCategoryIds;
    }

    const categoryScore = 35; // Guaranteed match on at least one required category
    const matchedCategoryNames = matchedCategories.map((cId) => categoryBudgetMap[cId]?.name || 'Event Service');

    // --- RULE 2: BUDGET ALIGNMENT (25 Points Max) ---
    let budgetScore = 0;
    let budgetReason = '';
    const relevantServices = services.filter((s) => matchedCategories.includes(s.category_id));
    const lowestPrice = relevantServices.length > 0 
      ? Math.min(...relevantServices.map((s) => parseFloat(s.price))) 
      : parseFloat(vendor.starting_price);

    // Find the allocated budget for the matched category
    const primaryMatchedCatId = matchedCategories[0];
    const allocatedBudget = categoryBudgetMap[primaryMatchedCatId]?.allocatedBudget || (parseFloat(event.total_budget) * 0.25);

    if (lowestPrice <= allocatedBudget) {
      // Comfortably fits within allocated budget
      budgetScore = 25;
      budgetReason = `Fits within your ${categoryBudgetMap[primaryMatchedCatId]?.name || 'service'} budget (₹${lowestPrice.toLocaleString('en-IN')} vs ₹${allocatedBudget.toLocaleString('en-IN')} allocated).`;
    } else if (lowestPrice <= allocatedBudget * 1.15) {
      // Slightly higher (within 15% tolerance)
      budgetScore = 18;
      budgetReason = `Starting service (₹${lowestPrice.toLocaleString('en-IN')}) slightly exceeds allocated budget (₹${allocatedBudget.toLocaleString('en-IN')}) by <15%.`;
    } else if (lowestPrice <= allocatedBudget * 1.30) {
      budgetScore = 10;
      budgetReason = `Service pricing (₹${lowestPrice.toLocaleString('en-IN')}) is moderately above allocated budget (₹${allocatedBudget.toLocaleString('en-IN')}).`;
    } else {
      budgetScore = 2;
      budgetReason = `Premium offering (₹${lowestPrice.toLocaleString('en-IN')}) exceeds allocated category budget (₹${allocatedBudget.toLocaleString('en-IN')}).`;
    }

    // --- RULE 3: LOCATION & COVERAGE (15 Points Max) ---
    let locationScore = 0;
    let locationReason = '';
    const eventCityNormalized = (event.city || '').toLowerCase().trim();
    const vendorCityNormalized = (vendor.city || '').toLowerCase().trim();

    if (eventCityNormalized === vendorCityNormalized) {
      locationScore = 15;
      locationReason = `Based directly in ${vendor.city}, providing immediate local coverage.`;
    } else {
      // Regional Tamil Nadu coverage
      locationScore = 11;
      locationReason = `Based in ${vendor.city} with coverage radius of ${vendor.service_radius_km} km encompassing ${event.city}.`;
    }

    // --- RULE 4: DATE AVAILABILITY (15 Points Max) ---
    let availabilityScore = 0;
    let availabilityReason = '';
    const isDateBlocked = blockedVendorSet.has(vendor.id);

    if (!isDateBlocked) {
      availabilityScore = 15;
      availabilityReason = `Open and available on your scheduled event date (${event.event_date}).`;
    } else {
      availabilityScore = 0;
      availabilityReason = `Has a potential scheduling conflict or blocked date on ${event.event_date}.`;
    }

    // --- RULE 5: RATING & TRACK RECORD (10 Points Max) ---
    const rating = parseFloat(vendor.average_rating || 0);
    let ratingScore = 0;
    if (rating >= 4.9) ratingScore = 10;
    else if (rating >= 4.7) ratingScore = 9;
    else if (rating >= 4.5) ratingScore = 8;
    else if (rating >= 4.0) ratingScore = 7;
    else ratingScore = 5;

    const ratingReason = rating > 0 
      ? `Rated ${rating.toFixed(2)} ★ with ${vendor.review_count} verified customer reviews.`
      : `Verified professional on EventEase platform.`;

    // TOTAL CALCULATED SCORE
    const totalScore = categoryScore + budgetScore + locationScore + availabilityScore + ratingScore;

    // Collect all explainable match reasons
    const matchReasons = [
      `Offers required category: ${matchedCategoryNames.join(', ')}.`,
      budgetReason,
      locationReason,
      availabilityReason,
      ratingReason
    ];

    evaluatedVendors.push({
      vendor: {
        id: vendor.id,
        businessName: vendor.business_name,
        bio: vendor.bio,
        city: vendor.city,
        serviceRadiusKm: vendor.service_radius_km,
        startingPrice: vendor.starting_price,
        averageRating: vendor.average_rating,
        reviewCount: vendor.review_count,
        avatarUrl: vendor.avatar_url,
        bannerUrl: vendor.banner_url,
        matchedCategories: matchedCategoryNames,
        services: services.map((s) => ({
          title: s.title,
          price: s.price,
          categoryName: s.category_name
        }))
      },
      matchScore: Math.min(100, Math.round(totalScore)),
      breakdown: {
        category: categoryScore,
        budget: budgetScore,
        location: locationScore,
        availability: availabilityScore,
        rating: ratingScore
      },
      matchReasons,
      existingBookingStatus: bookedVendorMap[vendor.id] || null
    });
  }

  // 4. Sort by Match Score Descending
  evaluatedVendors.sort((a, b) => b.matchScore - a.matchScore);

  return evaluatedVendors;
}
