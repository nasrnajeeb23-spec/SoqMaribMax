import { create } from 'zustand';
import { Toast, ToastType } from '../types';

interface ToastState {
  toasts: Toast[];
  showToast: (message: string, type: ToastType) => void;
  removeToast: (id: string) => void;
}

export const useToastStore = create<ToastState>((set) => ({
  toasts: [],
  showToast: (message, type) => {
    const id = `toast-${Date.now()}-${Math.random()}`;
    const newToast: Toast = { id, message, type };

    set(state => ({ toasts: [...state.toasts, newToast] }));

    setTimeout(() => {
      set(state => ({ toasts: state.toasts.filter(toast => toast.id !== id) }));
    }, 4000);
  },
  removeToast: (id) => {
    set(state => ({ toasts: state.toasts.filter(toast => toast.id !== id) }));
  },
}));
