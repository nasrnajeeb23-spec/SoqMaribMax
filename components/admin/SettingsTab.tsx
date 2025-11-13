import React, { useState, useEffect } from 'react';
import { useSettings } from '../../hooks/useSettings';
import { PlatformSettings } from '../../types';
import { useToast } from '../../hooks/useToast';

const SettingsTab: React.FC = () => {
    const { settings, updateSettings } = useSettings();
    const { showToast } = useToast();
    const [formState, setFormState] = useState<PlatformSettings>(settings);
    const [isDirty, setIsDirty] = useState(false);

    useEffect(() => {
        setFormState(settings);
        setIsDirty(false);
    }, [settings]);
    
    useEffect(() => {
        setIsDirty(JSON.stringify(formState) !== JSON.stringify(settings));
    }, [formState, settings]);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, type, checked, value } = e.target;
        setFormState(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));
    };
    
    const handleNumberInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        const numValue = value === '' ? 0 : parseFloat(value);
        if (!isNaN(numValue) && numValue >= 0) {
            setFormState(prev => ({ ...prev, [name]: numValue }));
        }
    };
    
    const handleCommissionChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const percentage = parseFloat(e.target.value);
        if (!isNaN(percentage) && percentage >= 0 && percentage <= 100) {
            setFormState(prev => ({ ...prev, commissionRate: percentage / 100 }));
        } else if (e.target.value === '') {
             setFormState(prev => ({ ...prev, commissionRate: 0 }));
        }
    };

    const handleSocialLinkChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const { name, value } = e.target;
      setFormState(prev => ({
        ...prev,
        socialLinks: {
          ...prev.socialLinks,
          [name]: value,
        },
      }));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        updateSettings(formState, showToast);
    };

    return (
        <div>
            <h2 className="text-xl font-semibold text-gray-700 mb-4">إعدادات المنصة</h2>
            <form onSubmit={handleSubmit} className="bg-gray-50 p-6 rounded-lg border space-y-6 max-w-2xl mx-auto">
                {/* Maintenance Mode */}
                <div className="flex justify-between items-center bg-yellow-100 p-4 rounded-md border border-yellow-300">
                    <div>
                        <h3 className="font-semibold text-yellow-800">وضع الصيانة</h3>
                        <p className="text-sm text-yellow-700">عند تفعيله، سيتم عرض صفحة صيانة لجميع الزوار والمستخدمين ما عدا المسؤولين.</p>
                    </div>
                    <label htmlFor="maintenanceMode" className="flex items-center cursor-pointer">
                        <div className="relative">
                            <input type="checkbox" id="maintenanceMode" name="maintenanceMode" className="sr-only" checked={formState.maintenanceMode} onChange={handleInputChange} />
                            <div className="block bg-gray-300 w-14 h-8 rounded-full"></div>
                            <div className="dot absolute left-1 top-1 bg-white w-6 h-6 rounded-full transition-transform"></div>
                        </div>
                    </label>
                </div>
                
                {/* Financial Settings */}
                 <h3 className="text-lg font-semibold text-gray-700 pt-4 border-t">الإعدادات المالية</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <label htmlFor="commissionRate" className="block text-sm font-medium text-gray-700">نسبة عمولة المنصة (%)</label>
                        <input
                            type="number"
                            id="commissionRate"
                            name="commissionRate"
                            value={formState.commissionRate * 100}
                            onChange={handleCommissionChange}
                            min="0"
                            max="100"
                            step="0.1"
                            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-sky-500 focus:border-sky-500"
                        />
                    </div>
                    <div>
                        <label htmlFor="adCost" className="block text-sm font-medium text-gray-700">تكلفة الإعلان في الواجهة (ريال)</label>
                        <input
                            type="number"
                            id="adCost"
                            name="adCost"
                            value={formState.adCost}
                            onChange={handleNumberInputChange}
                            min="0"
                            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-sky-500 focus:border-sky-500"
                        />
                    </div>
                    <div>
                        <label htmlFor="standardListingFee" className="block text-sm font-medium text-gray-700">رسوم الإدراج القياسي (ريال)</label>
                        <input
                            type="number"
                            id="standardListingFee"
                            name="standardListingFee"
                            value={formState.standardListingFee}
                            onChange={handleNumberInputChange}
                            min="0"
                            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-sky-500 focus:border-sky-500"
                        />
                    </div>
                    <div>
                        <label htmlFor="featuredListingFee" className="block text-sm font-medium text-gray-700">رسوم الإدراج المميز (ريال)</label>
                        <input
                            type="number"
                            id="featuredListingFee"
                            name="featuredListingFee"
                            value={formState.featuredListingFee}
                            onChange={handleNumberInputChange}
                            min="0"
                            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-sky-500 focus:border-sky-500"
                        />
                    </div>
                </div>

                 {/* Social Links */}
                <h3 className="text-lg font-semibold text-gray-700 pt-4 border-t">روابط التواصل الاجتماعي</h3>
                <div className="space-y-4">
                     <div>
                        <label htmlFor="facebook" className="block text-sm font-medium text-gray-700">رابط فيسبوك</label>
                        <input type="url" id="facebook" name="facebook" value={formState.socialLinks?.facebook || ''} onChange={handleSocialLinkChange} className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md" />
                    </div>
                     <div>
                        <label htmlFor="twitter" className="block text-sm font-medium text-gray-700">رابط تويتر</label>
                        <input type="url" id="twitter" name="twitter" value={formState.socialLinks?.twitter || ''} onChange={handleSocialLinkChange} className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md" />
                    </div>
                    <div>
                        <label htmlFor="instagram" className="block text-sm font-medium text-gray-700">رابط انستغرام</label>
                        <input type="url" id="instagram" name="instagram" value={formState.socialLinks?.instagram || ''} onChange={handleSocialLinkChange} className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md" />
                    </div>
                    <div>
                        <label htmlFor="whatsapp" className="block text-sm font-medium text-gray-700">رقم واتساب (مع رمز الدولة)</label>
                        <input type="tel" id="whatsapp" name="whatsapp" value={formState.socialLinks?.whatsapp || ''} onChange={handleSocialLinkChange} className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md" placeholder="967..." />
                    </div>
                </div>


                {/* Save Button */}
                <div className="text-left pt-4">
                    <button
                        type="submit"
                        disabled={!isDirty}
                        className="inline-flex items-center justify-center py-2 px-6 border border-transparent text-sm font-medium rounded-md text-white bg-sky-600 hover:bg-sky-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-sky-500 disabled:bg-gray-400 disabled:cursor-not-allowed"
                    >
                        حفظ التغييرات
                    </button>
                </div>
            </form>
            <style>{`
                input[type="checkbox"]:checked + .block + .dot {
                    transform: translateX(100%);
                }
                 input[type="checkbox"]:checked + .block {
                    background-color: #bae6fd;
                }
            `}</style>
        </div>
    );
};

export default SettingsTab;