import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { useToast } from '../hooks/useToast';
import Spinner from '../components/common/Spinner';
import { useForm } from '../hooks/useForm';
import { required, isEmail, minLength } from '../utils/validation';


const LoginPage: React.FC = () => {
  const [serverError, setServerError] = useState('');
  const { login, loading, loginWithGoogle } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();

  const { values, errors, touched, formIsValid, handleChange, handleBlur, handleSubmit } = useForm({
    initialValues: {
      email: '',
      password: '',
    },
    validationRules: {
      email: [required(), isEmail()],
      password: [required(), minLength(6)],
    },
    onSubmit: async (formValues) => {
        setServerError('');
        try {
            const user = await login(formValues.email, formValues.password);
            if (user) {
                showToast(`أهلاً بعودتك، ${user.name}!`, 'success');
                navigate('/');
            } else {
                setServerError('البريد الإلكتروني أو كلمة المرور غير صحيحة.');
            }
        } catch (err: any) {
            setServerError(err.message || 'حدث خطأ أثناء تسجيل الدخول. يرجى المحاولة مرة أخرى.');
        }
    }
  });


  const handleGoogleLogin = async () => {
    setServerError('');
    try {
      const user = await loginWithGoogle();
      if (user) {
        showToast(`أهلاً بك، ${user.name}!`, 'success');
        navigate('/');
      } else {
        setServerError('فشل تسجيل الدخول باستخدام جوجل.');
      }
    } catch (err: any) {
      setServerError(err.message || 'حدث خطأ أثناء تسجيل الدخول. يرجى المحاولة مرة أخرى.');
    }
  };


  return (
    <div className="min-h-full flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 bg-[var(--color-surface)] p-10 rounded-xl shadow-lg" style={{boxShadow: 'var(--shadow-lg)'}}>
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-[var(--color-text-base)]">
            تسجيل الدخول إلى حسابك
          </h2>
        </div>
        <form className="mt-8 space-y-6" onSubmit={handleSubmit} noValidate>
          {serverError && <p className="text-red-500 text-center bg-red-500/10 p-3 rounded-md">{serverError}</p>}
          
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-[var(--color-text-muted)]">
              البريد الإلكتروني
            </label>
            <div className="mt-1 relative">
              <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                <svg className="h-5 w-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                    <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z" />
                    <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z" />
                </svg>
              </div>
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                className={`w-full pl-4 pr-10 py-3 bg-[var(--color-background)] border rounded-md focus:outline-none focus:ring-[var(--color-primary)] focus:border-[var(--color-primary)] sm:text-sm text-[var(--color-text-base)] ${touched.email && errors.email ? 'border-red-500' : 'border-[var(--color-border)]'}`}
                placeholder="your@email.com"
                value={values.email}
                onChange={handleChange}
                onBlur={handleBlur}
              />
            </div>
            {touched.email && errors.email && <p className="mt-2 text-sm text-red-600">{errors.email}</p>}
          </div>
          
          <div>
            <label htmlFor="password" className="block text-sm font-medium text-[var(--color-text-muted)]">
              كلمة المرور
            </label>
            <div className="mt-1 relative">
               <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                <svg className="h-5 w-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 2a4 4 0 00-4 4v2H4a2 2 0 00-2 2v6a2 2 0 002 2h12a2 2 0 002-2V10a2 2 0 00-2-2h-2V6a4 4 0 00-4-4zm-2 4V6a2 2 0 114 0v2H8zm2 6a1 1 0 100-2 1 1 0 000 2z" clipRule="evenodd" />
                </svg>
              </div>
              <input
                id="password"
                name="password"
                type="password"
                autoComplete="current-password"
                required
                className={`w-full pl-4 pr-10 py-3 bg-[var(--color-background)] border rounded-md focus:outline-none focus:ring-[var(--color-primary)] focus:border-[var(--color-primary)] sm:text-sm text-[var(--color-text-base)] ${touched.password && errors.password ? 'border-red-500' : 'border-[var(--color-border)]'}`}
                placeholder="••••••••"
                value={values.password}
                onChange={handleChange}
                onBlur={handleBlur}
              />
            </div>
            {touched.password && errors.password && <p className="mt-2 text-sm text-red-600">{errors.password}</p>}
          </div>

          <div>
            <button
              type="submit"
              disabled={loading}
              className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-[var(--color-primary)] hover:bg-[var(--color-primary-hover)] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[var(--color-primary)] disabled:bg-sky-400 disabled:cursor-not-allowed"
            >
              {loading ? <Spinner size="sm" className="h-5 w-5" /> : 'تسجيل الدخول'}
            </button>
          </div>
        </form>
        
        <div className="relative my-6">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-[var(--color-border)]"></div>
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="px-2 bg-[var(--color-surface)] text-[var(--color-text-muted)]">
              أو
            </span>
          </div>
        </div>

        <div>
          <button
            type="button"
            onClick={handleGoogleLogin}
            disabled={loading}
            className="w-full inline-flex justify-center items-center py-3 px-4 border border-[var(--color-border)] rounded-md shadow-sm bg-[var(--color-surface)] text-sm font-medium text-[var(--color-text-base)] hover:bg-[var(--color-background)] disabled:bg-gray-100 disabled:cursor-not-allowed"
          >
            {loading ? <Spinner size="sm" /> : (
                <>
                    <svg className="w-5 h-5 ml-2" role="img" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><title>Google</title><path d="M12.48 10.92v3.28h7.84c-.24 1.84-.853 3.187-1.787 4.133-1.147 1.147-2.933 2.4-5.113 2.4-4.32 0-7.78-3.573-7.78-7.92s3.46-7.92 7.78-7.92c2.4 0 3.84 1.027 4.933 2.013l2.84-2.84C18.24 1.28 15.78 0 12.48 0 5.867 0 .333 5.393.333 12s5.534 12 12.147 12c3.28 0 5.753-1.12 7.613-2.973 1.947-1.947 2.56-4.853 2.56-7.84 0-.587-.053-1.147-.12-1.72H12.48z"></path></svg>
                    تسجيل الدخول باستخدام جوجل
                </>
            )}
          </button>
        </div>


        <div className="text-sm text-center">
          <p className="text-[var(--color-text-muted)]">
            ليس لديك حساب؟{' '}
            <Link to="/register" className="font-medium text-[var(--color-primary)] hover:text-[var(--color-primary-hover)]">
              أنشئ حسابًا جديدًا
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
