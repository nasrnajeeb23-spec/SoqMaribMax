import { useAuth } from './useAuth';
import { useUIStore } from '../store/uiStore';

/**
 * A custom hook that prompts unauthenticated users to sign in before performing an action.
 * @returns A function that takes an action callback and a prompt message.
 * It returns a new function that will either execute the action or open the auth prompt.
 */
export const useAuthPrompt = () => {
  const { isAuthenticated, user } = useAuth();
  const { openAuthPrompt } = useUIStore();

  const prompt = (action: () => void, message: string, requiredRole: 'BUYER' | null = 'BUYER') => {
    return () => {
      if (isAuthenticated) {
        if (requiredRole && user?.role !== requiredRole) {
          // You can add a toast message here if you want to notify users who are logged in but have the wrong role.
          // For now, we just prevent the action.
          return;
        }
        action();
      } else {
        openAuthPrompt(message);
      }
    };
  };

  return prompt;
};
