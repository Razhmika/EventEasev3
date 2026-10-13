import { Router } from 'express';
import { planEventWithAI } from '../controllers/aiController.js';
import { verifyToken } from '../middleware/authMiddleware.js';

const router = Router();

// Endpoint accessible to authenticated users
router.post('/plan', verifyToken, planEventWithAI);

export default router;
