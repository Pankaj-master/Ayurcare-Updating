import Joi from 'joi';

export const createDietPlanSchema = Joi.object({
  name: Joi.string().min(2).max(100).required(),
  description: Joi.string().optional(),
  patientId: Joi.string().optional(),
  doshaType: Joi.string().valid('VATA', 'PITTA', 'KAPHA', 'TRIDOSHA').optional(),
  duration: Joi.number().integer().min(1).optional(),
  items: Joi.array().items(
    Joi.object({
      foodId: Joi.string().optional(),
      recipeId: Joi.string().optional(),
      mealType: Joi.string().valid('BREAKFAST', 'LUNCH', 'DINNER', 'SNACK').required(),
      quantity: Joi.number().min(0).optional(),
      unit: Joi.string().optional(),
      notes: Joi.string().optional(),
      dayOfWeek: Joi.number().integer().min(1).max(7).optional(),
      time: Joi.string().pattern(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/).optional()
    })
  ).min(1).required()
});

export const updateDietPlanSchema = Joi.object({
  name: Joi.string().min(2).max(100).optional(),
  description: Joi.string().optional(),
  patientId: Joi.string().optional(),
  doshaType: Joi.string().valid('VATA', 'PITTA', 'KAPHA', 'TRIDOSHA').optional(),
  duration: Joi.number().integer().min(1).optional(),
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
