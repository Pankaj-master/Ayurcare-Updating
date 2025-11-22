import { Router } from 'express';
import { RecipeController } from '../controllers/RecipeController';
import { authenticateToken, authorizeRoles } from '../middleware/auth';
import { validateRequest, validateQuery, validateParams } from '../middleware/validation';
import { createRecipeSchema, updateRecipeSchema, paginationSchema, idSchema } from '../validators/recipe';

const router = Router();
const recipeController = new RecipeController();

// All routes require authentication
router.use(authenticateToken);

// Get all recipes
router.get('/', validateQuery(paginationSchema), recipeController.getAllRecipes);

// Create new recipe (Doctor only)
router.post('/', authorizeRoles('DOCTOR'), validateRequest(createRecipeSchema), recipeController.createRecipe);

// Get recipe by ID
router.get('/:id', validateParams(idSchema), recipeController.getRecipeById);

// Update recipe (Doctor only)
router.put('/:id', authorizeRoles('DOCTOR'), validateParams(idSchema), validateRequest(updateRecipeSchema), recipeController.updateRecipe);

// Delete recipe (Doctor only)
router.delete('/:id', authorizeRoles('DOCTOR'), validateParams(idSchema), recipeController.deleteRecipe);

// Get recipes by difficulty
router.get('/difficulty/:difficulty', validateParams(idSchema), validateQuery(paginationSchema), recipeController.getRecipesByDifficulty);

export default router;
