import { Response } from 'express';
import { AuthRequest } from '../middleware/authMiddleware';
import { Booking } from '../models/Booking';

export const getDashboardData = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      res.status(401).json({ message: 'Unauthorized' });
      return;
    }

    const { User } = await import('../models/User');
    const user = await User.findById(userId);
    if (!user) {
      res.status(404).json({ message: 'User not found' });
      return;
    }

    const isBarber = user.role === 'barber';
    const now = new Date();

    // Fetch relevant bookings
    // For barber: find where barber name matches user.name, and populate client details
    // For client: find where userId matches user._id
    let allBookings: any[] = [];
    
    if (isBarber) {
      allBookings = await Booking.find({ barber: user.name })
        .populate('userId', 'name email avatarUrl')
        .sort({ date: -1 });
    } else {
      allBookings = await Booking.find({ userId }).sort({ date: -1 });
    }

    // Seed dummy data if empty just for show, but skip it to avoid blowing up logic here
    // We already seeded before, but users might have empty dashboards. Let's keep it simple.
    
    const upcomingBookings = allBookings.filter(b => b.date > now && b.status === 'Upcoming');
    const pastBookings = allBookings.filter(b => b.date <= now || b.status !== 'Upcoming');
    
    // Calculate stats
    const totalBookings = allBookings.length;
    
    let highlightStat = 'None Yet';
    let maxCount = 0;
    const counts: Record<string, number> = {};

    if (isBarber) {
      // Find top client
      allBookings.forEach(b => {
        const clientName = b.userId?.name || 'Unknown Client';
        counts[clientName] = (counts[clientName] || 0) + 1;
        if (counts[clientName] > maxCount) {
          maxCount = counts[clientName];
          highlightStat = clientName;
        }
      });
    } else {
      // Find favorite barber
      allBookings.forEach(b => {
        counts[b.barber] = (counts[b.barber] || 0) + 1;
        if (counts[b.barber] > maxCount) {
          maxCount = counts[b.barber];
          highlightStat = b.barber;
        }
      });
    }

    // Map bookings to a friendly frontend format so frontend doesn't need to do complex mapping
    const mapBooking = (b: any) => ({
      ...b.toObject(),
      clientName: b.userId?.name || 'Unknown Client',
      clientAvatar: b.userId?.avatarUrl || ''
    });

    res.status(200).json({
      role: user.role,
      stats: {
        totalBookings,
        upcoming: upcomingBookings.length,
        highlightStat
      },
      upcomingAppointments: upcomingBookings.slice(0, 3).reverse().map(mapBooking),
      bookingHistory: pastBookings.slice(0, 5).map(mapBooking)
    });

  } catch (error) {
    console.error('Dashboard error:', error);
    res.status(500).json({ message: 'Server error fetching dashboard' });
  }
};
