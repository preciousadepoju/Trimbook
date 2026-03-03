import { Router } from 'express';
import multer from 'multer';
import { v2 as cloudinary } from 'cloudinary';
import { CloudinaryStorage } from 'multer-storage-cloudinary';
import { authMiddleware, AuthRequest } from '../middleware/authMiddleware';
import { User } from '../models/User';

const router = Router();

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME || 'dznzlyh2a',
  api_key: process.env.CLOUDINARY_API_KEY || '679198642738212',
  api_secret: process.env.CLOUDINARY_API_SECRET || '5R-Qo7w01e0Yt9_QxH9M-FhA3S4'
});

const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: async (req, file) => {
    return {
      folder: 'trimbook',
      allowedFormats: ['jpeg', 'png', 'jpg', 'webp']
    };
  },
});

const upload = multer({ storage: storage });

router.post('/avatar', authMiddleware, upload.single('image'), async (req: AuthRequest, res: any) => {
  try {
    const userId = req.user?.id;
    if (!userId) return res.status(401).json({ message: 'Unauthorized' });
    
    if (!req.file) {
      return res.status(400).json({ message: 'No image file provided' });
    }

    const { User } = await import('../models/User');
    const updatedUser = await User.findByIdAndUpdate(
      userId,
      { avatarUrl: req.file.path },
      { new: true }
    ).select('-passwordHash');

    res.status(200).json({ message: 'Avatar updated', user: updatedUser });
  } catch (error: any) {
    console.error('Avatar upload error:', error);
    res.status(500).json({ message: error.message || 'Server error uploading avatar' });
  }
});

router.post('/portfolio', authMiddleware, upload.array('images', 5), async (req: AuthRequest, res: any) => {
  try {
    const userId = req.user?.id;
    if (!userId) return res.status(401).json({ message: 'Unauthorized' });

    const user = await User.findById(userId);
    if (!user || user.role !== 'barber') {
      return res.status(403).json({ message: 'Only barbers can upload portfolio images' });
    }
    
    const files = req.files as Express.Multer.File[];
    if (!files || files.length === 0) {
      return res.status(400).json({ message: 'No images provided' });
    }

    const imageUrls = files.map(file => file.path);

    const updatedUser = await User.findByIdAndUpdate(
      userId,
      { $push: { portfolioImages: { $each: imageUrls } } },
      { new: true }
    ).select('-passwordHash');

    res.status(200).json({ message: 'Portfolio updated', user: updatedUser });
  } catch (error) {
    console.error('Portfolio upload error:', error);
    res.status(500).json({ message: 'Server error uploading portfolio' });
  }
});

router.delete('/portfolio', authMiddleware, async (req: AuthRequest, res: any) => {
  try {
    const userId = req.user?.id;
    if (!userId) return res.status(401).json({ message: 'Unauthorized' });

    const { imageUrl } = req.body;
    if (!imageUrl) return res.status(400).json({ message: 'Image URL required' });

    const user = await User.findById(userId);
    if (!user || user.role !== 'barber') {
      return res.status(403).json({ message: 'Only barbers can delete portfolio images' });
    }

    // Since we're just storing URLs, we remove the exact URL string.
    // Real-world would also delete it from Cloudinary using api, but removing from array is fine for now
    const updatedUser = await User.findByIdAndUpdate(
      userId,
      { $pull: { portfolioImages: imageUrl } },
      { new: true }
    ).select('-passwordHash');

    res.status(200).json({ message: 'Portfolio image removed', user: updatedUser });
  } catch (error) {
    console.error('Portfolio delete error:', error);
    res.status(500).json({ message: 'Server error deleting portfolio image' });
  }
});

// Middleware to handle multer errors locally
router.use((err: any, req: any, res: any, next: any) => {
  console.error('Multer/Cloudinary Error:', err);
  
  // Extract real error string if it is an object
  const errorMsg = err?.message || err?.error?.message || 'An error occurred during file upload';

  if (err instanceof multer.MulterError || err) {
    return res.status(400).json({ 
      message: typeof errorMsg === 'string' ? errorMsg : 'Invalid upload', 
      details: err
    });
  }
  next(err);
});

export default router;
