import Joi from 'joi';

export const createAppointmentSchema = Joi.object({
  doctorId: Joi.string().required(),
  patientId: Joi.string().required(),
  date: Joi.date().iso().required(),
  time: Joi.string().pattern(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/).required(),
  duration: Joi.number().integer().min(15).max(480).optional(),
  notes: Joi.string().optional()
});

export const updateAppointmentSchema = Joi.object({
  date: Joi.date().iso().optional(),
  time: Joi.string().pattern(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/).optional(),
  duration: Joi.number().integer().min(15).max(480).optional(),
  status: Joi.string().valid('scheduled', 'completed', 'cancelled').optional(),
  notes: Joi.string().optional()
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
