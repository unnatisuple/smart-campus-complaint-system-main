import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { User, Role } from '../types';
import { MOCK_CREDENTIALS, MOCK_STUDENTS, MOCK_STAFF } from '../data/mockData';

interface AuthStore {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string, role: Role) => Promise<{ success: boolean; error?: string }>;
  logout: () => void;
  setLoading: (v: boolean) => void;
}

const MOCK_ADMIN_USER: User = {
  id: 'admin1',
  name: 'Dr. Anand Verma',
  email: 'admin@campus.edu',
  role: 'admin',
  createdAt: '2019-01-01',
  isActive: true,
};

export const useAuthStore = create<AuthStore>()(
  persist(
    (set) => ({
      user: null,
      token: null,
      isAuthenticated: false,
      isLoading: false,

      login: async (email, password, role) => {
        set({ isLoading: true });

        // Simulate network delay
        await new Promise((r) => setTimeout(r, 1200));

        const cred = MOCK_CREDENTIALS.find(
          (c) => c.email === email && c.password === password && c.role === role
        );

        if (!cred) {
          set({ isLoading: false });
          return { success: false, error: 'Invalid credentials. Try student@campus.edu / Student@123' };
        }

        let user: User;
        if (role === 'student') {
          user = MOCK_STUDENTS.find((s) => s.id === cred.userId) as User;
        } else if (role === 'staff') {
          user = MOCK_STAFF.find((s) => s.id === cred.userId) as User;
        } else {
          user = MOCK_ADMIN_USER;
        }

        const token = `mock-jwt-token-${role}-${Date.now()}`;
        set({ user, token, isAuthenticated: true, isLoading: false });
        return { success: true };
      },

      logout: () => {
        set({ user: null, token: null, isAuthenticated: false });
      },

      setLoading: (v) => set({ isLoading: v }),
    }),
    {
      name: 'smart-campus-auth',
      partialize: (state) => ({
        user: state.user,
        token: state.token,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
);
