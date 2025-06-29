import React from 'react';
import { motion } from 'framer-motion';
import { Archive } from 'lucide-react';

const ChatListItem = ({ chat, isActive, onClick }) => {
  const getInitials = (name) => name.split(' ').map(n => n[0]).join('');

  return (
    <motion.div
      onClick={onClick}
      className={`flex items-center p-3 rounded-2xl cursor-pointer transition-all duration-200 ${isActive ? 'bg-blue-500/20 dark:bg-blue-500/30' : 'hover:bg-gray-100 dark:hover:bg-gray-800/50'}`}
      whileTap={{ scale: 0.98 }}
    >
      <div className="relative w-12 h-12 mr-4">
        {chat.avatar === 'archive' ? (
           <div className="w-full h-full rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center">
             <Archive size={20} className="text-gray-500 dark:text-gray-400" />
           </div>
        ) : chat.avatar ? (
          <img src={chat.avatar} alt={chat.name} className="w-full h-full rounded-full object-cover" />
        ) : (
          <div className="w-full h-full rounded-full bg-purple-500 flex items-center justify-center">
            <span className="text-white font-bold text-lg">{getInitials(chat.name)}</span>
          </div>
        )}
        {chat.unread > 0 && (
          <div className="absolute top-0 right-0 w-5 h-5 bg-blue-500 rounded-full flex items-center justify-center text-white text-xs font-bold border-2 border-white dark:border-gray-900">
            {chat.unread}
          </div>
        )}
      </div>
      <div className="flex-1 overflow-hidden">
        <div className="flex justify-between items-center">
          <h3 className="font-bold text-gray-800 dark:text-gray-100 truncate">{chat.name}</h3>
          <p className={`text-xs ${chat.unread > 0 ? 'text-blue-500 dark:text-blue-400 font-semibold' : 'text-gray-400 dark:text-gray-500'}`}>{chat.time}</p>
        </div>
        <p className="text-sm text-gray-500 dark:text-gray-400 truncate">{chat.message}</p>
      </div>
    </motion.div>
  );
};

export default ChatListItem;
