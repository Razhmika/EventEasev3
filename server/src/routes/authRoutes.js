import { Router } from 'express';
import {
  registerCustomer,
  registerVendor,
  login,
  getProfile,
  updateProfile
} from '../controllers/authController.js';
import { verifyToken } from '../middleware/authMiddleware.js';
import { authLimiter } from '../middleware/rateLimiter.js';

const router = Router();

// Public routes with rate limiting
router.post('/register/customer', authLimiter, registerCustomer);
router.post('/register/vendor', authLimiter, registerVendor);
router.post('/login', authLimiter, login);

// Authenticated profile routes
router.get('/profile', verifyToken, getProfile);
router.put('/profile', verifyToken, updateProfile);

export default router;
