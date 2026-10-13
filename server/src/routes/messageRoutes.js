import { Router } from 'express';
import {
  getConversations,
  getMessages,
  sendMessage,
  initiateConversation
} from '../controllers/messageController.js';
import { verifyToken } from '../middleware/authMiddleware.js';

const router = Router();

router.use(verifyToken);

router.get('/conversations', getConversations);
router.post('/conversations/initiate', initiateConversation);
router.get('/conversations/:id', getMessages);
router.post('/conversations/:id/messages', sendMessage);

export default router;
