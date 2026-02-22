import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { User } from '../types/user';
import { tokenUtils } from '../utils/token';

interface Notification {
  id: number;
  title: string;
  message: string;
  read: boolean;
  createdAt: string;
}

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  notifications: Notification[];
  setUser: (user: User) => void;
  logout: () => void;
  setNotifications: (notifications: Notification[]) => void;
  markNotificationRead: (id: number) => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      isAuthenticated: false,
      notifications: [],
      setUser: (user) => set({ user, isAuthenticated: true }),
      logout: () => {
        tokenUtils.clearTokens();
        set({ user: null, isAuthenticated: false, notifications: [] });
      },
      setNotifications: (notifications) => set({ notifications }),
      markNotificationRead: (id) =>
        set((state) => ({
          notifications: state.notifications.map((n) =>
            n.id === id ? { ...n, read: true } : n
          ),
        })),
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({ user: state.user, isAuthenticated: state.isAuthenticated }),
    }
  )
);
