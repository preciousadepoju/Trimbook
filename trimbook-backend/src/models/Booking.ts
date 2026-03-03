import mongoose, { Document, Schema } from 'mongoose';

export interface IBooking extends Document {
  userId: mongoose.Types.ObjectId;
  service: string;
  barber: string;
  date: Date;
  status: 'Upcoming' | 'Completed' | 'Cancelled';
  createdAt: Date;
  updatedAt: Date;
}

const bookingSchema = new Schema<IBooking>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    service: {
      type: String,
      required: true,
    },
    barber: {
      type: String,
      required: true,
    },
    date: {
      type: Date,
      required: true,
    },
    status: {
      type: String,
      enum: ['Upcoming', 'Completed', 'Cancelled'],
      default: 'Upcoming',
    }
  },
  {
    timestamps: true,
  }
);

export const Booking = mongoose.model<IBooking>('Booking', bookingSchema);
