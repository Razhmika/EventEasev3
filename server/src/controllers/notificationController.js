import pool from '../config/db.js';
import { sendSuccess, sendError } from '../utils/responseHandler.js';

// Get current user's notifications
export const getMyNotifications = async (req, res) => {
  const userId = req.user.id;

  try {
    const [notifications] = await pool.execute(
      `SELECT id, title, message, type, link_url, is_read, created_at
       FROM notifications
       WHERE user_id = ?
       ORDER BY created_at DESC
       LIMIT 30`,
      [userId]
    );

    const [unreadCountRows] = await pool.execute(
      `SELECT COUNT(*) as unread_count FROM notifications WHERE user_id = ? AND is_read = FALSE`,
      [userId]
    );

    return sendSuccess(res, {
      notifications,
      unreadCount: unreadCountRows[0].unread_count
    }, 'Notifications retrieved.');
  } catch (error) {
    console.error('[Get Notifications Error]', error);
    return sendError(res, 'Failed to fetch notifications.', 500);
  }
};

// Mark single notification as read
export const markNotificationRead = async (req, res) => {
  const { id } = req.params;
  const userId = req.user.id;

  try {
    await pool.execute(
      `UPDATE notifications SET is_read = TRUE WHERE id = ? AND user_id = ?`,
      [id, userId]
    );
    return sendSuccess(res, null, 'Notification marked as read.');
  } catch (error) {
    console.error('[Mark Notification Read Error]', error);
    return sendError(res, 'Failed to update notification.', 500);
  }
};

// Mark all as read
export const markAllNotificationsRead = async (req, res) => {
  const userId = req.user.id;

  try {
    await pool.execute(
      `UPDATE notifications SET is_read = TRUE WHERE user_id = ? AND is_read = FALSE`,
      [userId]
    );
    return sendSuccess(res, null, 'All notifications marked as read.');
  } catch (error) {
    console.error('[Mark All Read Error]', error);
    return sendError(res, 'Failed to mark all notifications as read.', 500);
  }
};
