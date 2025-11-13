import { create } from 'zustand';
import { CommunityPost, PostComment } from '../types';
import { useAuthStore } from './authStore';
import { useNotificationStore } from './notificationStore';
import * as api from '../api';

interface CommunityState {
  posts: CommunityPost[];
  comments: PostComment[];
  getPostById: (postId: string) => CommunityPost | undefined;
  getCommentsForPost: (postId: string) => PostComment[];
  createPost: (postData: Omit<CommunityPost, 'id' | 'authorId' | 'timestamp' | 'likes' | 'commentCount'>, showToast: (msg: string, type: any) => void) => Promise<void>;
  addComment: (postId: string, content: string, showToast: (msg: string, type: any) => void) => Promise<void>;
  toggleLike: (postId: string, showToast: (msg: string, type: any) => void) => Promise<void>;
  deletePost: (postId: string, showToast: (msg: string, type: any) => void) => Promise<void>;
  initialize: () => Promise<void>;
}

export const useCommunityStore = create<CommunityState>((set, get) => ({
  posts: [],
  comments: [],
  initialize: async () => {
    const [posts, comments] = await Promise.all([
      api.apiFetchPosts(),
      api.apiFetchComments()
    ]);
    set({ posts, comments });
  },
  getPostById: (postId) => get().posts.find(p => p.id === postId),
  getCommentsForPost: (postId) => {
    return get().comments.filter(c => c.postId === postId)
                   .sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());
  },
  createPost: async (postData, showToast) => {
    const { user } = useAuthStore.getState();
    if (!user) { showToast('يجب تسجيل الدخول لنشر منشور.', 'error'); return; }
    const newPostData: CommunityPost = {
      id: `post-${Date.now()}`, authorId: user.id, timestamp: new Date().toISOString(),
      likes: [], commentCount: 0, ...postData,
    };
    const newPost = await api.apiAddPost(newPostData);
    set(state => ({ posts: [newPost, ...state.posts] }));
    showToast('تم نشر منشورك بنجاح!', 'success');
  },
  addComment: async (postId, content, showToast) => {
    const { user } = useAuthStore.getState();
    if (!user) { showToast('يجب تسجيل الدخول للتعليق.', 'error'); return; }
    const post = get().getPostById(postId);
    if (!post) return;
    
    const newCommentData: PostComment = {
      id: `comment-${Date.now()}`, postId, authorId: user.id, content, timestamp: new Date().toISOString(),
    };
    const newComment = await api.apiAddComment(newCommentData);
    const updatedPost = await api.apiUpdatePost(postId, { commentCount: post.commentCount + 1 });
    
    set(state => ({
      comments: [...state.comments, newComment],
      posts: state.posts.map(p => p.id === postId ? updatedPost : p),
    }));

    if (user.id !== post.authorId) {
      useNotificationStore.getState().addNotification({
          userId: post.authorId, message: `علق ${user.name} على منشورك.`, link: `/community/${postId}`
      });
    }
  },
  deletePost: async (postId, showToast) => {
    await api.apiDeletePost(postId);
    set(state => ({
      posts: state.posts.filter(p => p.id !== postId),
      comments: state.comments.filter(c => c.postId !== postId),
    }));
    showToast('تم حذف المنشور بنجاح.', 'info');
  },
  toggleLike: async (postId, showToast) => {
    const { user } = useAuthStore.getState();
    if (!user) { showToast('يجب تسجيل الدخول للإعجاب بالمنشورات.', 'error'); return; }
    const post = get().getPostById(postId);
    if (!post) return;

    const userHasLiked = post.likes.includes(user.id);
    const newLikes = userHasLiked ? post.likes.filter(id => id !== user.id) : [...post.likes, user.id];
    
    const updatedPost = await api.apiUpdatePost(postId, { likes: newLikes });
    set(state => ({
      posts: state.posts.map(p => p.id === postId ? updatedPost : p)
    }));

    if (!userHasLiked && user.id !== post.authorId) {
      useNotificationStore.getState().addNotification({
        userId: post.authorId, message: `أعجب ${user.name} بمنشورك.`, link: `/community/${postId}`
      });
    }
  },
}));

useCommunityStore.getState().initialize();
