import React, { useState, useMemo } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useCommunity } from '../hooks/useCommunity';
import { useAuth } from '../hooks/useAuth';
import PostCard from '../components/community/PostCard';

const PostDetailPage: React.FC = () => {
    const { postId } = useParams<{ postId: string }>();
    const { user, users } = useAuth();
    const { getPostById, getCommentsForPost, addComment } = useCommunity();
    const [newComment, setNewComment] = useState('');

    const post = useMemo(() => postId ? getPostById(postId) : undefined, [postId, getPostById]);
    const comments = useMemo(() => postId ? getCommentsForPost(postId) : [], [postId, getCommentsForPost]);

    const handleCommentSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (post && newComment.trim()) {
            addComment(post.id, newComment);
            setNewComment('');
        }
    };

    if (!post) {
        return (
            <div className="text-center py-20 bg-white p-8 rounded-lg shadow-lg">
                <h2 className="text-2xl font-bold">عذراً، هذا المنشور غير موجود!</h2>
                <Link to="/community" className="text-white bg-sky-600 hover:bg-sky-700 font-bold py-2 px-6 rounded-md mt-6 inline-block">
                    العودة للمجتمع
                </Link>
            </div>
        );
    }
    
    return (
        <div className="max-w-3xl mx-auto space-y-6">
            {/* Main Post */}
            <PostCard post={post} isDetailPage />

            {/* Add Comment Form */}
            <div className="bg-white p-4 rounded-lg shadow-md">
                 <h3 className="font-bold mb-3 text-lg">أضف تعليقك</h3>
                 <form onSubmit={handleCommentSubmit} className="flex items-start gap-3">
                     <div className="w-10 h-10 bg-gray-300 rounded-full flex items-center justify-center font-bold text-white flex-shrink-0">{user?.name.charAt(0)}</div>
                     <div className="flex-grow">
                         <textarea
                            value={newComment}
                            onChange={(e) => setNewComment(e.target.value)}
                            placeholder="اكتب تعليقاً..."
                            className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-sky-500"
                            rows={2}
                            required
                         />
                         <button type="submit" className="mt-2 px-4 py-2 bg-sky-600 text-white font-semibold rounded-md hover:bg-sky-700 text-sm">
                            نشر التعليق
                         </button>
                     </div>
                 </form>
            </div>

            {/* Comments List */}
             <div className="bg-white p-4 rounded-lg shadow-md">
                 <h3 className="font-bold mb-4 text-lg">التعليقات ({comments.length})</h3>
                 <div className="space-y-4">
                     {comments.map(comment => {
                         const author = users.find(u => u.id === comment.authorId);
                         return (
                             <div key={comment.id} className="flex items-start gap-3 border-b pb-3 last:border-b-0 last:pb-0">
                                 <div className="w-10 h-10 bg-gray-300 rounded-full flex items-center justify-center font-bold text-white flex-shrink-0">
                                     {author?.name.charAt(0)}
                                 </div>
                                 <div className="flex-grow">
                                     <div className="bg-gray-100 rounded-lg p-3">
                                        <div className="flex justify-between items-baseline">
                                            <p className="font-semibold text-gray-800 text-sm">{author?.name}</p>
                                            <p className="text-xs text-gray-500">
                                                {new Date(comment.timestamp).toLocaleString('ar-EG', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit'})}
                                            </p>
                                        </div>
                                        <p className="text-gray-700 mt-1">{comment.content}</p>
                                     </div>
                                 </div>
                             </div>
                         )
                     })}
                     {comments.length === 0 && <p className="text-gray-500 text-center py-4">كن أول من يعلق على هذا المنشور!</p>}
                 </div>
            </div>
        </div>
    );
};

export default PostDetailPage;