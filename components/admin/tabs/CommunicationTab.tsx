import React, { useState } from 'react';
import { User, UserRole } from '../../../types';
import Spinner from '../../common/Spinner';

interface CommunicationTabProps {
    users: User[];
    addBulkNotifications: (message: string, link: string, userIds: string[]) => void;
    showToast: (msg: string, type: any) => void;
}

const CommunicationTab: React.FC<CommunicationTabProps> = ({ users, addBulkNotifications, showToast }) => {
    const [message, setMessage] = useState('');
    const [link, setLink] = useState('/');
    const [target, setTarget] = useState<'ALL' | UserRole>('ALL');
    const [isSending, setIsSending] = useState(false);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!message.trim()) {
            showToast('لا يمكن إرسال رسالة فارغة.', 'error');
            return;
        }

        setIsSending(true);

        const targetUsers = users.filter(u => {
            if (u.role === 'ADMIN') return false; // Exclude admin
            if (target === 'ALL') return true;
            return u.role === target;
        });

        if (targetUsers.length === 0) {
            showToast('لا يوجد مستخدمون مستهدفون في هذه الفئة.', 'info');
            setIsSending(false);
            return;
        }

        const targetUserIds = targetUsers.map(u => u.id);

        setTimeout(() => {
            addBulkNotifications(message, link, targetUserIds);
            setIsSending(false);
            showToast(`تم إرسال الإشعار بنجاح إلى ${targetUsers.length} مستخدم.`, 'success');
            setMessage('');
            setLink('/');
        }, 1000);
    };

    return (
        <div>
            <h2 className="text-xl font-semibold text-[var(--color-text-muted)] mb-4">إرسال إشعارات جماعية</h2>
            <div className="bg-gray-50 dark:bg-slate-900/50 p-6 rounded-lg border border-[var(--color-border)]">
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label htmlFor="notification-message" className="block text-sm font-medium text-[var(--color-text-muted)]">نص الرسالة</label>
                        <textarea
                            id="notification-message"
                            rows={4}
                            value={message}
                            onChange={e => setMessage(e.target.value)}
                            required
                            className="mt-1 block w-full px-3 py-2 border border-[var(--color-border)] rounded-md shadow-sm focus:outline-none focus:ring-[var(--color-primary)] focus:border-[var(--color-primary)] bg-[var(--color-background)]"
                            placeholder="مثال: تخفيضات نهاية الأسبوع تبدأ الآن!"
                        />
                    </div>
                    <div>
                        <label htmlFor="notification-link" className="block text-sm font-medium text-[var(--color-text-muted)]">الرابط (عند الضغط على الإشعار)</label>
                        <input
                            type="text"
                            id="notification-link"
                            value={link}
                            onChange={e => setLink(e.target.value)}
                            required
                            className="mt-1 block w-full px-3 py-2 border border-[var(--color-border)] rounded-md shadow-sm focus:outline-none focus:ring-[var(--color-primary)] focus:border-[var(--color-primary)] bg-[var(--color-background)]"
                            placeholder="مثال: /products/p1"
                        />
                    </div>
                    <div>
                        <label htmlFor="notification-target" className="block text-sm font-medium text-[var(--color-text-muted)]">إرسال إلى</label>
                        <select
                            id="notification-target"
                            value={target}
                            onChange={e => setTarget(e.target.value as 'ALL' | UserRole)}
                            className="mt-1 block w-full px-3 py-2 border border-[var(--color-border)] bg-[var(--color-surface)] rounded-md shadow-sm focus:outline-none focus:ring-[var(--color-primary)] focus:border-[var(--color-primary)]"
                        >
                            <option value="ALL">كل المستخدمين</option>
                            <option value="BUYER">المشترين فقط</option>
                            <option value="SELLER">البائعين فقط</option>
                            <option value="DELIVERY">مندوبي التوصيل فقط</option>
                        </select>
                    </div>
                    <div className="text-right">
                        <button
                            type="submit"
                            disabled={isSending}
                            className="inline-flex items-center justify-center py-2 px-6 border border-transparent text-sm font-medium rounded-md text-white bg-[var(--color-primary)] hover:bg-[var(--color-primary-hover)] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[var(--color-primary)] disabled:bg-sky-400 disabled:cursor-not-allowed"
                        >
                            {isSending ? <Spinner size="sm" className="ml-2" /> : null}
                            {isSending ? 'جاري الإرسال...' : 'إرسال الإشعار'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default CommunicationTab;
