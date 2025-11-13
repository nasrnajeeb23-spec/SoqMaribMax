import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { CommunityPost } from '../../types';
import { useAuth } from '../../hooks/useAuth';
import { useCommunity } from '../../hooks/useCommunity';

interface PostCardProps {
    post: CommunityPost;
    isDetailPage?: boolean;
}

const itemVariants = {
  hidden: { y: 20, opacity: 0 },
  visible: { y: 0, opacity: 1 }
};

const PostCard: React.FC<PostCardProps> = ({ post, isDetailPage = false }) => {
    const { user, users } = useAuth();
    const { toggleLike } = useCommunity();
    const author = users.find(u => u.id === post.authorId);
    const hasLiked = user ? post.likes.includes(user.id) : false;
    
    const timeAgo = (dateString: string) => {
        const date = new Date(dateString);
        const seconds = Math.floor((new Date().getTime() - date.getTime()) / 1000);
        let interval = seconds / 31536000;
        if (interval > 1) return `منذ ${Math.floor(interval)} سنوات`;
        interval = seconds / 2592000;
        if (interval > 1) return `منذ ${Math.floor(interval)} أشهر`;
        interval = seconds / 86400;
        if (interval > 1) return `منذ ${Math.floor(interval)} أيام`;
        interval = seconds / 3600;
        if (interval > 1) return `منذ ${Math.floor(interval)} ساعات`;
        interval = seconds / 60;
        if (interval > 1) return `منذ ${Math.floor(interval)} دقائق`;
        return 'الآن';
    };

    const handleLikeClick = (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
        toggleLike(post.id);
    };

    const cardContent = (
         <div className="bg-white p-4 rounded-lg shadow-md transition-shadow hover:shadow-lg">
            {/* Header */}
            <div className="flex items-center mb-4">
                 <div className="w-12 h-12 bg-gray-300 rounded-full flex items-center justify-center font-bold text-white flex-shrink-0">
                    {author?.name.charAt(0)}
                </div>
                <div className="mr-3">
                    <p className="font-bold text-gray-800">{author?.name}</p>
                    <p className="text-xs text-gray-500">{timeAgo(post.timestamp)} · في <span className="font-semibold">{post.category.name}</span></p>
                </div>
            </div>

            {/* Content */}
            <div className="space-y-4">
                <p className={`text-gray-700 ${!isDetailPage ? 'line-clamp-4' : ''}`}>{post.content}</p>
                {post.imageUrl && <img src={post.imageUrl} alt="Post content" className="rounded-lg w-full max-h-96 object-cover" />}
            </div>

             {/* Footer */}
             <div className="mt-4 pt-3 border-t flex justify-between items-center text-gray-500">
                <div className="text-sm">
                    {post.likes.length > 0 && <span>{post.likes.length} إعجاب</span>}
                </div>
                <div className="flex gap-4">
                    <button onClick={handleLikeClick} className={`flex items-center gap-1.5 text-sm font-semibold hover:text-sky-600 transition-colors ${hasLiked ? 'text-sky-600' : ''}`}>
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                            <path d="M2 10.5a1.5 1.5 0 113 0v6a1.5 1.5 0 01-3 0v-6zM6 10.333V17a1 1 0 001 1h8a1 1 0 001-1v-6.667a2 2 0 00-.293-1.033l-4-4A2 2 0 009.293 4.293L6.293 7.293A2 2 0 006 8.667v1.666z" />
                        </svg>
                        أعجبني
                    </button>
                    <Link to={`/community/${post.id}`} className="flex items-center gap-1.5 text-sm font-semibold hover:text-sky-600 transition-colors">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M18 5v8a2 2 0 01-2 2h-5l-5 4v-4H4a2 2 0 01-2-2V5a2 2 0 012-2h12a2 2 0 012 2zM7 8H5v2h2V8zm2 0h2v2H9V8zm6 0h-2v2h2V8z" clipRule="evenodd" />
                        </svg>
                        {post.commentCount > 0 ? `${post.commentCount} تعليق` : 'تعليق'}
                    </Link>
                </div>
             </div>
        </div>
    );
    
    return isDetailPage ? cardContent : (
        <motion.div variants={itemVariants}>
            <Link to={`/community/${post.id}`} className="block">
                {cardContent}
            </Link>
        </motion.div>
    );
};

export default PostCard;