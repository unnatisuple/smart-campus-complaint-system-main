import { Router, Request, Response } from 'express';
import { authenticate } from '../middleware/auth';

const router = Router();

// GET /api/users/me
router.get('/users/me', authenticate, (req: Request, res: Response) => {
  res.json({
    success: true,
    data: {
      id: req.user?.userId,
      email: req.user?.email,
      role: req.user?.role,
      name: req.user?.email.split('@')[0],
    }
  });
});

// PUT /api/users/profile
router.put('/users/profile', authenticate, (req: Request, res: Response) => {
  const { name, mobile, department } = req.body;
  res.json({
    success: true,
    message: 'Profile updated successfully',
    data: {
      id: req.user?.userId,
      email: req.user?.email,
      role: req.user?.role,
      name,
      mobile,
      department
    }
  });
});

export default router;
