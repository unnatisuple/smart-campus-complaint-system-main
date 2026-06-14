// ─── User Types ───────────────────────────────────────────────────────────────
export type Role = 'student' | 'staff' | 'admin';

export interface User {
  id: string;
  name: string;
  email: string;
  role: Role;
  avatar?: string;
  createdAt: string;
  isActive: boolean;
}

export interface Student extends User {
  role: 'student';
  enrollmentNo: string;
  department: string;
  year: number;
  mobile: string;
}

export interface Staff extends User {
  role: 'staff';
  expertise: string[];
  department: string;
  assignedCount: number;
}

export interface Admin extends User {
  role: 'admin';
  isSuperAdmin: boolean;
}

// ─── Complaint Types ───────────────────────────────────────────────────────────
export type ComplaintStatus =
  | 'pending'
  | 'assigned'
  | 'in_progress'
  | 'resolved'
  | 'closed';

export type Priority = 'low' | 'medium' | 'high' | 'critical';

export interface ComplaintCategory {
  id: string;
  name: string;
  icon: string;
  description: string;
  color: string;
}

export interface ComplaintMedia {
  id: string;
  url: string;
  type: 'image' | 'video' | 'document';
  name: string;
}

export interface ComplaintUpdate {
  id: string;
  complaintId: string;
  updatedBy: string;
  updatedByName: string;
  updatedByRole: Role;
  oldStatus: ComplaintStatus;
  newStatus: ComplaintStatus;
  remarks: string;
  createdAt: string;
}

export interface Assignment {
  id: string;
  complaintId: string;
  staffId: string;
  staffName: string;
  staffEmail: string;
  assignedBy: string;
  assignedAt: string;
  notes: string;
}

export interface Complaint {
  id: string;
  complaintNo: string;
  studentId: string;
  studentName: string;
  studentEnrollment: string;
  title: string;
  description: string;
  categoryId: string;
  categoryName: string;
  categoryIcon: string;
  priority: Priority;
  status: ComplaintStatus;
  building: string;
  floor: string;
  roomNumber: string;
  locationNotes: string;
  media: ComplaintMedia[];
  assignment?: Assignment;
  updates: ComplaintUpdate[];
  createdAt: string;
  updatedAt: string;
  resolvedAt?: string;
  expectedResolution?: string;
  aiSummary?: string;
}

// ─── Notification Types ────────────────────────────────────────────────────────
export type NotificationType =
  | 'complaint_submitted'
  | 'complaint_assigned'
  | 'status_updated'
  | 'complaint_resolved'
  | 'new_complaint'
  | 'feedback_received';

export interface Notification {
  id: string;
  userId: string;
  type: NotificationType;
  title: string;
  message: string;
  read: boolean;
  complaintId?: string;
  createdAt: string;
}

// ─── Feedback Types ────────────────────────────────────────────────────────────
export interface Feedback {
  id: string;
  complaintId: string;
  studentId: string;
  rating: number;
  comment: string;
  createdAt: string;
}

// ─── Analytics Types ───────────────────────────────────────────────────────────
export interface OverviewStats {
  totalUsers: number;
  totalStudents: number;
  totalStaff: number;
  totalComplaints: number;
  activeComplaints: number;
  resolvedToday: number;
  avgResolutionHours: number;
  satisfactionRate: number;
}

export interface CategoryBreakdown {
  name: string;
  count: number;
  color: string;
}

export interface MonthlyTrend {
  month: string;
  submitted: number;
  resolved: number;
}

export interface StaffPerformance {
  staffName: string;
  resolved: number;
  avgTime: number;
  rating: number;
}

// ─── Auth Types ───────────────────────────────────────────────────────────────
export interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}

export interface LoginCredentials {
  email: string;
  password: string;
  role: Role;
}

export interface RegisterData {
  name: string;
  email: string;
  mobile: string;
  enrollmentNo: string;
  department: string;
  year: number;
  password: string;
}

// ─── Form Types ───────────────────────────────────────────────────────────────
export interface ComplaintFormData {
  title: string;
  description: string;
  categoryId: string;
  priority: Priority;
  building: string;
  floor: string;
  roomNumber: string;
  locationNotes: string;
  files: File[];
}

// ─── API Response Types ───────────────────────────────────────────────────────
export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
  error?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}
