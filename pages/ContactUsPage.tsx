import React from 'react';
import { motion } from 'framer-motion';
import { useContent } from '../hooks/useContent';
import { useForm } from '../hooks/useForm';
import { required, isEmail, minLength } from '../utils/validation';
import { useToast } from '../hooks/useToast';

const ContactUsPage: React.FC = () => {
    const { getPageContent } = useContent();
    const content = getPageContent('contact');
    const { showToast } = useToast();

    const { values, errors, touched, formIsValid, handleChange, handleBlur, handleSubmit } = useForm({
        initialValues: {
            name: '',
            email: '',
            message: '',
        },
        validationRules: {
            name: [required()],
            email: [required(), isEmail()],
            message: [required(), minLength(10, 'الرسالة قصيرة جداً.')],
        },
        onSubmit: (formValues, { resetForm }) => {
            console.log("Form Submitted", formValues); // Mock submission
            showToast('شكراً لتواصلك معنا! سيتم الرد عليك في أقرب وقت.', 'success');
            resetForm();
        }
    });

    if (!content) {
        return <div>جار تحميل المحتوى...</div>;
    }

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="bg-[var(--color-surface)] p-8 rounded-lg shadow-lg max-w-4xl mx-auto"
        >
            <h1 className="text-4xl font-bold text-[var(--color-text-base)] text-center mb-4">{content.title}</h1>
            <div className="mb-8" dangerouslySetInnerHTML={{ __html: content.body }} />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                {/* Contact Form */}
                <div className="space-y-6">
                    <h2 className="text-2xl font-semibold text-[var(--color-text-muted)]">أرسل لنا رسالة</h2>
                    <form onSubmit={handleSubmit} className="space-y-4" noValidate>
                        <div>
                            <label htmlFor="name" className="block text-sm font-medium text-[var(--color-text-muted)]">الاسم الكامل</label>
                            <input type="text" id="name" name="name" value={values.name} onChange={handleChange} onBlur={handleBlur} required className={`mt-1 block w-full px-3 py-2 bg-[var(--color-background)] border rounded-md shadow-sm focus:outline-none focus:ring-[var(--color-primary)] focus:border-[var(--color-primary)] ${touched.name && errors.name ? 'border-red-500' : 'border-[var(--color-border)]'}`} />
                            {touched.name && errors.name && <p className="mt-1 text-sm text-red-600">{errors.name}</p>}
                        </div>
                        <div>
                            <label htmlFor="email" className="block text-sm font-medium text-[var(--color-text-muted)]">البريد الإلكتروني</label>
                            <input type="email" id="email" name="email" value={values.email} onChange={handleChange} onBlur={handleBlur} required className={`mt-1 block w-full px-3 py-2 bg-[var(--color-background)] border rounded-md shadow-sm focus:outline-none focus:ring-[var(--color-primary)] focus:border-[var(--color-primary)] ${touched.email && errors.email ? 'border-red-500' : 'border-[var(--color-border)]'}`} />
                            {touched.email && errors.email && <p className="mt-1 text-sm text-red-600">{errors.email}</p>}
                        </div>
                        <div>
                            <label htmlFor="message" className="block text-sm font-medium text-[var(--color-text-muted)]">رسالتك</label>
                            <textarea id="message" name="message" value={values.message} onChange={handleChange} onBlur={handleBlur} required rows={5} className={`mt-1 block w-full px-3 py-2 bg-[var(--color-background)] border rounded-md shadow-sm focus:outline-none focus:ring-[var(--color-primary)] focus:border-[var(--color-primary)] ${touched.message && errors.message ? 'border-red-500' : 'border-[var(--color-border)]'}`}></textarea>
                            {touched.message && errors.message && <p className="mt-1 text-sm text-red-600">{errors.message}</p>}
                        </div>
                        <button type="submit" className="w-full bg-[var(--color-primary)] text-white font-bold py-3 px-4 rounded-md hover:bg-[var(--color-primary-hover)] transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed">
                            إرسال الرسالة
                        </button>
                    </form>
                </div>

                {/* Contact Info */}
                <div className="space-y-6">
                    <h2 className="text-2xl font-semibold text-[var(--color-text-muted)]">معلومات التواصل</h2>
                    <div className="space-y-4">
                        <div className="flex items-start gap-4">
                            <div className="mt-1 flex-shrink-0 h-6 w-6 text-[var(--color-primary)]"><svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg></div>
                            <div>
                                <h3 className="font-semibold text-[var(--color-text-base)]">البريد الإلكتروني</h3>
                                <p className="text-[var(--color-text-muted)]">للاستفسارات العامة والدعم الفني:</p>
                                <a href="mailto:support@souqmarib.demo" className="text-[var(--color-primary)] hover:underline">support@souqmarib.demo</a>
                            </div>
                        </div>
                        <div className="flex items-start gap-4">
                             <div className="mt-1 flex-shrink-0 h-6 w-6 text-[var(--color-primary)]"><svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" /></svg></div>
                            <div>
                                <h3 className="font-semibold text-[var(--color-text-base)]">الهاتف</h3>
                                <p className="text-[var(--color-text-muted)]">متواجدون من السبت إلى الخميس، 9 صباحاً - 5 مساءً:</p>
                                <p className="text-[var(--color-text-base)]" dir="ltr">+967 777 XXX XXX</p>
                            </div>
                        </div>
                        <div className="flex items-start gap-4">
                             <div className="mt-1 flex-shrink-0 h-6 w-6 text-[var(--color-primary)]"><svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg></div>
                            <div>
                                <h3 className="font-semibold text-[var(--color-text-base)]">العنوان</h3>
                                <p className="text-[var(--color-text-muted)]">مبنى السوق الرقمي، الشارع العام،</p>
                                <p className="text-[var(--color-text-base)]">مأرب، اليمن</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </motion.div>
    );
};

export default ContactUsPage;
