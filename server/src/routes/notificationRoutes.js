import { Router } from 'express';
import {
  getMyNotifications,
  markNotificationRead,
  markAllNotificationsRead
} from '../controllers/notificationController.js';
import { verifyToken } from '../middleware/authMiddleware.js';

const router = Router();

router.use(verifyToken);

router.get('/', getMyNotifications);
router.put('/:id/read', markNotificationRead);
router.put('/read-all', markAllNotificationsRead);

export default router;
