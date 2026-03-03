import mongoose, { Schema, Document } from 'mongoose';

export interface INotification extends Document {
  userId: mongoose.Types.ObjectId;   // recipient user ID
  type: 'new_booking' | 'booking_cancelled' | 'booking_confirmed' | 'booking_updated' | 'booking_completed' | 'new_review';
  title: string;
  message: string;
  isRead: boolean;
  bookingId?: mongoose.Types.ObjectId;
  createdAt: Date;
}

const NotificationSchema = new Schema<INotification>({
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  type: {
    type: String,
    enum: ['new_booking', 'booking_cancelled', 'booking_confirmed', 'booking_updated', 'booking_completed', 'new_review'],
    required: true
  },
  title: { type: String, required: true },
  message: { type: String, required: true },
  isRead: { type: Boolean, default: false },
  bookingId: { type: Schema.Types.ObjectId, ref: 'Booking' }
}, { timestamps: true });

export const Notification = mongoose.model<INotification>('Notification', NotificationSchema);
