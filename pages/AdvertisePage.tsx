import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAds } from '../../hooks/useAds';
import { useAuth } from '../../hooks/useAuth';
import { useToast } from '../../hooks/useToast';
import { useSettings } from '../../hooks/useSettings';
import { useForm } from '../../hooks/useForm';
import { required } from '../../utils/validation';
import ImageUploader from '../../components/common/ImageUploader';

const AdvertisePage: React.FC = () => {
  const { addAd } = useAds();
  const { user } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();
  const { settings } = useSettings();
  
  // FIX: Added 'handleBlur' to the destructuring of the useForm hook.
  const { values, errors, touched, handleChange, handleBlur, handleSubmit } = useForm({
    initialValues: {
      title: '',
      imageUrl: '',
      link: '',
    },
    validationRules: {
      title: [required()],
      imageUrl: [required('يرجى رفع صورة للإعلان.')],
      link: [required()],
    },
    onSubmit: async (formValues) => {
      if (!user) {
        showToast('يجب تسجيل الدخول لنشر إعلان.', 'error');
        return;
      }
      const success = addAd({
        title: formValues.title,
        imageUrl: formValues.imageUrl,
        link: formValues.link,
        advertiserName: user.name,
      });
      
      if (await success) {
        navigate('/');
      }
    },
  });

  return (
    <div className="max-w-2xl mx-auto bg-white p-8 rounded-lg shadow-lg">
      <h1 className="text-3xl font-bold text-gray-800 mb-2 text-center">أعلن في سوق مارب</h1>
      <p className="text-center text-gray-500 mb-6">
        صل بإعلانك إلى آلاف المستخدمين. املأ النموذج أدناه وانشر إعلانك اليوم!
      </p>
      <form onSubmit={handleSubmit} className="space-y-6" noValidate>
        <div>
          <label htmlFor="title" className="block text-sm font-medium text-gray-700">عنوان الإعلان (جملة قصيرة وجذابة)</label>
          <input type="text" id="title" name="title" value={values.title} onChange={handleChange} onBlur={handleBlur} required className={`mt-1 block w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-sky-500 focus:border-sky-500 ${touched.title && errors.title ? 'border-red-500' : 'border-gray-300'}`} />
           {touched.title && errors.title && <p className="mt-2 text-sm text-red-600">{errors.title}</p>}
        </div>
        <div>
          <ImageUploader 
            label="صورة الإعلان (مقاس 1200x400)"
            onImageUpload={(url) => handleChange({ target: { name: 'imageUrl', value: url } } as any)}
            initialImageUrl={values.imageUrl}
          />
           {touched.imageUrl && errors.imageUrl && <p className="mt-2 text-sm text-red-600">{errors.imageUrl}</p>}
        </div>
        <div>
          <label htmlFor="link" className="block text-sm font-medium text-gray-700">الرابط (عند الضغط على الإعلان)</label>
          <input type="url" id="link" name="link" value={values.link} onChange={handleChange} onBlur={handleBlur} placeholder="https://example.com" required className={`mt-1 block w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-sky-500 focus:border-sky-500 ${touched.link && errors.link ? 'border-red-500' : 'border-gray-300'}`} />
           {touched.link && errors.link && <p className="mt-2 text-sm text-red-600">{errors.link}</p>}
        </div>
        <div className="bg-sky-50 p-4 rounded-lg border border-sky-200 text-center">
            <p className="font-bold text-lg text-sky-800">التكلفة: {settings.adCost} ريال يمني</p>
            <p className="text-sm text-sky-700">لمدة 7 أيام من العرض المميز في الصفحة الرئيسية.</p>
        </div>
        <div>
          <button type="submit" className="w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-base font-medium text-white bg-sky-600 hover:bg-sky-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-sky-500">
            المتابعة للدفع ونشر الإعلان
          </button>
        </div>
      </form>
    </div>
  );
};

export default AdvertisePage;