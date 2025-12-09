import { Router } from 'express';
import { UserController } from '../controllers/UserController';
import { authenticateToken, authorizeRoles } from '../middleware/auth';
import { validateRequest, validateQuery } from '../middleware/validation';
import { updateUserSchema, paginationSchema } from '../validators/user';
import multer from "multer";

// Temporary local storage (later you can switch to S3/Cloudinary)
const upload = multer({ dest: "uploads/" });

const router = Router();
const userController = new UserController();

// All routes require authentication
router.use(authenticateToken);

// Get all users (Doctor only)
router.get('/', authorizeRoles('DOCTOR'), validateQuery(paginationSchema), userController.getAllUsers);

// Get user by ID
router.get('/:id', userController.getUserById);

// Update user profile
router.put('/:id',upload.single("avatar"), validateRequest(updateUserSchema), userController.updateUser);

// Delete user (Doctor only)
router.delete('/:id', authorizeRoles('DOCTOR'), userController.deleteUser);

export default router;

