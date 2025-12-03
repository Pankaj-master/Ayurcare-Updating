import { Router } from 'express';
import { DietPlanController } from '../controllers/DietPlanController';
import { authenticateToken, authorizeRoles } from '../middleware/auth';
import { validateRequest, validateQuery, validateParams } from '../middleware/validation';
import { createDietPlanSchema, updateDietPlanSchema, paginationSchema, idSchema } from '../validators/dietPlan';

const router = Router();
const dietPlanController = new DietPlanController();

// All routes require authentication
router.use(authenticateToken);

/* -------------------------------------
 * STATIC ROUTES (NON-DYNAMIC FIRST)
 * -----------------------------------*/

// Get all diet plans
router.get('/', validateQuery(paginationSchema), dietPlanController.getAllDietPlans);

// Create new diet plan (Doctor only)
router.post('/', authorizeRoles('DOCTOR'), validateRequest(createDietPlanSchema), dietPlanController.createDietPlan);

// Get diet plans assigned to a specific patient
router.get('/patient/:patientId', dietPlanController.getDietPlansForPatient);

// Get diet plans by Doctor
router.get('/doctor/:doctorId', authorizeRoles('DOCTOR'), dietPlanController.getDietPlansByDoctor);

// Duplicate a diet plan
router.post('/:id/duplicate', authorizeRoles('DOCTOR'), validateParams(idSchema), dietPlanController.duplicateDietPlan);

// Add a new item to existing plan
router.post('/:id/add-item', authorizeRoles('DOCTOR'), validateParams(idSchema), dietPlanController.addDietPlanItem);

// Update a single item
router.put('/item/:itemId', authorizeRoles('DOCTOR'), dietPlanController.updateDietPlanItem);

// Delete a single item
router.delete('/item/:itemId', authorizeRoles('DOCTOR'), dietPlanController.deleteDietPlanItem);

/* -------------------------------------
 * NESTED ROUTES BEFORE GENERIC :id
 * -----------------------------------*/

// Get diet plan items
router.get('/:id/items', validateParams(idSchema), dietPlanController.getDietPlanItems);

// Diet plan grouped by days
router.get('/:id/days', validateParams(idSchema), dietPlanController.getDietPlanByDays);

// Get a specific day of the diet
router.get('/:id/day/:dayNumber', validateParams(idSchema), dietPlanController.getDietPlanByDay);


/* -------------------------------------
 * GENERIC :id ROUTES AT THE END
 * -----------------------------------*/

// Get diet plan by ID
router.get('/:id', validateParams(idSchema), dietPlanController.getDietPlanById);

// Update diet plan
router.put('/:id', authorizeRoles('DOCTOR'), validateParams(idSchema), validateRequest(updateDietPlanSchema), dietPlanController.updateDietPlan);

// Delete diet plan
router.delete('/:id', authorizeRoles('DOCTOR'), validateParams(idSchema), dietPlanController.deleteDietPlan);

export default router;
