import { Router } from 'express';
import { createService, updateService, deleteService, getAllServices, getBarberServices } from '../controllers/serviceController';
import { authMiddleware } from '../middleware/authMiddleware';

const router = Router();

// Public routes
router.get('/', getAllServices);
router.get('/barber/:barberId', getBarberServices);

// Protected routes (Barber only)
router.post('/', authMiddleware, createService as any);
router.put('/:id', authMiddleware, updateService as any);
router.delete('/:id', authMiddleware, deleteService as any);

export default router;
