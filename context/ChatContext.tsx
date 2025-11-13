import React, { createContext, useState, ReactNode, useMemo, useCallback, useEffect } from 'react';
import { Conversation, Message } from '../types';
import { mockConversationsData, mockMessagesData } from '../data/chatData';
import { useAuth } from '../hooks/useAuth';
import { realtimeService } from '../api/realtimeService';

interface ChatContextType {
  conversations: Conversation[];
  getMessagesForConversation: (conversationId: string) => Message[];
  sendMessage: (receiverId: string, text: string) => Conversation;
  getConversationWithUser: (contactId: string) => Conversation | undefined;
  unreadConversationsCount: number;
  markConversationAsRead: (conversationId: string) => void;
  typingStatus: Record<string, boolean>;
  sendTypingStart: (conversationId: string) => void;
  sendTypingStop: (conversationId: string) => void;
}

export const ChatContext = createContext<ChatContextType | undefined>(undefined);

interface ChatProviderProps {
  children: ReactNode;
}

export const ChatProvider: React.FC<ChatProviderProps> = ({ children }) => {
  const { user } = useAuth();
  const [conversations, setConversations] = useState<Conversation[]>(mockConversationsData);
  const [messages, setMessages] = useState<Message[]>(mockMessagesData);
  const [typingStatus, setTypingStatus] = useState<Record<string, boolean>>({});


  // Listen for real-time chat messages and typing events
  useEffect(() => {
    realtimeService.onEvent((event) => {
      if (event.type === 'chat_message') {
        const receivedMessage = event.payload;
        // Add message only if the current user is the recipient
        if (receivedMessage.receiverId === user?.id) {
          setMessages(prev => {
            const messageExists = prev.some(m => m.id === receivedMessage.id);
            if (!messageExists) {
               // When a message is received, the other person has stopped typing.
               setTypingStatus(prevStatus => ({...prevStatus, [receivedMessage.conversationId]: false}));
               return [...prev, receivedMessage];
            }
            return prev;
          });
        }
      }
      if (event.type === 'user-typing-start' || event.type === 'user-typing-stop') {
        const { conversationId, userId } = event.payload;
        if (userId !== user?.id) {
            setTypingStatus(prev => ({ ...prev, [conversationId]: event.type === 'user-typing-start' }));
        }
      }
    });
  }, [user]);


  const userConversations = useMemo(() => {
    if (!user) return [];
    // Re-evaluate lastMessage for sorting as messages state changes
    const updatedConversations = conversations.map(conv => ({
        ...conv,
        lastMessage: messages
          .filter(m => m.conversationId === conv.id)
          .sort((a,b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())[0]
    }));

    return updatedConversations
      .filter(c => c.participantIds.includes(user.id))
      .sort((a, b) => {
        const dateA = a.lastMessage ? new Date(a.lastMessage.timestamp) : new Date(0);
        const dateB = b.lastMessage ? new Date(b.lastMessage.timestamp) : new Date(0);
        return dateB.getTime() - dateA.getTime();
      });
  }, [conversations, messages, user]);

  const getMessagesForConversation = useCallback((conversationId: string): Message[] => {
    return messages
      .filter(m => m.conversationId === conversationId)
      .sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());
  }, [messages]);

  const getConversationWithUser = useCallback((contactId: string): Conversation | undefined => {
    if (!user) return undefined;
    return conversations.find(c => 
        c.participantIds.includes(user.id) && c.participantIds.includes(contactId)
    );
  }, [conversations, user]);

  const markConversationAsRead = (conversationId: string) => {
      setMessages(prevMessages => 
          prevMessages.map(msg => {
              if (msg.conversationId === conversationId && msg.receiverId === user?.id && !msg.isRead) {
                  return { ...msg, isRead: true };
              }
              return msg;
          })
      );
  };

  const unreadConversationsCount = useMemo(() => {
    if (!user) return 0;
    return userConversations.filter(conv => 
      conv.lastMessage && conv.lastMessage.receiverId === user.id && !conv.lastMessage.isRead
    ).length;
  }, [userConversations, user]);
  
  const sendTypingStart = (conversationId: string) => {
    if (!user) return;
    realtimeService.postEvent({
      type: 'user-typing-start',
      payload: { conversationId, userId: user.id }
    });
  };

  const sendTypingStop = (conversationId: string) => {
    if (!user) return;
    realtimeService.postEvent({
      type: 'user-typing-stop',
      payload: { conversationId, userId: user.id }
    });
  };

  const sendMessage = (receiverId: string, text: string): Conversation => {
    if (!user) throw new Error("User not logged in");
    
    let conversation = getConversationWithUser(receiverId);

    if (!conversation) {
        // Create a new conversation
        const newConversation: Conversation = {
            id: `conv-${Date.now()}`,
            participantIds: [user.id, receiverId],
        };
        setConversations(prev => [...prev, newConversation]);
        conversation = newConversation;
    }
    
    const newMessage: Message = {
        id: `msg-${Date.now()}`,
        conversationId: conversation.id,
        senderId: user.id,
        receiverId,
        text,
        timestamp: new Date().toISOString(),
        isRead: false,
    };

    // Add to local state immediately for instant feedback
    setMessages(prev => [...prev, newMessage]);

    // Broadcast the message to other tabs/windows
    realtimeService.postEvent({ type: 'chat_message', payload: newMessage });

    return conversation;
  };

  return (
    <ChatContext.Provider value={{ 
        conversations: userConversations, 
        getMessagesForConversation, 
        sendMessage, 
        getConversationWithUser,
        unreadConversationsCount,
        markConversationAsRead,
        typingStatus,
        sendTypingStart,
        sendTypingStop
    }}>
      {children}
    </ChatContext.Provider>
  );
};
