import { Router } from 'express';
import { ReminderController } from '../controllers/ReminderController';
import { authenticateToken } from '../middleware/auth';
import { validateRequest, validateQuery, validateParams } from '../middleware/validation';
import { createReminderSchema, updateReminderSchema, paginationSchema, idSchema } from '../validators/reminder';

const router = Router();
const reminderController = new ReminderController();

// All routes require authentication
router.use(authenticateToken);

// Get all reminders for user
router.get('/', validateQuery(paginationSchema), reminderController.getAllReminders);

// Create new reminder
router.post('/', validateRequest(createReminderSchema), reminderController.createReminder);

// Get reminder by ID
router.get('/:id', validateParams(idSchema), reminderController.getReminderById);

// Update reminder
router.put('/:id', validateParams(idSchema), validateRequest(updateReminderSchema), reminderController.updateReminder);

// Delete reminder
router.delete('/:id', validateParams(idSchema), reminderController.deleteReminder);

export default router;



