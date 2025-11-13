import React from 'react';
import { Link } from 'react-router-dom';
import { User, UserRole, VerificationStatus } from '../../../types';

interface UsersTabProps {
    users: User[];
    adminUser: User | null;
    approveVerification: (userId: string) => void;
    revokeVerification: (userId: string) => void;
    suspendUser: (userId: string) => void;
    unsuspendUser: (userId: string) => void;
    handleDeleteUser: (userId: string) => void;
    roleTranslations: { [key in UserRole]: string };
    roleColors: { [key in UserRole]: string };
    verificationStatusTranslations: { [key in VerificationStatus]: string };
    verificationStatusColors: { [key in VerificationStatus]: string };
}

const UsersTab: React.FC<UsersTabProps> = ({
    users,
    adminUser,
    approveVerification,
    revokeVerification,
    suspendUser,
    unsuspendUser,
    handleDeleteUser,
    roleTranslations,
    roleColors,
    verificationStatusTranslations,
    verificationStatusColors
}) => {
    return (
        <div>
            <h2 className="text-xl font-semibold text-[var(--color-text-muted)] mb-4">قائمة المستخدمين</h2>
            <div className="overflow-x-auto">
                <table className="min-w-full bg-[var(--color-surface)] border border-[var(--color-border)] responsive-table">
                    <thead className="bg-gray-100 dark:bg-slate-900/50">
                        <tr>
                            <th className="py-3 px-4 text-right font-semibold text-sm text-[var(--color-text-muted)] uppercase">الاسم</th>
                            <th className="py-3 px-4 text-right font-semibold text-sm text-[var(--color-text-muted)] uppercase">الدور</th>
                            <th className="py-3 px-4 text-center font-semibold text-sm text-[var(--color-text-muted)] uppercase">حالة التوثيق</th>
                            <th className="py-3 px-4 text-right font-semibold text-sm text-[var(--color-text-muted)] uppercase">الحساب</th>
                            <th className="py-3 px-4 text-right font-semibold text-sm text-[var(--color-text-muted)] uppercase">إجراءات</th>
                        </tr>
                    </thead>
                    <tbody className="text-[var(--color-text-base)]">
                        {users.map(user => (
                            <tr key={user.id} className={`border-b border-[var(--color-border)] hover:bg-[var(--color-background)] ${user.isSuspended ? 'bg-red-500/10' : ''}`}>
                                <td data-label="الاسم" className="py-3 px-4">
                                    <Link to={`/sellers/${user.id}`} className="hover:underline text-[var(--color-primary)]">{user.name}</Link>
                                    <p className="text-xs text-[var(--color-text-muted)]">{user.email}</p>
                                </td>
                                <td data-label="الدور" className="py-3 px-4">
                                    <span className={`px-2 py-1 text-xs font-semibold rounded-full ${roleColors[user.role]}`}>
                                        {roleTranslations[user.role]}
                                    </span>
                                </td>
                                <td data-label="التوثيق" className="py-3 px-4 text-center">
                                    <span className={`px-2 py-1 text-xs font-semibold rounded-full ${verificationStatusColors[user.verificationStatus]}`}>
                                        {verificationStatusTranslations[user.verificationStatus]}
                                    </span>
                                    {user.verificationStatus === 'PENDING_VERIFICATION' && (
                                        <div className="flex items-center justify-center space-x-2 space-x-reverse mt-1">
                                            <a href={user.commercialRegisterUrl} target="_blank" rel="noopener noreferrer" className="text-[var(--color-primary)] hover:underline text-xs">السجل</a>
                                            <a href={user.guaranteeUrl} target="_blank" rel="noopener noreferrer" className="text-[var(--color-primary)] hover:underline text-xs">الضمانة</a>
                                        </div>
                                    )}
                                </td>
                                <td data-label="الحساب" className="py-3 px-4">
                                    {user.isSuspended && <span className="px-2 py-1 text-xs font-semibold rounded-full bg-red-200 text-red-800">معلّق</span>}
                                </td>
                                <td data-label="إجراءات" className="py-3 px-4">
                                    <div className="flex items-center space-x-2 space-x-reverse flex-wrap gap-1">
                                        {user.verificationStatus === 'PENDING_VERIFICATION' && (<button onClick={() => approveVerification(user.id)} className="bg-green-500 text-white text-xs font-bold py-1 px-2 rounded-md hover:bg-green-600">اعتماد</button>)}
                                        {user.verificationStatus === 'VERIFIED' && (<button onClick={() => revokeVerification(user.id)} className="bg-yellow-500 text-white text-xs font-bold py-1 px-2 rounded-md hover:bg-yellow-600">إلغاء</button>)}
                                        {user.isSuspended ? (
                                            <button onClick={() => unsuspendUser(user.id)} className="bg-blue-500 text-white text-xs font-bold py-1 px-2 rounded-md hover:bg-blue-600">إلغاء التعليق</button>
                                        ) : (
                                            <button onClick={() => suspendUser(user.id)} disabled={adminUser?.id === user.id} className="bg-yellow-600 text-white text-xs font-bold py-1 px-2 rounded-md hover:bg-yellow-700 disabled:bg-gray-400">تعليق</button>
                                        )}
                                        <button onClick={() => handleDeleteUser(user.id)} disabled={adminUser?.id === user.id} className="bg-red-500 text-white text-xs font-bold py-1 px-2 rounded-md hover:bg-red-600 disabled:bg-gray-400">حذف</button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default UsersTab;
