import mongoose, { Document, Schema } from 'mongoose';

export interface IUser extends Document {
  name: string;
  email: string;
  passwordHash: string;
  role: 'user' | 'admin' | 'barber';
  avatarUrl?: string;
  phone?: string;
  location?: string;
  isVerified: boolean;
  verificationCode?: string;
  verificationCodeExpiresAt?: Date;
  resetPasswordCode?: string;
  resetPasswordExpiresAt?: Date;
  workingHours?: {
    startTime: string;
    endTime: string;
  };
  portfolioImages?: string[];
  createdAt: Date;
  updatedAt: Date;
}

const userSchema = new Schema<IUser>(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    passwordHash: {
      type: String,
      required: true,
    },
    role: {
      type: String,
      enum: ['user', 'admin', 'barber'],
      default: 'user',
    },
    avatarUrl: {
      type: String,
      default: '',
    },
    phone: {
      type: String,
    },
    location: {
      type: String,
    },
    isVerified: {
      type: Boolean,
      default: false,
    },
    verificationCode: {
      type: String,
    },
    verificationCodeExpiresAt: {
      type: Date,
    },
    resetPasswordCode: {
      type: String,
    },
    resetPasswordExpiresAt: {
      type: Date,
    },
    workingHours: {
      startTime: { type: String, default: "09:00" },
      endTime: { type: String, default: "18:00" }
    },
    portfolioImages: {
      type: [String],
      default: []
    }
  },
  {
    timestamps: true,
  }
);

export const User = mongoose.model<IUser>('User', userSchema);
