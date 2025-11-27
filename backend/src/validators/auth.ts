import Joi from 'joi';

export const loginSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().min(6).required(),
  role: Joi.string().valid('DOCTOR', 'PATIENT').required()
});

export const registerSchema = Joi.object({
  name: Joi.string().min(2).max(50).required(),
  email: Joi.string().email().required(),
  password: Joi.string().min(6).required(),
  role: Joi.string().valid('DOCTOR', 'PATIENT').required(),
  phone: Joi.string().optional(),
  address: Joi.string().optional(),
  // Doctor specific
  specialization: Joi.string().when('role', {
    is: 'DOCTOR',
    then: Joi.required(),
    otherwise: Joi.optional()
  }),
  licenseNumber: Joi.string().when('role', {
    is: 'DOCTOR',
    then: Joi.required(),
    otherwise: Joi.optional()
  }),
  experience: Joi.number().integer().min(0).when('role', {
    is: 'DOCTOR',
    then: Joi.required(),
    otherwise: Joi.optional()
  }),
  // Patient specific
  age: Joi.number().integer().min(1).max(120).when('role', {
    is: 'PATIENT',
    then: Joi.required(),
    otherwise: Joi.optional()
  }),
  gender: Joi.string().valid('male', 'female', 'other').when('role', {
    is: 'PATIENT',
    then: Joi.required(),
    otherwise: Joi.optional()
  }),
  doshaType: Joi.string().valid('VATA', 'PITTA', 'KAPHA', 'TRIDOSHA').optional(),
  medicalHistory: Joi.string().optional(),
  allergies: Joi.string().optional(),
  medications: Joi.string().optional()
});

export const changePasswordSchema = Joi.object({
  currentPassword: Joi.string().min(6).required(),
  newPassword: Joi.string().min(6).required(),
});