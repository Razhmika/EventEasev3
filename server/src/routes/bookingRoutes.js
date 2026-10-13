import { Router } from 'express';
import {
  createBooking,
  getMyBookings,
  updateBookingStatus
} from '../controllers/bookingController.js';
import { verifyToken } from '../middleware/authMiddleware.js';

const router = Router();

router.use(verifyToken);

router.get('/', getMyBookings);
router.post('/', createBooking);
router.put('/:id/status', updateBookingStatus);

export default router;
