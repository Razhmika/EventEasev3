import jwt from 'jsonwebtoken';
import pool from '../config/db.js';
import { sendError } from '../utils/responseHandler.js';

export const verifyToken = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return sendError(res, 'Authentication token required.', 401);
    }

    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'eventease_super_secret_jwt_key_2026_lavender_secure');

    // Retrieve active user record
    const [users] = await pool.execute(
      `SELECT id, email, role, first_name, last_name, phone, is_active FROM users WHERE id = ?`,
      [decoded.userId]
    );

    if (users.length === 0 || !users[0].is_active) {
      return sendError(res, 'User account is inactive or no longer exists.', 401);
    }

    const user = users[0];

    // Fetch corresponding profile ID
    let profileId = null;
    if (user.role === 'customer') {
      let [cp] = await pool.execute(`SELECT id FROM customer_profiles WHERE user_id = ?`, [user.id]);
      if (cp.length === 0) {
        [cp] = await pool.execute(
          `SELECT cp.id FROM customer_profiles cp 
           JOIN users u ON cp.user_id = u.id 
           WHERE u.first_name = ? AND u.last_name = ? LIMIT 1`,
          [user.first_name, user.last_name]
        );
      }
      if (cp.length > 0) profileId = cp[0].id;
    } else if (user.role === 'vendor') {
      let [vp] = await pool.execute(`SELECT id, verification_status FROM vendor_profiles WHERE user_id = ?`, [user.id]);
      if (vp.length === 0) {
        [vp] = await pool.execute(
          `SELECT vp.id, vp.verification_status FROM vendor_profiles vp 
           JOIN users u ON vp.user_id = u.id 
           WHERE u.first_name = ? AND u.last_name = ? LIMIT 1`,
          [user.first_name, user.last_name]
        );
      }
      if (vp.length > 0) {
        profileId = vp[0].id;
        user.verification_status = vp[0].verification_status;
      }
    }

    req.user = {
      id: user.id,
      email: user.email,
      role: user.role,
      firstName: user.first_name,
      lastName: user.last_name,
      phone: user.phone,
      profileId,
      verificationStatus: user.verification_status || null
    };

    next();
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return sendError(res, 'Session token expired. Please log in again.', 401);
    }
    return sendError(res, 'Invalid authentication token.', 401);
  }
};
