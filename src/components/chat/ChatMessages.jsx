import React, { useRef, useEffect } from 'react';
import { MessageSquare } from 'lucide-react';

const ChatMessages = ({ selectedChat, messages, messageInput, onMessageInputChange, onSendMessage, sending, otherUserProfile }) => {
  const messagesEndRef = useRef(null);

  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);

  return (
    <div className="hidden md:flex flex-1 flex-col">
      {selectedChat ? (
        <>
          {/* Chat Header */}
          <div className="flex items-center p-3 border-b border-gray-200 dark:border-gray-700/60 sticky top-0 bg-white/80 dark:bg-gray-900/80 backdrop-blur-md z-10 gap-3">
            {otherUserProfile?.avatar_url ? (
              <img src={otherUserProfile.avatar_url} className="w-10 h-10 rounded-full object-cover" alt={otherUserProfile.display_name} />
            ) : (
              <div className="w-10 h-10 rounded-full bg-purple-500 flex items-center justify-center text-white font-bold">
                {otherUserProfile?.display_name?.[0] || '?'}
              </div>
            )}
            <div>
              <h2 className="font-bold text-lg">{otherUserProfile?.display_name || 'Chat'}</h2>
              <p className="text-sm text-gray-500">Online</p>
            </div>
          </div>
          {/* Messages Area */}
          <div className="flex-1 p-6 flex flex-col gap-2 overflow-y-auto bg-gray-50 dark:bg-gray-800/50">
            {messages.length === 0 ? (
              <div className="text-center text-gray-500 my-8">
                <MessageSquare size={48} className="mx-auto text-gray-400" />
                <p className="mt-2">No messages yet.</p>
              </div>
            ) : (
              messages.map(msg => {
                const isMe = msg.sender_id === supabase.auth.user()?.id;
                return (
                  <div key={msg.id} className={`flex items-end gap-2 ${isMe ? 'justify-end' : 'justify-start'}`}>
                    {!isMe && otherUserProfile?.avatar_url && (
                      <img src={otherUserProfile.avatar_url} className="w-7 h-7 rounded-full object-cover mb-1" alt={otherUserProfile.display_name} />
                    )}
                    <div className={`rounded-2xl px-4 py-2 max-w-xs shadow text-sm relative ${isMe ? 'bg-blue-500 text-white rounded-br-md' : 'bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-100 rounded-bl-md'}`}>
                      {msg.content}
                      <div className="text-[10px] text-right text-gray-300 mt-1">{new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</div>
                      {/* Bubble tail */}
                      <span className={`absolute bottom-0 ${isMe ? 'right-0' : 'left-0'} w-3 h-3 ${isMe ? 'bg-blue-500' : 'bg-white dark:bg-gray-700'} rounded-bl-full rounded-br-full`} style={{ transform: isMe ? 'translateY(50%) rotate(45deg)' : 'translateY(50%) rotate(-45deg)' }} />
                    </div>
                  </div>
                );
              })
            )}
            <div ref={messagesEndRef} />
          </div>
          {/* Message Input */}
          <div className="p-4 bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-700/60">
            <div className="relative">
              <input 
                type="text" 
                placeholder="Type a message..."
                className="w-full bg-gray-100 dark:bg-gray-800 border-none rounded-xl pl-4 pr-12 py-3 focus:ring-2 focus:ring-blue-500 transition"
                value={messageInput}
                onChange={onMessageInputChange}
                onKeyDown={e => { if (e.key === 'Enter') onSendMessage(); }}
                disabled={sending}
              />
              <button
                className="absolute right-3 top-1/2 -translate-y-1/2 text-blue-500 hover:text-blue-600 disabled:opacity-60"
                onClick={onSendMessage}
                disabled={sending || !messageInput.trim()}
              >
                <MessageSquare size={22} />
              </button>
            </div>
          </div>
        </>
      ) : (
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center text-gray-500">
            <MessageSquare size={64} className="mx-auto" />
            <h2 className="mt-4 text-xl font-medium">Select a chat</h2>
            <p>Start a conversation from the list on the left.</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default ChatMessages;
