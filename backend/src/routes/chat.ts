import { Router } from 'express';
import { ChatController } from '../controllers/ChatController';
import { authenticateToken } from '../middleware/auth';
import { validateRequest, validateQuery, validateParams } from '../middleware/validation';
import { createMessageSchema, paginationSchema, idSchema, messageIdSchema } from '../validators/chat';

const router = Router();
const chatController = new ChatController();

// All routes require authentication
router.use(authenticateToken);

// Get all messages
router.get('/', validateQuery(paginationSchema), chatController.getAllMessages);

// Send new message
router.post('/', validateRequest(createMessageSchema), chatController.sendMessage);

// Get chat summaries for current user
router.get('/summaries', validateQuery(paginationSchema), chatController.getChatSummary);

// Get conversation between users
router.get('/conversation/:userId', validateParams(idSchema), validateQuery(paginationSchema), chatController.getConversation);



// Get message by ID
router.get('/:id', validateParams(idSchema), chatController.getMessageById);

// Mark message as read
router.put('/:id/read', validateParams(messageIdSchema), chatController.markAsRead);



export default router;



