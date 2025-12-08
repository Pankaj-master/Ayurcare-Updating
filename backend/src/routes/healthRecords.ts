import { Router } from 'express';
import { HealthRecordController } from '../controllers/HealthRecordController';
import { authenticateToken, authorizeRoles } from '../middleware/auth';
import { validateRequest, validateQuery, validateParams } from '../middleware/validation';
import { createHealthRecordSchema, updateHealthRecordSchema, paginationSchema, idSchema } from '../validators/healthRecord';

const router = Router();
const healthRecordController = new HealthRecordController();

// All routes require authentication
router.use(authenticateToken);

// Get all health records
router.get('/', validateQuery(paginationSchema), healthRecordController.getAllHealthRecords);

// Create new health record (Doctor only)
router.post('/', authorizeRoles('DOCTOR'), validateRequest(createHealthRecordSchema), healthRecordController.createHealthRecord);

// Get health record by ID
router.get('/:id', validateParams(idSchema), healthRecordController.getHealthRecordById);

// Update health record (Doctor only)
router.put('/:id', authorizeRoles('DOCTOR'), validateParams(idSchema), validateRequest(updateHealthRecordSchema), healthRecordController.updateHealthRecord);

// Delete health record (Doctor only)
router.delete('/:id', authorizeRoles('DOCTOR'), validateParams(idSchema), healthRecordController.deleteHealthRecord);

export default router;



