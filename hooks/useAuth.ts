import { useAuthStore } from '../store/authStore';

export const useAuth = () => {
  const store = useAuthStore();
  const isAuthenticated = !!store.user;

  return { ...store, isAuthenticated };
};
