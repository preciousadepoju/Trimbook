import { Router } from 'express';
import { register, login, getProfile, verifyEmail, forgotPassword, resetPassword } from '../controllers/authController';

const router = Router();

// Auth routes
router.post('/register', register);
router.post('/login', login);
router.post('/verify-email', verifyEmail);
router.get('/profile', getProfile);
router.post('/forgot-password', forgotPassword);
router.post('/reset-password', resetPassword);

export default router;
