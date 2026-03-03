import mongoose, { Document, Schema } from 'mongoose';

export interface IService extends Document {
  barber: mongoose.Types.ObjectId;
  title: string;
  duration: string;
  price: string;
  description: string;
  bestSeller: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const serviceSchema = new Schema<IService>(
  {
    barber: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    title: {
      type: String,
      required: true,
      trim: true,
    },
    duration: {
      type: String,
      required: true,
    },
    price: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      required: true,
    },
    bestSeller: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

export const Service = mongoose.model<IService>('Service', serviceSchema);
