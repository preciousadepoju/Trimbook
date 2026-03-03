import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { User } from '../models/User';
import { sendVerificationEmail, sendPasswordResetEmail } from '../utils/email';

const JWT_SECRET = process.env.JWT_SECRET || 'your_super_secret_jwt_key_here_change_it';


export const register = async (req: Request, res: Response): Promise<void> => {
  try {
    const { name, email, password, role, phone, location } = req.body;

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      res.status(400).json({ message: 'User already exists with that email' });
      return;
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);

    // Create user
    let userRole = 'user';
    if (role === 'admin') userRole = 'admin';
    if (role === 'barber') userRole = 'barber';

    // Generate 6-digit OTP
    const verificationCode = Math.floor(100000 + Math.random() * 900000).toString();
    const verificationCodeExpiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes from now

    const newUser = new User({
      name,
      email,
      passwordHash,
      role: userRole,
      phone,
      location,
      isVerified: false,
      verificationCode,
      verificationCodeExpiresAt
    });

    await newUser.save();

    // Send email (test account will print url to console)
    await sendVerificationEmail(newUser.email, verificationCode);

    res.status(201).json({
      message: 'Verification code sent to your email.',
      requiresVerification: true,
      email: newUser.email
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ message: 'Server error during registration' });
  }
};

export const verifyEmail = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, code } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
       res.status(404).json({ message: 'User not found' });
       return;
    }

    if (user.isVerified) {
       res.status(400).json({ message: 'User is already verified' });
       return;
    }

    if (user.verificationCode !== code) {
       res.status(400).json({ message: 'Invalid verification code' });
       return;
    }

    if (user.verificationCodeExpiresAt && user.verificationCodeExpiresAt < new Date()) {
       res.status(400).json({ message: 'Verification code has expired. Please request a new one.' });
       return;
    }

    user.isVerified = true;
    user.verificationCode = undefined;
    user.verificationCodeExpiresAt = undefined;
    
    await user.save();

    // After success, log them in instantly
    const token = jwt.sign(
      { id: user._id, role: user.role },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.status(200).json({
      message: 'Email verified and logged in successfully!',
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        phone: user.phone,
        location: user.location,
        avatarUrl: user.avatarUrl,
        portfolioImages: user.portfolioImages,
        workingHours: user.workingHours
      }
    });

  } catch (error) {
     console.error('Verification error:', error);
     res.status(500).json({ message: 'Server error during verification' });
  }
};

export const login = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, password } = req.body;

    // Find user
    const user = await User.findOne({ email });
    if (!user) {
      res.status(401).json({ message: 'Invalid credentials' });
      return;
    }

    // Verify password
    const isMatch = await bcrypt.compare(password, user.passwordHash);
    if (!isMatch) {
      res.status(401).json({ message: 'Invalid credentials' });
      return;
    }

    // Checking Verification
    if (!user.isVerified) {
      // Re-generate OTP
      const verificationCode = Math.floor(100000 + Math.random() * 900000).toString();
      user.verificationCode = verificationCode;
      user.verificationCodeExpiresAt = new Date(Date.now() + 10 * 60 * 1000);
      await user.save();

      await sendVerificationEmail(user.email, verificationCode);
      res.status(403).json({ message: 'Please verify your email to log in. A new code has been sent.', requiresVerification: true, email: user.email });
      return;
    }

    // Generate JWT token
    const token = jwt.sign(
      { id: user._id, role: user.role },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.status(200).json({
      message: 'Logged in successfully',
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        phone: user.phone,
        location: user.location,
        avatarUrl: user.avatarUrl,
        portfolioImages: user.portfolioImages,
        workingHours: user.workingHours
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Server error during login' });
  }
};

// Simple profile endpoint relying on either a token or to be expanded with auth middleware later
export const getProfile = async (req: Request, res: Response): Promise<void> => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) {
      res.status(401).json({ message: 'No token provided' });
      return;
    }

    const decoded = jwt.verify(token, JWT_SECRET) as { id: string, role: string };
    const user = await User.findById(decoded.id).select('-passwordHash');

    if (!user) {
      res.status(404).json({ message: 'User not found' });
      return;
    }

    res.status(200).json(user);
  } catch (error) {
    res.status(401).json({ message: 'Invalid token' });
  }
};

// Step 1: Send reset code to email
export const forgotPassword = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email } = req.body;

    const user = await User.findOne({ email: email.toLowerCase() });
    // Always return 200 to avoid user enumeration
    if (!user) {
      res.status(200).json({ message: 'If that email exists, a reset code has been sent.' });
      return;
    }

    // Generate 6-digit code
    const resetCode = Math.floor(100000 + Math.random() * 900000).toString();
    user.resetPasswordCode = resetCode;
    user.resetPasswordExpiresAt = new Date(Date.now() + 15 * 60 * 1000); // 15 minutes
    await user.save();

    await sendPasswordResetEmail(user.email, resetCode);

    res.status(200).json({ message: 'If that email exists, a reset code has been sent.' });
  } catch (error) {
    console.error('Forgot password error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Step 2: Verify code and set new password
export const resetPassword = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, code, newPassword } = req.body;

    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
      res.status(404).json({ message: 'User not found' });
      return;
    }

    if (!user.resetPasswordCode || user.resetPasswordCode !== code) {
      res.status(400).json({ message: 'Invalid or incorrect reset code.' });
      return;
    }

    if (user.resetPasswordExpiresAt && user.resetPasswordExpiresAt < new Date()) {
      res.status(400).json({ message: 'Reset code has expired. Please request a new one.' });
      return;
    }

    // Hash new password and clear reset fields
    const salt = await bcrypt.genSalt(10);
    user.passwordHash = await bcrypt.hash(newPassword, salt);
    user.resetPasswordCode = undefined;
    user.resetPasswordExpiresAt = undefined;
    await user.save();

    res.status(200).json({ message: 'Password reset successfully. You can now log in.' });
  } catch (error) {
    console.error('Reset password error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

