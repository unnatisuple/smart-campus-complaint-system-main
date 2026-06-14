import { Router, Request, Response } from 'express';
import { authenticate, isAdmin } from '../middleware/auth';

const router = Router();

// GET /api/admin/overview
router.get('/overview', authenticate, isAdmin, (req: Request, res: Response) => {
  res.json({
    success: true,
    data: {
      totalUsers: 1450,
      totalStudents: 1320,
      totalStaff: 130,
      totalComplaints: 2401,
      activeComplaints: 84,
      resolvedToday: 18,
    }
  });
});

// GET /api/admin/staff
router.get('/staff', authenticate, isAdmin, (req: Request, res: Response) => {
  res.json({
    success: true,
    data: [
      { id: 'st1', name: 'Rajesh Kumar', email: 'staff@campus.edu', expertise: ['Electrical'], assignedCount: 3 },
      { id: 'st2', name: 'Amit Gupta', email: 'amit@campus.edu', expertise: ['Plumbing'], assignedCount: 1 },
    ]
  });
});

// GET /api/admin/students
router.get('/students', authenticate, isAdmin, (req: Request, res: Response) => {
  res.json({
    success: true,
    data: [
      { id: 's1', name: 'Arjun Sharma', email: 'student@campus.edu', enrollmentNo: '2024-01-00001', department: 'CSE' }
    ]
  });
});

export default router;
