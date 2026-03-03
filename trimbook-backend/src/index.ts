import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';

dotenv.config();

import mongoose from 'mongoose';
import authRoutes from './routes/authRoutes';
import dashboardRoutes from './routes/dashboardRoutes';
import bookingRoutes from './routes/bookingRoutes';
import userRoutes from './routes/userRoutes';
import serviceRoutes from './routes/serviceRoutes';
import uploadRoutes from './routes/uploadRoutes';
import notificationRoutes from './routes/notificationRoutes';
import reviewRoutes from './routes/reviewRoutes';

const app = express();

// Middleware
app.use(express.json());
// CORS configuration
const corsOptions = {
    origin: '*', // You can restrict this to your frontend URL later e.g., 'http://localhost:5173'
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    credentials: true,
    optionsSuccessStatus: 204
};
app.use(cors(corsOptions));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/bookings', bookingRoutes);
app.use('/api/users', userRoutes);
app.use('/api/services', serviceRoutes);
app.use('/api/uploads', uploadRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/reviews', reviewRoutes);

// Database Connection
const PORT = process.env.PORT || 5000;
const MONGODB_URI = process.env.MONGODB_URI || '';

if (!MONGODB_URI) {
  console.log('Environment variable MONGODB_URI is not set. Please update your .env file with your Atlas Connection String.');
} else {
  mongoose.connect(MONGODB_URI)
    .then(() => {
      console.log('Connected to MongoDB successfully');
      app.listen(PORT, () => {
        console.log(`Server is running on port ${PORT}`);
      });
    })
    .catch((error) => {
      console.error('MongoDB connection error:', error);
    });
}
