import { Router } from 'express';
import { getBarbers, deleteUserProfile, updateUserProfile } from '../controllers/userController';
import { authMiddleware } from '../middleware/authMiddleware';

const router = Router();

router.get('/barbers', getBarbers);
router.put('/profile', authMiddleware, updateUserProfile as any);
router.delete('/profile', authMiddleware, deleteUserProfile as any);

export default router;
