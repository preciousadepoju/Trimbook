import mongoose, { Schema, Document } from 'mongoose';

export interface IReview extends Document {
  clientId: mongoose.Types.ObjectId;
  barberId: mongoose.Types.ObjectId;
  bookingId: mongoose.Types.ObjectId;
  rating: number; // 1-5
  comment?: string;
  clientName?: string;
  clientAvatar?: string;
  createdAt: Date;
}

const ReviewSchema = new Schema<IReview>({
  clientId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  barberId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  bookingId: { type: Schema.Types.ObjectId, ref: 'Booking', required: true, unique: true }, // one review per booking
  rating: { type: Number, required: true, min: 1, max: 5 },
  comment: { type: String, trim: true, maxlength: 500 },
  clientName: { type: String },
  clientAvatar: { type: String },
}, { timestamps: true });

export const Review = mongoose.model<IReview>('Review', ReviewSchema);
