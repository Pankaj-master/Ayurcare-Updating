import Joi from 'joi';

export const createPatientSchema = Joi.object({
  // ---- USER FIELDS ----
  email: Joi.string().email().required(),
  name: Joi.string().min(2).max(50).required(),

  // ---- PATIENT REQUIRED FIELDS ----
  doctorId: Joi.string().required(),
  patientCode: Joi.string().required(),

  // ---- USER OPTIONAL FIELDS ----
  phone: Joi.string().optional(),
  address: Joi.string().optional(),
  age: Joi.number().integer().min(1).max(120).optional(),
  gender: Joi.string().valid('male', 'female', 'other').optional(),
  doshaType: Joi.string().valid('VATA', 'PITTA', 'KAPHA', 'TRIDOSHA').optional(),
  medicalHistory: Joi.string().optional(),
  allergies: Joi.string().optional(),
  medications: Joi.string().optional(),

  // ---- PATIENT OPTIONAL FIELDS ----
  height: Joi.number().positive().optional(),
  weight: Joi.number().positive().optional(),
  sleepPattern: Joi.string().optional(),
  bowelMovement: Joi.string().optional(),
  bloodGroup: Joi.string().optional(),
  mealFrequency: Joi.number().integer().min(1).max(20).optional(),
  waterIntake: Joi.number().positive().optional(),
  notes: Joi.string().optional(),
});


export const updatePatientSchema = Joi.object({
  patientCode: Joi.string().optional(),

  height: Joi.number().positive().optional(),
  weight: Joi.number().positive().optional(),
  sleepPattern: Joi.string().optional(),
  bowelMovement: Joi.string().optional(),

  bloodGroup: Joi.string().optional(),
  mealFrequency: Joi.number().integer().min(1).max(20).optional(),
  waterIntake: Joi.number().positive().optional(),
  notes: Joi.string().optional(),
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