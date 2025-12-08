// validators/disease.ts
import Joi from "joi";

export const createDiseaseSchema = Joi.object({
  name: Joi.string().min(2).required(),
  description: Joi.string().optional(),
  vata: Joi.number().integer().min(-3).max(3).default(0),
  pitta: Joi.number().integer().min(-3).max(3).default(0),
  kapha: Joi.number().integer().min(-3).max(3).default(0)
});

export const updateDiseaseSchema = Joi.object({
  name: Joi.string().min(2).optional(),
  description: Joi.string().optional(),
  vata: Joi.number().integer().min(-3).max(3).optional(),
  pitta: Joi.number().integer().min(-3).max(3).optional(),
  kapha: Joi.number().integer().min(-3).max(3).optional()
});

export const paginationSchema = Joi.object({
  page: Joi.number().min(1).default(1),
  limit: Joi.number().min(1).default(10),
  sortBy: Joi.string().optional(),
  sortOrder: Joi.string().valid("asc", "desc").default("desc")
});

export const idSchema = Joi.object({
  id: Joi.string().required()
});
