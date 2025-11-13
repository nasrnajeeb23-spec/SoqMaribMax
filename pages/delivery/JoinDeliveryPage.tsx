import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useToast } from '../../hooks/useToast';
import Spinner from '../../components/common/Spinner';
import { useForm } from '../../hooks/useForm';
import { required, isEmail, minLength } from '../../utils/validation';
import LocationPicker from '../../components/common/LocationPicker';

const JoinDeliveryPage: React.FC = () => {
  const { showToast } = useToast();
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { values, errors, touched, handleChange, handleBlur, handleSubmit } = useForm({
    initialValues: {
      name: '',
      email: '',
      phone: '',
      city: '',
      location: null as { lat: number; lng: number } | null,
      message: '',
    },
    validationRules: {
      name: [required()],
      email: [required(), isEmail()],
      phone: [required()],
      city: [required('يرجى تحديد مدينة على الخريطة.')],
      location: [required('يرجى تحديد موقع على الخريطة.')],
      message: [minLength(10, 'يرجى كتابة نبذة مختصرة عنك.')],
    },
    onSubmit: (formValues) => {
        setIsSubmitting(true);
        // Simulate API call to submit application
        setTimeout(() => {
            console.log("Submitting delivery application:", formValues);
            setIsSubmitting(false);
            showToast('تم إرسال طلبك بنجاح! سيتم التواصل معك قريباً.', 'success');
            navigate('/');
        }, 1500);
    }
  });

  const handleLocationSelect = (loc: { lat: number; lng: number; name: string }) => {
    handleChange({ target: { name: 'location', value: { lat: loc.lat, lng: loc.lng } } } as any);
    handleChange({ target: { name: 'city', value: loc.name.split(',')[0].trim() } } as any);
  };

  return (
    <div className="min-h-full flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-xl w-full space-y-8 bg-[var(--color-surface)] p-10 rounded-xl shadow-lg" style={{boxShadow: 'var(--shadow-lg)'}}>
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-[var(--color-text-base)]">
            انضم إلى فريقنا كمندوب توصيل
          </h2>
          <p className="mt-2 text-center text-sm text-[var(--color-text-muted)]">
            املأ النموذج أدناه وسيقوم فريقنا بمراجعة طلبك والتواصل معك.
          </p>
        </div>
        <form className="mt-8 space-y-6" onSubmit={handleSubmit} noValidate>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-[var(--color-text-muted)]">الاسم الكامل</label>
              <input id="name" name="name" type="text" required value={values.name} onChange={handleChange} onBlur={handleBlur} className={`mt-1 w-full p-3 border rounded-md focus:outline-none focus:ring-[var(--color-primary)] focus:border-[var(--color-primary)] bg-[var(--color-background)] ${touched.name && errors.name ? 'border-red-500' : 'border-[var(--color-border)]'}`}/>
              {touched.name && errors.name && <p className="mt-2 text-sm text-red-600">{errors.name}</p>}
            </div>
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-[var(--color-text-muted)]">البريد الإلكتروني</label>
              <input id="email" name="email" type="email" required value={values.email} onChange={handleChange} onBlur={handleBlur} className={`mt-1 w-full p-3 border rounded-md focus:outline-none focus:ring-[var(--color-primary)] focus:border-[var(--color-primary)] bg-[var(--color-background)] ${touched.email && errors.email ? 'border-red-500' : 'border-[var(--color-border)]'}`}/>
              {touched.email && errors.email && <p className="mt-2 text-sm text-red-600">{errors.email}</p>}
            </div>
          </div>

           <div>
              <label htmlFor="phone" className="block text-sm font-medium text-[var(--color-text-muted)]">رقم الهاتف</label>
              <input id="phone" name="phone" type="tel" required value={values.phone} onChange={handleChange} onBlur={handleBlur} className={`mt-1 w-full p-3 border rounded-md focus:outline-none focus:ring-[var(--color-primary)] focus:border-[var(--color-primary)] bg-[var(--color-background)] ${touched.phone && errors.phone ? 'border-red-500' : 'border-[var(--color-border)]'}`}/>
              {touched.phone && errors.phone && <p className="mt-2 text-sm text-red-600">{errors.phone}</p>}
            </div>
          
           <div>
            <label className="block text-sm font-medium text-[var(--color-text-muted)]">موقعك الحالي</label>
            <div className="mt-1">
                <LocationPicker onLocationSelect={handleLocationSelect} />
            </div>
            {touched.location && errors.location && <p className="mt-2 text-sm text-red-600">{errors.location}</p>}
            {values.city && <p className="mt-1 text-sm text-[var(--color-text-muted)]">المدينة المحددة: {values.city}</p>}
          </div>

           <div>
            <label htmlFor="message" className="block text-sm font-medium text-[var(--color-text-muted)]">نبذة مختصرة عنك</label>
            <textarea id="message" name="message" rows={4} required value={values.message} onChange={handleChange} onBlur={handleBlur} className={`mt-1 w-full p-3 border rounded-md focus:outline-none focus:ring-[var(--color-primary)] focus:border-[var(--color-primary)] bg-[var(--color-background)] ${touched.message && errors.message ? 'border-red-500' : 'border-[var(--color-border)]'}`} placeholder="تحدث عن خبراتك السابقة إن وجدت..."></textarea>
            {touched.message && errors.message && <p className="mt-2 text-sm text-red-600">{errors.message}</p>}
          </div>

          <div>
            <button
              type="submit"
              disabled={isSubmitting}
              className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-[var(--color-primary)] hover:bg-[var(--color-primary-hover)] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[var(--color-primary)] disabled:bg-sky-400 disabled:cursor-not-allowed"
            >
              {isSubmitting ? <Spinner size="sm" className="h-5 w-5" /> : 'إرسال الطلب'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default JoinDeliveryPage;