import React, { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { useCommunity } from '../hooks/useCommunity';
import { useAuth } from '../hooks/useAuth';
import { postCategories } from '../data/communityData';
import { PostCategory } from '../types';
import PostCard from '../components/community/PostCard';
import Spinner from '../components/common/Spinner';

const CommunityPage: React.FC = () => {
    const { user } = useAuth();
    const { posts, createPost } = useCommunity();
    const [isCreatingPost, setIsCreatingPost] = useState(false);
    const [postContent, setPostContent] = useState('');
    const [postImageUrl, setPostImageUrl] = useState('');
    const [selectedCategory, setSelectedCategory] = useState<PostCategory>(postCategories[0]);
    const [activeFilter, setActiveFilter] = useState<string | null>(null);

    const handleCreatePost = (e: React.FormEvent) => {
        e.preventDefault();
        if (postContent.trim()) {
            createPost({
                content: postContent,
                imageUrl: postImageUrl.trim() ? postImageUrl : undefined,
                category: selectedCategory,
            });
            setPostContent('');
            setPostImageUrl('');
            setIsCreatingPost(false);
        }
    };
    
    const filteredPosts = useMemo(() => {
        if (!activeFilter) return posts;
        return posts.filter(p => p.category.id === activeFilter);
    }, [posts, activeFilter]);
    
    const containerVariants = {
        hidden: { opacity: 0 },
        visible: { opacity: 1, transition: { staggerChildren: 0.1 } }
    };
    
    const itemVariants = {
        hidden: { y: 20, opacity: 0 },
        visible: { y: 0, opacity: 1 }
    };

    return (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            {/* Sidebar */}
            <motion.aside variants={itemVariants} className="md:col-span-1 bg-white p-4 rounded-lg shadow-md h-fit sticky top-24">
                <h2 className="text-lg font-bold mb-4">التصنيفات</h2>
                <ul>
                    <li>
                        <button onClick={() => setActiveFilter(null)} className={`w-full text-right p-2 rounded-md font-semibold text-sm transition-colors ${!activeFilter ? 'bg-sky-100 text-sky-700' : 'hover:bg-gray-100'}`}>
                            كل المنشورات
                        </button>
                    </li>
                    {postCategories.map(cat => (
                         <li key={cat.id}>
                            <button onClick={() => setActiveFilter(cat.id)}  className={`w-full text-right p-2 rounded-md font-semibold text-sm transition-colors ${activeFilter === cat.id ? 'bg-sky-100 text-sky-700' : 'hover:bg-gray-100'}`}>
                                {cat.name}
                            </button>
                        </li>
                    ))}
                </ul>
            </motion.aside>

            {/* Main Content */}
            <main className="md:col-span-3 space-y-6">
                <motion.div variants={itemVariants} className="bg-white p-4 rounded-lg shadow-md">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-gray-300 rounded-full flex items-center justify-center font-bold text-white flex-shrink-0">{user?.name.charAt(0)}</div>
                        <button onClick={() => setIsCreatingPost(true)} className="w-full text-right bg-gray-100 hover:bg-gray-200 text-gray-500 rounded-full p-3 transition-colors">
                            بماذا تفكر يا {user?.name}؟
                        </button>
                    </div>

                    {isCreatingPost && (
                        <motion.form 
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: 'auto', opacity: 1 }}
                            onSubmit={handleCreatePost} className="mt-4 space-y-4"
                        >
                            <textarea
                                value={postContent}
                                onChange={e => setPostContent(e.target.value)}
                                placeholder="اكتب منشورك هنا..."
                                className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-sky-500"
                                rows={4}
                                required
                            />
                            <input
                                type="url"
                                value={postImageUrl}
                                onChange={e => setPostImageUrl(e.target.value)}
                                placeholder="رابط صورة (اختياري)"
                                className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-sky-500"
                            />
                            <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
                               <select value={selectedCategory.id} onChange={e => setSelectedCategory(postCategories.find(c => c.id === e.target.value) || postCategories[0])} className="p-2 border border-gray-300 bg-white rounded-md focus:outline-none focus:ring-2 focus:ring-sky-500">
                                   {postCategories.map(cat => <option key={cat.id} value={cat.id}>{cat.name}</option>)}
                               </select>
                               <div className="flex gap-2">
                                    <button type="button" onClick={() => setIsCreatingPost(false)} className="px-4 py-2 bg-gray-200 text-gray-800 font-semibold rounded-md hover:bg-gray-300">إلغاء</button>
                                    <button type="submit" className="px-4 py-2 bg-sky-600 text-white font-semibold rounded-md hover:bg-sky-700">نشر</button>
                               </div>
                            </div>
                        </motion.form>
                    )}
                </motion.div>
                
                <motion.div variants={containerVariants} initial="hidden" animate="visible" className="space-y-6">
                    {filteredPosts.length > 0 ? (
                        filteredPosts.map(post => <PostCard key={post.id} post={post} />)
                    ) : (
                        <div className="text-center py-10 bg-white rounded-lg shadow-md">
                            <p className="text-gray-500">لا توجد منشورات في هذا التصنيف بعد.</p>
                        </div>
                    )}
                </motion.div>
            </main>
        </div>
    );
};

export default CommunityPage;