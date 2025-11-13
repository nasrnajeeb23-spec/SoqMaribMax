import { create } from 'zustand';
import { Conversation, Message } from '../types';
import { realtimeService } from '../api/realtimeService';
import { useAuthStore } from './authStore';
import * as api from '../api';

interface ChatState {
  conversations: Conversation[]; // for current user
  allConversations: Conversation[]; // all conversations
  messages: Message[];
  typingStatus: Record<string, boolean>;
  getMessagesForConversation: (conversationId: string) => Message[];
  sendMessage: (receiverId: string, text: string) => Promise<Conversation>;
  getConversationWithUser: (contactId: string) => Conversation | undefined;
  unreadConversationsCount: number;
  markConversationAsRead: (conversationId: string) => Promise<void>;
  sendTypingStart: (conversationId: string) => void;
  sendTypingStop: (conversationId: string) => void;
  initialize: () => void;
  _updateDerivedState: () => void;
}

export const useChatStore = create<ChatState>((set, get) => ({
  conversations: [],
  allConversations: [],
  messages: [],
  typingStatus: {},
  unreadConversationsCount: 0,
  
  _updateDerivedState: () => {
    const { user } = useAuthStore.getState();
    if (!user) {
        set({ conversations: [], unreadConversationsCount: 0 });
        return;
    }

    const allConversations = get().allConversations;
    const allMessages = get().messages;
    
    const updatedConversations = allConversations.map(conv => ({
        ...conv,
        lastMessage: allMessages
          .filter(m => m.conversationId === conv.id)
          .sort((a,b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())[0]
    }));

    const userConversations = updatedConversations
      .filter(c => c.participantIds.includes(user.id))
      .sort((a, b) => {
        const dateA = a.lastMessage ? new Date(a.lastMessage.timestamp) : new Date(0);
        const dateB = b.lastMessage ? new Date(b.lastMessage.timestamp) : new Date(0);
        return dateB.getTime() - dateA.getTime();
      });
      
    const unreadCount = userConversations.filter(conv => 
      conv.lastMessage && conv.lastMessage.receiverId === user.id && !conv.lastMessage.isRead
    ).length;
    
    set({ conversations: userConversations, unreadConversationsCount: unreadCount });
  },
  
  getMessagesForConversation: (conversationId) => {
    return get().messages.filter(m => m.conversationId === conversationId)
      .sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());
  },
  getConversationWithUser: (contactId) => {
    const { user } = useAuthStore.getState();
    if (!user) return undefined;
    return get().allConversations.find(c => 
        c.participantIds.includes(user!.id) && c.participantIds.includes(contactId)
    );
  },
  markConversationAsRead: async (conversationId) => {
      const { user } = useAuthStore.getState();
      const updatedMessages = get().messages.map(msg => 
            (msg.conversationId === conversationId && msg.receiverId === user?.id && !msg.isRead) 
            ? { ...msg, isRead: true } 
            : msg
      );
      await api.apiUpdateMessages(updatedMessages);
      set({ messages: updatedMessages });
      get()._updateDerivedState();
  },
  sendTypingStart: (conversationId) => {
    const { user } = useAuthStore.getState();
    if (!user) return;
    realtimeService.postEvent({ type: 'user-typing-start', payload: { conversationId, userId: user.id } });
  },
  sendTypingStop: (conversationId) => {
    const { user } = useAuthStore.getState();
    if (!user) return;
    realtimeService.postEvent({ type: 'user-typing-stop', payload: { conversationId, userId: user.id } });
  },
  sendMessage: async (receiverId, text) => {
    const { user } = useAuthStore.getState();
    if (!user) throw new Error("User not logged in");
    
    let conversation = get().getConversationWithUser(receiverId);

    if (!conversation) {
        const newConversationData: Conversation = { id: `conv-${Date.now()}`, participantIds: [user.id, receiverId] };
        conversation = await api.apiAddConversation(newConversationData);
        set(state => ({ allConversations: [...state.allConversations, conversation!] }));
    }
    
    const newMessageData: Message = {
        id: `msg-${Date.now()}`, conversationId: conversation.id, senderId: user.id, receiverId,
        text, timestamp: new Date().toISOString(), isRead: false,
    };

    const newMessage = await api.apiAddMessage(newMessageData);
    set(state => ({ messages: [...state.messages, newMessage] }));
    realtimeService.postEvent({ type: 'chat_message', payload: newMessage });
    get()._updateDerivedState();
    return conversation;
  },
  initialize: async () => {
    const [conversations, messages] = await Promise.all([
      api.apiFetchConversations(),
      api.apiFetchMessages()
    ]);
    set({ allConversations: conversations, messages });
    get()._updateDerivedState();
    
    realtimeService.onEvent((event) => {
      if (event.type === 'chat_message') {
        const receivedMessage = event.payload;
        if (receivedMessage.receiverId === useAuthStore.getState().user?.id) {
            set(state => {
                const exists = state.messages.some(m => m.id === receivedMessage.id);
                if (!exists) {
                    return { messages: [...state.messages, receivedMessage], typingStatus: {...state.typingStatus, [receivedMessage.conversationId]: false} };
                }
                return state;
            });
            get()._updateDerivedState();
        }
      }
      if (event.type === 'user-typing-start' || event.type === 'user-typing-stop') {
        const { conversationId, userId } = event.payload;
        if (userId !== useAuthStore.getState().user?.id) {
            set(state => ({ typingStatus: { ...state.typingStatus, [conversationId]: event.type === 'user-typing-start' } }));
        }
      }
    });

    useAuthStore.subscribe(() => get()._updateDerivedState());
  }
}));

useChatStore.getState().initialize();
