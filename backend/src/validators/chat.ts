import Joi from 'joi';

export const createMessageSchema = Joi.object({
  receiverId: Joi.string().optional(),
  patientId: Joi.string().optional(),
  message: Joi.string().min(1).max(1000).required()
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
