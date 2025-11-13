import React from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useUIStore } from '../../store/uiStore';
import { useAuth } from '../../hooks/useAuth';
import { useToast } from '../../hooks/useToast';
import Spinner from '../common/Spinner';

const AuthPromptModal: React.FC = () => {
  const { isAuthPromptOpen, authPromptMessage, closeAuthPrompt } = useUIStore();
  const navigate = useNavigate();
  const { loginWithGoogle, loading } = useAuth();
  const { showToast } = useToast();


  const handleNavigateAndClose = (path: string) => {
    closeAuthPrompt();
    navigate(path);
  };
  
  const handleGoogleLogin = async () => {
    try {
      const user = await loginWithGoogle();
      if (user) {
        showToast(`أهلاً بك، ${user.name}!`, 'success');
        closeAuthPrompt();
      } else {
        showToast('فشل تسجيل الدخول باستخدام جوجل.', 'error');
      }
    } catch (err: any) {
      showToast(err.message || 'حدث خطأ. يرجى المحاولة مرة أخرى.', 'error');
    }
  };


  return (
    <AnimatePresence>
      {isAuthPromptOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4"
          onClick={closeAuthPrompt}
        >
          <motion.div
            initial={{ scale: 0.7, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.7, opacity: 0 }}
            transition={{ type: 'spring', stiffness: 300, damping: 25 }}
            className="bg-[var(--color-surface)] rounded-xl shadow-2xl p-8 w-full max-w-md text-center relative"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={closeAuthPrompt}
              className="absolute top-3 left-3 text-[var(--color-text-muted)] hover:text-[var(--color-text-base)]"
              aria-label="إغلاق"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
            </button>
            
            <div className="mx-auto mb-4 w-16 h-16 bg-[var(--color-primary-light)] rounded-full flex items-center justify-center">
              <svg className="w-10 h-10 text-[var(--color-primary)]" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg>
            </div>

            <h2 className="text-2xl font-bold text-[var(--color-text-base)] mb-3">انضم إلى مجتمع سوق مارب!</h2>
            <p className="text-[var(--color-text-muted)] mb-6">{authPromptMessage}</p>

            <button
                type="button"
                onClick={handleGoogleLogin}
                disabled={loading}
                className="w-full inline-flex justify-center items-center py-3 px-4 border border-[var(--color-border)] rounded-lg shadow-sm bg-[var(--color-surface)] text-sm font-medium text-[var(--color-text-base)] hover:bg-[var(--color-background)] disabled:bg-gray-100 disabled:cursor-not-allowed mb-4"
            >
                {loading ? <Spinner size="sm" /> : (
                    <>
                        <svg className="w-5 h-5 ml-2" role="img" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><title>Google</title><path d="M12.48 10.92v3.28h7.84c-.24 1.84-.853 3.187-1.787 4.133-1.147 1.147-2.933 2.4-5.113 2.4-4.32 0-7.78-3.573-7.78-7.92s3.46-7.92 7.78-7.92c2.4 0 3.84 1.027 4.933 2.013l2.84-2.84C18.24 1.28 15.78 0 12.48 0 5.867 0 .333 5.393.333 12s5.534 12 12.147 12c3.28 0 5.753-1.12 7.613-2.973 1.947-1.947 2.56-4.853 2.56-7.84 0-.587-.053-1.147-.12-1.72H12.48z"></path></svg>
                        المتابعة باستخدام جوجل
                    </>
                )}
            </button>
            
            <div className="relative my-4">
                <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-[var(--color-border)]"></div>
                </div>
                <div className="relative flex justify-center text-sm">
                    <span className="px-2 bg-[var(--color-surface)] text-[var(--color-text-muted)]">
                    أو
                    </span>
                </div>
            </div>


            <div className="space-y-3 mt-4">
              <button
                onClick={() => handleNavigateAndClose('/register')}
                className="w-full text-lg font-medium text-white bg-[var(--color-primary)] hover:bg-[var(--color-primary-hover)] p-3 rounded-lg transition-colors"
              >
                إنشاء حساب جديد
              </button>
              <button
                onClick={() => handleNavigateAndClose('/login')}
                className="w-full text-lg font-medium text-[var(--color-text-base)] bg-[var(--color-background)] hover:bg-[var(--color-border)] p-3 rounded-lg transition-colors"
              >
                لدي حساب بالفعل
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default AuthPromptModal;