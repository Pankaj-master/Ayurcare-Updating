import { Router } from 'express';
import { FoodController } from '../controllers/FoodController';
import { authenticateToken, authorizeRoles } from '../middleware/auth';
import { validateRequest, validateQuery, validateParams } from '../middleware/validation';
import { createFoodSchema, updateFoodSchema, paginationSchema, idSchema } from '../validators/food';

const router = Router();
const foodController = new FoodController();

// All routes require authentication
router.use(authenticateToken);

// Get all foods
router.get('/', validateQuery(paginationSchema), foodController.getAllFoods);

// Create new food (Doctor only)
router.post('/', authorizeRoles('DOCTOR'), validateRequest(createFoodSchema), foodController.createFood);

// Search foods by category
router.get('/category/:category',
  validateQuery(paginationSchema), // keep pagination validation
  foodController.getFoodsByCategory
);


// Get food by ID
router.get('/:id', validateParams(idSchema), foodController.getFoodById);

// Update food (Doctor only)
router.put('/:id', authorizeRoles('DOCTOR'), validateParams(idSchema), validateRequest(updateFoodSchema), foodController.updateFood);

// Delete food (Doctor only)
router.delete('/:id', authorizeRoles('DOCTOR'), validateParams(idSchema), foodController.deleteFood);


export default router;

