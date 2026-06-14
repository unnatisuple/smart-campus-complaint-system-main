import { Router, Request, Response } from 'express';
import { authenticate, isStudent, isStaff, isStaffOrAdmin } from '../middleware/auth';

const router = Router();

// Mock complaints data
let COMPLAINTS: any[] = [];

// GET /api/complaints
router.get('/', authenticate, (req: Request, res: Response) => {
  const user = req.user;
  if (user?.role === 'student') {
    // Students only see their own complaints
    return res.json({ success: true, data: COMPLAINTS.filter(c => c.studentId === user.userId) });
  } else if (user?.role === 'staff') {
    // Staff see complaints assigned to them
    return res.json({ success: true, data: COMPLAINTS.filter(c => c.assignment?.staffId === user.userId) });
  } else {
    // Admins see all
    return res.json({ success: true, data: COMPLAINTS });
  }
});

// GET /api/complaints/:id
router.get('/:id', authenticate, (req: Request, res: Response) => {
  const complaint = COMPLAINTS.find(c => c.id === req.params.id);
  if (!complaint) {
    return res.status(404).json({ error: 'Complaint not found' });
  }
  res.json({ success: true, data: complaint });
});

// POST /api/complaints
router.post('/', authenticate, isStudent, (req: Request, res: Response) => {
  const { title, description, categoryId, priority, building, floor, roomNumber, locationNotes } = req.body;
  const newComplaint = {
    id: `cmp_${Date.now()}`,
    complaintNo: `CMP-2026-${Math.floor(1000 + Math.random() * 9000)}`,
    title,
    description,
    categoryId,
    categoryName: 'General',
    categoryIcon: '🔧',
    priority,
    status: 'pending',
    studentId: req.user?.userId,
    studentName: req.user?.email.split('@')[0],
    studentEmail: req.user?.email,
    building,
    floor,
    roomNumber,
    locationNotes,
    createdAt: new Date().toISOString(),
    updates: [],
  };
  COMPLAINTS.push(newComplaint);
  res.status(201).json({ success: true, data: newComplaint });
});

// PUT /api/complaints/:id/status
router.put('/:id/status', authenticate, isStaffOrAdmin, (req: Request, res: Response) => {
  const { status, remarks } = req.body;
  const index = COMPLAINTS.findIndex(c => c.id === req.params.id);
  if (index === -1) {
    return res.status(404).json({ error: 'Complaint not found' });
  }

  COMPLAINTS[index].status = status;
  COMPLAINTS[index].updates.push({
    id: `upd_${Date.now()}`,
    oldStatus: COMPLAINTS[index].status,
    newStatus: status,
    remarks,
    updatedByName: req.user?.email.split('@')[0],
    updatedByRole: req.user?.role,
    createdAt: new Date().toISOString(),
  });

  res.json({ success: true, data: COMPLAINTS[index] });
});

// PUT /api/complaints/:id/assign
router.put('/:id/assign', authenticate, isStaffOrAdmin, (req: Request, res: Response) => {
  const { staffId, staffName, staffEmail } = req.body;
  const index = COMPLAINTS.findIndex(c => c.id === req.params.id);
  if (index === -1) {
    return res.status(404).json({ error: 'Complaint not found' });
  }

  COMPLAINTS[index].status = 'assigned';
  COMPLAINTS[index].assignment = {
    staffId,
    staffName,
    staffEmail,
    assignedAt: new Date().toISOString(),
  };

  res.json({ success: true, data: COMPLAINTS[index] });
});

export default router;
