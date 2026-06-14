import { Router, Request, Response } from 'express';
import { authenticate } from '../middleware/auth';

const router = Router();

// Mock notifications store
let NOTIFICATIONS: any[] = [];

// GET /api/notifications
router.get('/', authenticate, (req: Request, res: Response) => {
  res.json({
    success: true,
    data: NOTIFICATIONS.filter(n => n.userId === req.user?.userId)
  });
});

// PUT /api/notifications/:id/read
router.put('/:id/read', authenticate, (req: Request, res: Response) => {
  const index = NOTIFICATIONS.findIndex(n => n.id === req.params.id && n.userId === req.user?.userId);
  if (index !== -1) {
    NOTIFICATIONS[index].read = true;
  }
  res.json({ success: true, message: 'Notification marked as read' });
});

export default router;
