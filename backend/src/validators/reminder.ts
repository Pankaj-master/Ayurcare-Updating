import Joi from 'joi';

export const createReminderSchema = Joi.object({
  title: Joi.string().min(2).max(100).required(),
  message: Joi.string().min(5).max(500).required(),
  date: Joi.date().iso().required(),
  time: Joi.string().pattern(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/).required()
});

export const updateReminderSchema = Joi.object({
  title: Joi.string().min(2).max(100).optional(),
  message: Joi.string().min(5).max(500).optional(),
  date: Joi.date().iso().optional(),
  time: Joi.string().pattern(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/).optional(),
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