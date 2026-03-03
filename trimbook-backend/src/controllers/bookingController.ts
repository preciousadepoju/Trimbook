import { Request, Response } from 'express';
import { AuthRequest } from '../middleware/authMiddleware';
import { Booking } from '../models/Booking';
import { Notification } from '../models/Notification';
import { sendBookingConfirmationToClient, sendNewBookingAlertToBarber } from '../utils/email';

export const createBooking = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      res.status(401).json({ message: 'Unauthorized' });
      return;
    }

    const { service, barber, date } = req.body;

    if (!service || !barber || !date) {
      res.status(400).json({ message: 'Please provide service, barber, and date' });
      return;
    }

    const newBooking = new Booking({
      userId,
      service,
      barber,
      date,
      status: 'Upcoming'
    });

    await newBooking.save();

    // --- Post-booking side effects (non-blocking) ---
    try {
      const { User } = await import('../models/User');

      // Find client and barber user objects
      const clientUser = await User.findById(userId).select('name email');
      const barberUser = await User.findOne({ name: barber, role: 'barber' }).select('_id name email');

      const bookingDate = new Date(date);
      const clientName = clientUser?.name || 'A client';
      const barberName = barberUser?.name || barber;

      // 1. Create in-app notification for the barber
      if (barberUser) {
        await Notification.create({
          userId: barberUser._id,
          type: 'new_booking',
          title: 'New Appointment Booked',
          message: `${clientName} booked a ${service} appointment on ${bookingDate.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })} at ${bookingDate.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}.`,
          bookingId: newBooking._id as any
        });
      }

      // 2. Send confirmation email to client (fire and forget)
      if (clientUser?.email) {
        sendBookingConfirmationToClient(clientUser.email, clientName, barberName, service, bookingDate).catch(console.error);
      }

      // 3. Send alert email to barber (fire and forget)
      if (barberUser?.email) {
        sendNewBookingAlertToBarber(barberUser.email, barberName, clientName, service, bookingDate).catch(console.error);
      }
    } catch (sideEffectErr) {
      // Do NOT fail the main request if side effects fail
      console.error('Side effect error after booking creation:', sideEffectErr);
    }

    res.status(201).json({
      message: 'Booking created successfully',
      booking: newBooking
    });

  } catch (error) {
    console.error('Booking error:', error);
    res.status(500).json({ message: 'Server error creating booking' });
  }
};

export const getBookings = async (req: AuthRequest, res: Response): Promise<void> => {
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

    let allBookings: any[] = [];
    if (user.role === 'barber') {
      allBookings = await Booking.find({ barber: user.name })
        .populate('userId', 'name email avatarUrl')
        .sort({ date: -1 });
    } else {
      allBookings = await Booking.find({ userId }).sort({ date: -1 });
    }

    const mapBooking = (b: any) => ({
      ...b.toObject(),
      clientName: b.userId?.name || 'Unknown Client',
      clientAvatar: b.userId?.avatarUrl || ''
    });

    res.status(200).json(allBookings.map(mapBooking));
  } catch (error) {
    console.error('Fetch bookings error:', error);
    res.status(500).json({ message: 'Server error fetching bookings' });
  }
};

export const updateBookingStatus = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      res.status(401).json({ message: 'Unauthorized' });
      return;
    }

    const { id } = req.params;
    const { status } = req.body; // 'Cancelled', 'Completed'

    if (!['Cancelled', 'Completed'].includes(status)) {
      res.status(400).json({ message: 'Invalid status' });
      return;
    }

    const booking = await Booking.findById(id);
    if (!booking) {
      res.status(404).json({ message: 'Booking not found' });
      return;
    }

    // Checking authorization
    const { User } = await import('../models/User');
    const user = await User.findById(userId);

    const isClientOwner = booking.userId.toString() === userId;
    const isBarberOwner = user?.role === 'barber' && booking.barber === user.name;

    if (!isClientOwner && !isBarberOwner) {
      res.status(403).json({ message: 'Not authorized to update this booking' });
      return;
    }

    booking.status = status as any;
    await booking.save();

    // When completed → create a rating-reminder notification for the client (non-blocking)
    if (status === 'Completed') {
      try {
        await Notification.create({
          userId: booking.userId,
          type: 'booking_completed',
          title: '⭐ Rate Your Experience',
          message: `How was your ${booking.service} with ${booking.barber}? Leave a quick review!`,
          bookingId: booking._id as any
        });
      } catch (notifErr) {
        console.error('Failed to create rating notification:', notifErr);
      }
    }

    res.status(200).json({ message: `Booking ${status.toLowerCase()}`, booking });
  } catch (error) {
    console.error('Update booking status error:', error);
    res.status(500).json({ message: 'Server error updating booking' });
  }
};

export const updateBooking = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      res.status(401).json({ message: 'Unauthorized' });
      return;
    }

    const { id } = req.params;
    const { service, barber, date } = req.body;

    if (!service || !barber || !date) {
      res.status(400).json({ message: 'Please provide service, barber, and date' });
      return;
    }

    const booking = await Booking.findById(id);
    if (!booking) {
      res.status(404).json({ message: 'Booking not found' });
      return;
    }

    // Only the client owner can reschedule their appointment
    if (booking.userId.toString() !== userId) {
      res.status(403).json({ message: 'Not authorized to reschedule this booking' });
      return;
    }

    booking.service = service;
    booking.barber = barber;
    booking.date = date;
    
    await booking.save();

    res.status(200).json({ message: 'Booking updated successfully', booking });
  } catch (error) {
    console.error('Reschedule booking error:', error);
    res.status(500).json({ message: 'Server error rescheduling booking' });
  }
};

export const getAvailableSlots = async (req: Request, res: Response): Promise<void> => {
  try {
    const { barberName, date } = req.query;
    if (!barberName || !date) {
      res.status(400).json({ message: 'Barber name and date are required' });
      return;
    }

    const startOfDay = new Date(date as string);
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date(date as string);
    endOfDay.setHours(23, 59, 59, 999);

    const bookings = await Booking.find({
      barber: barberName,
      status: { $ne: 'Cancelled' },
      date: { $gte: startOfDay, $lte: endOfDay }
    }).select('date');

    // Return the booked times as HH:mm strings
    const bookedTimes = bookings.map(b => {
      const hours = b.date.getHours().toString().padStart(2, '0');
      const minutes = b.date.getMinutes().toString().padStart(2, '0');
      return `${hours}:${minutes}`;
    });

    res.status(200).json({ bookedTimes });
  } catch (error) {
    console.error('Fetch availability error:', error);
    res.status(500).json({ message: 'Server error fetching availability' });
  }
};
