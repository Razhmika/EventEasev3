import pool from '../config/db.js';
import { sendSuccess, sendError } from '../utils/responseHandler.js';

// 1. Get All Events for Authenticated Customer
export const getMyEvents = async (req, res) => {
  try {
    const customerId = req.user.profileId;

    const [events] = await pool.execute(
      `SELECT 
        e.id,
        e.title,
        e.event_type,
        DATE_FORMAT(e.event_date, '%Y-%m-%d') as event_date,
        e.event_time,
        e.location,
        e.city,
        e.guest_count,
        e.total_budget,
        e.theme_style,
        e.description,
        e.status,
        e.created_at,
        COUNT(DISTINCT er.id) as requirements_count,
        COUNT(DISTINCT b.id) as bookings_count,
        SUM(CASE WHEN b.status = 'accepted' THEN 1 ELSE 0 END) as confirmed_bookings_count
       FROM events e
       LEFT JOIN event_requirements er ON e.id = er.event_id
       LEFT JOIN bookings b ON e.id = b.event_id
       WHERE e.customer_id = ?
       GROUP BY e.id
       ORDER BY e.event_date ASC`,
      [customerId]
    );

    return sendSuccess(res, events, 'Customer events retrieved.');
  } catch (error) {
    console.error('[Get Events Error]', error);
    return sendError(res, 'Failed to retrieve events.', 500);
  }
};

// 2. Get Single Event Details
export const getEventById = async (req, res) => {
  const { id } = req.params;
  const customerId = req.user.profileId;

  try {
    const [events] = await pool.execute(
      `SELECT 
        e.id,
        e.customer_id,
        e.title,
        e.event_type,
        DATE_FORMAT(e.event_date, '%Y-%m-%d') as event_date,
        e.event_time,
        e.location,
        e.city,
        e.guest_count,
        e.total_budget,
        e.theme_style,
        e.description,
        e.status,
        e.created_at
       FROM events e
       WHERE e.id = ?`,
      [id]
    );

    if (events.length === 0) {
      return sendError(res, 'Event not found.', 404);
    }

    const event = events[0];

    // Ownership check (unless admin)
    if (req.user.role === 'customer' && event.customer_id !== customerId) {
      return sendError(res, 'Unauthorized access to this event.', 403);
    }

    // Requirements with category details
    const [requirements] = await pool.execute(
      `SELECT er.id, er.category_id, er.allocated_budget, er.special_requests, sc.name as category_name, sc.slug as category_slug, sc.icon_name
       FROM event_requirements er
       JOIN service_categories sc ON er.category_id = sc.id
       WHERE er.event_id = ?`,
      [id]
    );

    // Associated Bookings
    const [bookings] = await pool.execute(
      `SELECT b.id, b.status, b.quote_amount, b.created_at, vp.id as vendor_id, vp.business_name, vp.city as vendor_city, vp.average_rating, sc.name as category_name
       FROM bookings b
       JOIN vendor_profiles vp ON b.vendor_id = vp.id
       JOIN service_categories sc ON b.category_id = sc.id
       WHERE b.event_id = ?
       ORDER BY b.created_at DESC`,
      [id]
    );

    return sendSuccess(res, {
      ...event,
      requirements,
      bookings
    }, 'Event details retrieved.');
  } catch (error) {
    console.error('[Get Event Detail Error]', error);
    return sendError(res, 'Failed to fetch event details.', 500);
  }
};

// 3. Create Event with Requirements (Transactional)
export const createEvent = async (req, res) => {
  const customerId = req.user.profileId;
  const {
    title,
    eventType,
    eventDate,
    eventTime,
    location,
    city,
    guestCount,
    totalBudget,
    themeStyle,
    description,
    requirements // Array of { categoryId, allocatedBudget, specialRequests }
  } = req.body;

  if (!title || !eventType || !eventDate || !location || !city || !guestCount || !totalBudget) {
    return sendError(res, 'Please provide all required event details.', 400);
  }

  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();

    const [evtResult] = await conn.execute(
      `INSERT INTO events (customer_id, title, event_type, event_date, event_time, location, city, guest_count, total_budget, theme_style, description, status)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'planning')`,
      [
        customerId,
        title.trim(),
        eventType.trim(),
        eventDate,
        eventTime || null,
        location.trim(),
        city.trim(),
        parseInt(guestCount, 10),
        parseFloat(totalBudget),
        themeStyle ? themeStyle.trim() : null,
        description ? description.trim() : null
      ]
    );
    const eventId = evtResult.insertId;

    if (Array.isArray(requirements) && requirements.length > 0) {
      for (const reqItem of requirements) {
        if (reqItem.categoryId) {
          await conn.execute(
            `INSERT INTO event_requirements (event_id, category_id, allocated_budget, special_requests)
             VALUES (?, ?, ?, ?)`,
            [
              eventId,
              reqItem.categoryId,
              reqItem.allocatedBudget ? parseFloat(reqItem.allocatedBudget) : null,
              reqItem.specialRequests || null
            ]
          );
        }
      }
    }

    await conn.commit();
    return sendSuccess(res, { eventId }, 'Event created successfully.', 201);
  } catch (error) {
    await conn.rollback();
    console.error('[Create Event Error]', error);
    return sendError(res, 'Failed to create event requirement.', 500);
  } finally {
    conn.release();
  }
};

// 4. Update Event
export const updateEvent = async (req, res) => {
  const { id } = req.params;
  const customerId = req.user.profileId;
  const {
    title,
    eventType,
    eventDate,
    eventTime,
    location,
    city,
    guestCount,
    totalBudget,
    themeStyle,
    description,
    status
  } = req.body;

  try {
    const [result] = await pool.execute(
      `UPDATE events SET
        title = COALESCE(?, title),
        event_type = COALESCE(?, event_type),
        event_date = COALESCE(?, event_date),
        event_time = COALESCE(?, event_time),
        location = COALESCE(?, location),
        city = COALESCE(?, city),
        guest_count = COALESCE(?, guest_count),
        total_budget = COALESCE(?, total_budget),
        theme_style = COALESCE(?, theme_style),
        description = COALESCE(?, description),
        status = COALESCE(?, status)
       WHERE id = ? AND customer_id = ?`,
      [
        title ? title.trim() : null,
        eventType ? eventType.trim() : null,
        eventDate || null,
        eventTime || null,
        location ? location.trim() : null,
        city ? city.trim() : null,
        guestCount ? parseInt(guestCount, 10) : null,
        totalBudget ? parseFloat(totalBudget) : null,
        themeStyle ? themeStyle.trim() : null,
        description !== undefined ? description : null,
        status || null,
        id,
        customerId
      ]
    );

    if (result.affectedRows === 0) {
      return sendError(res, 'Event not found or unauthorized.', 404);
    }

    return sendSuccess(res, null, 'Event updated successfully.');
  } catch (error) {
    console.error('[Update Event Error]', error);
    return sendError(res, 'Failed to update event.', 500);
  }
};

// 5. Cancel Event
export const cancelEvent = async (req, res) => {
  const { id } = req.params;
  const customerId = req.user.profileId;

  try {
    const [result] = await pool.execute(
      `UPDATE events SET status = 'cancelled' WHERE id = ? AND customer_id = ?`,
      [id, customerId]
    );

    if (result.affectedRows === 0) {
      return sendError(res, 'Event not found or unauthorized.', 404);
    }

    return sendSuccess(res, null, 'Event cancelled successfully.');
  } catch (error) {
    console.error('[Cancel Event Error]', error);
    return sendError(res, 'Failed to cancel event.', 500);
  }
};
