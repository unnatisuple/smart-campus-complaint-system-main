import { create } from 'zustand';
import { Complaint, ComplaintFormData } from '../types';
import { MOCK_COMPLAINTS } from '../data/mockData';

interface ComplaintStore {
  complaints: Complaint[];
  isLoading: boolean;
  fetchComplaints: (filters?: Record<string, string>) => Promise<void>;
  getComplaintById: (id: string) => Complaint | undefined;
  submitComplaint: (data: ComplaintFormData, studentId: string, studentName: string, enrollment: string) => Promise<Complaint>;
  updateStatus: (id: string, status: Complaint['status'], remarks: string, staffName: string) => Promise<void>;
  assignStaff: (complaintId: string, staffId: string, staffName: string, staffEmail: string) => Promise<void>;
}

export const useComplaintStore = create<ComplaintStore>((set, get) => ({
  complaints: [],
  isLoading: false,

  fetchComplaints: async () => {
    set({ isLoading: true });
    await new Promise((r) => setTimeout(r, 800));
    set({ complaints: MOCK_COMPLAINTS, isLoading: false });
  },

  getComplaintById: (id) => get().complaints.find((c) => c.id === id),

  submitComplaint: async (data, studentId, studentName, enrollment) => {
    await new Promise((r) => setTimeout(r, 1500));
    const { CATEGORIES } = await import('../data/mockData');
    const category = CATEGORIES.find((c) => c.id === data.categoryId)!;

    const newComplaint: Complaint = {
      id: `cmp${Date.now()}`,
      complaintNo: `CMP-2024-${String(MOCK_COMPLAINTS.length + 1).padStart(4, '0')}`,
      studentId,
      studentName,
      studentEnrollment: enrollment,
      title: data.title,
      description: data.description,
      categoryId: data.categoryId,
      categoryName: category?.name ?? 'Others',
      categoryIcon: category?.icon ?? '📋',
      priority: data.priority,
      status: 'pending',
      building: data.building,
      floor: data.floor,
      roomNumber: data.roomNumber,
      locationNotes: data.locationNotes,
      media: [],
      updates: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    set((state) => ({ complaints: [newComplaint, ...state.complaints] }));
    return newComplaint;
  },

  updateStatus: async (id, status, remarks, staffName) => {
    await new Promise((r) => setTimeout(r, 600));
    set((state) => ({
      complaints: state.complaints.map((c) => {
        if (c.id !== id) return c;
        const update = {
          id: `u${Date.now()}`,
          complaintId: id,
          updatedBy: 'staff',
          updatedByName: staffName,
          updatedByRole: 'staff' as const,
          oldStatus: c.status,
          newStatus: status,
          remarks,
          createdAt: new Date().toISOString(),
        };
        return {
          ...c,
          status,
          updates: [...c.updates, update],
          updatedAt: new Date().toISOString(),
          resolvedAt: status === 'resolved' ? new Date().toISOString() : c.resolvedAt,
        };
      }),
    }));
  },

  assignStaff: async (complaintId, staffId, staffName, staffEmail) => {
    await new Promise((r) => setTimeout(r, 600));
    set((state) => ({
      complaints: state.complaints.map((c) => {
        if (c.id !== complaintId) return c;
        return {
          ...c,
          status: 'assigned',
          assignment: {
            id: `a${Date.now()}`,
            complaintId,
            staffId,
            staffName,
            staffEmail,
            assignedBy: 'admin1',
            assignedAt: new Date().toISOString(),
            notes: '',
          },
          updatedAt: new Date().toISOString(),
        };
      }),
    }));
  },
}));
