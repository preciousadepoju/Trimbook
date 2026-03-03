import { Router } from 'express';
import { register, login, getProfile, verifyEmail } from '../controllers/authController';

const router = Router();

// Auth routes
router.post('/register', register);
router.post('/login', login);
router.post('/verify-email', verifyEmail);
router.get('/profile', getProfile);

export default router;
