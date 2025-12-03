import Joi from "joi";

export const createReminderSchema = Joi.object({
  userId: Joi.string().required(),
  title: Joi.string().min(2).max(100).required(),
  description: Joi.string().allow("", null).max(500),
  message: Joi.string().allow("", null).max(500), // optional message
  type: Joi.string().valid("meal", "medicine", "activity", "hydration").optional(),
  frequency: Joi.string()
    .valid("daily", "weekdays", "weekends", "custom")
    .optional(),
  days: Joi.array().items(Joi.string()).default([]), // string[]
  date: Joi.date().iso().optional(),
  time: Joi.string()
    .pattern(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/)
    .required(),
  isActive: Joi.boolean().default(true),
  lastTriggered: Joi.date().iso().optional(),
  nextTrigger: Joi.date().iso().optional(),
});

export const updateReminderSchema = Joi.object({
  title: Joi.string().min(2).max(100).optional(),
  description: Joi.string().allow("", null).max(500).optional(),
  message: Joi.string().allow("", null).max(500).optional(),
  type: Joi.string()
    .valid("meal", "medicine", "activity", "hydration")
    .optional(),
  frequency: Joi.string()
    .valid("daily", "weekdays", "weekends", "custom")
    .optional(),
  days: Joi.array().items(Joi.string()).optional(),
  date: Joi.date().iso().optional(),
  time: Joi.string()
    .pattern(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/)
    .optional(),
  isActive: Joi.boolean().optional(),
  lastTriggered: Joi.date().iso().optional(),
  nextTrigger: Joi.date().iso().optional(),
});

export const paginationSchema = Joi.object({
  page: Joi.number().integer().min(1).default(1),
  limit: Joi.number().integer().min(1).max(100).default(10),
  sortBy: Joi.string().optional(),
  sortOrder: Joi.string().valid("asc", "desc").default("desc"),
});

export const idSchema = Joi.object({
  id: Joi.string().required(),
});
