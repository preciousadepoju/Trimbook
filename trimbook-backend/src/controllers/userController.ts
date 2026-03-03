import { Request, Response } from 'express';
import { User } from '../models/User';
import { Review } from '../models/Review';

export const getBarbers = async (req: Request, res: Response): Promise<void> => {
  try {
    const barbers = await User.find({ role: 'barber' }).select('name email avatarUrl phone location workingHours portfolioImages').lean();

    // Attach avg rating + review count to each barber
    const barbersWithRatings = await Promise.all(
      barbers.map(async (barber: any) => {
        const reviews = await Review.find({ barberId: barber._id });
        const totalReviews = reviews.length;
        const avgRating = totalReviews > 0
          ? Math.round((reviews.reduce((s, r) => s + r.rating, 0) / totalReviews) * 10) / 10
          : 0;
        return { ...barber, avgRating, reviewCount: totalReviews };
      })
    );

    res.status(200).json(barbersWithRatings);
  } catch (error) {
    console.error('Error fetching barbers:', error);
    res.status(500).json({ message: 'Server error fetching barbers' });
  }
};

import { AuthRequest } from '../middleware/authMiddleware';

export const deleteUserProfile = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      res.status(401).json({ message: 'Unauthorized' });
      return;
    }

    const { User } = await import('../models/User');
    const user = await User.findByIdAndDelete(userId);

    if (!user) {
      res.status(404).json({ message: 'User not found' });
      return;
    }

    res.status(200).json({ message: 'Account deleted successfully' });
  } catch (error) {
    console.error('Error deleting user profile:', error);
    res.status(500).json({ message: 'Server error deleting account' });
  }
};

export const updateUserProfile = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      res.status(401).json({ message: 'Unauthorized' });
      return;
    }

    const { name, phone, location, workingHours } = req.body;
    const { User } = await import('../models/User');

    const updatedUser = await User.findByIdAndUpdate(
      userId,
      { 
        $set: { 
          ...(name && { name }),
          ...(phone && { phone }),
          ...(location && { location }),
          ...(workingHours && { workingHours })
        }
      },
      { new: true }
    ).select('-passwordHash');

    if (!updatedUser) {
      res.status(404).json({ message: 'User not found' });
      return;
    }

    res.status(200).json({ message: 'Profile updated successfully', user: updatedUser });
  } catch (error) {
    console.error('Error updating profile:', error);
    res.status(500).json({ message: 'Server error updating profile' });
  }
};
