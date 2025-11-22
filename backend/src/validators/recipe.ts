import Joi from 'joi';

export const createRecipeSchema = Joi.object({
  name: Joi.string().min(2).max(100).required(),
  description: Joi.string().optional(),
  instructions: Joi.string().min(10).required(),
  prepTime: Joi.number().integer().min(0).optional(),
  cookTime: Joi.number().integer().min(0).optional(),
  servings: Joi.number().integer().min(1).optional(),
  difficulty: Joi.string().valid('easy', 'medium', 'hard').optional(),
  imageUrl: Joi.string().optional(),
  items: Joi.array().items(
    Joi.object({
      foodId: Joi.string().required(),
      quantity: Joi.number().min(0).required(),
      unit: Joi.string().required()
    })
  ).min(1).required()
});

export const updateRecipeSchema = Joi.object({
  name: Joi.string().min(2).max(100).optional(),
  description: Joi.string().optional(),
  instructions: Joi.string().min(10).optional(),
  prepTime: Joi.number().integer().min(0).optional(),
  cookTime: Joi.number().integer().min(0).optional(),
  servings: Joi.number().integer().min(1).optional(),
  difficulty: Joi.string().valid('easy', 'medium', 'hard').optional(),
  imageUrl: Joi.string().optional(),
  isActive: Joi.boolean().optional()
});

export const paginationSchema = Joi.object({
  page: Joi.number().integer().min(1).default(1),
  limit: Joi.number().integer().min(1).max(100).default(10),
  sortBy: Joi.string().optional(),
  sortOrder: Joi.string().valid('asc', 'desc').default('desc')
});

export const idSchema = Joi.object({
  id: Joi.string().required()
});