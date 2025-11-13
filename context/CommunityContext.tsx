import React, { createContext, useState, ReactNode, useCallback } from 'react';
import { CommunityPost, PostComment } from '../types';
import { mockPostsData, mockCommentsData } from '../data/communityData';
import { useAuth } from '../hooks/useAuth';
import { useToast } from '../hooks/useToast';
import { useNotifications } from '../hooks/useNotifications';

interface CommunityContextType {
  posts: CommunityPost[];
  getPostById: (postId: string) => CommunityPost | undefined;
  getCommentsForPost: (postId: string) => PostComment[];
  createPost: (postData: Omit<CommunityPost, 'id' | 'authorId' | 'timestamp' | 'likes' | 'commentCount'>) => void;
  addComment: (postId: string, content: string) => void;
  toggleLike: (postId: string) => void;
  deletePost: (postId: string) => void; // New
}

export const CommunityContext = createContext<CommunityContextType | undefined>(undefined);

interface CommunityProviderProps {
  children: ReactNode;
}

export const CommunityProvider: React.FC<CommunityProviderProps> = ({ children }) => {
  const [posts, setPosts] = useState<CommunityPost[]>(mockPostsData);
  const [comments, setComments] = useState<PostComment[]>(mockCommentsData);
  const { user } = useAuth();
  const { showToast } = useToast();
  const { addNotification } = useNotifications();

  const getPostById = useCallback((postId: string) => posts.find(p => p.id === postId), [posts]);

  const getCommentsForPost = useCallback((postId: string) => {
    return comments.filter(c => c.postId === postId)
                   .sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());
  }, [comments]);
  
  const createPost = (postData: Omit<CommunityPost, 'id' | 'authorId' | 'timestamp' | 'likes' | 'commentCount'>) => {
    if (!user) {
      showToast('يجب تسجيل الدخول لنشر منشور.', 'error');
      return;
    }
    const newPost: CommunityPost = {
      id: `post-${Date.now()}`,
      authorId: user.id,
      timestamp: new Date().toISOString(),
      likes: [],
      commentCount: 0,
      ...postData,
    };
    
    setPosts(prev => [newPost, ...prev]);
    showToast('تم نشر منشورك بنجاح!', 'success');
  };
  
  const addComment = (postId: string, content: string) => {
    if (!user) {
      showToast('يجب تسجيل الدخول للتعليق.', 'error');
      return;
    }
    const post = getPostById(postId);
    if (!post) return;
    
    const newComment: PostComment = {
      id: `comment-${Date.now()}`,
      postId,
      authorId: user.id,
      content,
      timestamp: new Date().toISOString(),
    };
    
    setComments(prev => [...prev, newComment]);
    
    // Update comment count on post
    setPosts(prev => prev.map(p => p.id === postId ? { ...p, commentCount: p.commentCount + 1 } : p));

    // Notify post author
    if (user.id !== post.authorId) {
       addNotification({
          userId: post.authorId,
          message: `علق ${user.name} على منشورك.`,
          link: `/community/${postId}`
       });
    }
  };
  
  const deletePost = (postId: string) => {
    setPosts(prev => prev.filter(p => p.id !== postId));
    // Also delete associated comments
    setComments(prev => prev.filter(c => c.postId !== postId));
    showToast('تم حذف المنشور بنجاح.', 'info');
  };

  const toggleLike = (postId: string) => {
      if (!user) {
        showToast('يجب تسجيل الدخول للإعجاب بالمنشورات.', 'error');
        return;
      }
      const post = getPostById(postId);
      if (!post) return;

      const userHasLiked = post.likes.includes(user.id);
      
      const updatedPosts = posts.map(p => {
          if (p.id === postId) {
              return {
                  ...p,
                  likes: userHasLiked 
                         ? p.likes.filter(id => id !== user.id) 
                         : [...p.likes, user.id]
              };
          }
          return p;
      });

      setPosts(updatedPosts);

      // Notify post author only on like, not on unlike
      if (!userHasLiked && user.id !== post.authorId) {
          addNotification({
              userId: post.authorId,
              message: `أعجب ${user.name} بمنشورك.`,
              link: `/community/${postId}`
          });
      }
  };

  return (
    <CommunityContext.Provider value={{ posts, getPostById, getCommentsForPost, createPost, addComment, toggleLike, deletePost }}>
      {children}
    </CommunityContext.Provider>
  );
};