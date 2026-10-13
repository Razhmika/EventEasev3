import { Router } from 'express';
import {
  getVendors,
  getVendorById,
  getMyServices,
  addService,
  updateService,
  deleteService,
  getMyPortfolio,
  addPortfolioItem,
  deletePortfolioItem,
  getMyAvailability,
  setAvailability
} from '../controllers/vendorController.js';
import { verifyToken } from '../middleware/authMiddleware.js';
import { requireRole } from '../middleware/roleMiddleware.js';

const router = Router();

// Public routes
router.get('/', getVendors);
router.get('/:id', getVendorById);

// Protected vendor routes
router.use(verifyToken, requireRole('vendor'));

// Services
router.get('/me/services', getMyServices);
router.post('/me/services', addService);
router.put('/me/services/:id', updateService);
router.delete('/me/services/:id', deleteService);

// Portfolio
router.get('/me/portfolio', getMyPortfolio);
router.post('/me/portfolio', addPortfolioItem);
router.delete('/me/portfolio/:id', deletePortfolioItem);

// Availability
router.get('/me/availability', getMyAvailability);
router.post('/me/availability', setAvailability);

export default router;
