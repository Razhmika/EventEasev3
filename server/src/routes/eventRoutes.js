import { Router } from 'express';
import {
  getMyEvents,
  getEventById,
  createEvent,
  updateEvent,
  cancelEvent
} from '../controllers/eventController.js';
import { verifyToken } from '../middleware/authMiddleware.js';
import { requireRole } from '../middleware/roleMiddleware.js';

const router = Router();

router.use(verifyToken);

// Customer event routes
router.get('/', requireRole('customer', 'admin'), getMyEvents);
router.get('/:id', getEventById);
router.post('/', requireRole('customer'), createEvent);
router.put('/:id', requireRole('customer'), updateEvent);
router.delete('/:id', requireRole('customer'), cancelEvent);

export default router;
