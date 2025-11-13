import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { useToast } from '../../hooks/useToast';
import ImageUploader from '../../components/common/ImageUploader';

const SellerVerificationPage: React.FC = () => {
  const { user, requestVerification } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();
  
  const [commercialRegisterUrl, setCommercialRegisterUrl] = useState('');
  const [guaranteeUrl, setGuaranteeUrl] = useState('');
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    if (!commercialRegisterUrl || !guaranteeUrl) {
      showToast('يرجى رفع صور المستندات المطلوبة.', 'error');
      return;
    }

    requestVerification(user.id, commercialRegisterUrl, guaranteeUrl);
    showToast('تم إرسال طلب التوثيق بنجاح للمراجعة.', 'success');
    navigate('/seller-dashboard');
  };

  return (
    <div className="max-w-2xl mx-auto bg-white p-8 rounded-lg shadow-lg">
      <h1 className="text-3xl font-bold text-gray-800 mb-2 text-center">توثيق حساب البائع</h1>
      <p className="text-center text-gray-500 mb-6">
        لزيادة ثقة المشترين، يرجى رفع صور واضحة لمستنداتك.
      </p>
      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <ImageUploader 
            label="صورة السجل التجاري"
            onImageUpload={setCommercialRegisterUrl}
            initialImageUrl={commercialRegisterUrl}
          />
        </div>
        <div>
          <ImageUploader 
            label="صورة الضمانة"
            onImageUpload={setGuaranteeUrl}
            initialImageUrl={guaranteeUrl}
          />
        </div>
        <div>
          <button type="submit" className="w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-base font-medium text-white bg-sky-600 hover:bg-sky-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-sky-500">
            إرسال الطلب للمراجعة
          </button>
        </div>
      </form>
    </div>
  );
};

export default SellerVerificationPage;