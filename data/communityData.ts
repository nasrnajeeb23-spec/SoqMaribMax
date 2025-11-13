import { CommunityPost, PostComment, PostCategory } from '../types';

export const postCategories: PostCategory[] = [
    { id: 'pc1', name: 'نقاش عام', description: 'تحدث عن أي شيء يخص السوق أو المنتجات بشكل عام.' },
    { id: 'pc2', name: 'أسئلة واستفسارات', description: 'هل لديك سؤال؟ اطرحه هنا ليجيبك أعضاء المجتمع.' },
    { id: 'pc3', name: 'تجارب وتقييمات', description: 'شارك تجربتك مع منتج أو بائع معين.' },
];

export const mockPostsData: CommunityPost[] = [
    { id: 'post1', authorId: 'user-2', content: 'يا جماعة، أريد أن أشتري لابتوب مستعمل للدراسة، بماذا تنصحوني؟ الميزانية حوالي 100 ألف ريال.', category: postCategories[1], timestamp: new Date(Date.now() - 1000 * 60 * 60 * 3).toISOString(), likes: ['user-1', 'user-3'], commentCount: 2 }
];

export const mockCommentsData: PostComment[] = [
    { id: 'comment1', postId: 'post1', authorId: 'user-1', content: 'أنصحك بلابتوبات ديل، عملية جداً وتتحمل. يمكنك البحث في قسم الإلكترونيات.', timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString() }
];
