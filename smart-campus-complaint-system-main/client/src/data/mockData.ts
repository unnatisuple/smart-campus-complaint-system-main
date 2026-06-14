import {
  Complaint,
  Student,
  Staff,
  Notification,
  ComplaintCategory,
  OverviewStats,
  CategoryBreakdown,
  MonthlyTrend,
  StaffPerformance,
} from '../types';

// ─── Categories ───────────────────────────────────────────────────────────────
export const CATEGORIES: ComplaintCategory[] = [
  { id: 'c1', name: 'Electrical', icon: '⚡', description: 'Power, lighting, wiring issues', color: '#FBBF24' },
  { id: 'c2', name: 'Plumbing', icon: '🔧', description: 'Water, drainage, tap issues', color: '#06B6D4' },
  { id: 'c3', name: 'Civil / Structure', icon: '🏗️', description: 'Walls, floors, ceilings', color: '#94A3B8' },
  { id: 'c4', name: 'Cleaning', icon: '🧹', description: 'Cleanliness, hygiene, waste', color: '#10B981' },
  { id: 'c5', name: 'IT / Network', icon: '🌐', description: 'WiFi, computers, servers', color: '#2563EB' },
  { id: 'c6', name: 'Lab Equipment', icon: '🔬', description: 'Lab tools, machines, instruments', color: '#7C3AED' },
  { id: 'c7', name: 'Furniture', icon: '🪑', description: 'Chairs, tables, storage', color: '#F59E0B' },
  { id: 'c8', name: 'Security', icon: '🔒', description: 'CCTV, locks, access control', color: '#EF4444' },
  { id: 'c9', name: 'AC / Ventilation', icon: '❄️', description: 'Air conditioning, fans', color: '#67E8F9' },
  { id: 'c10', name: 'Others', icon: '📋', description: 'Any other campus issue', color: '#6366F1' },
];

// ─── Mock Students ─────────────────────────────────────────────────────────────
export const MOCK_STUDENTS: Student[] = [
  {
    id: 's1', name: 'Arjun Sharma', email: 'student@campus.edu',
    role: 'student', enrollmentNo: '2021-01-12345', department: 'CSE',
    year: 3, mobile: '9876543210', createdAt: '2021-08-01', isActive: true,
  },
  {
    id: 's2', name: 'Priya Patel', email: 'priya@campus.edu',
    role: 'student', enrollmentNo: '2022-02-23456', department: 'ECE',
    year: 2, mobile: '9876543211', createdAt: '2022-08-01', isActive: true,
  },
  {
    id: 's3', name: 'Rohan Mehta', email: 'rohan@campus.edu',
    role: 'student', enrollmentNo: '2020-01-11111', department: 'ME',
    year: 4, mobile: '9876543212', createdAt: '2020-08-01', isActive: true,
  },
  {
    id: 's4', name: 'Neha Singh', email: 'neha@campus.edu',
    role: 'student', enrollmentNo: '2023-03-34567', department: 'CE',
    year: 1, mobile: '9876543213', createdAt: '2023-08-01', isActive: true,
  },
  {
    id: 's5', name: 'Vikram Joshi', email: 'vikram@campus.edu',
    role: 'student', enrollmentNo: '2021-04-45678', department: 'IT',
    year: 3, mobile: '9876543214', createdAt: '2021-08-01', isActive: true,
  },
];

// ─── Mock Staff ────────────────────────────────────────────────────────────────
export const MOCK_STAFF: Staff[] = [
  {
    id: 'st1', name: 'Rajesh Kumar', email: 'staff@campus.edu',
    role: 'staff', expertise: ['Electrical', 'AC / Ventilation'], department: 'Maintenance',
    assignedCount: 5, createdAt: '2020-01-01', isActive: true,
  },
  {
    id: 'st2', name: 'Suresh Verma', email: 'suresh@campus.edu',
    role: 'staff', expertise: ['Plumbing', 'Civil / Structure'], department: 'Maintenance',
    assignedCount: 3, createdAt: '2019-01-01', isActive: true,
  },
  {
    id: 'st3', name: 'Amit Gupta', email: 'amit@campus.edu',
    role: 'staff', expertise: ['IT / Network', 'Lab Equipment'], department: 'IT',
    assignedCount: 7, createdAt: '2021-06-01', isActive: true,
  },
  {
    id: 'st4', name: 'Manoj Tiwari', email: 'manoj@campus.edu',
    role: 'staff', expertise: ['Cleaning', 'Furniture'], department: 'Housekeeping',
    assignedCount: 4, createdAt: '2022-01-01', isActive: true,
  },
  {
    id: 'st5', name: 'Deepak Rao', email: 'deepak@campus.edu',
    role: 'staff', expertise: ['Security', 'Civil / Structure'], department: 'Security',
    assignedCount: 2, createdAt: '2020-06-01', isActive: true,
  },
];

// ─── Mock Complaints ───────────────────────────────────────────────────────────
export const MOCK_COMPLAINTS: Complaint[] = [
  {
    id: 'cmp1', complaintNo: 'CMP-2024-0001',
    studentId: 's1', studentName: 'Arjun Sharma', studentEnrollment: '2021-01-12345',
    title: 'Faulty electrical wiring in Lab 3', description: 'There are exposed electrical wires near the workstations in Lab 3 that pose a serious safety hazard. Students have been getting mild shocks. Immediate attention required.',
    categoryId: 'c1', categoryName: 'Electrical', categoryIcon: '⚡',
    priority: 'critical', status: 'in_progress',
    building: 'Block A', floor: '2', roomNumber: 'Lab 3', locationNotes: 'Near window-side workstations',
    media: [{ id: 'm1', url: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400', type: 'image', name: 'lab_wiring.jpg' }],
    assignment: { id: 'a1', complaintId: 'cmp1', staffId: 'st1', staffName: 'Rajesh Kumar', staffEmail: 'staff@campus.edu', assignedBy: 'admin1', assignedAt: '2024-10-02T10:00:00Z', notes: 'Urgent - safety issue' },
    updates: [
      { id: 'u1', complaintId: 'cmp1', updatedBy: 'st1', updatedByName: 'Rajesh Kumar', updatedByRole: 'staff', oldStatus: 'assigned', newStatus: 'in_progress', remarks: 'Assessed the issue. Ordering replacement parts. Will fix by tomorrow.', createdAt: '2024-10-02T14:00:00Z' },
    ],
    createdAt: '2024-10-01T09:00:00Z', updatedAt: '2024-10-02T14:00:00Z',
    expectedResolution: '2024-10-03T18:00:00Z',
  },
  {
    id: 'cmp2', complaintNo: 'CMP-2024-0002',
    studentId: 's1', studentName: 'Arjun Sharma', studentEnrollment: '2021-01-12345',
    title: 'Leaking pipe in boys washroom', description: 'The pipe under the sink in the boys washroom on 1st floor of Block B is leaking continuously, causing water logging on the floor. This is unhygienic.',
    categoryId: 'c2', categoryName: 'Plumbing', categoryIcon: '🔧',
    priority: 'high', status: 'resolved',
    building: 'Block B', floor: '1', roomNumber: 'Washroom B-101', locationNotes: 'Second sink from left',
    media: [],
    assignment: { id: 'a2', complaintId: 'cmp2', staffId: 'st2', staffName: 'Suresh Verma', staffEmail: 'suresh@campus.edu', assignedBy: 'admin1', assignedAt: '2024-09-20T11:00:00Z', notes: 'Priority fix needed' },
    updates: [
      { id: 'u2', complaintId: 'cmp2', updatedBy: 'st2', updatedByName: 'Suresh Verma', updatedByRole: 'staff', oldStatus: 'assigned', newStatus: 'in_progress', remarks: 'Inspected the pipe. Need to replace seal.', createdAt: '2024-09-20T15:00:00Z' },
      { id: 'u3', complaintId: 'cmp2', updatedBy: 'st2', updatedByName: 'Suresh Verma', updatedByRole: 'staff', oldStatus: 'in_progress', newStatus: 'resolved', remarks: 'Pipe repaired and tested. No more leakage.', createdAt: '2024-09-21T10:00:00Z' },
    ],
    createdAt: '2024-09-19T09:00:00Z', updatedAt: '2024-09-21T10:00:00Z', resolvedAt: '2024-09-21T10:00:00Z',
  },
  {
    id: 'cmp3', complaintNo: 'CMP-2024-0003',
    studentId: 's1', studentName: 'Arjun Sharma', studentEnrollment: '2021-01-12345',
    title: 'WiFi not working in Library section C', description: 'The WiFi in Library Section C has been down for 3 days. Students are unable to access online resources needed for assignments.',
    categoryId: 'c5', categoryName: 'IT / Network', categoryIcon: '🌐',
    priority: 'medium', status: 'pending',
    building: 'Library Block', floor: '1', roomNumber: 'Section C', locationNotes: 'Near the reading tables at the back',
    media: [],
    updates: [],
    createdAt: '2024-10-05T11:00:00Z', updatedAt: '2024-10-05T11:00:00Z',
  },
  {
    id: 'cmp4', complaintNo: 'CMP-2024-0004',
    studentId: 's2', studentName: 'Priya Patel', studentEnrollment: '2022-02-23456',
    title: 'Broken chairs in Seminar Hall', description: 'Multiple chairs in the seminar hall are broken and posing a risk of injury to students attending lectures. At least 10 chairs need replacement.',
    categoryId: 'c7', categoryName: 'Furniture', categoryIcon: '🪑',
    priority: 'low', status: 'assigned',
    building: 'Main Block', floor: '3', roomNumber: 'Seminar Hall', locationNotes: 'Rows 5-8 in the back',
    media: [],
    assignment: { id: 'a3', complaintId: 'cmp4', staffId: 'st4', staffName: 'Manoj Tiwari', staffEmail: 'manoj@campus.edu', assignedBy: 'admin1', assignedAt: '2024-10-04T09:00:00Z', notes: '' },
    updates: [],
    createdAt: '2024-10-03T14:00:00Z', updatedAt: '2024-10-04T09:00:00Z',
  },
  {
    id: 'cmp5', complaintNo: 'CMP-2024-0005',
    studentId: 's3', studentName: 'Rohan Mehta', studentEnrollment: '2020-01-11111',
    title: 'AC not working in Classroom 201', description: 'The air conditioner in Classroom 201 is not working since last week. During summer, the temperature inside is unbearable making it difficult to attend classes.',
    categoryId: 'c9', categoryName: 'AC / Ventilation', categoryIcon: '❄️',
    priority: 'high', status: 'pending',
    building: 'Academic Block', floor: '2', roomNumber: '201', locationNotes: '',
    media: [],
    updates: [],
    createdAt: '2024-10-04T09:00:00Z', updatedAt: '2024-10-04T09:00:00Z',
  },
  {
    id: 'cmp6', complaintNo: 'CMP-2024-0006',
    studentId: 's4', studentName: 'Neha Singh', studentEnrollment: '2023-03-34567',
    title: 'CCTV camera not working at Gate 2', description: 'The CCTV camera at the main gate (Gate 2) entrance has not been working for the past week. This is a security concern.',
    categoryId: 'c8', categoryName: 'Security', categoryIcon: '🔒',
    priority: 'critical', status: 'pending',
    building: 'Main Gate', floor: 'Ground', roomNumber: 'Gate 2', locationNotes: 'Right side camera',
    media: [],
    updates: [],
    createdAt: '2024-10-05T08:00:00Z', updatedAt: '2024-10-05T08:00:00Z',
  },
  {
    id: 'cmp7', complaintNo: 'CMP-2024-0007',
    studentId: 's5', studentName: 'Vikram Joshi', studentEnrollment: '2021-04-45678',
    title: 'Lab computers running extremely slow', description: 'All computers in Computer Lab 2 are running very slowly. It takes 15-20 minutes to start up and applications crash frequently affecting practical sessions.',
    categoryId: 'c5', categoryName: 'IT / Network', categoryIcon: '🌐',
    priority: 'medium', status: 'resolved',
    building: 'CS Block', floor: '1', roomNumber: 'Computer Lab 2', locationNotes: '',
    media: [],
    assignment: { id: 'a4', complaintId: 'cmp7', staffId: 'st3', staffName: 'Amit Gupta', staffEmail: 'amit@campus.edu', assignedBy: 'admin1', assignedAt: '2024-09-25T10:00:00Z', notes: '' },
    updates: [
      { id: 'u4', complaintId: 'cmp7', updatedBy: 'st3', updatedByName: 'Amit Gupta', updatedByRole: 'staff', oldStatus: 'in_progress', newStatus: 'resolved', remarks: 'Reinstalled OS on all machines and upgraded RAM. Systems are now running smoothly.', createdAt: '2024-09-27T16:00:00Z' },
    ],
    createdAt: '2024-09-24T13:00:00Z', updatedAt: '2024-09-27T16:00:00Z', resolvedAt: '2024-09-27T16:00:00Z',
  },
  {
    id: 'cmp8', complaintNo: 'CMP-2024-0008',
    studentId: 's2', studentName: 'Priya Patel', studentEnrollment: '2022-02-23456',
    title: 'Classroom ceiling paint peeling off', description: 'The paint on the ceiling of Classroom 105 is peeling off in large chunks and falling on students. This is a safety hazard and also unhygienic.',
    categoryId: 'c3', categoryName: 'Civil / Structure', categoryIcon: '🏗️',
    priority: 'high', status: 'in_progress',
    building: 'Academic Block', floor: '1', roomNumber: '105', locationNotes: 'Center and back portion of ceiling',
    media: [],
    assignment: { id: 'a5', complaintId: 'cmp8', staffId: 'st2', staffName: 'Suresh Verma', staffEmail: 'suresh@campus.edu', assignedBy: 'admin1', assignedAt: '2024-10-01T09:00:00Z', notes: '' },
    updates: [
      { id: 'u5', complaintId: 'cmp8', updatedBy: 'st2', updatedByName: 'Suresh Verma', updatedByRole: 'staff', oldStatus: 'assigned', newStatus: 'in_progress', remarks: 'Started work. Will complete painting over the weekend.', createdAt: '2024-10-02T09:00:00Z' },
    ],
    createdAt: '2024-09-30T10:00:00Z', updatedAt: '2024-10-02T09:00:00Z',
  },
];

// ─── Mock Notifications ────────────────────────────────────────────────────────
export const MOCK_NOTIFICATIONS: Notification[] = [
  { id: 'n1', userId: 's1', type: 'complaint_assigned', title: 'Complaint Assigned', message: 'Your complaint CMP-2024-0001 has been assigned to Rajesh Kumar', read: false, complaintId: 'cmp1', createdAt: '2024-10-02T10:00:00Z' },
  { id: 'n2', userId: 's1', type: 'status_updated', title: 'Status Updated', message: 'Your complaint CMP-2024-0001 is now In Progress', read: false, complaintId: 'cmp1', createdAt: '2024-10-02T14:00:00Z' },
  { id: 'n3', userId: 's1', type: 'complaint_resolved', title: 'Complaint Resolved! 🎉', message: 'Your complaint CMP-2024-0002 has been resolved. Please rate your experience.', read: true, complaintId: 'cmp2', createdAt: '2024-09-21T10:00:00Z' },
  { id: 'n4', userId: 'st1', type: 'new_complaint', title: 'New Task Assigned', message: 'A new complaint CMP-2024-0001 has been assigned to you', read: false, complaintId: 'cmp1', createdAt: '2024-10-02T10:00:00Z' },
  { id: 'n5', userId: 'admin1', type: 'complaint_submitted', title: 'New Complaint Received', message: 'Student Arjun Sharma submitted a new critical complaint', read: false, complaintId: 'cmp1', createdAt: '2024-10-01T09:00:00Z' },
];

// ─── Overview Stats ────────────────────────────────────────────────────────────
export const MOCK_OVERVIEW: OverviewStats = {
  totalUsers: 1284,
  totalStudents: 1247,
  totalStaff: 32,
  totalComplaints: 2401,
  activeComplaints: 47,
  resolvedToday: 8,
  avgResolutionHours: 36,
  satisfactionRate: 94.2,
};

// ─── Category Breakdown ────────────────────────────────────────────────────────
export const MOCK_CATEGORY_BREAKDOWN: CategoryBreakdown[] = [
  { name: 'Electrical', count: 412, color: '#FBBF24' },
  { name: 'Plumbing', count: 389, color: '#06B6D4' },
  { name: 'IT / Network', count: 356, color: '#2563EB' },
  { name: 'Civil', count: 287, color: '#94A3B8' },
  { name: 'AC / Ventilation', count: 234, color: '#67E8F9' },
  { name: 'Furniture', count: 198, color: '#F59E0B' },
  { name: 'Cleaning', count: 178, color: '#10B981' },
  { name: 'Security', count: 156, color: '#EF4444' },
  { name: 'Lab Equipment', count: 134, color: '#7C3AED' },
  { name: 'Others', count: 57, color: '#6366F1' },
];

// ─── Monthly Trends ────────────────────────────────────────────────────────────
export const MOCK_MONTHLY_TRENDS: MonthlyTrend[] = [
  { month: 'Nov', submitted: 180, resolved: 165 },
  { month: 'Dec', submitted: 142, resolved: 138 },
  { month: 'Jan', submitted: 198, resolved: 182 },
  { month: 'Feb', submitted: 225, resolved: 210 },
  { month: 'Mar', submitted: 267, resolved: 248 },
  { month: 'Apr', submitted: 312, resolved: 290 },
  { month: 'May', submitted: 284, resolved: 275 },
  { month: 'Jun', submitted: 198, resolved: 185 },
  { month: 'Jul', submitted: 156, resolved: 150 },
  { month: 'Aug', submitted: 189, resolved: 178 },
  { month: 'Sep', submitted: 234, resolved: 220 },
  { month: 'Oct', submitted: 216, resolved: 160 },
];

// ─── Staff Performance ─────────────────────────────────────────────────────────
export const MOCK_STAFF_PERFORMANCE: StaffPerformance[] = [
  { staffName: 'Rajesh Kumar', resolved: 189, avgTime: 28, rating: 4.8 },
  { staffName: 'Amit Gupta', resolved: 234, avgTime: 22, rating: 4.9 },
  { staffName: 'Suresh Verma', resolved: 145, avgTime: 42, rating: 4.6 },
  { staffName: 'Manoj Tiwari', resolved: 167, avgTime: 18, rating: 4.7 },
  { staffName: 'Deepak Rao', resolved: 98, avgTime: 56, rating: 4.4 },
];

// ─── Credentials map ───────────────────────────────────────────────────────────
export const MOCK_CREDENTIALS = [
  { email: 'student@campus.edu', password: 'Student@123', role: 'student' as const, userId: 's1' },
  { email: 'staff@campus.edu', password: 'Staff@123', role: 'staff' as const, userId: 'st1' },
  { email: 'admin@campus.edu', password: 'Admin@123', role: 'admin' as const, userId: 'admin1' },
];

// ─── Buildings & Floors ────────────────────────────────────────────────────────
export const BUILDINGS = ['Block A', 'Block B', 'Block C', 'Academic Block', 'CS Block', 'Library Block', 'Main Block', 'Admin Block', 'Main Gate', 'Hostel Block'];
export const DEPARTMENTS = ['CSE', 'ECE', 'ME', 'CE', 'EE', 'IT', 'CIVIL', 'CHEM'];
