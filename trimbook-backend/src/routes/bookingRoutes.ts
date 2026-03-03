import { Router } from 'express';
import { createBooking, getBookings, updateBookingStatus, updateBooking, getAvailableSlots } from '../controllers/bookingController';
import { authMiddleware } from '../middleware/authMiddleware';

const router = Router();

router.get('/unavailable-slots', getAvailableSlots as any);
router.post('/', authMiddleware, createBooking as any);
router.get('/', authMiddleware, getBookings as any);
router.patch('/:id/status', authMiddleware, updateBookingStatus as any);
router.put('/:id', authMiddleware, updateBooking as any);

export default router;
