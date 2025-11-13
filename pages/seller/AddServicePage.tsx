import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useServices } from '../../hooks/useServices';
import { useCategories } from '../../hooks/useCategories';
import { ServicePricingModel } from '../../types';
import { useToast } from '../../hooks/useToast';
import { useForm } from '../../hooks/useForm';
import { required, isPositiveNumber } from '../../utils/validation';
import ImageUploader from '../../components/common/ImageUploader';

const AddServicePage: React.FC = () => {
  const { addService } = useServices();
  const { serviceCategories } = useCategories();
  const { showToast } = useToast();
  const navigate = useNavigate();

  // FIX: Added 'handleBlur' to the destructuring of the useForm hook.
  const { values, errors, touched, handleChange, handleBlur, handleSubmit } = useForm({
    initialValues: {
      title: '',
      description: '',
      price: '',
      pricingModel: 'FIXED' as ServicePricingModel,
      categoryId: serviceCategories[0]?.id || '',
      city: '',
      imageUrl: '',
      availability: '',
    },
    validationRules: {
      title: [required()],
      price: [required(), isPositiveNumber()],
      categoryId: [required()],
      city: [required()],
      imageUrl: [required('يرجى رفع صورة للخدمة.')],
      availability: [required()],
    },
    onSubmit: (formValues) => {
      const selectedCategory = serviceCategories.find(c => c.id === formValues.categoryId);
      if (!selectedCategory) return;
      
      addService({
        ...formValues,
        price: parseFloat(formValues.price),
        category: selectedCategory,
      }, showToast);
        
      navigate('/provider-dashboard');
    }
  });

  return (
    <div className="max-w-2xl mx-auto bg-white p-8 rounded-lg shadow-lg">
      <h1 className="text-3xl font-bold text-gray-800 mb-6 text-center">إضافة خدمة جديدة</h1>
      <form onSubmit={handleSubmit} className="space-y-6" noValidate>
        <div>
          <label htmlFor="title" className="block text-sm font-medium text-gray-700">عنوان الخدمة</label>
           <div className="relative mt-1">
             <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                <svg className="h-5 w-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M17.707 9.293a1 1 0 010 1.414l-7 7a1 1 0 01-1.414 0l-7-7A.997.997 0 012 10V5a3 3 0 013-3h5a.997.997 0 01.707.293l7 7zM5 6a1 1 0 100-2 1 1 0 000 2z" clipRule="evenodd" /></svg>
             </div>
            <input type="text" id="title" name="title" value={values.title} onChange={handleChange} onBlur={handleBlur} required className={`block w-full pr-10 pl-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-teal-500 focus:border-teal-500 ${touched.title && errors.title ? 'border-red-500' : 'border-gray-300'}`} />
           </div>
           {touched.title && errors.title && <p className="mt-2 text-sm text-red-600">{errors.title}</p>}
        </div>
        <div>
          <label htmlFor="description" className="block text-sm font-medium text-gray-700">وصف كامل للخدمة</label>
          <textarea id="description" name="description" value={values.description} onChange={handleChange} onBlur={handleBlur} required rows={4} className={`mt-1 block w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-teal-500 focus:border-teal-500 ${touched.description && errors.description ? 'border-red-500' : 'border-gray-300'}`}></textarea>
           {touched.description && errors.description && <p className="mt-2 text-sm text-red-600">{errors.description}</p>}
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label htmlFor="price" className="block text-sm font-medium text-gray-700">السعر</label>
              <div className="relative mt-1">
                 <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <span className="text-gray-500 sm:text-sm">ريال</span>
                </div>
                <input type="number" id="price" name="price" value={values.price} onChange={handleChange} onBlur={handleBlur} required className={`block w-full pl-12 pr-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-teal-500 focus:border-teal-500 ${touched.price && errors.price ? 'border-red-500' : 'border-gray-300'}`} />
              </div>
              {touched.price && errors.price && <p className="mt-2 text-sm text-red-600">{errors.price}</p>}
            </div>
             <div>
                <label htmlFor="pricingModel" className="block text-sm font-medium text-gray-700">نموذج التسعير</label>
                <select id="pricingModel" name="pricingModel" value={values.pricingModel} onChange={handleChange} onBlur={handleBlur} className="mt-1 block w-full px-3 py-2 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-teal-500 focus:border-teal-500">
                    <option value="FIXED">سعر ثابت</option>
                    <option value="HOURLY">بالساعة</option>
                    <option value="PER_PROJECT">لكل مشروع</option>
                </select>
            </div>
        </div>
        <div>
          <label htmlFor="categoryId" className="block text-sm font-medium text-gray-700">تصنيف الخدمة</label>
          <select id="categoryId" name="categoryId" value={values.categoryId} onChange={handleChange} onBlur={handleBlur} required className="mt-1 block w-full px-3 py-2 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-teal-500 focus:border-teal-500">
            {serviceCategories.map(cat => (
              <option key={cat.id} value={cat.id}>{cat.name}</option>
            ))}
          </select>
        </div>
         <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
            <label htmlFor="city" className="block text-sm font-medium text-gray-700">المدينة</label>
            <div className="relative mt-1">
                 <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                    <svg className="h-5 w-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" /></svg>
                 </div>
                <input type="text" id="city" name="city" value={values.city} onChange={handleChange} onBlur={handleBlur} required className={`block w-full pr-10 pl-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-teal-500 focus:border-teal-500 ${touched.city && errors.city ? 'border-red-500' : 'border-gray-300'}`} />
              </div>
              {touched.city && errors.city && <p className="mt-2 text-sm text-red-600">{errors.city}</p>}
            </div>
            <div>
            <label htmlFor="availability" className="block text-sm font-medium text-gray-700">أوقات التوفر</label>
             <div className="relative mt-1">
                 <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                    <svg className="h-5 w-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M5.75 2a.75.75 0 01.75.75V4h7V2.75a.75.75 0 011.5 0V4h.25A2.75 2.75 0 0118 6.75v8.5A2.75 2.75 0 0115.25 18H4.75A2.75 2.75 0 012 15.25v-8.5A2.75 2.75 0 014.75 4H5V2.75A.75.75 0 015.75 2zM4.5 6.75a1.25 1.25 0 011.25-1.25h8.5a1.25 1.25 0 011.25 1.25v8.5a1.25 1.25 0 01-1.25-1.25h-8.5a1.25 1.25 0 01-1.25-1.25v-8.5z" clipRule="evenodd" /></svg>
                 </div>
                <input type="text" id="availability" name="availability" value={values.availability} onChange={handleChange} onBlur={handleBlur} placeholder="مثال: من الأحد إلى الخميس" required className={`block w-full pr-10 pl-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-teal-500 focus:border-teal-500 ${touched.availability && errors.availability ? 'border-red-500' : 'border-gray-300'}`} />
              </div>
               {touched.availability && errors.availability && <p className="mt-2 text-sm text-red-600">{errors.availability}</p>}
            </div>
        </div>
         <div>
            <ImageUploader 
              label="صورة معبرة عن الخدمة"
              onImageUpload={(url) => handleChange({ target: { name: 'imageUrl', value: url } } as any)}
              initialImageUrl={values.imageUrl}
            />
            {touched.imageUrl && errors.imageUrl && <p className="mt-2 text-sm text-red-600">{errors.imageUrl}</p>}
        </div>
        <div>
          <button type="submit" className="w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-base font-medium text-white bg-teal-600 hover:bg-teal-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-500">
            إضافة الخدمة
          </button>
        </div>
      </form>
    </div>
  );
};

export default AddServicePage;