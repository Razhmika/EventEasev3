import pool from '../config/db.js';
import { sendSuccess, sendError } from '../utils/responseHandler.js';

// 1. Submit Review for a Completed Booking
export const createReview = async (req, res) => {
  const customerId = req.user.profileId;
  const { bookingId, rating, comment } = req.body;

  if (!bookingId || !rating) {
    return sendError(res, 'Booking ID and star rating (1-5) are required.', 400);
  }

  const numRating = parseInt(rating, 10);
  if (numRating < 1 || numRating > 5) {
    return sendError(res, 'Rating must be between 1 and 5.', 400);
  }

  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();

    // Verify booking is completed and belongs to customer
    const [bookings] = await conn.execute(
      `SELECT id, customer_id, vendor_id, status FROM bookings WHERE id = ?`,
      [bookingId]
    );

    if (bookings.length === 0) {
      await conn.rollback();
      return sendError(res, 'Booking not found.', 404);
    }

    const booking = bookings[0];

    if (booking.customer_id !== customerId) {
      await conn.rollback();
      return sendError(res, 'You can only review your own bookings.', 403);
    }

    if (booking.status !== 'completed') {
      await conn.rollback();
      return sendError(res, 'Reviews can only be submitted for completed events.', 400);
    }

    // Check duplicate review
    const [existing] = await conn.execute(
      `SELECT id FROM reviews WHERE booking_id = ?`,
      [bookingId]
    );

    if (existing.length > 0) {
      await conn.rollback();
      return sendError(res, 'A review has already been submitted for this booking.', 409);
    }

    // Insert review
    const [revRes] = await conn.execute(
      `INSERT INTO reviews (booking_id, customer_id, vendor_id, rating, comment)
       VALUES (?, ?, ?, ?, ?)`,
      [bookingId, customerId, booking.vendor_id, numRating, comment ? comment.trim() : null]
    );

    // Recalculate Vendor Average Rating and Count
    const [ratingStats] = await conn.execute(
      `SELECT AVG(rating) as avg_rating, COUNT(*) as rev_count FROM reviews WHERE vendor_id = ?`,
      [booking.vendor_id]
    );

    const avgRating = parseFloat(ratingStats[0].avg_rating || numRating).toFixed(2);
    const revCount = ratingStats[0].rev_count || 1;

    await conn.execute(
      `UPDATE vendor_profiles SET average_rating = ?, review_count = ? WHERE id = ?`,
      [avgRating, revCount, booking.vendor_id]
    );

    // Notify vendor
    const [vUser] = await conn.execute(
      `SELECT user_id FROM vendor_profiles WHERE id = ?`,
      [booking.vendor_id]
    );
    if (vUser.length > 0) {
      await conn.execute(
        `INSERT INTO notifications (user_id, title, message, type, link_url)
         VALUES (?, 'New Customer Review', ?, 'success', '/vendor/profile')`,
        [vUser[0].user_id, `You received a ${numRating}-star review from ${req.user.firstName}!`]
      );
    }

    await conn.commit();
    return sendSuccess(res, { reviewId: revRes.insertId, averageRating: avgRating }, 'Review posted successfully.', 201);
  } catch (error) {
    await conn.rollback();
    console.error('[Create Review Error]', error);
    return sendError(res, 'Failed to submit review.', 500);
  } finally {
    conn.release();
  }
};

// 2. Get Reviews for a Vendor
export const getVendorReviews = async (req, res) => {
  const { vendorId } = req.params;

  try {
    const [reviews] = await pool.execute(
      `SELECT 
        r.id,
        r.rating,
        r.comment,
        r.created_at,
        u.first_name,
        u.last_name,
        cp.avatar_url,
        e.title as event_title
       FROM reviews r
       JOIN customer_profiles cp ON r.customer_id = cp.id
       JOIN users u ON cp.user_id = u.id
       JOIN bookings b ON r.booking_id = b.id
       JOIN events e ON b.event_id = e.id
       WHERE r.vendor_id = ?
       ORDER BY r.created_at DESC`,
      [vendorId]
    );

    return sendSuccess(res, reviews, 'Reviews retrieved.');
  } catch (error) {
    console.error('[Get Reviews Error]', error);
    return sendError(res, 'Failed to fetch reviews.', 500);
  }
};
