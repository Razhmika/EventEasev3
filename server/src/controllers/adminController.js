import pool from '../config/db.js';
import { sendSuccess, sendError } from '../utils/responseHandler.js';

// 1. Get Platform Metrics
export const getPlatformStats = async (req, res) => {
  try {
    const [customerCountRows] = await pool.execute(`SELECT COUNT(*) as count FROM customer_profiles`);
    const [vendorCountRows] = await pool.execute(`SELECT COUNT(*) as count FROM vendor_profiles`);
    const [eventCountRows] = await pool.execute(`SELECT COUNT(*) as count FROM events`);
    const [bookingCountRows] = await pool.execute(`SELECT COUNT(*) as count FROM bookings`);
    const [confirmedBookingRows] = await pool.execute(`SELECT COUNT(*) as count FROM bookings WHERE status = 'accepted'`);
    const [grossVolumeRows] = await pool.execute(`SELECT COALESCE(SUM(quote_amount), 0) as total FROM bookings WHERE status IN ('accepted', 'completed')`);
    const [pendingVerificationRows] = await pool.execute(`SELECT COUNT(*) as count FROM vendor_profiles WHERE verification_status = 'pending'`);

    // Recent 10 platform bookings
    const [recentBookings] = await pool.execute(
      `SELECT 
        b.id,
        b.status,
        b.quote_amount,
        b.created_at,
        e.title as event_title,
        vp.business_name,
        CONCAT(u.first_name, ' ', u.last_name) as customer_name
       FROM bookings b
       JOIN events e ON b.event_id = e.id
       JOIN vendor_profiles vp ON b.vendor_id = vp.id
       JOIN customer_profiles cp ON b.customer_id = cp.id
       JOIN users u ON cp.user_id = u.id
       ORDER BY b.created_at DESC
       LIMIT 8`
    );

    return sendSuccess(res, {
      totalCustomers: customerCountRows[0].count,
      totalVendors: vendorCountRows[0].count,
      totalEvents: eventCountRows[0].count,
      totalBookings: bookingCountRows[0].count,
      confirmedBookings: confirmedBookingRows[0].count,
      grossVolume: parseFloat(grossVolumeRows[0].total),
      pendingVerifications: pendingVerificationRows[0].count,
      recentBookings
    }, 'Platform metrics retrieved.');
  } catch (error) {
    console.error('[Admin Stats Error]', error);
    return sendError(res, 'Failed to fetch platform statistics.', 500);
  }
};

// 2. Get All Users (with pagination and search)
export const getAllUsers = async (req, res) => {
  const { role, search, page = 1, limit = 20 } = req.query;
  const offset = (parseInt(page, 10) - 1) * parseInt(limit, 10);
  const conditions = [];
  const params = [];

  if (role) {
    conditions.push('role = ?');
    params.push(role);
  }

  if (search) {
    conditions.push('(email LIKE ? OR first_name LIKE ? OR last_name LIKE ?)');
    const t = `%${search}%`;
    params.push(t, t, t);
  }

  const whereClause = conditions.length ? `WHERE ${conditions.join(' AND ')}` : '';

  try {
    const countSql = `SELECT COUNT(*) as total FROM users ${whereClause}`;
    const [countRows] = await pool.execute(countSql, params);
    const total = countRows[0].total;

    const dataSql = `
      SELECT id, email, role, first_name, last_name, phone, is_active, created_at
      FROM users
      ${whereClause}
      ORDER BY created_at DESC
      LIMIT ? OFFSET ?
    `;
    const [users] = await pool.query(dataSql, [...params, parseInt(limit, 10), parseInt(offset, 10)]);

    return sendSuccess(res, {
      users,
      pagination: {
        page: parseInt(page, 10),
        limit: parseInt(limit, 10),
        total,
        totalPages: Math.ceil(total / parseInt(limit, 10))
      }
    }, 'Users retrieved.');
  } catch (error) {
    console.error('[Admin Users Error]', error);
    return sendError(res, 'Failed to retrieve users.', 500);
  }
};

// 3. Toggle User Status (Activate/Suspend)
export const toggleUserStatus = async (req, res) => {
  const { id } = req.params;
  const { isActive } = req.body;

  try {
    // Prevent admin from deactivating self
    if (parseInt(id, 10) === req.user.id) {
      return sendError(res, 'You cannot deactivate your own administrator account.', 400);
    }

    await pool.execute(`UPDATE users SET is_active = ? WHERE id = ?`, [!!isActive, id]);

    // Log action
    await pool.execute(
      `INSERT INTO activity_logs (user_id, action, details)
       VALUES (?, 'USER_STATUS_TOGGLED', ?)`,
      [req.user.id, `User #${id} status changed to ${isActive ? 'active' : 'inactive'}`]
    );

    return sendSuccess(res, null, `User account ${isActive ? 'activated' : 'suspended'}.`);
  } catch (error) {
    console.error('[Toggle User Error]', error);
    return sendError(res, 'Failed to update user status.', 500);
  }
};

// 4. Get All Vendors with Verification Status
export const getAllVendors = async (req, res) => {
  try {
    const [vendors] = await pool.execute(
      `SELECT 
        vp.id,
        vp.user_id,
        vp.business_name,
        vp.city,
        vp.starting_price,
        vp.verification_status,
        vp.average_rating,
        vp.review_count,
        vp.created_at,
        u.email,
        u.first_name,
        u.last_name,
        u.is_active
       FROM vendor_profiles vp
       JOIN users u ON vp.user_id = u.id
       ORDER BY vp.created_at DESC`
    );

    return sendSuccess(res, vendors, 'Vendors retrieved.');
  } catch (error) {
    console.error('[Admin Vendors Error]', error);
    return sendError(res, 'Failed to fetch vendors.', 500);
  }
};

// 5. Update Vendor Verification Status
export const updateVendorVerification = async (req, res) => {
  const { id } = req.params;
  const { status } = req.body; // 'verified', 'pending', 'suspended'

  if (!['verified', 'pending', 'suspended'].includes(status)) {
    return sendError(res, 'Invalid verification status.', 400);
  }

  try {
    await pool.execute(
      `UPDATE vendor_profiles SET verification_status = ? WHERE id = ?`,
      [status, id]
    );

    // Notify Vendor User
    const [vUser] = await pool.execute(`SELECT user_id, business_name FROM vendor_profiles WHERE id = ?`, [id]);
    if (vUser.length > 0) {
      await pool.execute(
        `INSERT INTO notifications (user_id, title, message, type, link_url)
         VALUES (?, 'Account Verification Status', ?, ?, '/vendor/profile')`,
        [
          vUser[0].user_id,
          `Your vendor business account "${vUser[0].business_name}" is now ${status}.`,
          status === 'verified' ? 'success' : 'warning'
        ]
      );
    }

    // Log Activity
    await pool.execute(
      `INSERT INTO activity_logs (user_id, action, details)
       VALUES (?, 'VENDOR_VERIFICATION_UPDATED', ?)`,
      [req.user.id, `Vendor #${id} verification set to ${status}`]
    );

    return sendSuccess(res, null, `Vendor verification status updated to ${status}.`);
  } catch (error) {
    console.error('[Update Verification Error]', error);
    return sendError(res, 'Failed to update vendor status.', 500);
  }
};

// 6. Get System Activity Logs
export const getActivityLogs = async (req, res) => {
  try {
    const [logs] = await pool.execute(
      `SELECT 
        al.id,
        al.action,
        al.details,
        al.created_at,
        u.email as admin_email,
        CONCAT(u.first_name, ' ', u.last_name) as admin_name
       FROM activity_logs al
       LEFT JOIN users u ON al.user_id = u.id
       ORDER BY al.created_at DESC
       LIMIT 50`
    );

    return sendSuccess(res, logs, 'Activity logs retrieved.');
  } catch (error) {
    console.error('[Activity Logs Error]', error);
    return sendError(res, 'Failed to retrieve logs.', 500);
  }
};
