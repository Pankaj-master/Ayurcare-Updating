import { Router } from 'express';
import { DietPlanController } from '../controllers/DietPlanController';
import { authenticateToken, authorizeRoles } from '../middleware/auth';
import { validateRequest, validateQuery, validateParams } from '../middleware/validation';
import { createDietPlanSchema, updateDietPlanSchema, paginationSchema, idSchema } from '../validators/dietPlan';

const router = Router();
const dietPlanController = new DietPlanController();

// All routes require authentication
router.use(authenticateToken);

// Get all diet plans
router.get('/', validateQuery(paginationSchema), dietPlanController.getAllDietPlans);

// Create new diet plan (Doctor only)
router.post('/', authorizeRoles('DOCTOR'), validateRequest(createDietPlanSchema), dietPlanController.createDietPlan);

// Get diet plan by ID
router.get('/:id', validateParams(idSchema), dietPlanController.getDietPlanById);

// Update diet plan (Doctor only)
router.put('/:id', authorizeRoles('DOCTOR'), validateParams(idSchema), validateRequest(updateDietPlanSchema), dietPlanController.updateDietPlan);

// Delete diet plan (Doctor only)
router.delete('/:id', authorizeRoles('DOCTOR'), validateParams(idSchema), dietPlanController.deleteDietPlan);

// Get diet plan items
router.get('/:id/items', validateParams(idSchema), dietPlanController.getDietPlanItems);

export default router;


