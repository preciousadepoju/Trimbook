import { Router, Response } from 'express';
import { authMiddleware, AuthRequest } from '../middleware/authMiddleware';
import { Notification } from '../models/Notification';

const router = Router();

// GET /api/notifications - get all notifications for the logged-in user
router.get('/', authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.id;
    if (!userId) return res.status(401).json({ message: 'Unauthorized' });

    const notifications = await Notification.find({ userId })
      .sort({ createdAt: -1 })
      .limit(20);

    const unreadCount = await Notification.countDocuments({ userId, isRead: false });

    res.status(200).json({ notifications, unreadCount });
  } catch (error) {
    console.error('Fetch notifications error:', error);
    res.status(500).json({ message: 'Server error fetching notifications' });
  }
});

// PATCH /api/notifications/:id/read - mark a single notification as read
router.patch('/:id/read', authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.id;
    if (!userId) return res.status(401).json({ message: 'Unauthorized' });

    await Notification.findOneAndUpdate(
      { _id: req.params.id, userId },
      { isRead: true }
    );

    res.status(200).json({ message: 'Notification marked as read' });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// PATCH /api/notifications/read-all - mark all as read
router.patch('/read-all', authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.id;
    if (!userId) return res.status(401).json({ message: 'Unauthorized' });

    await Notification.updateMany({ userId, isRead: false }, { isRead: true });

    res.status(200).json({ message: 'All notifications marked as read' });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

export default router;
