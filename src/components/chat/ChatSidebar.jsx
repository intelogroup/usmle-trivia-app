import React from 'react';
import { Search } from 'lucide-react';
import ChatListItem from './ChatListItem';

const ChatSidebar = ({ chats, selectedChat, onSelectChat, searchTerm, onSearchChange, searchResults, searchLoading, onStartChat, chatLoadingId }) => {
  return (
    <div className="w-full md:w-1/3 lg:w-1/4 h-full border-r border-gray-200 dark:border-gray-700/60 flex flex-col">
      <div className="p-4 border-b border-gray-200 dark:border-gray-700/60 sticky top-0 bg-white/80 dark:bg-gray-900/80 backdrop-blur-md z-10">
        <h1 className="text-2xl font-bold">Chats</h1>
        <div className="relative mt-4">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder="Search users..."
            className="w-full bg-gray-100 dark:bg-gray-800 border-none rounded-xl pl-10 pr-4 py-2.5 focus:ring-2 focus:ring-blue-500 transition"
            value={searchTerm}
            onChange={onSearchChange}
          />
        </div>
        {searchLoading && <div className="text-xs text-gray-400 mt-2">Searching...</div>}
        {searchResults.length > 0 && (
          <div className="mt-2 bg-white dark:bg-gray-800 rounded-xl shadow p-2 max-h-60 overflow-y-auto">
            {searchResults.map(user => (
              <div key={user.id} className="flex items-center justify-between py-2 px-2 hover:bg-blue-50 dark:hover:bg-blue-900/30 rounded-lg transition">
                <div className="flex items-center gap-2">
                  {user.avatar_url ? (
                    <img src={user.avatar_url} alt={user.display_name} className="w-8 h-8 rounded-full object-cover" />
                  ) : (
                    <div className="w-8 h-8 rounded-full bg-purple-500 flex items-center justify-center text-white font-bold">{user.display_name?.[0]}</div>
                  )}
                  <div>
                    <div className="font-semibold text-sm">{user.display_name}</div>
                    <div className="text-xs text-gray-400">{user.email}</div>
                  </div>
                </div>
                <button
                  className="ml-2 px-3 py-1 bg-blue-500 text-white rounded-lg text-xs font-semibold hover:bg-blue-600 disabled:opacity-60"
                  onClick={() => onStartChat(user.id)}
                  disabled={chatLoadingId === user.id}
                >
                  {chatLoadingId === user.id ? 'Loading...' : 'Chat'}
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
      <div className="flex-1 overflow-y-auto p-2 space-y-1">
        {chats.map(chat => (
          <ChatListItem 
            key={chat.id} 
            chat={chat} 
            isActive={selectedChat?.id === chat.id} 
            onClick={() => onSelectChat(chat)} 
          />
        ))}
      </div>
    </div>
  );
};

export default ChatSidebar;
