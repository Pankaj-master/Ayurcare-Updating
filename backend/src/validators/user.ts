import Joi from 'joi';

export const idSchema = Joi.object({
  id: Joi.string().required()
});

export const paginationSchema = Joi.object({
  page: Joi.number().integer().min(1).default(1),
  limit: Joi.number().integer().min(1).max(100).default(10),
  sortBy: Joi.string().optional(),
  sortOrder: Joi.string().valid('asc', 'desc').default('desc')
});

export const updateUserSchema = Joi.object({
  name: Joi.string().min(2).max(50).optional(),
  phone: Joi.string().optional(),
  address: Joi.string().optional(),
  avatar: Joi.string().optional(),
  specialization: Joi.string().optional(),
  licenseNumber: Joi.string().optional(),
  experience: Joi.number().integer().min(0).optional(),
  age: Joi.number().integer().min(1).max(120).optional(),
  gender: Joi.string().valid('male', 'female', 'other').optional(),
  doshaType: Joi.string().valid('VATA', 'PITTA', 'KAPHA', 'TRIDOSHA').optional(),
  medicalHistory: Joi.string().optional(),
  allergies: Joi.string().optional(),
  medications: Joi.string().optional()
});



