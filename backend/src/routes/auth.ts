import { Router } from 'express';
import { AuthController } from '../controllers/AuthController';
import { validateRequest } from '../middleware/validation';
import { authenticateToken } from '../middleware/auth';
import { loginSchema, registerSchema } from '../validators/auth';

const router = Router();
const authController = new AuthController();

// Public routes
router.post('/login', validateRequest(loginSchema), authController.login.bind(authController));
router.post('/register', validateRequest(registerSchema), authController.register.bind(authController));

// Protected routes
router.get('/me', authenticateToken, authController.getMe.bind(authController));
router.post('/refresh', authController.refreshToken.bind(authController));
router.post('/logout', authenticateToken, authController.logout.bind(authController));

export default router;