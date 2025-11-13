import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useProducts } from '../../hooks/useProducts';
import { useCategories } from '../../hooks/useCategories';
import { Product, Category, ListingType } from '../../types';
import { useToast } from '../../hooks/useToast';
import { useForm } from '../../hooks/useForm';
import { required, isPositiveNumber } from '../../utils/validation';
import Spinner from '../../components/common/Spinner';
import ImageUploader from '../../components/common/ImageUploader';

const EditProductPage: React.FC = () => {
  const { productId } = useParams<{ productId: string }>();
  const { products, updateProduct } = useProducts();
  const { productCategories: categories } = useCategories();
  const navigate = useNavigate();
  const { showToast } = useToast();
  
  const productToEdit = products.find(p => p.id === productId);

  const { values, errors, touched, handleChange, handleBlur, handleSubmit } = useForm({
    initialValues: {
      name: productToEdit?.name || '',
      description: productToEdit?.description || '',
      price: productToEdit?.price.toString() || '',
      categoryId: productToEdit?.category.id || '',
      city: productToEdit?.city || '',
      imageUrl: productToEdit?.imageUrl || '',
      isNew: productToEdit?.isNew ?? true,
      stock: productToEdit?.stock.toString() || '',
    },
    validationRules: {
        name: [required()],
        description: [required()],
        price: [required(), isPositiveNumber()],
        city: [required()],
        imageUrl: [required('يرجى رفع صورة للمنتج.')],
        stock: [required(), isPositiveNumber('يجب أن تكون الكمية أكبر من صفر')],
    },
    onSubmit: (formValues) => {
        const selectedCategory = categories.find(c => c.id === formValues.categoryId);
        if (!productId || !selectedCategory) {
          showToast('حدث خطأ غير متوقع.', 'error');
          return;
        }

        updateProduct(productId, {
          name: formValues.name,
          description: formValues.description,
          price: parseFloat(formValues.price),
          category: selectedCategory,
          city: formValues.city,
          imageUrl: formValues.imageUrl,
          isNew: formValues.isNew,
          stock: parseInt(formValues.stock, 10),
        });
        
        showToast('تم تحديث المنتج بنجاح!', 'success');
        navigate('/seller-dashboard');
    }
  });


  if (!productToEdit) {
    return (
        <div className="flex justify-center items-center h-64">
            <Spinner size="lg" />
            <span className="mr-4">جار التحميل...</span>
        </div>
    );
  }

  // Auctions cannot be edited through this form
  if (productToEdit.listingType === 'AUCTION') {
    return (
        <div className="text-center p-8 bg-white rounded-lg shadow-lg">
            <h2 className="text-2xl font-bold">لا يمكن تعديل منتجات المزاد</h2>
            <p className="text-gray-600 mt-2">لا يمكن تعديل تفاصيل منتجات المزاد بعد إضافتها.</p>
            <button onClick={() => navigate(-1)} className="mt-4 bg-sky-600 text-white font-bold py-2 px-6 rounded-md">
                العودة
            </button>
        </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto bg-white p-8 rounded-lg shadow-lg">
      <h1 className="text-3xl font-bold text-gray-800 mb-6 text-center">تعديل السلعة</h1>
      <form onSubmit={handleSubmit} className="space-y-6" noValidate>
        <div>
          <label htmlFor="name" className="block text-sm font-medium text-gray-700">اسم السلعة</label>
           <div className="relative mt-1">
             <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none"><svg className="h-5 w-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M17.707 9.293a1 1 0 010 1.414l-7 7a1 1 0 01-1.414 0l-7-7A.997.997 0 012 10V5a3 3 0 013-3h5a.997.997 0 01.707.293l7 7zM5 6a1 1 0 100-2 1 1 0 000 2z" clipRule="evenodd" /></svg></div>
            <input type="text" id="name" name="name" value={values.name} onChange={handleChange} onBlur={handleBlur} required className={`block w-full pr-10 pl-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-sky-500 focus:border-sky-500 ${touched.name && errors.name ? 'border-red-500' : 'border-gray-300'}`} />
          </div>
          {touched.name && errors.name && <p className="mt-2 text-sm text-red-600">{errors.name}</p>}
        </div>
        <div>
          <label htmlFor="description" className="block text-sm font-medium text-gray-700">الوصف</label>
          <textarea id="description" name="description" value={values.description} onChange={handleChange} onBlur={handleBlur} required rows={4} className={`mt-1 block w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-sky-500 focus:border-sky-500 ${touched.description && errors.description ? 'border-red-500' : 'border-gray-300'}`}></textarea>
          {touched.description && errors.description && <p className="mt-2 text-sm text-red-600">{errors.description}</p>}
        </div>
         <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label htmlFor="price" className="block text-sm font-medium text-gray-700">السعر</label>
              <div className="relative mt-1">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none"><span className="text-gray-500 sm:text-sm">ريال</span></div>
                <input type="number" id="price" name="price" value={values.price} onChange={handleChange} onBlur={handleBlur} required className={`block w-full pl-12 pr-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-sky-500 focus:border-sky-500 ${touched.price && errors.price ? 'border-red-500' : 'border-gray-300'}`} />
              </div>
               {touched.price && errors.price && <p className="mt-2 text-sm text-red-600">{errors.price}</p>}
            </div>
            <div>
              <label htmlFor="stock" className="block text-sm font-medium text-gray-700">الكمية المتوفرة</label>
               <div className="relative mt-1">
                    <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none"><svg className="h-5 w-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M6 2a2 2 0 00-2 2v12a2 2 0 002 2h8a2 2 0 002-2V4a2 2 0 00-2-2H6zm3.5 4.5a.5.5 0 00-1 0V8H7.25a.5.5 0 000 1H8.5v1.25a.5.5 0 001 0V9h1.25a.5.5 0 000-1H9.5V6.5zm-3 4a.5.5 0 000 1h8a.5.5 0 000-1H6.5z" clipRule="evenodd" /></svg></div>
                    <input type="number" id="stock" name="stock" value={values.stock} onChange={handleChange} onBlur={handleBlur} required className={`block w-full pr-10 pl-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-sky-500 focus:border-sky-500 ${touched.stock && errors.stock ? 'border-red-500' : 'border-gray-300'}`} />
                </div>
                {touched.stock && errors.stock && <p className="mt-2 text-sm text-red-600">{errors.stock}</p>}
            </div>
        </div>
        <div>
          <label htmlFor="categoryId" className="block text-sm font-medium text-gray-700">التصنيف</label>
          <select id="categoryId" name="categoryId" value={values.categoryId} onChange={handleChange} onBlur={handleBlur} required className="mt-1 block w-full px-3 py-2 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-sky-500 focus:border-sky-500">
            {categories.map(cat => ( <option key={cat.id} value={cat.id}>{cat.name}</option>))}
          </select>
        </div>
        <div>
          <label htmlFor="city" className="block text-sm font-medium text-gray-700">المدينة</label>
           <div className="relative mt-1">
             <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none"><svg className="h-5 w-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" /></svg></div>
            <input type="text" id="city" name="city" value={values.city} onChange={handleChange} onBlur={handleBlur} required className={`block w-full pr-10 pl-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-sky-500 focus:border-sky-500 ${touched.city && errors.city ? 'border-red-500' : 'border-gray-300'}`} />
          </div>
          {touched.city && errors.city && <p className="mt-2 text-sm text-red-600">{errors.city}</p>}
        </div>
         <div>
          <ImageUploader 
            label="صورة السلعة"
            onImageUpload={(url) => handleChange({ target: { name: 'imageUrl', value: url } } as any)}
            initialImageUrl={values.imageUrl}
          />
          {touched.imageUrl && errors.imageUrl && <p className="mt-2 text-sm text-red-600">{errors.imageUrl}</p>}
        </div>
         <div>
            <span className="block text-sm font-medium text-gray-700">حالة السلعة</span>
            <div className="mt-2 flex items-center space-x-4 space-x-reverse">
              <label className="inline-flex items-center"><input type="radio" className="form-radio text-sky-600" name="isNew" value="true" checked={values.isNew === true} onChange={() => handleChange({ target: { name: 'isNew', value: true } } as any)} /><span className="mr-2">جديد</span></label>
              <label className="inline-flex items-center"><input type="radio" className="form-radio text-sky-600" name="isNew" value="false" checked={values.isNew === false} onChange={() => handleChange({ target: { name: 'isNew', value: false } } as any)} /><span className="mr-2">مستعمل</span></label>
            </div>
          </div>
        <div>
          <button type="submit" className="w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-base font-medium text-white bg-sky-600 hover:bg-sky-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-sky-500">
            حفظ التغييرات
          </button>
        </div>
      </form>
    </div>
  );
};

export default EditProductPage;