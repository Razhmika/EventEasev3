import { Router } from 'express';
import { createReview, getVendorReviews } from '../controllers/reviewController.js';
import { verifyToken } from '../middleware/authMiddleware.js';
import { requireRole } from '../middleware/roleMiddleware.js';

const router = Router();

router.get('/vendor/:vendorId', getVendorReviews);
router.post('/', verifyToken, requireRole('customer'), createReview);

export default router;
