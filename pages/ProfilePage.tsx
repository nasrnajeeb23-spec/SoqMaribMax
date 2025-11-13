import React, { useState, useEffect } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { UserRole } from '../types';
import { useToast } from '../hooks/useToast';
import LocationPicker from '../components/common/LocationPicker';

const ProfilePage: React.FC = () => {
  const { user, updateUser } = useAuth();
  const { showToast } = useToast();
  
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: user?.name || '',
    city: user?.city || '',
    phone: user?.phone || '',
    location: user?.location || null,
    contactInfo: user?.contactInfo || { whatsapp: '', facebook: '', instagram: '' },
  });

  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name,
        city: user.city,
        phone: user.phone || '',
        location: user.location || null,
        contactInfo: user.contactInfo || { whatsapp: '', facebook: '', instagram: '' },
      });
    }
  }, [user]);

  if (!user) {
    return <Navigate to="/login" />;
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };
  
  const handleContactInfoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
        ...prev,
        contactInfo: {
            ...prev.contactInfo,
            [name]: value,
        }
    }));
  };
  
  const handleLocationSelect = (loc: { lat: number; lng: number; name: string }) => {
    setFormData(prev => ({
        ...prev,
        location: { lat: loc.lat, lng: loc.lng },
        city: loc.name.split(',')[0].trim()
    }));
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (user) {
      updateUser(user.id, {
        name: formData.name,
        city: formData.city,
        phone: formData.phone,
        location: formData.location || undefined,
        contactInfo: formData.contactInfo,
      });
      showToast('تم تحديث الملف الشخصي بنجاح!', 'success');
      setIsEditing(false);
    }
  };

  const handleCancel = () => {
    if (user) {
      setFormData({
        name: user.name,
        city: user.city,
        phone: user.phone || '',
        location: user.location || null,
        contactInfo: user.contactInfo || { whatsapp: '', facebook: '', instagram: '' },
      });
    }
    setIsEditing(false);
  };

  const roleTranslations: { [key in UserRole]: string } = {
    ADMIN: 'مسؤول',
    SELLER: 'بائع',
    BUYER: 'مشتري',
    DELIVERY: 'مندوب توصيل',
    PROVIDER: 'مقدم خدمة',
  };
  
  const roleColors: { [key in UserRole]: string } = {
    ADMIN: 'bg-red-200 text-red-800',
    SELLER: 'bg-blue-200 text-blue-800',
    BUYER: 'bg-green-200 text-green-800',
    DELIVERY: 'bg-purple-200 text-purple-800',
    PROVIDER: 'bg-teal-200 text-teal-800',
  };

  return (
    <div className="max-w-2xl mx-auto bg-[var(--color-surface)] p-8 rounded-lg shadow-lg">
      <div className="flex justify-between items-start">
        <h1 className="text-3xl font-bold text-[var(--color-text-base)]">الملف الشخصي</h1>
        {!isEditing && (
           <button onClick={() => setIsEditing(true)} className="bg-sky-100 text-sky-700 font-bold py-2 px-4 rounded-md hover:bg-sky-200 transition-colors text-sm">
              تعديل الملف الشخصي
           </button>
        )}
      </div>

      <div className="flex flex-col items-center text-center mt-6">
         <div className="w-24 h-24 bg-[var(--color-primary)] rounded-full flex items-center justify-center text-white font-bold text-4xl mb-4">
            {user.name.charAt(0)}
        </div>
        {!isEditing ? (
          <h2 className="text-2xl font-bold text-[var(--color-text-base)]">{user.name}</h2>
        ) : (
          <input 
            type="text"
            name="name"
            value={formData.name}
            onChange={handleInputChange}
            className="text-2xl font-bold text-center border-b-2 border-gray-300 focus:border-sky-500 outline-none p-1 bg-transparent"
          />
        )}
        <span className={`mt-2 px-3 py-1 text-sm font-semibold rounded-full ${roleColors[user.role]}`}>
            {roleTranslations[user.role]}
        </span>
      </div>
      
      <form onSubmit={handleSave} className="mt-8">
        <div className="border-t border-[var(--color-border)] pt-6">
          <h2 className="text-xl font-semibold text-[var(--color-text-muted)] mb-4">المعلومات الشخصية</h2>
          <div className="space-y-4">
            <div className="flex items-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400 ml-3 flex-shrink-0" viewBox="0 0 20 20" fill="currentColor">
                  <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z" />
                  <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z" />
              </svg>
              <span className="text-[var(--color-text-muted)]">{user.email} <span className="text-xs">(لا يمكن تعديله)</span></span>
            </div>
            <div className="flex items-start">
               <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400 ml-3 flex-shrink-0 mt-1" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
               </svg>
               {!isEditing ? (
                  <span className="text-[var(--color-text-base)]">{formData.city}</span>
               ) : (
                  <div className="w-full">
                    <LocationPicker 
                      onLocationSelect={handleLocationSelect} 
                      initialPosition={formData.location || undefined}
                    />
                  </div>
               )}
            </div>
            <div className="flex items-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400 ml-3 flex-shrink-0" viewBox="0 0 20 20" fill="currentColor">
                  <path d="M2 3a1 1 0 011-1h2.153a1 1 0 01.986.836l.74 4.435a1 1 0 01-.54 1.06l-1.548.773a11.037 11.037 0 006.105 6.105l.774-1.548a1 1 0 011.059-.54l4.435.74a1 1 0 01.836.986V17a1 1 0 01-1 1h-2C7.82 18 2 12.18 2 5V3z" />
              </svg>
              {!isEditing ? (
                  <span className="text-[var(--color-text-base)]" dir="ltr">{formData.phone || 'لم يتم إضافة رقم هاتف'}</span>
              ) : (
                   <input
                      type="tel"
                      name="phone"
                      value={formData.phone}
                      onChange={handleInputChange}
                      className="text-[var(--color-text-base)] border-b-2 border-gray-300 focus:border-sky-500 outline-none p-1 w-full bg-transparent"
                      dir="ltr"
                  />
              )}
            </div>
          </div>
        </div>
        
        { (user.role === 'SELLER' || user.role === 'PROVIDER') && (
        <div className="mt-8 border-t border-[var(--color-border)] pt-6">
          <h2 className="text-xl font-semibold text-[var(--color-text-muted)] mb-4">معلومات التواصل (اختياري)</h2>
           <div className="space-y-4">
               {!isEditing ? (
                <>
                    {Object.entries(user.contactInfo || {}).map(([key, value]) => value && (
                        <div key={key} className="flex items-center">
                            <span className="text-gray-500 ml-3 capitalize w-20">{key}:</span>
                            <a href={key === 'whatsapp' ? `https://wa.me/${value}`: value} target="_blank" rel="noopener noreferrer" className="text-sky-600 hover:underline break-all">{value}</a>
                        </div>
                    ))}
                    {!Object.values(user.contactInfo || {}).some(v => v) && <p className="text-gray-500">لم يتم إضافة معلومات تواصل.</p>}
                </>
               ) : (
                <>
                    <div>
                        <label className="block text-sm font-medium text-gray-700">واتساب (مع رمز الدولة)</label>
                        <input type="text" name="whatsapp" value={formData.contactInfo.whatsapp || ''} onChange={handleContactInfoChange} className="mt-1 block w-full p-2 border border-gray-300 rounded-md" placeholder="967777XXXXXX" />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700">رابط فيسبوك</label>
                        <input type="url" name="facebook" value={formData.contactInfo.facebook || ''} onChange={handleContactInfoChange} className="mt-1 block w-full p-2 border border-gray-300 rounded-md" placeholder="https://facebook.com/username" />
                    </div>
                     <div>
                        <label className="block text-sm font-medium text-gray-700">رابط انستغرام</label>
                        <input type="url" name="instagram" value={formData.contactInfo.instagram || ''} onChange={handleContactInfoChange} className="mt-1 block w-full p-2 border border-gray-300 rounded-md" placeholder="https://instagram.com/username" />
                    </div>
                </>
               )}
           </div>
        </div>
        )}

        {isEditing && (
            <div className="mt-8 flex justify-end gap-4">
                <button type="button" onClick={handleCancel} className="bg-gray-200 text-gray-800 font-bold py-2 px-4 rounded-md hover:bg-gray-300 transition-colors">
                    إلغاء
                </button>
                 <button type="submit" className="bg-[var(--color-primary)] text-white font-bold py-2 px-4 rounded-md hover:bg-[var(--color-primary-hover)] transition-colors">
                    حفظ التغييرات
                </button>
            </div>
        )}
      </form>
    </div>
  );
};

export default ProfilePage;