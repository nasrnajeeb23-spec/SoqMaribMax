import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useProducts } from '../../hooks/useProducts';
import { useCategories } from '../../hooks/useCategories';
import { Category, ListingType } from '../../types';
import { useToast } from '../../hooks/useToast';
import { GoogleGenAI } from '@google/genai';
import Spinner from '../../components/common/Spinner';
import { useSettings } from '../../hooks/useSettings';
import { useForm } from '../../hooks/useForm';
import { required, isPositiveNumber, conditional } from '../../utils/validation';
import LocationPicker from '../../components/common/LocationPicker';
import ImageUploader from '../../components/common/ImageUploader';
import { useAuth } from '../../hooks/useAuth';
import { useStoreStore } from '../../store/storeStore';

const AddProductPage: React.FC = () => {
  const { addProduct, products } = useProducts();
  const { productCategories: categories } = useCategories();
  const { showToast } = useToast();
  const navigate = useNavigate();
  const { settings } = useSettings();
  const { user } = useAuth();
  const { getStoreByOwnerId } = useStoreStore();
  
  const userStore = getStoreByOwnerId(user?.id || '');

  const [isGeneratingDesc, setIsGeneratingDesc] = useState(false);
  const [isSuggestingPrice, setIsSuggestingPrice] = useState(false);

  const { values, errors, touched, handleChange, handleBlur, handleSubmit } = useForm({
    initialValues: {
      name: '',
      description: '',
      price: '',
      categoryId: categories[0]?.id || '',
      storeCategory: userStore?.categories[0] || '',
      city: user?.city || '',
      location: user?.location || null,
      imageUrl: '',
      isNew: true,
      stock: '1',
      featuredListing: 'standard' as 'standard' | 'featured',
      productListingType: 'FIXED_PRICE' as ListingType,
      auctionDuration: 3,
    },
    validationRules: {
      name: [required()],
      description: [required()],
      price: [required(), isPositiveNumber()],
      categoryId: [required()],
      city: [required('يرجى تحديد مدينة على الخريطة.')],
      location: [required('يرجى تحديد موقع على الخريطة.')],
      imageUrl: [required('يرجى رفع صورة للمنتج.')],
      stock: conditional(
        (allValues: any) => allValues.productListingType === 'FIXED_PRICE',
        [required(), isPositiveNumber('يجب أن تكون الكمية أكبر من صفر')]
      ),
    },
    onSubmit: (formValues) => {
        const selectedCategory = categories.find(c => c.id === formValues.categoryId);
        if (!selectedCategory) return;
    
        let auctionEndDate: string | undefined = undefined;
        if (formValues.productListingType === 'AUCTION') {
            const endDate = new Date();
            endDate.setDate(endDate.getDate() + formValues.auctionDuration);
            auctionEndDate = endDate.toISOString();
        }

        const cost = formValues.featuredListing === 'standard' ? settings.standardListingFee : settings.featuredListingFee;
        if (window.confirm(`التكلفة الإجمالية: ${cost} ريال يمني. هل تريد المتابعة؟`)) {
          addProduct({
            name: formValues.name,
            description: formValues.description,
            price: parseFloat(formValues.price),
            category: selectedCategory,
            storeCategory: formValues.storeCategory,
            city: formValues.city,
            location: formValues.location!,
            imageUrl: formValues.imageUrl,
            isNew: formValues.isNew,
            stock: formValues.productListingType === 'AUCTION' ? 1 : parseInt(formValues.stock, 10),
          }, formValues.featuredListing, formValues.productListingType, auctionEndDate);
          
          showToast('تم الدفع وإضافة المنتج بنجاح!', 'success');
          navigate('/seller-dashboard');
        }
    }
  });


  const handleGenerateDescription = async () => {
    if (!values.name.trim()) {
        showToast('يرجى إدخال اسم المنتج أولاً.', 'error');
        return;
    }
    setIsGeneratingDesc(true);
    try {
        const ai = new GoogleGenAI({ apiKey: process.env.API_KEY as string });
        const prompt = `أنت كاتب إعلانات خبير في التجارة الإلكترونية. بناءً على اسم المنتج التالي، اكتب وصفًا تسويقيًا احترافيًا وجذابًا للمنتج باللغة العربية. يجب أن يكون الوصف في فقرة واحدة ومناسباً للسوق اليمني. اسم المنتج: "${values.name}"`;
        
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt,
        });
        
        const generatedText = response.text;
        
        if (generatedText) {
            handleChange({ target: { name: 'description', value: generatedText } } as any);
            showToast('تم إنشاء الوصف بنجاح!', 'success');
        } else {
            throw new Error('No text generated.');
        }

    } catch (err) {
        console.error("Error generating description:", err);
        showToast('فشل إنشاء الوصف. يرجى المحاولة مرة أخرى.', 'error');
    } finally {
        setIsGeneratingDesc(false);
    }
  };

  const handleSuggestPrice = async () => {
    if (!values.name.trim() || !values.categoryId) {
        showToast('يرجى إدخال اسم المنتج واختيار التصنيف أولاً.', 'error');
        return;
    }
    setIsSuggestingPrice(true);

    try {
        const similarProducts = products
            .filter(p => p.category.id === values.categoryId)
            .slice(0, 10)
            .map(p => `- ${p.name} (السعر: ${p.price} ريال)`)
            .join('\n');

        const selectedCategoryName = categories.find(c => c.id === values.categoryId)?.name;
        const condition = values.isNew ? 'جديد' : 'مستعمل';

        const prompt = `
            أنت خبير تسعير في سوق يمني إلكتروني اسمه "سوق مارب".
            مهمتك هي اقتراح سعر تنافسي وعادل لمنتج جديد يريد بائع إضافته.

            تفاصيل المنتج الجديد:
            - الاسم: "${values.name}"
            - التصنيف: ${selectedCategoryName}
            - الحالة: ${condition}
            - الوصف: ${values.description}

            قائمة ببعض المنتجات المشابهة الموجودة حالياً في نفس التصنيف بالسوق:
            ${similarProducts || 'لا توجد منتجات مشابهة حالياً.'}

            بناءً على هذه المعلومات، قم بتحليل السوق واقترح أفضل سعر للمنتج بالريال اليمني.
            
            الرجاء الرد برقم فقط بدون أي نصوص إضافية أو رموز عملة أو فواصل. مثال: 120000
        `;
        
        const ai = new GoogleGenAI({ apiKey: process.env.API_KEY as string });
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt,
        });
        
        const suggestedPriceText = response.text.trim();
        const suggestedPrice = parseInt(suggestedPriceText.replace(/[^0-9]/g, ''), 10);

        if (!isNaN(suggestedPrice) && suggestedPrice > 0) {
            handleChange({ target: { name: 'price', value: String(suggestedPrice) } } as any);
            showToast('تم اقتراح السعر بنجاح!', 'success');
        } else {
            throw new Error('Invalid price format received from AI.');
        }

    } catch (err) {
        console.error("Error suggesting price:", err);
        showToast('فشل اقتراح السعر. يرجى المحاولة مرة أخرى.', 'error');
    } finally {
        setIsSuggestingPrice(false);
    }
  };
  
  const handleLocationSelect = (loc: { lat: number; lng: number; name: string }) => {
    handleChange({ target: { name: 'location', value: { lat: loc.lat, lng: loc.lng } } } as any);
    handleChange({ target: { name: 'city', value: loc.name.split(',')[0].trim() } } as any);
  };


  return (
    <div className="max-w-2xl mx-auto bg-[var(--color-surface)] p-8 rounded-lg shadow-lg">
      <h1 className="text-3xl font-bold text-[var(--color-text-base)] mb-6 text-center">إضافة سلعة جديدة</h1>
      <form onSubmit={handleSubmit} className="space-y-6" noValidate>
        
        <div>
            <span className="block text-sm font-medium text-[var(--color-text-muted)]">نوع العرض</span>
            <div className="mt-2 grid grid-cols-2 gap-4">
              <label className={`flex items-center justify-center p-3 border rounded-lg cursor-pointer ${values.productListingType === 'FIXED_PRICE' ? 'bg-[var(--color-primary-light)] border-[var(--color-primary)]' : 'hover:bg-[var(--color-background)]'}`}>
                <input type="radio" name="productListingType" value="FIXED_PRICE" checked={values.productListingType === 'FIXED_PRICE'} onChange={handleChange} className="form-radio text-[var(--color-primary)]"/>
                <span className="mr-3 font-medium">سعر ثابت</span>
              </label>
              <label className={`flex items-center justify-center p-3 border rounded-lg cursor-pointer ${values.productListingType === 'AUCTION' ? 'bg-[var(--color-primary-light)] border-[var(--color-primary)]' : 'hover:bg-[var(--color-background)]'}`}>
                <input type="radio" name="productListingType" value="AUCTION" checked={values.productListingType === 'AUCTION'} onChange={handleChange} className="form-radio text-[var(--color-primary)]"/>
                <span className="mr-3 font-medium">مزاد</span>
              </label>
            </div>
        </div>

        <div>
          <label htmlFor="name" className="block text-sm font-medium text-[var(--color-text-muted)]">اسم السلعة</label>
           <div className="relative mt-1">
             <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                <svg className="h-5 w-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M17.707 9.293a1 1 0 010 1.414l-7 7a1 1 0 01-1.414 0l-7-7A.997.997 0 012 10V5a3 3 0 013-3h5a.997.997 0 01.707.293l7 7zM5 6a1 1 0 100-2 1 1 0 000 2z" clipRule="evenodd" /></svg>
             </div>
            <input type="text" id="name" name="name" value={values.name} onChange={handleChange} onBlur={handleBlur} required className={`block w-full pr-10 pl-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-[var(--color-primary)] focus:border-[var(--color-primary)] bg-[var(--color-background)] ${touched.name && errors.name ? 'border-red-500' : 'border-[var(--color-border)]'}`} />
           </div>
           {touched.name && errors.name && <p className="mt-2 text-sm text-red-600">{errors.name}</p>}
        </div>
        <div>
          <div className="flex justify-between items-center mb-1">
            <label htmlFor="description" className="block text-sm font-medium text-[var(--color-text-muted)]">الوصف</label>
            <button type="button" onClick={handleGenerateDescription} disabled={!values.name.trim() || isGeneratingDesc} className="flex items-center gap-1.5 text-sm font-medium text-purple-600 hover:text-purple-800 disabled:text-gray-400 disabled:cursor-not-allowed transition-colors">
                {isGeneratingDesc ? (<><Spinner size="sm" /><span>جاري الإنشاء...</span></>) : (<><span>إنشاء بالذكاء الاصطناعي</span><span className="text-lg">✨</span></>)}
            </button>
          </div>
          <textarea id="description" name="description" value={values.description} onChange={handleChange} onBlur={handleBlur} required rows={4} className={`block w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-[var(--color-primary)] focus:border-[var(--color-primary)] bg-[var(--color-background)] ${touched.description && errors.description ? 'border-red-500' : 'border-[var(--color-border)]'}`}></textarea>
          {touched.description && errors.description && <p className="mt-2 text-sm text-red-600">{errors.description}</p>}
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
                <label htmlFor="price" className="block text-sm font-medium text-[var(--color-text-muted)]">{values.productListingType === 'AUCTION' ? 'السعر المبدئي' : 'السعر'}</label>
                 <div className="mt-1 flex rounded-md shadow-sm">
                    <div className="relative flex-grow">
                        <input type="number" id="price" name="price" value={values.price} onChange={handleChange} onBlur={handleBlur} required className={`block w-full pr-3 pl-12 py-2 border rounded-r-md focus:outline-none focus:ring-[var(--color-primary)] focus:border-[var(--color-primary)] bg-[var(--color-background)] sm:text-sm ${touched.price && errors.price ? 'border-red-500' : 'border-[var(--color-border)]'}`} />
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none"><span className="text-gray-500 sm:text-sm">ريال</span></div>
                    </div>
                    <button type="button" onClick={handleSuggestPrice} disabled={!values.name.trim() || isSuggestingPrice} className="inline-flex items-center px-3 py-2 border border-r-0 border-[var(--color-border)] bg-gray-50 dark:bg-slate-700 text-sm font-medium text-[var(--color-text-muted)] hover:bg-gray-100 rounded-l-md disabled:bg-gray-100 disabled:text-gray-400 disabled:cursor-not-allowed">
                        {isSuggestingPrice ? <Spinner size="sm" /> : <span className="flex items-center gap-1.5" title="اقترح سعرًا باستخدام الذكاء الاصطناعي"><span className="hidden sm:inline">اقترح</span><span className="text-base">💡</span></span>}
                    </button>
                </div>
                {touched.price && errors.price && <p className="mt-2 text-sm text-red-600">{errors.price}</p>}
            </div>
             {values.productListingType === 'FIXED_PRICE' ? (
                <div>
                    <label htmlFor="stock" className="block text-sm font-medium text-[var(--color-text-muted)]">الكمية المتوفرة</label>
                     <div className="relative mt-1">
                        <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none"><svg className="h-5 w-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M6 2a2 2 0 00-2 2v12a2 2 0 002 2h8a2 2 0 002-2V4a2 2 0 00-2-2H6zm3.5 4.5a.5.5 0 00-1 0V8H7.25a.5.5 0 000 1H8.5v1.25a.5.5 0 001 0V9h1.25a.5.5 0 000-1H9.5V6.5zm-3 4a.5.5 0 000 1h8a.5.5 0 000-1H6.5z" clipRule="evenodd" /></svg></div>
                        <input type="number" id="stock" name="stock" value={values.stock} onChange={handleChange} onBlur={handleBlur} required className={`block w-full pr-10 pl-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-[var(--color-primary)] focus:border-[var(--color-primary)] bg-[var(--color-background)] ${touched.stock && errors.stock ? 'border-red-500' : 'border-[var(--color-border)]'}`} />
                    </div>
                    {touched.stock && errors.stock && <p className="mt-2 text-sm text-red-600">{errors.stock}</p>}
                </div>
             ) : (
                <div>
                    <label htmlFor="auctionDuration" className="block text-sm font-medium text-[var(--color-text-muted)]">مدة المزاد</label>
                    <select id="auctionDuration" name="auctionDuration" value={values.auctionDuration} onChange={handleChange} onBlur={handleBlur} className="mt-1 block w-full px-3 py-2 border border-[var(--color-border)] bg-[var(--color-surface)] rounded-md shadow-sm focus:outline-none focus:ring-[var(--color-primary)] focus:border-[var(--color-primary)]">
                        <option value={1}>يوم واحد</option><option value={3}>3 أيام</option><option value={5}>5 أيام</option><option value={7}>7 أيام</option>
                    </select>
                </div>
             )}
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label htmlFor="categoryId" className="block text-sm font-medium text-[var(--color-text-muted)]">التصنيف العام</label>
              <select id="categoryId" name="categoryId" value={values.categoryId} onChange={handleChange} onBlur={handleBlur} required className="mt-1 block w-full px-3 py-2 border border-[var(--color-border)] bg-[var(--color-surface)] rounded-md shadow-sm focus:outline-none focus:ring-[var(--color-primary)] focus:border-[var(--color-primary)]">
                {categories.map(cat => (<option key={cat.id} value={cat.id}>{cat.name}</option>))}
              </select>
            </div>
            {userStore && userStore.categories.length > 0 && (
                 <div>
                    <label htmlFor="storeCategory" className="block text-sm font-medium text-[var(--color-text-muted)]">قسم المتجر</label>
                    <select id="storeCategory" name="storeCategory" value={values.storeCategory} onChange={handleChange} onBlur={handleBlur} className="mt-1 block w-full px-3 py-2 border border-[var(--color-border)] bg-[var(--color-surface)] rounded-md shadow-sm focus:outline-none focus:ring-[var(--color-primary)] focus:border-[var(--color-primary)]">
                        <option value="">بدون قسم</option>
                        {userStore.categories.map(cat => (<option key={cat} value={cat}>{cat}</option>))}
                    </select>
                </div>
            )}
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
            <label className="block text-sm font-medium text-[var(--color-text-muted)]">موقع السلعة</label>
            <div className="mt-1">
                <LocationPicker onLocationSelect={handleLocationSelect} initialPosition={values.location || undefined} />
            </div>
            {touched.location && errors.location && <p className="mt-2 text-sm text-red-600">{errors.location}</p>}
            {values.city && <p className="mt-1 text-sm text-[var(--color-text-muted)]">المدينة المحددة: {values.city}</p>}
        </div>
         <div>
            <span className="block text-sm font-medium text-[var(--color-text-muted)]">حالة السلعة</span>
            <div className="mt-2 flex items-center space-x-4 space-x-reverse">
              <label className="inline-flex items-center"><input type="radio" className="form-radio text-[var(--color-primary)]" name="isNew" value="true" checked={values.isNew === true} onChange={() => handleChange({ target: { name: 'isNew', value: true } } as any)} /><span className="mr-2">جديد</span></label>
              <label className="inline-flex items-center"><input type="radio" className="form-radio text-[var(--color-primary)]" name="isNew" value="false" checked={values.isNew === false} onChange={() => handleChange({ target: { name: 'isNew', value: false } } as any)} /><span className="mr-2">مستعمل</span></label>
            </div>
          </div>
          <div>
            <span className="block text-sm font-medium text-[var(--color-text-muted)]">خيارات الترويج</span>
            <div className="mt-2 space-y-2">
              <label className="flex items-center p-3 border rounded-lg cursor-pointer hover:bg-[var(--color-primary-light)] has-[:checked]:bg-[var(--color-primary-light)] has-[:checked]:border-[var(--color-primary)]"><input type="radio" name="featuredListing" value="standard" checked={values.featuredListing === 'standard'} onChange={handleChange} className="form-radio text-[var(--color-primary)]"/><div className="mr-3"><p className="font-medium">عرض قياسي</p><p className="text-sm text-gray-500">سيتم عرض سلعتك في القوائم العامة.</p></div><span className="mr-auto font-bold text-[var(--color-text-base)]">{settings.standardListingFee} ريال</span></label>
              <label className="flex items-center p-3 border rounded-lg cursor-pointer hover:bg-[var(--color-primary-light)] has-[:checked]:bg-[var(--color-primary-light)] has-[:checked]:border-yellow-500"><input type="radio" name="featuredListing" value="featured" checked={values.featuredListing === 'featured'} onChange={handleChange} className="form-radio text-[var(--color-primary)]"/><div className="mr-3"><p className="font-medium flex items-center gap-2">عرض مميز <span className="text-xs bg-yellow-200 text-yellow-800 px-2 py-0.5 rounded-full">الأكثر شيوعاً</span></p><p className="text-sm text-gray-500">تمييز لمدة 7 أيام.</p></div><span className="mr-auto font-bold text-yellow-600">{settings.featuredListingFee} ريال</span></label>
            </div>
          </div>
        <div>
          <button type="submit" className="w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-base font-medium text-white bg-[var(--color-primary)] hover:bg-[var(--color-primary-hover)] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[var(--color-primary)]">
            المتابعة للدفع
          </button>
        </div>
      </form>
    </div>
  );
};

export default AddProductPage;