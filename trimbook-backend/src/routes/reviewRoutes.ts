import { Router, Response, Request } from 'express';
import { authMiddleware, AuthRequest } from '../middleware/authMiddleware';
import { Review } from '../models/Review';
import { Booking } from '../models/Booking';
import { User } from '../models/User';
import { Notification } from '../models/Notification';

const STAR_MAP: Record<number, string> = { 1: '⭐', 2: '⭐⭐', 3: '⭐⭐⭐', 4: '⭐⭐⭐⭐', 5: '⭐⭐⭐⭐⭐' };

const router = Router();

// POST /api/reviews — client submits a review (must have completed booking)
router.post('/', authMiddleware, async (req: AuthRequest, res: any) => {
  try {
    const clientId = req.user?.id;
    if (!clientId) return res.status(401).json({ message: 'Unauthorized' });

    const { bookingId, rating, comment } = req.body;

    if (!bookingId || !rating) {
      return res.status(400).json({ message: 'bookingId and rating are required' });
    }
    if (rating < 1 || rating > 5) {
      return res.status(400).json({ message: 'Rating must be between 1 and 5' });
    }

    // Verify the booking exists, belongs to this client, and is Completed
    const booking = await Booking.findById(bookingId);
    if (!booking) return res.status(404).json({ message: 'Booking not found' });
    if (booking.userId.toString() !== clientId) {
      return res.status(403).json({ message: 'You can only review your own bookings' });
    }
    if (booking.status !== 'Completed') {
      return res.status(400).json({ message: 'You can only review completed appointments' });
    }

    // Find the barber by name to get their ID
    const barberUser = await User.findOne({ name: booking.barber, role: 'barber' }).select('_id name');
    if (!barberUser) return res.status(404).json({ message: 'Barber not found' });

    // Get client details for display
    const clientUser = await User.findById(clientId).select('name avatarUrl');

    // Check if a review already exists for this booking
    const existing = await Review.findOne({ bookingId });
    if (existing) {
      return res.status(409).json({ message: 'You already reviewed this appointment' });
    }

    const review = await Review.create({
      clientId,
      barberId: barberUser._id,
      bookingId,
      rating,
      comment: comment?.trim() || '',
      clientName: clientUser?.name || 'Anonymous',
      clientAvatar: clientUser?.avatarUrl || '',
    });

    // Notify the barber about the new review (non-blocking)
    try {
      const stars = STAR_MAP[rating] || `${rating}/5`;
      await Notification.create({
        userId: barberUser._id,
        type: 'new_review',
        title: `New Review — ${stars}`,
        message: `${clientUser?.name || 'A client'} rated your ${booking.service} session.${
          comment ? ` "${comment.substring(0, 60)}${comment.length > 60 ? '...' : ''}"` : ''
        }`,
        bookingId: booking._id as any,
      });
    } catch (notifErr) {
      console.error('Failed to notify barber of review:', notifErr);
    }

    res.status(201).json({ message: 'Review submitted successfully', review });
  } catch (error: any) {
    if (error.code === 11000) {
      return res.status(409).json({ message: 'You already reviewed this appointment' });
    }
    console.error('Review error:', error);
    res.status(500).json({ message: 'Server error submitting review' });
  }
});

// GET /api/reviews/barber/:barberId — get all reviews + stats for a barber
router.get('/barber/:barberId', async (req: Request, res: any) => {
  try {
    const { barberId } = req.params;

    const reviews = await Review.find({ barberId }).sort({ createdAt: -1 }).limit(20);

    const totalReviews = reviews.length;
    const avgRating = totalReviews > 0
      ? Math.round((reviews.reduce((sum, r) => sum + r.rating, 0) / totalReviews) * 10) / 10
      : 0;

    res.status(200).json({ reviews, avgRating, totalReviews });
  } catch (error) {
    console.error('Fetch reviews error:', error);
    res.status(500).json({ message: 'Server error fetching reviews' });
  }
});

// GET /api/reviews/booking/:bookingId — check if a booking has been reviewed (for client UI)
router.get('/booking/:bookingId', authMiddleware, async (req: AuthRequest, res: any) => {
  try {
    const review = await Review.findOne({ bookingId: req.params.bookingId });
    res.status(200).json({ reviewed: !!review, review: review || null });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// GET /api/reviews/my-reviews — barber fetches all their own reviews + stats
router.get('/my-reviews', authMiddleware, async (req: AuthRequest, res: any) => {
  try {
    const userId = req.user?.id;
    if (!userId) return res.status(401).json({ message: 'Unauthorized' });

    const reviews = await Review.find({ barberId: userId }).sort({ createdAt: -1 });

    const totalReviews = reviews.length;
    const avgRating = totalReviews > 0
      ? Math.round((reviews.reduce((sum, r) => sum + r.rating, 0) / totalReviews) * 10) / 10
      : 0;

    // Star breakdown
    const breakdown: Record<number, number> = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
    reviews.forEach(r => { breakdown[r.rating] = (breakdown[r.rating] || 0) + 1; });

    res.status(200).json({ reviews, avgRating, totalReviews, breakdown });
  } catch (error) {
    console.error('My reviews error:', error);
    res.status(500).json({ message: 'Server error fetching reviews' });
  }
});

export default router;
