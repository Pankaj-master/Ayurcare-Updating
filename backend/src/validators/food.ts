import Joi from 'joi';

export const createFoodSchema = Joi.object({
  name: Joi.string().min(2).max(100).required(),
  description: Joi.string().optional(),

  category: Joi.string()
    .valid(
      'GRAINS', 'VEGETABLES', 'FRUITS', 'DAIRY',
      'SPICES', 'HERBS', 'NUTS', 'LEGUMES',
      'MEAT', 'FISH', 'OTHER'
    )
    .required(),

  calories: Joi.number().min(0).optional(),
  protein: Joi.number().min(0).optional(),
  carbs: Joi.number().min(0).optional(),
  fat: Joi.number().min(0).optional(),

  // Ayurvedic + JSON fields
  doshaEffects: Joi.string().optional(),  // JSON string (ex: '{"vata": "increase"}')
  rasa: Joi.string().optional(),
  virya: Joi.string().optional(),
  guna: Joi.string().optional(),
  vipaka: Joi.string().optional(),
  benefits: Joi.string().optional(),
  precautions: Joi.string().optional(),

  imageUrl: Joi.string().optional(),

  isActive: Joi.boolean().optional().default(true),
});


export const updateFoodSchema = Joi.object({
  name: Joi.string().min(2).max(100).optional(),
  description: Joi.string().optional(),

  category: Joi.string()
    .valid(
      'GRAINS', 'VEGETABLES', 'FRUITS', 'DAIRY',
      'SPICES', 'HERBS', 'NUTS', 'LEGUMES',
      'MEAT', 'FISH', 'OTHER'
    )
    .optional(),

  calories: Joi.number().min(0).optional(),
  protein: Joi.number().min(0).optional(),
  carbs: Joi.number().min(0).optional(),
  fat: Joi.number().min(0).optional(),

  // Ayurvedic + JSON fields
  doshaEffects: Joi.string().optional(),
  benefits: Joi.string().optional(),
  precautions: Joi.string().optional(),
  rasa: Joi.string().optional(),
  virya: Joi.string().optional(),
  guna: Joi.string().optional(),
  vipaka: Joi.string().optional(),

  imageUrl: Joi.string().optional(),
  isActive: Joi.boolean().optional(),
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
