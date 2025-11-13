import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { useToast } from '../hooks/useToast';
import { User, UserRole } from '../types';
import Spinner from '../components/common/Spinner';
import { useForm } from '../hooks/useForm';
import { required, isEmail, minLength } from '../utils/validation';
import LocationPicker from '../components/common/LocationPicker';

const RegisterPage: React.FC = () => {
  const [serverError, setServerError] = useState('');
  const { register, loading, loginWithGoogle } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();

  const { values, errors, touched, formIsValid, handleChange, handleBlur, handleSubmit } = useForm({
    initialValues: {
      name: '',
      email: '',
      password: '',
      city: '',
      location: null as { lat: number; lng: number } | null,
      phone: '',
      role: 'BUYER' as UserRole,
    },
    validationRules: {
      name: [required()],
      email: [required(), isEmail()],
      password: [required(), minLength(6)],
      city: [required('يرجى تحديد مدينة على الخريطة.')],
      location: [required('يرجى تحديد موقع على الخريطة.')],
    },
    onSubmit: async (formValues) => {
        setServerError('');
        try {
            const newUser: Omit<User, 'id' | 'verificationStatus' | 'balance' | 'isSuspended' | 'commercialRegisterUrl' | 'guaranteeUrl' | 'averageRating' | 'following' | 'storeId'> = { 
                name: formValues.name,
                email: formValues.email,
                city: formValues.city,
                location: formValues.location!,
                phone: formValues.phone,
                role: formValues.role,
                joinDate: new Date().toISOString(),
            };
            const user = await register(newUser as any);
            if (user) {
                showToast(`أهلاً بك في سوق مارب، ${user.name}!`, 'success');
                if (user.role === 'SELLER') {
                    navigate('/seller-dashboard/create-store');
                } else {
                    navigate('/');
                }
            }
        } catch (err: any) {
            setServerError(err.message || 'حدث خطأ أثناء إنشاء الحساب.');
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
        setServerError('فشل إنشاء الحساب باستخدام جوجل.');
      }
    } catch (err: any) {
      setServerError(err.message || 'حدث خطأ. يرجى المحاولة مرة أخرى.');
    }
  };

  const handleLocationSelect = (loc: { lat: number; lng: number; name: string }) => {
    handleChange({ target: { name: 'location', value: { lat: loc.lat, lng: loc.lng } } } as any);
    handleChange({ target: { name: 'city', value: loc.name.split(',')[0].trim() } } as any);
  };


  return (
    <div className="min-h-full flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 bg-[var(--color-surface)] p-10 rounded-xl shadow-lg" style={{boxShadow: 'var(--shadow-lg)'}}>
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-[var(--color-text-base)]">
            إنشاء حساب جديد
          </h2>
        </div>
        <form className="mt-8 space-y-6" onSubmit={handleSubmit} noValidate>
          {serverError && <p className="text-red-500 text-center bg-red-500/10 p-3 rounded-md">{serverError}</p>}
          
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-[var(--color-text-muted)]">الاسم الكامل</label>
            <div className="mt-1 relative">
                <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                    <svg className="h-5 w-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" /></svg>
                </div>
                <input id="name" name="name" type="text" placeholder="مثال: علي محمد صالح" required value={values.name} onChange={handleChange} onBlur={handleBlur} className={`w-full pl-4 pr-10 py-3 border rounded-md focus:outline-none focus:ring-[var(--color-primary)] focus:border-[var(--color-primary)] bg-[var(--color-background)] ${touched.name && errors.name ? 'border-red-500' : 'border-[var(--color-border)]'}`}/>
            </div>
             {touched.name && errors.name && <p className="mt-2 text-sm text-red-600">{errors.name}</p>}
          </div>
          
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-[var(--color-text-muted)]">البريد الإلكتروني</label>
            <div className="mt-1 relative">
                <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                    <svg className="h-5 w-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor"><path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z" /><path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z" /></svg>
                </div>
                <input id="email" name="email" type="email" autoComplete="email" placeholder="your@email.com" required value={values.email} onChange={handleChange} onBlur={handleBlur} className={`w-full pl-4 pr-10 py-3 border rounded-md focus:outline-none focus:ring-[var(--color-primary)] focus:border-[var(--color-primary)] bg-[var(--color-background)] ${touched.email && errors.email ? 'border-red-500' : 'border-[var(--color-border)]'}`}/>
            </div>
             {touched.email && errors.email && <p className="mt-2 text-sm text-red-600">{errors.email}</p>}
          </div>
          
          <div>
            <label htmlFor="password" className="block text-sm font-medium text-[var(--color-text-muted)]">كلمة المرور</label>
            <div className="mt-1 relative">
                <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                    <svg className="h-5 w-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M10 2a4 4 0 00-4 4v2H4a2 2 0 00-2 2v6a2 2 0 002 2h12a2 2 0 002-2V10a2 2 0 00-2-2h-2V6a4 4 0 00-4-4zm-2 4V6a2 2 0 114 0v2H8zm2 6a1 1 0 100-2 1 1 0 000 2z" clipRule="evenodd" /></svg>
                </div>
                <input id="password" name="password" type="password" autoComplete="new-password" placeholder="6 أحرف على الأقل" required value={values.password} onChange={handleChange} onBlur={handleBlur} className={`w-full pl-4 pr-10 py-3 border rounded-md focus:outline-none focus:ring-[var(--color-primary)] focus:border-[var(--color-primary)] bg-[var(--color-background)] ${touched.password && errors.password ? 'border-red-500' : 'border-[var(--color-border)]'}`}/>
            </div>
             {touched.password && errors.password && <p className="mt-2 text-sm text-red-600">{errors.password}</p>}
          </div>
          
           <div>
            <label className="block text-sm font-medium text-[var(--color-text-muted)]">الموقع</label>
            <div className="mt-1">
                <LocationPicker onLocationSelect={handleLocationSelect} />
            </div>
            {touched.location && errors.location && <p className="mt-2 text-sm text-red-600">{errors.location}</p>}
            {values.city && <p className="mt-1 text-sm text-[var(--color-text-muted)]">المدينة المحددة: {values.city}</p>}
          </div>
          
          <div>
            <label htmlFor="phone" className="block text-sm font-medium text-[var(--color-text-muted)]">رقم الهاتف (اختياري)</label>
            <div className="mt-1 relative">
                <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                    <svg className="h-5 w-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor"><path d="M2 3a1 1 0 011-1h2.153a1 1 0 01.986.836l.74 4.435a1 1 0 01-.54 1.06l-1.548.773a11.037 11.037 0 006.105 6.105l.774-1.548a1 1 0 011.059-.54l4.435.74a1 1 0 01.836.986V17a1 1 0 01-1 1h-2C7.82 18 2 12.18 2 5V3z" /></svg>
                </div>
                <input id="phone" name="phone" type="tel" placeholder="777xxxxxx" value={values.phone} onChange={handleChange} onBlur={handleBlur} className="w-full pl-4 pr-10 py-3 border border-[var(--color-border)] rounded-md focus:outline-none focus:ring-[var(--color-primary)] focus:border-[var(--color-primary)] bg-[var(--color-background)]"/>
            </div>
          </div>

          <div>
            <span className="text-[var(--color-text-muted)] font-medium">أريد التسجيل كـ:</span>
            <div className="mt-2 grid grid-cols-1 md:grid-cols-3 gap-2">
               <label className={`flex items-center justify-center p-3 border rounded-lg cursor-pointer transition-colors text-sm ${values.role === 'BUYER' ? 'bg-[var(--color-primary-light)] border-[var(--color-primary)]' : 'hover:bg-[var(--color-background)]'}`}>
                <input type="radio" className="form-radio text-[var(--color-primary)]" name="role" value="BUYER" checked={values.role === 'BUYER'} onChange={handleChange} />
                <span className="mr-2">مشتري</span>
              </label>
              <label className={`flex items-center justify-center p-3 border rounded-lg cursor-pointer transition-colors text-sm ${values.role === 'SELLER' ? 'bg-[var(--color-primary-light)] border-[var(--color-primary)]' : 'hover:bg-[var(--color-background)]'}`}>
                <input type="radio" className="form-radio text-[var(--color-primary)]" name="role" value="SELLER" checked={values.role === 'SELLER'} onChange={handleChange} />
                <span className="mr-2">بائع سلع</span>
              </label>
              <label className={`flex items-center justify-center p-3 border rounded-lg cursor-pointer transition-colors text-sm ${values.role === 'PROVIDER' ? 'bg-[var(--color-primary-light)] border-[var(--color-primary)]' : 'hover:bg-[var(--color-background)]'}`}>
                <input type="radio" className="form-radio text-[var(--color-primary)]" name="role" value="PROVIDER" checked={values.role === 'PROVIDER'} onChange={handleChange} />
                <span className="mr-2">مقدم خدمة</span>
              </label>
            </div>
          </div>

          <div>
            <button
              type="submit"
              disabled={loading}
              className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-[var(--color-primary)] hover:bg-[var(--color-primary-hover)] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[var(--color-primary)] disabled:bg-sky-400 disabled:cursor-not-allowed"
            >
              {loading ? <Spinner size="sm" className="h-5 w-5" /> : 'إنشاء حساب'}
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
                    إنشاء حساب باستخدام جوجل
                </>
            )}
          </button>
        </div>

        <div className="text-sm text-center">
          <p className="text-[var(--color-text-muted)]">
            لديك حساب بالفعل؟{' '}
            <Link to="/login" className="font-medium text-[var(--color-primary)] hover:text-[var(--color-primary-hover)]">
              قم بتسجيل الدخول
            </Link>
          </p>
        </div>
         <div className="text-center mt-6 pt-6 border-t border-[var(--color-border)]">
          <p className="text-sm text-[var(--color-text-muted)]">
            هل ترغب بالانضمام إلينا كمندوب توصيل؟
          </p>
          <Link to="/join-delivery" className="font-medium text-[var(--color-primary)] hover:text-[var(--color-primary-hover)]">
            قدم طلبك من هنا
          </Link>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;