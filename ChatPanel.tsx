import { useState, useEffect, useRef } from 'react';
import { Send, MessageCircle, X } from 'lucide-react';
import { useStore } from '../context/StoreContext';

interface ChatPanelProps {
  isOpen: boolean;
  onClose: () => void;
  receiverId?: string;
}

export default function ChatPanel({ isOpen, onClose, receiverId = 'admin' }: ChatPanelProps) {
  const { currentUser, getConversation, sendMessage, markAsRead, settings, isOwner, users, messages: allMessages } = useStore();
  const [message, setMessage] = useState('');
  const [selectedUser, setSelectedUser] = useState(receiverId);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const conversation = getConversation(selectedUser);

  // Get unique users who have chatted (for owner view)
  const chatUsers = isOwner 
    ? [...new Set(allMessages.map(m => m.senderId === settings.ownerUsername ? m.receiverId : m.senderId))]
        .filter(u => u !== settings.ownerUsername)
    : [];

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [conversation]);

  useEffect(() => {
    if (isOpen && currentUser) {
      const unreadIds = conversation
        .filter(m => m.receiverId === currentUser.username && !m.isRead)
        .map(m => m.id);
      if (unreadIds.length > 0) {
        markAsRead(unreadIds);
      }
    }
  }, [isOpen, conversation, currentUser, markAsRead]);

  const handleSend = () => {
    if (message.trim() && currentUser) {
      sendMessage(selectedUser, message.trim());
      setMessage('');
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed bottom-4 right-4 w-96 max-w-[calc(100vw-2rem)] h-[500px] max-h-[calc(100vh-8rem)] bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 rounded-2xl border border-red-900/50 shadow-2xl shadow-red-500/10 flex flex-col z-50 overflow-hidden">
      {/* Header */}
      <div className="p-4 border-b border-gray-700/50 bg-gradient-to-r from-red-900/20 to-orange-900/20">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-r from-red-500 to-orange-500 rounded-full flex items-center justify-center">
              <MessageCircle size={20} className="text-white" />
            </div>
            <div>
              <h3 className="text-white font-bold">
                {isOwner ? 'Customer Support' : 'Chat dengan Admin'}
              </h3>
              <p className="text-gray-400 text-xs">
                {isOwner ? `${chatUsers.length} percakapan` : 'Online'}
              </p>
            </div>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-white transition-colors">
            <X size={20} />
          </button>
        </div>

        {/* User selector for owner */}
        {isOwner && chatUsers.length > 0 && (
          <div className="mt-3 flex gap-2 overflow-x-auto pb-2">
            {chatUsers.map(username => {
              const user = users.find(u => u.username === username);
              const unreadCount = allMessages.filter(
                m => m.senderId === username && m.receiverId === settings.ownerUsername && !m.isRead
              ).length;
              return (
                <button
                  key={username}
                  onClick={() => setSelectedUser(username)}
                  className={`flex-shrink-0 px-3 py-1.5 rounded-full text-sm transition-all ${
                    selectedUser === username
                      ? 'bg-red-500 text-white'
                      : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                  }`}
                >
                  {user?.username || username}
                  {unreadCount > 0 && (
                    <span className="ml-1 px-1.5 py-0.5 bg-red-600 rounded-full text-xs">
                      {unreadCount}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {conversation.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center">
            <MessageCircle size={48} className="text-gray-600 mb-3" />
            <p className="text-gray-400">Belum ada pesan</p>
            <p className="text-gray-500 text-sm">Mulai percakapan dengan mengirim pesan</p>
          </div>
        ) : (
          conversation.map((msg) => {
            const isMe = msg.senderId === currentUser?.username;
            return (
              <div key={msg.id} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                <div
                  className={`max-w-[80%] px-4 py-2 rounded-2xl ${
                    isMe
                      ? 'bg-gradient-to-r from-red-600 to-red-500 text-white rounded-br-md'
                      : 'bg-gray-700 text-white rounded-bl-md'
                  }`}
                >
                  <p className="text-sm break-words">{msg.message}</p>
                  <p className={`text-xs mt-1 ${isMe ? 'text-red-200' : 'text-gray-400'}`}>
                    {new Date(msg.createdAt).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}
                  </p>
                </div>
              </div>
            );
          })
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="p-4 border-t border-gray-700/50">
        <div className="flex gap-2">
          <input
            type="text"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Ketik pesan..."
            className="flex-1 px-4 py-3 bg-gray-800 border border-gray-700 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-red-500 transition-colors"
          />
          <button
            onClick={handleSend}
            disabled={!message.trim()}
            className="px-4 py-3 bg-gradient-to-r from-red-600 to-orange-500 hover:from-red-500 hover:to-orange-400 text-white rounded-xl transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Send size={20} />
          </button>
        </div>
      </div>
    </div>
  );
}
