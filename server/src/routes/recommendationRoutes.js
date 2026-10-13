import { Router } from 'express';
import { getRecommendationsForEvent } from '../controllers/recommendationController.js';
import { verifyToken } from '../middleware/authMiddleware.js';

const router = Router();

router.get('/event/:eventId', verifyToken, getRecommendationsForEvent);

export default router;
