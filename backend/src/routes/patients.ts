import { Router } from 'express';
import { PatientController } from '../controllers/PatientController';
import { authenticateToken, authorizeRoles } from '../middleware/auth';
import { validateRequest, validateQuery, validateParams } from '../middleware/validation';
import { createPatientSchema, updatePatientSchema, paginationSchema, idSchema } from '../validators/patient';

const router = Router();
const patientController = new PatientController();

// All routes require authentication
router.use(authenticateToken);

// Get all patients (Doctor only)
router.get('/', authorizeRoles('DOCTOR'), validateQuery(paginationSchema), patientController.getAllPatients);

// Create new patient (Doctor only)
router.post('/', authorizeRoles('DOCTOR'), validateRequest(createPatientSchema), patientController.createPatient);

// Get patient by ID
router.get('/:id', validateParams(idSchema), patientController.getPatientById);

// Update patient (Doctor only)
router.put('/:id', authorizeRoles('DOCTOR'), validateParams(idSchema), validateRequest(updatePatientSchema), patientController.updatePatient);

// Delete patient (Doctor only)
router.delete('/:id', authorizeRoles('DOCTOR'), validateParams(idSchema), patientController.deletePatient);

// Get patient's diet plans
router.get('/:id/diet-plans', validateParams(idSchema), validateQuery(paginationSchema), patientController.getPatientDietPlans);

// Get patient's health records
router.get('/:id/health-records', validateParams(idSchema), validateQuery(paginationSchema), patientController.getPatientHealthRecords);

export default router;

