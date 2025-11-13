import React, { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { useDeliveries } from '../../hooks/useDeliveries';
import { useProducts } from '../../hooks/useProducts';
import { DeliveryStatus } from '../../types';
import DeliveryMap from '../../components/delivery/DeliveryMap';
import QrScanner from '../../components/delivery/QrScanner';
import { useToast } from '../../hooks/useToast';

declare const L: any; // Leaflet is global

const VerificationStatusCard = () => {
    const { user } = useAuth();
    if (!user || user.role !== 'DELIVERY') return null;

    switch (user.verificationStatus) {
        case 'VERIFIED': return <div className="bg-green-500/10 border-l-4 border-green-500 text-green-700 dark:text-green-300 p-4 rounded-lg flex items-center gap-4"><svg className="w-8 h-8 text-green-500 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"></path></svg><div><h3 className="font-bold">حسابك موثوق</h3><p className="text-sm">أنت الآن مندوب توصيل معتمد في المنصة.</p></div></div>;
        case 'PENDING_VERIFICATION': return <div className="bg-yellow-500/10 border-l-4 border-yellow-500 text-yellow-700 dark:text-yellow-300 p-4 rounded-lg"><h3 className="font-bold">طلب التوثيق قيد المراجعة...</h3></div>;
        default: return <div className="bg-blue-500/10 border-l-4 border-blue-500 p-4 rounded-lg"><h3 className="font-bold">وثّق حسابك لتبدأ العمل!</h3><Link to="/delivery-dashboard/verification" className="text-blue-600 hover:underline">قدم طلب الآن</Link></div>;
    }
};

type Tab = 'available' | 'current';

const DeliveryDashboardPage: React.FC = () => {
  const { user, users } = useAuth();
  const { deliveries, acceptDeliveryJob, confirmPickup, confirmDropoff, trackingWatchId } = useDeliveries();
  const { products } = useProducts();
  const { showToast } = useToast();
  const [activeTab, setActiveTab] = useState<Tab>('available');
  const [scanningDeliveryId, setScanningDeliveryId] = useState<string | null>(null);
  const [enteringCodeDeliveryId, setEnteringCodeDeliveryId] = useState<string | null>(null);
  const [dropoffCode, setDropoffCode] = useState('');

  const { availableJobs, myJobs } = useMemo(() => ({
    availableJobs: deliveries.filter(d => d.status === 'READY_FOR_PICKUP' && !d.deliveryPersonId),
    myJobs: deliveries.filter(d => d.deliveryPersonId === user?.id && ['READY_FOR_PICKUP', 'IN_TRANSIT'].includes(d.status))
  }), [deliveries, user]);

  const getProductById = (id: string) => products.find(p => p.id === id);
  const getUserById = (id: string) => users.find(u => u.id === id);

  const handleScan = (code: string) => {
    if (scanningDeliveryId && confirmPickup(scanningDeliveryId, code)) {
      showToast('تم تأكيد الاستلام بنجاح! بدأ تتبع الموقع.', 'success');
      setScanningDeliveryId(null);
    } else {
      showToast('رمز الاستلام غير صحيح.', 'error');
    }
  };

  const handleCodeSubmit = (e: React.FormEvent) => {
      e.preventDefault();
      if (enteringCodeDeliveryId && confirmDropoff(enteringCodeDeliveryId, dropoffCode)) {
          showToast('تم تأكيد التسليم بنجاح! توقف تتبع الموقع.', 'success');
          setEnteringCodeDeliveryId(null);
          setDropoffCode('');
      } else {
          showToast('رمز التسليم غير صحيح.', 'error');
      }
  };

  return (
    <div className="space-y-8">
      <h1 className="text-3xl font-bold text-[var(--color-text-base)]">لوحة تحكم التوصيل</h1>
      <VerificationStatusCard />
      <div className="bg-[var(--color-surface)] p-4 sm:p-6 rounded-xl shadow-lg border border-transparent dark:border-[var(--color-border)]">
        <div className="border-b border-[var(--color-border)]">
          <nav className="-mb-px flex space-x-6 space-x-reverse" aria-label="Tabs">
            <button onClick={() => setActiveTab('available')} className={`${activeTab === 'available' ? 'border-sky-500 text-sky-600' : 'border-transparent text-gray-500'} whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}>وظائف متاحة ({availableJobs.length})</button>
            <button onClick={() => setActiveTab('current')} className={`${activeTab === 'current' ? 'border-sky-500 text-sky-600' : 'border-transparent text-gray-500'} whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}>وظائفي الحالية ({myJobs.length})</button>
          </nav>
        </div>
        <div className="mt-6">
          {activeTab === 'available' && (
            <div>
              <h3 className="text-lg font-semibold mb-4">طلبات جاهزة للاستلام</h3>
              <div className="h-96 w-full rounded-lg shadow-md border mb-6" id="map">
                  <DeliveryMap location={undefined} />
              </div>
              <div className="space-y-4">
                {availableJobs.map(job => {
                  const product = getProductById(job.productId);
                  const seller = getUserById(job.sellerId);
                  return(
                  <div key={job.id} className="bg-gray-50 p-3 rounded-md flex justify-between items-center">
                    <div>
                      <p className="font-semibold">{product?.name}</p>
                      <p className="text-sm text-gray-500">من: {seller?.name} ({seller?.city})</p>
                    </div>
                    <button onClick={() => acceptDeliveryJob(job.id)} className="bg-green-500 text-white font-bold py-2 px-4 rounded-md hover:bg-green-600">قبول</button>
                  </div>
                )})}
                {availableJobs.length === 0 && <p className="text-center text-gray-500">لا توجد وظائف متاحة حالياً.</p>}
              </div>
            </div>
          )}
          {activeTab === 'current' && (
            <div className="space-y-4">
              {myJobs.map(job => {
                const product = getProductById(job.productId);
                const buyer = getUserById(job.buyerId);
                const seller = getUserById(job.sellerId);
                return (
                <div key={job.id} className="bg-gray-50 p-4 rounded-lg border">
                  <p className="font-bold">{product?.name}</p>
                  <div className="text-sm text-gray-600 mt-2 space-y-1">
                    <p><strong>من:</strong> {seller?.name} ({seller?.city})</p>
                    <p><strong>إلى:</strong> {buyer?.name} ({buyer?.city})</p>
                  </div>
                  {job.status === 'IN_TRANSIT' && trackingWatchId !== null && (
                      <div className="mt-3 flex items-center gap-2 bg-blue-100 text-blue-800 text-sm font-semibold px-3 py-2 rounded-md">
                          <div className="relative flex h-3 w-3">
                              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
                              <span className="relative inline-flex rounded-full h-3 w-3 bg-blue-500"></span>
                          </div>
                          <span>تتبع الموقع نشط</span>
                      </div>
                  )}
                  <div className="mt-4 pt-4 border-t flex flex-wrap gap-2">
                    {job.status === 'READY_FOR_PICKUP' && <button onClick={() => setScanningDeliveryId(job.id)} className="bg-sky-600 text-white font-bold py-2 px-4 rounded-md hover:bg-sky-700">مسح QR للاستلام</button>}
                    {job.status === 'IN_TRANSIT' && (
                      <button onClick={() => setEnteringCodeDeliveryId(job.id)} className="bg-green-600 text-white font-bold py-2 px-4 rounded-md hover:bg-green-700">تأكيد التسليم</button>
                    )}
                  </div>
                </div>
              )})}
              {myJobs.length === 0 && <p className="text-center text-gray-500">ليس لديك أي وظائف قيد التنفيذ.</p>}
            </div>
          )}
        </div>
      </div>
      {scanningDeliveryId && <QrScanner onClose={() => setScanningDeliveryId(null)} onScan={handleScan} />}
      {enteringCodeDeliveryId && (
         <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
            <div className="bg-[var(--color-surface)] rounded-lg shadow-xl p-6 w-full max-w-sm text-center">
                <h2 className="text-xl font-bold mb-4">تأكيد التسليم</h2>
                <p className="text-sm text-[var(--color-text-muted)] mb-4">اطلب رمز التسليم من المشتري وأدخله هنا.</p>
                <form onSubmit={handleCodeSubmit}>
                    <input 
                        type="text"
                        value={dropoffCode}
                        onChange={(e) => setDropoffCode(e.target.value)}
                        placeholder="XXXX"
                        maxLength={4}
                        className="w-full p-3 border-2 border-[var(--color-border)] rounded-md text-center font-mono text-2xl tracking-widest"
                        required
                    />
                    <div className="flex justify-center gap-4 mt-6">
                        <button type="button" onClick={() => setEnteringCodeDeliveryId(null)} className="bg-gray-200 text-gray-800 font-bold py-2 px-6 rounded-md hover:bg-gray-300">إغلاق</button>
                        <button type="submit" className="bg-green-500 text-white font-bold py-2 px-6 rounded-md hover:bg-green-600">تأكيد</button>
                    </div>
                </form>
            </div>
        </div>
      )}
    </div>
  );
};

export default DeliveryDashboardPage;