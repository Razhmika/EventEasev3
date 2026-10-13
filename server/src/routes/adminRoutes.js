import { Router } from 'express';
import {
  getPlatformStats,
  getAllUsers,
  toggleUserStatus,
  getAllVendors,
  updateVendorVerification,
  getActivityLogs
} from '../controllers/adminController.js';
import { verifyToken } from '../middleware/authMiddleware.js';
import { requireRole } from '../middleware/roleMiddleware.js';

const router = Router();

// Strictly require admin role on every administrative endpoint
router.use(verifyToken, requireRole('admin'));

router.get('/stats', getPlatformStats);
router.get('/users', getAllUsers);
router.put('/users/:id/status', toggleUserStatus);
router.get('/vendors', getAllVendors);
router.put('/vendors/:id/verification', updateVendorVerification);
router.get('/activity-logs', getActivityLogs);

export default router;
