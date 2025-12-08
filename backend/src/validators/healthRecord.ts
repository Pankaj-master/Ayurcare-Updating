import Joi from 'joi';

export const createHealthRecordSchema = Joi.object({
  patientId: Joi.string().required(),
  date: Joi.date().iso().required(),
  weight: Joi.number().min(0).max(500).optional(),
  height: Joi.number().min(0).max(300).optional(),
  bloodPressure: Joi.string().pattern(/^\d{1,3}\/\d{1,3}$/).optional(),
  heartRate: Joi.number().integer().min(30).max(200).optional(),
  temperature: Joi.number().min(30).max(45).optional(),
  symptoms: Joi.string().optional(),
  diagnosis: Joi.string().optional(),
  notes: Joi.string().optional()
});

export const updateHealthRecordSchema = Joi.object({
  date: Joi.date().iso().optional(),
  weight: Joi.number().min(0).max(500).optional(),
  height: Joi.number().min(0).max(300).optional(),
  bloodPressure: Joi.string().pattern(/^\d{1,3}\/\d{1,3}$/).optional(),
  heartRate: Joi.number().integer().min(30).max(200).optional(),
  temperature: Joi.number().min(30).max(45).optional(),
  symptoms: Joi.string().optional(),
  diagnosis: Joi.string().optional(),
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