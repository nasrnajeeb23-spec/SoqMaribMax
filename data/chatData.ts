import { Conversation, Message } from '../types';

export const mockMessagesData: Message[] = [
    { id: 'msg1', conversationId: 'conv1', senderId: 'user-2', receiverId: 'user-1', text: 'مرحباً، هل اللابتوب ما زال متوفراً؟', timestamp: new Date().toISOString(), isRead: true }
];

export const mockConversationsData: Conversation[] = [
    { id: 'conv1', participantIds: ['user-1', 'user-2'] }
];
