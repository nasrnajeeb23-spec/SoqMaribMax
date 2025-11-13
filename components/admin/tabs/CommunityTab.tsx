import React from 'react';
import { CommunityPost, User } from '../../../types';

interface CommunityTabProps {
    posts: CommunityPost[];
    getUserById: (userId: string) => User | undefined;
    deletePost: (postId: string, showToast: (msg: string, type: any) => void) => void;
    showToast: (msg: string, type: any) => void;
}

const CommunityTab: React.FC<CommunityTabProps> = ({ posts, getUserById, deletePost, showToast }) => {

    const handleDeletePost = (postId: string) => {
        if (window.confirm('هل أنت متأكد من رغبتك في حذف هذا المنشور؟')) {
            deletePost(postId, showToast);
        }
    };
    
    return (
        <div>
            <h2 className="text-xl font-semibold text-[var(--color-text-muted)] mb-4">منشورات المجتمع</h2>
            <div className="overflow-x-auto">
                <table className="min-w-full bg-[var(--color-surface)] border border-[var(--color-border)] responsive-table">
                    <thead className="bg-gray-100 dark:bg-slate-900/50">
                        <tr>
                            <th className="py-3 px-4 text-right font-semibold text-sm text-[var(--color-text-muted)] uppercase">المحتوى</th>
                            <th className="py-3 px-4 text-right font-semibold text-sm text-[var(--color-text-muted)] uppercase">الناشر</th>
                            <th className="py-3 px-4 text-right font-semibold text-sm text-[var(--color-text-muted)] uppercase">إجراءات</th>
                        </tr>
                    </thead>
                    <tbody className="text-[var(--color-text-base)]">
                        {posts.map(post => (
                            <tr key={post.id} className="border-b border-[var(--color-border)] hover:bg-[var(--color-background)]">
                                <td data-label="المحتوى" className="py-3 px-4 max-w-sm truncate">{post.content}</td>
                                <td data-label="الناشر" className="py-3 px-4">{getUserById(post.authorId)?.name || 'N/A'}</td>
                                <td data-label="إجراءات" className="py-3 px-4">
                                    <button onClick={() => handleDeletePost(post.id)} className="bg-red-500 text-white text-sm font-bold py-1 px-3 rounded-md hover:bg-red-600 transition">حذف</button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default CommunityTab;
