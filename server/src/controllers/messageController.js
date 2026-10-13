import pool from '../config/db.js';
import { sendSuccess, sendError } from '../utils/responseHandler.js';

// 1. Get All Conversations for Authenticated User
export const getConversations = async (req, res) => {
  const role = req.user.role;
  const profileId = req.user.profileId;

  try {
    let sql;
    let params;

    if (role === 'customer') {
      sql = `
        SELECT 
          c.id,
          c.event_id,
          c.booking_id,
          c.updated_at,
          vp.business_name as partner_name,
          vp.avatar_url as partner_avatar,
          e.title as event_title,
          (
            SELECT content FROM messages WHERE conversation_id = c.id ORDER BY created_at DESC LIMIT 1
          ) as last_message,
          (
            SELECT created_at FROM messages WHERE conversation_id = c.id ORDER BY created_at DESC LIMIT 1
          ) as last_message_time,
          (
            SELECT COUNT(*) FROM messages WHERE conversation_id = c.id AND sender_id != ? AND is_read = FALSE
          ) as unread_count
        FROM conversations c
        JOIN vendor_profiles vp ON c.vendor_id = vp.id
        LEFT JOIN events e ON c.event_id = e.id
        WHERE c.customer_id = ?
        ORDER BY c.updated_at DESC
      `;
      params = [req.user.id, profileId];
    } else if (role === 'vendor') {
      sql = `
        SELECT 
          c.id,
          c.event_id,
          c.booking_id,
          c.updated_at,
          CONCAT(u.first_name, ' ', u.last_name) as partner_name,
          cp.avatar_url as partner_avatar,
          e.title as event_title,
          (
            SELECT content FROM messages WHERE conversation_id = c.id ORDER BY created_at DESC LIMIT 1
          ) as last_message,
          (
            SELECT created_at FROM messages WHERE conversation_id = c.id ORDER BY created_at DESC LIMIT 1
          ) as last_message_time,
          (
            SELECT COUNT(*) FROM messages WHERE conversation_id = c.id AND sender_id != ? AND is_read = FALSE
          ) as unread_count
        FROM conversations c
        JOIN customer_profiles cp ON c.customer_id = cp.id
        JOIN users u ON cp.user_id = u.id
        LEFT JOIN events e ON c.event_id = e.id
        WHERE c.vendor_id = ?
        ORDER BY c.updated_at DESC
      `;
      params = [req.user.id, profileId];
    } else {
      return sendSuccess(res, []);
    }

    const [conversations] = await pool.execute(sql, params);
    return sendSuccess(res, conversations, 'Conversations retrieved.');
  } catch (error) {
    console.error('[Get Conversations Error]', error);
    return sendError(res, 'Failed to fetch conversations.', 500);
  }
};

// 2. Get Messages for a specific Conversation
export const getMessages = async (req, res) => {
  const { id } = req.params;
  const userId = req.user.id;
  const profileId = req.user.profileId;
  const role = req.user.role;

  try {
    // Check conversation authorization
    const [convs] = await pool.execute(
      `SELECT * FROM conversations WHERE id = ?`,
      [id]
    );

    if (convs.length === 0) {
      return sendError(res, 'Conversation not found.', 404);
    }

    const conv = convs[0];
    if (role === 'customer' && conv.customer_id !== profileId) {
      return sendError(res, 'Unauthorized.', 403);
    }
    if (role === 'vendor' && conv.vendor_id !== profileId) {
      return sendError(res, 'Unauthorized.', 403);
    }

    // Mark unread messages sent by the other party as read
    await pool.execute(
      `UPDATE messages SET is_read = TRUE WHERE conversation_id = ? AND sender_id != ? AND is_read = FALSE`,
      [id, userId]
    );

    // Retrieve all messages
    const [messages] = await pool.execute(
      `SELECT 
        m.id,
        m.conversation_id,
        m.sender_id,
        m.content,
        m.is_read,
        m.created_at,
        u.first_name as sender_first_name,
        u.last_name as sender_last_name,
        u.role as sender_role
       FROM messages m
       JOIN users u ON m.sender_id = u.id
       WHERE m.conversation_id = ?
       ORDER BY m.created_at ASC`,
      [id]
    );

    return sendSuccess(res, messages, 'Messages retrieved.');
  } catch (error) {
    console.error('[Get Messages Error]', error);
    return sendError(res, 'Failed to retrieve messages.', 500);
  }
};

// 3. Send Message
export const sendMessage = async (req, res) => {
  const { id } = req.params;
  const { content } = req.body;
  const userId = req.user.id;
  const profileId = req.user.profileId;
  const role = req.user.role;

  if (!content || !content.trim()) {
    return sendError(res, 'Message content cannot be empty.', 400);
  }

  try {
    // Verify participation
    const [convs] = await pool.execute(
      `SELECT c.*, vp.user_id as vendor_user_id, cp.user_id as customer_user_id
       FROM conversations c
       JOIN vendor_profiles vp ON c.vendor_id = vp.id
       JOIN customer_profiles cp ON c.customer_id = cp.id
       WHERE c.id = ?`,
      [id]
    );

    if (convs.length === 0) {
      return sendError(res, 'Conversation not found.', 404);
    }

    const conv = convs[0];
    if (role === 'customer' && conv.customer_id !== profileId) {
      return sendError(res, 'Unauthorized.', 403);
    }
    if (role === 'vendor' && conv.vendor_id !== profileId) {
      return sendError(res, 'Unauthorized.', 403);
    }

    // Insert message
    const [result] = await pool.execute(
      `INSERT INTO messages (conversation_id, sender_id, content, is_read)
       VALUES (?, ?, ?, FALSE)`,
      [id, userId, content.trim()]
    );

    // Update conversation timestamp
    await pool.execute(
      `UPDATE conversations SET updated_at = CURRENT_TIMESTAMP WHERE id = ?`,
      [id]
    );

    // Notify recipient
    const recipientUserId = role === 'customer' ? conv.vendor_user_id : conv.customer_user_id;
    await pool.execute(
      `INSERT INTO notifications (user_id, title, message, type, link_url)
       VALUES (?, 'New Message', ?, 'info', ?)`,
      [
        recipientUserId,
        `New message from ${req.user.firstName}: "${content.trim().slice(0, 50)}..."`,
        role === 'customer' ? '/vendor/messages' : '/customer/messages'
      ]
    );

    return sendSuccess(res, {
      messageId: result.insertId,
      senderId: userId,
      content: content.trim(),
      createdAt: new Date().toISOString()
    }, 'Message sent successfully.', 201);
  } catch (error) {
    console.error('[Send Message Error]', error);
    return sendError(res, 'Failed to send message.', 500);
  }
};

// 4. Initiate or Retrieve Existing Direct Conversation
export const initiateConversation = async (req, res) => {
  const role = req.user.role;
  const profileId = req.user.profileId;
  const { vendorId, customerId, bookingId, eventId, initialMessage } = req.body;

  let custId = null;
  let vendId = null;

  if (role === 'customer') {
    custId = profileId;
    vendId = vendorId;
  } else if (role === 'vendor') {
    vendId = profileId;
    custId = customerId;
  }

  if (!custId || !vendId) {
    return sendError(res, 'Both customer and vendor profiles are required to initiate conversation.', 400);
  }

  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();

    // Check if conversation already exists between this customer and vendor
    const [existing] = await conn.execute(
      `SELECT id, event_id, booking_id FROM conversations 
       WHERE customer_id = ? AND vendor_id = ? 
       ORDER BY updated_at DESC LIMIT 1`,
      [custId, vendId]
    );

    let conversationId;
    if (existing.length > 0) {
      conversationId = existing[0].id;
      if ((bookingId && !existing[0].booking_id) || (eventId && !existing[0].event_id)) {
        await conn.execute(
          `UPDATE conversations 
           SET booking_id = COALESCE(?, booking_id), 
               event_id = COALESCE(?, event_id),
               updated_at = NOW() 
           WHERE id = ?`,
          [bookingId || null, eventId || null, conversationId]
        );
      }
    } else {
      const [newConv] = await conn.execute(
        `INSERT INTO conversations (customer_id, vendor_id, event_id, booking_id) 
         VALUES (?, ?, ?, ?)`,
        [custId, vendId, eventId || null, bookingId || null]
      );
      conversationId = newConv.insertId;
    }

    if (initialMessage && initialMessage.trim()) {
      await conn.execute(
        `INSERT INTO messages (conversation_id, sender_id, content, is_read) 
         VALUES (?, ?, ?, FALSE)`,
        [conversationId, req.user.id, initialMessage.trim()]
      );
      await conn.execute(`UPDATE conversations SET updated_at = NOW() WHERE id = ?`, [conversationId]);
    }

    await conn.commit();
    return sendSuccess(res, { conversationId }, 'Conversation initiated successfully.');
  } catch (error) {
    await conn.rollback();
    console.error('[Initiate Conversation Error]', error);
    return sendError(res, 'Failed to start conversation.', 500);
  } finally {
    conn.release();
  }
};

