import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useChat } from '../hooks/useChat';
import { useAuth } from '../hooks/useAuth';
import { useProducts } from '../hooks/useProducts';
import { Product, Message } from '../types';

// Renders a special card for messages containing a product link
const ProductMessageCard: React.FC<{ product: Product; message: Message; isSender: boolean }> = ({ product, message, isSender }) => {
    const formatPrice = (price: number) => new Intl.NumberFormat('ar-YE', { style: 'currency', currency: 'YER', minimumFractionDigits: 0 }).format(price);
    const queryText = message.text.split('\n')[0];

    return (
        <div className={`rounded-lg py-2 px-3 max-w-xs ${isSender ? 'bg-[var(--color-primary)] text-white' : 'bg-gray-200 text-gray-800 dark:bg-slate-700 dark:text-slate-200'}`}>
            <p className="mb-2 text-sm">{queryText}</p>
            <Link to={`/products/${product.id}`} className="block bg-black/10 dark:bg-black/20 p-2 rounded-md hover:bg-black/20 dark:hover:bg-black/40 transition-colors">
                <div className="flex gap-3">
                    <img src={product.imageUrl} alt={product.name} className="w-16 h-16 object-cover rounded-md" />
                    <div className="text-right">
                        <p className="font-bold text-sm">{product.name}</p>
                        <p className="text-sm font-bold mt-1">{formatPrice(product.listingType === 'AUCTION' ? product.auctionDetails!.currentBid : product.price)}</p>
                    </div>
                </div>
            </Link>
             <p className={`text-xs mt-1 ${isSender ? 'text-sky-100' : 'text-gray-500 dark:text-slate-400'} text-left`}>
                {new Date(message.timestamp).toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' })}
                {isSender && (
                    <span className={`mr-1 inline-block ${message.isRead ? 'text-blue-300' : 'text-sky-100/70'}`}>
                        {message.isRead ? '✓✓' : '✓'}
                    </span>
                )}
            </p>
        </div>
    );
};

const ChatPage: React.FC = () => {
  const { contactId } = useParams<{ contactId?: string }>();
  const navigate = useNavigate();
  const { 
    conversations, 
    getMessagesForConversation, 
    sendMessage, 
    getConversationWithUser,
    markConversationAsRead,
    typingStatus,
    sendTypingStart,
    sendTypingStop
  } = useChat();
  const { user, users } = useAuth();
  const { products } = useProducts();
  const [activeConversationId, setActiveConversationId] = useState<string | null>(null);
  const [newMessage, setNewMessage] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const typingTimeoutRef = useRef<number | null>(null);

  useEffect(() => {
    // If a contactId is provided in the URL, find or create a conversation
    if (contactId) {
      const existingConversation = getConversationWithUser(contactId);
      if (existingConversation) {
        setActiveConversationId(existingConversation.id);
      } else {
        // This logic can be expanded. For now, we assume a conversation is made on first message.
        // If no existing conversation, don't set an active one until a message is sent.
        setActiveConversationId(null);
      }
    } else if (conversations.length > 0) {
        // If no contactId, default to the most recent conversation
        setActiveConversationId(conversations[0].id);
        navigate(`/chat/${getParticipant(conversations[0])?.id}`, { replace: true });
    }
  }, [contactId, getConversationWithUser, conversations, navigate]);

  useEffect(() => {
      // Mark messages as read when a conversation is opened
      if(activeConversationId) {
          markConversationAsRead(activeConversationId);
      }
  }, [activeConversationId, markConversationAsRead, getMessagesForConversation]);

  useEffect(() => {
    // Scroll to the bottom of the message list
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [activeConversationId, getMessagesForConversation]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setNewMessage(e.target.value);
    if (!activeConversationId) return;

    if (!typingTimeoutRef.current) {
        sendTypingStart(activeConversationId);
    } else {
        clearTimeout(typingTimeoutRef.current);
    }

    typingTimeoutRef.current = window.setTimeout(() => {
        sendTypingStop(activeConversationId);
        typingTimeoutRef.current = null;
    }, 1500);
  };

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (newMessage.trim() === '') return;
    
    // Clear typing timeout and send stop event
    if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
        typingTimeoutRef.current = null;
    }

    let receiverId = contactId;
    let currentConvId = activeConversationId;

    if (activeConversationId) {
        sendTypingStop(activeConversationId);
    }

    if (currentConvId && !receiverId) {
        const activeConv = conversations.find(c => c.id === currentConvId);
        receiverId = activeConv?.participantIds.find(id => id !== user?.id);
    }

    if(receiverId) {
        const conversation = sendMessage(receiverId, newMessage);
        if (!currentConvId) {
          setActiveConversationId(conversation.id);
        }
        setNewMessage('');
    } else {
        console.error("Could not determine receiver to send message.");
    }
  };

  const getParticipant = (conv: any) => {
    if (!conv) return null;
    const participantId = conv.participantIds.find((id: string) => id !== user?.id);
    return users.find(u => u.id === participantId);
  };
  
  const activeMessages = activeConversationId ? getMessagesForConversation(activeConversationId) : [];
  const showChatWindow = !!contactId;
  const isParticipantTyping = activeConversationId ? typingStatus[activeConversationId] : false;
  const productLinkRegex = /\/products\/(p[a-zA-Z0-9-]+)/;

  return (
    <div className="flex h-[calc(100vh-10rem)] bg-[var(--color-surface)] rounded-lg shadow-xl overflow-hidden border border-[var(--color-border)]">
      {/* Conversations List */}
      <aside className={`w-full md:w-1/3 border-l border-[var(--color-border)] flex-col ${showChatWindow ? 'hidden md:flex' : 'flex'}`}>
        <header className="p-4 border-b border-[var(--color-border)]">
          <h2 className="text-xl font-bold">الرسائل</h2>
        </header>
        <div className="overflow-y-auto h-full">
          {conversations.map(conv => {
            const participant = getParticipant(conv);
            const isUnread = conv.lastMessage && conv.lastMessage.receiverId === user?.id && !conv.lastMessage.isRead;
            return (
              <Link
                to={`/chat/${participant?.id}`}
                key={conv.id}
                onClick={() => setActiveConversationId(conv.id)}
                className={`flex items-center p-3 cursor-pointer hover:bg-[var(--color-background)] ${activeConversationId === conv.id ? 'bg-[var(--color-primary-light)]' : ''}`}
              >
                <div className="w-12 h-12 bg-gray-300 dark:bg-slate-600 rounded-full mr-3 flex items-center justify-center font-bold text-white flex-shrink-0">
                  {participant?.name.charAt(0)}
                </div>
                <div className="flex-grow overflow-hidden">
                  <div className="flex justify-between items-center">
                    <h3 className={`font-semibold truncate ${isUnread ? 'text-[var(--color-text-base)]' : 'text-[var(--color-text-muted)]'}`}>{participant?.name}</h3>
                    {isUnread && <span className="w-2.5 h-2.5 bg-[var(--color-primary)] rounded-full flex-shrink-0"></span>}
                  </div>
                  <p className={`text-sm truncate ${isUnread ? 'text-[var(--color-text-base)] font-medium' : 'text-[var(--color-text-muted)]'}`}>
                    {conv.lastMessage?.text.startsWith('استفسار بخصوص منتج:') ? 'رسالة بخصوص منتج' : conv.lastMessage?.text}
                  </p>
                </div>
              </Link>
            );
          })}
        </div>
      </aside>
      
      {/* Chat Window */}
      <main className={`w-full md:w-2/3 flex-col ${showChatWindow ? 'flex' : 'hidden md:flex'}`}>
         {(activeConversationId || contactId) ? (
          <>
            <header className="p-4 border-b border-[var(--color-border)] flex items-center">
                 <button onClick={() => navigate('/chat')} className="md:hidden text-[var(--color-text-muted)] p-2 ml-2">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 8l4 4m0 0l-4 4m4-4H3" /></svg>
                 </button>
                 <div className="w-10 h-10 bg-gray-300 dark:bg-slate-600 rounded-full mr-3 flex items-center justify-center font-bold text-white flex-shrink-0">
                  {users.find(u => u.id === (contactId || getParticipant(conversations.find(c => c.id === activeConversationId))?.id))?.name.charAt(0)}
                </div>
                <h3 className="font-semibold">{users.find(u => u.id === (contactId || getParticipant(conversations.find(c => c.id === activeConversationId))?.id))?.name}</h3>
            </header>
            <div className="flex-grow p-4 overflow-y-auto bg-[var(--color-background)]">
                {activeMessages.map(msg => {
                    const isSender = msg.senderId === user?.id;
                    const match = msg.text.match(productLinkRegex);
                    if (match) {
                        const productId = match[1];
                        const product = products.find(p => p.id === productId);
                        if (product) {
                            return (
                                <div key={msg.id} className={`flex ${isSender ? 'justify-end' : 'justify-start'} mb-3`}>
                                    <ProductMessageCard product={product} message={msg} isSender={isSender} />
                                </div>
                            );
                        }
                    }

                    return (
                        <div key={msg.id} className={`flex ${isSender ? 'justify-end' : 'justify-start'} mb-3`}>
                            <div className={`rounded-lg py-2 px-4 max-w-sm ${isSender ? 'bg-[var(--color-primary)] text-white' : 'bg-gray-200 text-gray-800 dark:bg-slate-700 dark:text-slate-200'}`}>
                                <p>{msg.text}</p>
                                <p className={`text-xs mt-1 ${isSender ? 'text-sky-100' : 'text-gray-500 dark:text-slate-400'} text-left`}>
                                    {new Date(msg.timestamp).toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' })}
                                    {isSender && (
                                        <span className={`mr-1 inline-block ${msg.isRead ? 'text-blue-300' : 'text-sky-100/70'}`}>
                                            {msg.isRead ? '✓✓' : '✓'}
                                        </span>
                                    )}
                                </p>
                            </div>
                        </div>
                    );
                })}
                 <div ref={messagesEndRef} />
            </div>
             <footer className="p-4 bg-[var(--color-surface)] border-t border-[var(--color-border)]">
                 <div className="h-6 px-4">
                    {isParticipantTyping && <div className="text-sm text-gray-500 animate-pulse">يكتب الآن...</div>}
                </div>
                <form onSubmit={handleSendMessage} className="flex items-center">
                    <input 
                        type="text"
                        value={newMessage}
                        onChange={handleInputChange}
                        placeholder="اكتب رسالتك هنا..."
                        className="w-full p-2 bg-[var(--color-background)] border border-[var(--color-border)] rounded-full focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] text-[var(--color-text-base)] placeholder:text-[var(--color-text-muted)]"
                    />
                    <button type="submit" className="mr-3 bg-[var(--color-primary)] text-white rounded-full p-3 hover:bg-[var(--color-primary-hover)] transition-colors">
                        <svg className="w-6 h-6 transform -rotate-90" fill="currentColor" viewBox="0 0 20 20"><path d="M10.894 2.553a1 1 0 00-1.788 0l-7 14a1 1 0 001.169 1.409l5-1.429A1 1 0 009 15.571V11a1 1 0 112 0v4.571a1 1 0 00.725.962l5 1.428a1 1 0 001.17-1.408l-7-14z"></path></svg>
                    </button>
                </form>
             </footer>
          </>
         ) : (
            <div className="flex items-center justify-center h-full text-[var(--color-text-muted)]">
                <div className="text-center">
                    <svg xmlns="http://www.w3.org/2000/svg" className="mx-auto h-16 w-16 text-gray-300 dark:text-slate-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" /></svg>
                    <h3 className="mt-2 text-xl font-medium text-[var(--color-text-base)]">حدد محادثة</h3>
                    <p className="mt-1 text-sm">اختر محادثة من القائمة لبدء الدردشة.</p>
                </div>
            </div>
         )}
      </main>
    </div>
  );
};

export default ChatPage;
