import { Router } from 'express';
import { AppointmentController } from '../controllers/AppointmentController';
import { authenticateToken, authorizeRoles } from '../middleware/auth';
import { validateRequest, validateQuery, validateParams } from '../middleware/validation';
import { createAppointmentSchema, updateAppointmentSchema, paginationSchema, idSchema } from '../validators/appointment';

const router = Router();
const appointmentController = new AppointmentController();

// All routes require authentication
router.use(authenticateToken);

// Get all appointments
router.get('/', validateQuery(paginationSchema), appointmentController.getAllAppointments);

// Create new appointment (Doctor only)
router.post('/', authorizeRoles('DOCTOR'), validateRequest(createAppointmentSchema), appointmentController.createAppointment);

// Get appointment by ID
router.get('/:id', validateParams(idSchema), appointmentController.getAppointmentById);

// Update appointment (Doctor only)
router.put('/:id', authorizeRoles('DOCTOR'), validateParams(idSchema), validateRequest(updateAppointmentSchema), appointmentController.updateAppointment);

// Delete appointment (Doctor only)
router.delete('/:id', authorizeRoles('DOCTOR'), validateParams(idSchema), appointmentController.deleteAppointment);

export default router;



