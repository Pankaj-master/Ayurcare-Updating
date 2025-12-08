import { Router } from 'express';
import { DiseaseController } from '../controllers/DeseaseController';
import { authenticateToken, authorizeRoles } from '../middleware/auth';
import { validateRequest, validateQuery, validateParams } from '../middleware/validation';
import { createDiseaseSchema, updateDiseaseSchema, paginationSchema, idSchema } from '../validators/desease';

const router = Router();
const diseaseController = new DiseaseController();

// All disease routes require authentication
router.use(authenticateToken);

// Get all diseases (paginated)
router.get('/', validateQuery(paginationSchema), diseaseController.getAllDiseases);

// Create new disease (Doctor only)
router.post('/', authorizeRoles('DOCTOR'), validateRequest(createDiseaseSchema), diseaseController.createDisease);

// Get disease by ID
router.get('/:id', validateParams(idSchema), diseaseController.getDiseaseById);

// Update disease (Doctor only)
router.put('/:id', authorizeRoles('DOCTOR'), validateParams(idSchema), validateRequest(updateDiseaseSchema), diseaseController.updateDisease);

// Delete disease (Doctor only)
router.delete('/:id', authorizeRoles('DOCTOR'), validateParams(idSchema), diseaseController.deleteDisease);

export default router;
