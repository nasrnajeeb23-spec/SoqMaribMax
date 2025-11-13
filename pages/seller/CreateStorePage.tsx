import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useToast } from '../../hooks/useToast';
import { useForm } from '../../hooks/useForm';
import { required, minLength } from '../../utils/validation';
import ImageUploader from '../../components/common/ImageUploader';
import { useStoreStore } from '../../store/storeStore';

const CreateStorePage: React.FC = () => {
    const { createStore } = useStoreStore();
    const { showToast } = useToast();
    const navigate = useNavigate();

    const { values, errors, touched, handleChange, handleBlur, handleSubmit } = useForm({
        initialValues: {
            name: '',
            description: '',
            logoUrl: '',
            bannerUrl: '',
            categories: '',
        },
        validationRules: {
            name: [required(), minLength(3, 'اسم المتجر قصير جداً.')],
            description: [required(), minLength(10, 'الوصف قصير جداً.')],
            logoUrl: [required('يرجى رفع شعار للمتجر.')],
            bannerUrl: [required('يرجى رفع صورة غلاف للمتجر.')],
        },
        onSubmit: async (formValues) => {
            const storeCategories = formValues.categories.split(',').map(c => c.trim()).filter(Boolean);
            const newStore = await createStore({
                name: formValues.name,
                description: formValues.description,
                logoUrl: formValues.logoUrl,
                bannerUrl: formValues.bannerUrl,
                categories: storeCategories,
            });

            if (newStore) {
                showToast('تم إنشاء متجرك بنجاح!', 'success');
                navigate('/seller-dashboard');
            } else {
                showToast('فشل إنشاء المتجر. يرجى المحاولة مرة أخرى.', 'error');
            }
        }
    });

    return (
        <div className="max-w-2xl mx-auto bg-[var(--color-surface)] p-8 rounded-lg shadow-lg">
            <h1 className="text-3xl font-bold text-[var(--color-text-base)] mb-2 text-center">إنشاء متجرك</h1>
            <p className="text-center text-[var(--color-text-muted)] mb-6">
                هذه هي واجهتك التجارية على المنصة. اجعلها مميزة!
            </p>
            <form onSubmit={handleSubmit} className="space-y-6" noValidate>
                <div>
                    <label htmlFor="name" className="block text-sm font-medium text-[var(--color-text-muted)]">اسم المتجر / العلامة التجارية</label>
                    <input type="text" id="name" name="name" value={values.name} onChange={handleChange} onBlur={handleBlur} required className={`mt-1 block w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-[var(--color-primary)] focus:border-[var(--color-primary)] bg-[var(--color-background)] ${touched.name && errors.name ? 'border-red-500' : 'border-[var(--color-border)]'}`} />
                    {touched.name && errors.name && <p className="mt-2 text-sm text-red-600">{errors.name}</p>}
                </div>

                <div>
                    <label htmlFor="description" className="block text-sm font-medium text-[var(--color-text-muted)]">وصف المتجر</label>
                    <textarea id="description" name="description" value={values.description} onChange={handleChange} onBlur={handleBlur} required rows={3} className={`mt-1 block w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-[var(--color-primary)] focus:border-[var(--color-primary)] bg-[var(--color-background)] ${touched.description && errors.description ? 'border-red-500' : 'border-[var(--color-border)]'}`}></textarea>
                    {touched.description && errors.description && <p className="mt-2 text-sm text-red-600">{errors.description}</p>}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <ImageUploader 
                            label="شعار المتجر (Logo)"
                            onImageUpload={(url) => handleChange({ target: { name: 'logoUrl', value: url } } as any)}
                            initialImageUrl={values.logoUrl}
                        />
                        {touched.logoUrl && errors.logoUrl && <p className="mt-2 text-sm text-red-600">{errors.logoUrl}</p>}
                    </div>
                     <div>
                        <ImageUploader 
                            label="صورة الغلاف (Banner)"
                            onImageUpload={(url) => handleChange({ target: { name: 'bannerUrl', value: url } } as any)}
                            initialImageUrl={values.bannerUrl}
                        />
                        {touched.bannerUrl && errors.bannerUrl && <p className="mt-2 text-sm text-red-600">{errors.bannerUrl}</p>}
                    </div>
                </div>
                 <div>
                    <label htmlFor="categories" className="block text-sm font-medium text-[var(--color-text-muted)]">أقسام المتجر (اختياري)</label>
                    <input type="text" id="categories" name="categories" value={values.categories} onChange={handleChange} onBlur={handleBlur} placeholder="مثال: ملابس, إلكترونيات, أثاث" className="mt-1 block w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-[var(--color-primary)] focus:border-[var(--color-primary)] bg-[var(--color-background)]" />
                     <p className="text-xs text-gray-500 mt-1">افصل بين كل قسم بفاصلة (,)</p>
                </div>
                <div>
                    <button type="submit" className="w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-base font-medium text-white bg-[var(--color-primary)] hover:bg-[var(--color-primary-hover)] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[var(--color-primary)]">
                        إنشاء المتجر
                    </button>
                </div>
            </form>
        </div>
    );
};

export default CreateStorePage;
