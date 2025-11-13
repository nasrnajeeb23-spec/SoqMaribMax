import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useChat } from '../hooks/useChat';
import { useAuth } from '../hooks/useAuth';

const ChatPage: React.FC = () => {
  const { contactId } = useParams<{ contactId?: string }>();
  const navigate = useNavigate();
  const { 
    conversations, 
    getMessagesForConversation, 
    sendMessage, 
    getConversationWithUser,
    markConversationAsRead 
  } = useChat();
  const { user, users } = useAuth();
  const [activeConversationId, setActiveConversationId] = useState<string | null>(null);
  const [newMessage, setNewMessage] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // If a contactId is provided in the URL, find or create a conversation
    if (contactId) {
      const existingConversation = getConversationWithUser(contactId);
      if (existingConversation) {
        setActiveConversationId(existingConversation.id);
      } else {
        // This logic can be expanded. For now, we assume a conversation is made on first message.
        // If no existing conversation, don't set an active one until a message is sent.
