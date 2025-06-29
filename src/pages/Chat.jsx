import React from 'react';
import ChatSidebar from '../components/chat/ChatSidebar';
import ChatMessages from '../components/chat/ChatMessages';
import useChat from '../hooks/useChat';

// Placeholder data for chat conversations
const placeholderChats = [
  { id: 1, name: 'Dr. Evelyn Reed', message: 'Just reviewing the latest cardiology case studies. Fascinating stuff!', time: '10:42 AM', unread: 2, avatar: 'https://images.unsplash.com/photo-1580894908361-967195033215?w=100&h=100&fit=crop&crop=faces' },
  { id: 2, name: 'Anatomy Study Group', message: 'Alex: Don\'t forget the pop quiz on cranial nerves tomorrow!', time: '9:15 AM', unread: 5, avatar: null },
  { id: 3, name: 'Dr. Ben Carter', message: 'Great work on the presentation today.', time: 'Yesterday', unread: 0, avatar: 'https://images.unsplash.com/photo-1556157382-97eda2d62296?w=100&h=100&fit=crop&crop=faces' },
  { id: 4, name: 'Pharmacology Q&A', message: 'You: Can anyone explain the mechanism of action for loop diuretics?', time: 'Yesterday', unread: 0, avatar: null },
  { id: 5, name: 'Julia Martinez', message: 'See you at the library later?', time: 'Wednesday', unread: 0, avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&h=100&fit=crop&crop=faces' },
  { id: 6, name: 'Archived Chats', message: 'You have 3 archived conversations.', time: 'Tuesday', unread: 0, avatar: 'archive' },
];

const ChatPage = () => {
  const {
    selectedChat,
    setSelectedChat,
    searchTerm,
    setSearchTerm,
    searchResults,
    searchLoading,
    chatLoadingId,
    messages,
    messageInput,
    setMessageInput,
    sending,
    otherUserProfile,
    handleStartChat,
    handleSendMessage
  } = useChat();

  return (
    <div className="flex h-full bg-white dark:bg-gray-900 text-gray-800 dark:text-gray-200">
      <ChatSidebar
        chats={placeholderChats}
        selectedChat={selectedChat}
        onSelectChat={setSelectedChat}
        searchTerm={searchTerm}
        onSearchChange={(e) => setSearchTerm(e.target.value)}
        searchResults={searchResults}
        searchLoading={searchLoading}
        onStartChat={handleStartChat}
        chatLoadingId={chatLoadingId}
      />
      <ChatMessages
        selectedChat={selectedChat}
        messages={messages}
        messageInput={messageInput}
        onMessageInputChange={(e) => setMessageInput(e.target.value)}
        onSendMessage={handleSendMessage}
        sending={sending}
        otherUserProfile={otherUserProfile}
      />
    </div>
  );
};

export default ChatPage;
