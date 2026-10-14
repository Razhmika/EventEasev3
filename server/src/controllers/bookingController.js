import pool from '../config/db.js';
import { sendSuccess, sendError } from '../utils/responseHandler.js';

// 1. Create a Booking Request (Customer)
export const createBooking = async (req, res) => {
  const customerId = req.user.profileId;
  const {
    eventId,
    vendorId,
    serviceId,
    categoryId,
    eventName,
    title,
    eventType,
    eventDate,
    eventTime,
    location,
    city,
    guestCount,
    estimatedBudget,
    totalBudget,
    requirementsNotes,
    quoteAmount,
    customerNotes,
    serviceRequirements
  } = req.body;

  if (!vendorId) {
    return sendError(res, 'Vendor ID is required.', 400);
  }

  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();

    // Fetch vendor profile details for intelligent location resolution
    const [vendorRows] = await conn.execute(
      `SELECT vp.id, vp.user_id, vp.business_name, vp.city, vp.address, vp.starting_price 
       FROM vendor_profiles vp WHERE vp.id = ?`,
      [vendorId]
    );
    if (vendorRows.length === 0) {
      await conn.rollback();
      return sendError(res, 'Vendor not found.', 404);
    }
    const vendorProfile = vendorRows[0];

    let actualEventId = eventId;
    let actualCategoryId = categoryId;
    let categorySlug = '';
    let eventTitle = title || eventName;
    let eventDateVal = eventDate;

    // Resolve categoryId and categorySlug
    if (serviceId) {
      const [serviceRows] = await conn.execute(
        `SELECT vs.category_id, sc.slug 
         FROM vendor_services vs 
         JOIN service_categories sc ON vs.category_id = sc.id 
         WHERE vs.id = ?`,
        [serviceId]
      );
      if (serviceRows.length > 0) {
        actualCategoryId = serviceRows[0].category_id;
        categorySlug = serviceRows[0].slug;
      }
    }

    if (!actualCategoryId) {
      const [vendCats] = await conn.execute(
        `SELECT vs.category_id, sc.slug 
         FROM vendor_services vs 
         JOIN service_categories sc ON vs.category_id = sc.id 
         WHERE vs.vendor_id = ? AND vs.is_active = TRUE LIMIT 1`,
        [vendorId]
      );
      if (vendCats.length > 0) {
        actualCategoryId = vendCats[0].category_id;
        categorySlug = vendCats[0].slug;
      } else {
        const [defaultCat] = await conn.execute(`SELECT id, slug FROM service_categories LIMIT 1`);
        actualCategoryId = defaultCat.length > 0 ? defaultCat[0].id : 1;
        categorySlug = defaultCat.length > 0 ? defaultCat[0].slug : '';
      }
    } else if (!categorySlug) {
      const [catRows] = await conn.execute(`SELECT slug FROM service_categories WHERE id = ?`, [actualCategoryId]);
      if (catRows.length > 0) categorySlug = catRows[0].slug;
    }

    // Direct booking flow: Create event atomically if eventId is not provided
    if (!actualEventId) {
      if (!eventDateVal) {
        await conn.rollback();
        return sendError(res, 'Event date is required to request a booking.', 400);
      }

      eventTitle = eventTitle?.trim() || `${eventType || 'Special'} Event`;
      const finalEventType = eventType || 'Special Event';

      // Intelligent Location Resolution:
      // If service is a fixed venue (marriage hall), or studio visit is chosen, use vendor's address automatically
      let finalLocation = location ? location.trim() : '';
      let finalCity = city ? city.trim() : (vendorProfile.city || 'Coimbatore');

      if (categorySlug === 'venues') {
        finalLocation = vendorProfile.address || `${vendorProfile.business_name}, ${vendorProfile.city}`;
        finalCity = vendorProfile.city;
      } else if (serviceRequirements?.serviceLocationType === 'studio') {
        finalLocation = vendorProfile.address || `${vendorProfile.business_name} Studio, ${vendorProfile.city}`;
        finalCity = vendorProfile.city;
      } else if (!finalLocation) {
        finalLocation = serviceRequirements?.gettingReadyLocation || serviceRequirements?.eventLocation || 'Venue To Be Finalized';
      }

      // Guest Count handling based on service category:
      // Bridal makeup does not collect irrelevant guest counts from customer
      let finalGuestCount = 50;
      if (categorySlug === 'bridal-makeup') {
        finalGuestCount = serviceRequirements?.peopleCount || (guestCount ? parseInt(guestCount, 10) : 1);
      } else if (categorySlug === 'catering') {
        finalGuestCount = serviceRequirements?.plateCount ? parseInt(serviceRequirements.plateCount, 10) : (guestCount ? parseInt(guestCount, 10) : 100);
      } else if (categorySlug === 'venues') {
        finalGuestCount = serviceRequirements?.guestCount ? parseInt(serviceRequirements.guestCount, 10) : (guestCount ? parseInt(guestCount, 10) : 200);
      } else {
        finalGuestCount = guestCount ? parseInt(guestCount, 10) : 50;
      }

      // Backend service-specific validation
      if (categorySlug === 'bridal-makeup') {
        if (serviceRequirements && serviceRequirements.serviceLocationType !== 'studio' && !finalLocation) {
          await conn.rollback();
          return sendError(res, 'Getting-ready location or address is required for bridal makeup.', 400);
        }
      } else if (categorySlug === 'venues') {
        if (!finalGuestCount || finalGuestCount < 1) {
          await conn.rollback();
          return sendError(res, 'Expected guest count is required for venue and marriage hall bookings.', 400);
        }
      } else if (categorySlug === 'catering') {
        if (!finalGuestCount || finalGuestCount < 1) {
          await conn.rollback();
          return sendError(res, 'Expected number of plates is required for catering inquiries.', 400);
        }
      }

      const finalBudget = estimatedBudget || totalBudget || quoteAmount || vendorProfile.starting_price || 0;

      // Create event atomically
      const [newEventRes] = await conn.execute(
        `INSERT INTO events (customer_id, title, event_type, event_date, event_time, location, city, guest_count, total_budget, description, status)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'planning')`,
        [
          customerId,
          eventTitle,
          finalEventType,
          eventDateVal,
          eventTime || '10:00:00',
          finalLocation,
          finalCity,
          finalGuestCount,
          parseFloat(finalBudget) || 0,
          requirementsNotes || customerNotes || null
        ]
      );
      actualEventId = newEventRes.insertId;
    } else {
      // Verify existing event ownership
      const [events] = await conn.execute(
        `SELECT id, title, DATE_FORMAT(event_date, '%Y-%m-%d') as event_date FROM events WHERE id = ? AND customer_id = ?`,
        [actualEventId, customerId]
      );

      if (events.length === 0) {
        await conn.rollback();
        return sendError(res, 'Event not found or unauthorized.', 404);
      }
      eventTitle = events[0].title;
      eventDateVal = events[0].event_date;
    }

    // Check if duplicate booking already exists for this vendor and event
    const [existing] = await conn.execute(
      `SELECT id, status FROM bookings WHERE event_id = ? AND vendor_id = ?`,
      [actualEventId, vendorId]
    );
    if (existing.length > 0 && !['cancelled', 'rejected'].includes(existing[0].status)) {
      await conn.rollback();
      return sendError(res, `A booking request is already ${existing[0].status} with this vendor.`, 409);
    }

    const finalQuoteAmount = quoteAmount || estimatedBudget || vendorProfile.starting_price || null;
    const serviceReqJson = serviceRequirements ? JSON.stringify(serviceRequirements) : null;

    // Insert booking with service_requirements
    const [bookRes] = await conn.execute(
      `INSERT INTO bookings (event_id, customer_id, vendor_id, category_id, service_id, status, quote_amount, service_requirements, customer_notes)
       VALUES (?, ?, ?, ?, ?, 'pending', ?, ?, ?)`,
      [
        actualEventId,
        customerId,
        vendorId,
        actualCategoryId,
        serviceId || null,
        finalQuoteAmount ? parseFloat(finalQuoteAmount) : null,
        serviceReqJson,
        customerNotes || requirementsNotes || null
      ]
    );
    const bookingId = bookRes.insertId;

    // Record in booking status history
    await conn.execute(
      `INSERT INTO booking_status_history (booking_id, changed_by_user_id, previous_status, new_status, comments)
       VALUES (?, ?, NULL, 'pending', 'Customer initiated booking request.')`,
      [bookingId, req.user.id]
    );

    // Create Notification for Vendor
    const vendorUserId = vendorProfile.user_id;
    if (vendorUserId) {
      await conn.execute(
        `INSERT INTO notifications (user_id, title, message, type, link_url)
         VALUES (?, 'New Booking Inquiry', ?, 'info', '/vendor/bookings')`,
        [
          vendorUserId,
          `You have received a new booking request for "${eventTitle}" on ${eventDateVal}.`
        ]
      );
    }

    // Create or find Conversation between Customer and Vendor
    const [existingConv] = await conn.execute(
      `SELECT id FROM conversations WHERE customer_id = ? AND vendor_id = ?`,
      [customerId, vendorId]
    );

    let conversationId;
    if (existingConv.length > 0) {
      conversationId = existingConv[0].id;
      await conn.execute(
        `UPDATE conversations SET event_id = ?, booking_id = ?, updated_at = NOW() WHERE id = ?`,
        [actualEventId, bookingId, conversationId]
      );
    } else {
      const [newConv] = await conn.execute(
        `INSERT INTO conversations (event_id, booking_id, customer_id, vendor_id)
         VALUES (?, ?, ?, ?)`,
        [actualEventId, bookingId, customerId, vendorId]
      );
      conversationId = newConv.insertId;
    }

    // Add initial message if notes provided
    const initialNote = customerNotes || requirementsNotes;
    if (initialNote) {
      await conn.execute(
        `INSERT INTO messages (conversation_id, sender_id, content, is_read)
         VALUES (?, ?, ?, FALSE)`,
        [conversationId, req.user.id, `[Booking Inquiry]: ${initialNote}`]
      );
    }

    await conn.commit();
    return sendSuccess(res, { bookingId, conversationId, eventId: actualEventId }, 'Booking request sent successfully.', 201);
  } catch (error) {
    await conn.rollback();
    console.error('[Create Booking Error]', error);
    return sendError(res, 'Failed to submit booking request.', 500);
  } finally {
    conn.release();
  }
};

// 2. Get Bookings for Current User (Customer or Vendor)
export const getMyBookings = async (req, res) => {
  const role = req.user.role;
  const profileId = req.user.profileId;

  try {
    let sql;
    let params;

    if (role === 'customer') {
      sql = `
        SELECT 
          b.id,
          b.event_id,
          b.customer_id,
          b.vendor_id,
          b.category_id,
          b.service_id,
          b.status,
          b.quote_amount,
          b.service_requirements,
          b.customer_notes,
          b.vendor_response,
          b.rejection_reason,
          b.created_at,
          b.updated_at,
          e.title as event_title,
          e.event_type,
          DATE_FORMAT(e.event_date, '%Y-%m-%d') as event_date,
          e.event_time,
          e.location as event_location,
          e.city as event_city,
          e.guest_count,
          vp.business_name,
          vp.city as vendor_city,
          vp.address as vendor_address,
          vp.avatar_url as vendor_avatar,
          vp.average_rating,
          sc.name as category_name,
          sc.slug as category_slug,
          vs.title as service_title,
          vs.price as service_price,
          vs.pricing_unit as service_pricing_unit,
          r.id as review_id,
          r.rating as review_rating
        FROM bookings b
        JOIN events e ON b.event_id = e.id
        JOIN vendor_profiles vp ON b.vendor_id = vp.id
        JOIN service_categories sc ON b.category_id = sc.id
        LEFT JOIN vendor_services vs ON b.service_id = vs.id
        LEFT JOIN reviews r ON b.id = r.booking_id
        WHERE b.customer_id = ?
        ORDER BY b.created_at DESC
      `;
      params = [profileId];
    } else if (role === 'vendor') {
      sql = `
        SELECT 
          b.id,
          b.event_id,
          b.customer_id,
          b.vendor_id,
          b.category_id,
          b.service_id,
          b.status,
          b.quote_amount,
          b.service_requirements,
          b.customer_notes,
          b.vendor_response,
          b.rejection_reason,
          b.created_at,
          b.updated_at,
          e.title as event_title,
          e.event_type,
          DATE_FORMAT(e.event_date, '%Y-%m-%d') as event_date,
          e.event_time,
          e.location as event_location,
          e.city as event_city,
          e.guest_count,
          e.total_budget,
          e.description as requirements_notes,
          u.first_name as customer_first_name,
          u.last_name as customer_last_name,
          u.email as customer_email,
          u.phone as customer_phone,
          cp.avatar_url as customer_avatar,
          vp.business_name,
          vp.city as vendor_city,
          vp.address as vendor_address,
          sc.name as category_name,
          sc.slug as category_slug,
          vs.title as service_title,
          vs.price as service_price,
          vs.pricing_unit as service_pricing_unit
        FROM bookings b
        JOIN events e ON b.event_id = e.id
        JOIN vendor_profiles vp ON b.vendor_id = vp.id
        JOIN customer_profiles cp ON b.customer_id = cp.id
        JOIN users u ON cp.user_id = u.id
        JOIN service_categories sc ON b.category_id = sc.id
        LEFT JOIN vendor_services vs ON b.service_id = vs.id
        WHERE b.vendor_id = ?
        ORDER BY b.created_at DESC
      `;
      params = [profileId];
    } else if (role === 'admin') {
      sql = `
        SELECT 
          b.id,
          b.status,
          b.quote_amount,
          b.service_requirements,
          b.rejection_reason,
          b.created_at,
          e.title as event_title,
          DATE_FORMAT(e.event_date, '%Y-%m-%d') as event_date,
          vp.business_name,
          vp.city as vendor_city,
          vp.address as vendor_address,
          CONCAT(u.first_name, ' ', u.last_name) as customer_name,
          sc.name as category_name,
          sc.slug as category_slug,
          vs.title as service_title
        FROM bookings b
        JOIN events e ON b.event_id = e.id
        JOIN vendor_profiles vp ON b.vendor_id = vp.id
        JOIN customer_profiles cp ON b.customer_id = cp.id
        JOIN users u ON cp.user_id = u.id
        JOIN service_categories sc ON b.category_id = sc.id
        LEFT JOIN vendor_services vs ON b.service_id = vs.id
        ORDER BY b.created_at DESC
      `;
      params = [];
    }

    const [bookings] = await pool.execute(sql, params);
    const parsedBookings = bookings.map(b => {
      let reqs = b.service_requirements;
      if (typeof reqs === 'string') {
        try {
          reqs = JSON.parse(reqs);
        } catch {
          reqs = null;
        }
      }
      return {
        ...b,
        service_requirements: reqs
      };
    });
    return sendSuccess(res, parsedBookings, 'Bookings retrieved successfully.');
  } catch (error) {
    console.error('[Get Bookings Error]', error);
    return sendError(res, 'Failed to fetch bookings.', 500);
  }
};

// 3. Update Booking Status (Vendor or Customer)
export const updateBookingStatus = async (req, res) => {
  const { id } = req.params;
  const { status, vendorResponse, rejectionReason, quoteAmount } = req.body;
  const userId = req.user.id;
  const role = req.user.role;
  const profileId = req.user.profileId;

  if (!status) {
    return sendError(res, 'New status is required.', 400);
  }

  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();

    // Fetch booking with event details
    const [bookingRows] = await conn.execute(
      `SELECT b.*, e.title as event_title, DATE_FORMAT(e.event_date, '%Y-%m-%d') as event_date,
              vp.business_name, vp.user_id as vendor_user_id, cp.user_id as customer_user_id
       FROM bookings b
       JOIN events e ON b.event_id = e.id
       JOIN vendor_profiles vp ON b.vendor_id = vp.id
       JOIN customer_profiles cp ON b.customer_id = cp.id
       WHERE b.id = ?`,
      [id]
    );

    if (bookingRows.length === 0) {
      await conn.rollback();
      return sendError(res, 'Booking not found.', 404);
    }

    const booking = bookingRows[0];

    // Authorization checks
    if (role === 'customer') {
      if (booking.customer_id !== profileId) {
        await conn.rollback();
        return sendError(res, 'Unauthorized.', 403);
      }
      if (status !== 'cancelled') {
        await conn.rollback();
        return sendError(res, 'Customers can only cancel their booking requests.', 403);
      }
    } else if (role === 'vendor') {
      if (booking.vendor_id !== profileId) {
        await conn.rollback();
        return sendError(res, 'Unauthorized.', 403);
      }
      if (!['accepted', 'rejected', 'completed'].includes(status)) {
        await conn.rollback();
        return sendError(res, 'Invalid status update for vendor.', 400);
      }

      // STRICT VALIDATION: Declining a booking strictly requires an explanation
      if (status === 'rejected') {
        const finalReason = (rejectionReason || vendorResponse || '').trim();
        if (!finalReason) {
          await conn.rollback();
          return sendError(res, 'A clear reason is required when declining a booking request.', 400);
        }
      }

      // CONCURRENCY CHECK WHEN ACCEPTING: Verify vendor availability
      if (status === 'accepted') {
        const [conflict] = await conn.execute(
          `SELECT id, status FROM vendor_availability WHERE vendor_id = ? AND date = ?`,
          [booking.vendor_id, booking.event_date]
        );

        if (conflict.length > 0 && conflict[0].status === 'booked') {
          await conn.rollback();
          return sendError(res, `Cannot accept booking: you are already booked for another event on ${booking.event_date}.`, 409);
        }

        // Lock date as booked
        await conn.execute(
          `INSERT INTO vendor_availability (vendor_id, date, status, notes)
           VALUES (?, ?, 'booked', ?)
           ON DUPLICATE KEY UPDATE status = 'booked', notes = VALUES(notes)`,
          [booking.vendor_id, booking.event_date, `Confirmed for event: ${booking.event_title}`]
        );
      }
    }

    const reasonVal = status === 'rejected' ? (rejectionReason || vendorResponse || null) : null;
    const responseVal = status === 'rejected' ? (vendorResponse || rejectionReason || null) : (vendorResponse || null);

    // Update booking
    await conn.execute(
      `UPDATE bookings 
       SET status = ?, 
           vendor_response = COALESCE(?, vendor_response), 
           rejection_reason = COALESCE(?, rejection_reason),
           quote_amount = COALESCE(?, quote_amount)
       WHERE id = ?`,
      [
        status,
        responseVal,
        reasonVal,
        quoteAmount ? parseFloat(quoteAmount) : null,
        id
      ]
    );

    // Audit status change
    await conn.execute(
      `INSERT INTO booking_status_history (booking_id, changed_by_user_id, previous_status, new_status, comments)
       VALUES (?, ?, ?, ?, ?)`,
      [id, userId, booking.status, status, reasonVal || responseVal || `Status updated to ${status}`]
    );

    // Send Notification to opposite party
    const targetUserId = role === 'customer' ? booking.vendor_user_id : booking.customer_user_id;
    const notifTitle = `Booking ${status.charAt(0).toUpperCase() + status.slice(1)}`;
    let notifMessage;

    if (role === 'vendor') {
      if (status === 'rejected') {
        notifMessage = `${booking.business_name} has declined your booking request for "${booking.event_title}". Reason: ${reasonVal}`;
      } else if (status === 'accepted') {
        notifMessage = `${booking.business_name} has accepted your booking request for "${booking.event_title}"${quoteAmount ? ` with a quote of ₹${parseFloat(quoteAmount).toLocaleString('en-IN')}` : ''}.`;
      } else {
        notifMessage = `${booking.business_name} has updated your booking to ${status}.`;
      }
    } else {
      notifMessage = `Customer has cancelled the booking request for "${booking.event_title}".`;
    }

    await conn.execute(
      `INSERT INTO notifications (user_id, title, message, type, link_url)
       VALUES (?, ?, ?, ?, ?)`,
      [targetUserId, notifTitle, notifMessage, status === 'accepted' ? 'success' : 'info', role === 'customer' ? '/vendor/bookings' : '/customer/bookings']
    );

    await conn.commit();
    return sendSuccess(res, null, `Booking status successfully updated to ${status}.`);
  } catch (error) {
    await conn.rollback();
    console.error('[Update Booking Status Error]', error);
    return sendError(res, 'Failed to update booking status.', 500);
  } finally {
    conn.release();
  }
};
