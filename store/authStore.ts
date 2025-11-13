import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { User, UserRole, VerificationStatus } from '../types';
import * as api from '../api';

interface AuthState {
  user: User | null;
  users: User[];
  loading: boolean;
  login: (email: string, pass: string) => Promise<User | null>;
  loginWithGoogle: () => Promise<User | null>;
  logout: () => void;
  register: (userData: Omit<User, 'id' | 'verificationStatus' | 'commercialRegisterUrl' | 'guaranteeUrl' | 'balance' | 'isSuspended'>) => Promise<User | null>;
  deleteUser: (userId: string) => Promise<void>;
  requestVerification: (userId: string, commercialRegisterUrl: string, guaranteeUrl: string) => Promise<void>;
  approveVerification: (userId: string) => Promise<void>;
  revokeVerification: (userId: string) => Promise<void>;
  suspendUser: (userId: string) => Promise<void>;
  unsuspendUser: (userId: string) => Promise<void>;
  followSeller: (sellerId: string) => Promise<void>;
  unfollowSeller: (sellerId: string) => Promise<void>;
  updateUser: (userId: string, updatedData: Partial<Pick<User, 'name' | 'city' | 'phone' | 'location' | 'contactInfo'>>) => Promise<void>;
  updateUserAverageRating: (userId: string, newAverageRating: number) => Promise<void>;
  updateUserBalance: (userId: string, amount: number) => Promise<void>;
  fetchAllUsers: () => Promise<void>;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      users: [],
      loading: false,
      fetchAllUsers: async () => {
        const users = await api.apiFetchUsers();
        set({ users });
      },
      login: async (email: string, pass: string): Promise<User | null> => {
        set({ loading: true });
        try {
          const user = await api.apiLoginUser(email);
          if (user.isSuspended) {
            throw new Error("هذا الحساب معلّق. يرجى التواصل مع الإدارة.");
          }
          set({ user, loading: false });
          return user;
        } catch (error) {
          set({ loading: false });
          throw error;
        }
      },
      loginWithGoogle: async (): Promise<User | null> => {
        set({ loading: true });
        try {
          const user = await api.apiLoginUser('google_user@example.com');
           if (user.isSuspended) {
            throw new Error("هذا الحساب معلّق. يرجى التواصل مع الإدارة.");
          }
          set({ user, loading: false });
          return user;
        } catch(error) {
           set({ loading: false });
           throw error;
        }
      },
      register: async (userData: Omit<User, 'id' | 'verificationStatus' | 'commercialRegisterUrl' | 'guaranteeUrl' | 'balance' | 'isSuspended'>): Promise<User | null> => {
        set({ loading: true });
        try {
            // FIX: Construct the full user object before sending it to the API.
            const newUser = await api.apiRegisterUser({
                ...userData,
                verificationStatus: 'NOT_VERIFIED',
                balance: 0,
                isSuspended: false,
            });
            set(state => ({ users: [...state.users, newUser], user: newUser, loading: false }));
            return newUser;
        } catch(error) {
            set({ loading: false });
            throw error;
        }
      },
      deleteUser: async (userId: string) => {
        // This is a mock; in a real app, you'd call an API and then refetch or update state.
        if (get().user?.id === userId) {
          alert("لا يمكنك حذف حسابك الخاص.");
          return;
        }
        set(state => ({ users: state.users.filter(u => u.id !== userId) }));
      },
      suspendUser: async (userId: string) => {
        const updatedUser = await api.apiUpdateUser(userId, { isSuspended: true });
        set(state => ({ users: state.users.map(u => u.id === userId ? updatedUser : u) }));
      },
      unsuspendUser: async (userId: string) => {
        const updatedUser = await api.apiUpdateUser(userId, { isSuspended: false });
        set(state => ({ users: state.users.map(u => u.id === userId ? updatedUser : u) }));
      },
      requestVerification: async (userId, commercialRegisterUrl, guaranteeUrl) => {
        const updatedUser = await api.apiUpdateUser(userId, { verificationStatus: 'PENDING_VERIFICATION', commercialRegisterUrl, guaranteeUrl });
        set(state => ({
            users: state.users.map(u => u.id === userId ? updatedUser : u),
            user: state.user?.id === userId ? updatedUser : state.user
        }));
      },
      approveVerification: async (userId: string) => {
        const updatedUser = await api.apiUpdateUser(userId, { verificationStatus: 'VERIFIED' });
        set(state => ({
            users: state.users.map(u => u.id === userId ? updatedUser : u),
            user: state.user?.id === userId ? updatedUser : state.user
        }));
      },
      revokeVerification: async (userId: string) => {
        const updatedUser = await api.apiUpdateUser(userId, { verificationStatus: 'NOT_VERIFIED', commercialRegisterUrl: undefined, guaranteeUrl: undefined });
        set(state => ({
            users: state.users.map(u => u.id === userId ? updatedUser : u),
            user: state.user?.id === userId ? updatedUser : state.user
        }));
      },
      followSeller: async (sellerId: string) => {
        const currentUser = get().user;
        if (!currentUser) return;
        const updatedFollowing = [...(currentUser.following || []), sellerId];
        const updatedUser = await api.apiUpdateUser(currentUser.id, { following: updatedFollowing });
        set({ user: updatedUser });
      },
      unfollowSeller: async (sellerId: string) => {
        const currentUser = get().user;
        if (!currentUser) return;
        const updatedFollowing = (currentUser.following || []).filter(id => id !== sellerId);
        const updatedUser = await api.apiUpdateUser(currentUser.id, { following: updatedFollowing });
        set({ user: updatedUser });
      },
      updateUser: async (userId, updatedData) => {
        const updatedUser = await api.apiUpdateUser(userId, updatedData);
        set(state => ({
            users: state.users.map(u => u.id === userId ? updatedUser : u),
            user: state.user?.id === userId ? updatedUser : state.user
        }));
      },
      updateUserAverageRating: async (userId, newAverageRating) => {
        const updatedUser = await api.apiUpdateUser(userId, { averageRating: newAverageRating });
        set(state => ({
            users: state.users.map(u => u.id === userId ? updatedUser : u),
            user: state.user?.id === userId ? updatedUser : state.user
        }));
      },
      updateUserBalance: async (userId, amount) => {
          const targetUser = get().users.find(u => u.id === userId);
          if (!targetUser) return;
          const newBalance = targetUser.balance + amount;
          const updatedUser = await api.apiUpdateUser(userId, { balance: newBalance });
          set(state => ({
            users: state.users.map(u => u.id === userId ? updatedUser : u),
            user: state.user?.id === userId ? updatedUser : state.user
        }));
      },
      logout: () => set({ user: null }),
    }),
    {
      name: 'souqmarib_user',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({ user: state.user }),
       onRehydrateStorage: () => (state) => {
        if (state) {
            state.fetchAllUsers();
        }
      }
    }
  )
);

// Initial fetch
useAuthStore.getState().fetchAllUsers();