import { create } from 'zustand';

interface UIState {
  isAuthPromptOpen: boolean;
  authPromptMessage: string;
  openAuthPrompt: (message: string) => void;
  closeAuthPrompt: () => void;
}

export const useUIStore = create<UIState>((set) => ({
  isAuthPromptOpen: false,
  authPromptMessage: 'يرجى تسجيل الدخول أو إنشاء حساب للمتابعة.',
  openAuthPrompt: (message) => set({ isAuthPromptOpen: true, authPromptMessage: message }),
  closeAuthPrompt: () => set({ isAuthPromptOpen: false }),
}));
