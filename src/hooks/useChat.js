import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { useLocation } from 'react-router-dom';

const useChat = () => {
  const [selectedChat, setSelectedChat] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [searchLoading, setSearchLoading] = useState(false);
  const [chatLoadingId, setChatLoadingId] = useState(null);
  const [messages, setMessages] = useState([]);
  const [messageInput, setMessageInput] = useState('');
  const [sending, setSending] = useState(false);
  const [otherUserProfile, setOtherUserProfile] = useState(null);
  const location = useLocation();
  const params = new URLSearchParams(location.search);
  const chatIdFromUrl = params.get('chatId');

  // User search handler
  useEffect(() => {
    if (!searchTerm) {
      setSearchResults([]);
      return;
    }
    setSearchLoading(true);
    const fetchUsers = async () => {
      const { data, error } = await supabase
        .from('profiles')
        .select('id, display_name, email, avatar_url')
        .ilike('display_name', `%${searchTerm}%`)
        .limit(10);
      setSearchResults(data || []);
      setSearchLoading(false);
    };
    const timeout = setTimeout(fetchUsers, 300);
    return () => clearTimeout(timeout);
  }, [searchTerm]);

  // Handler to start or open a chat with a user
  const handleStartChat = async (otherUserId) => {
    setChatLoadingId(otherUserId);
    const currentUser = supabase.auth.user();
    if (!currentUser) {
      alert('You must be logged in to start a chat.');
      setChatLoadingId(null);
      return;
    }
    const { data: chatId, error } = await supabase.rpc('find_or_create_one_to_one_chat', {
      user1: currentUser.id,
      user2: otherUserId
    });
    if (error) {
      alert('Error creating chat: ' + error.message);
      setChatLoadingId(null);
      return;
    }
    const { data: chat } = await supabase
      .from('chats')
      .select('*')
      .eq('id', chatId)
      .single();
    if (chat) {
      setSelectedChat({ ...chat, isNew: true });
      setSearchTerm('');
      setSearchResults([]);
    }
    setChatLoadingId(null);
  };

  // Fetch messages when selectedChat changes
  useEffect(() => {
    if (!selectedChat || !selectedChat.id) {
      setMessages([]);
      return;
    }
    let isMounted = true;
    const fetchMessages = async () => {
      const { data } = await supabase
        .from('messages')
        .select('id, sender_id, content, created_at')
        .eq('chat_id', selectedChat.id)
        .order('created_at', { ascending: true });
      if (isMounted) setMessages(data || []);
    };
    fetchMessages();
    const subscription = supabase
      .channel('messages')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'messages', filter: `chat_id=eq.${selectedChat.id}` }, payload => {
        setMessages(prev => [...prev, payload.new]);
      })
      .subscribe();
    return () => {
      isMounted = false;
      supabase.removeChannel(subscription);
    };
  }, [selectedChat]);

  // Send message handler
  const handleSendMessage = async () => {
    if (!messageInput.trim() || !selectedChat?.id) return;
    setSending(true);
    const currentUser = supabase.auth.user();
    if (!currentUser) {
      alert('You must be logged in to send messages.');
      setSending(false);
      return;
    }
    const { error } = await supabase.from('messages').insert({
      chat_id: selectedChat.id,
      sender_id: currentUser.id,
      content: messageInput.trim(),
    });
    if (error) {
      alert('Error sending message: ' + error.message);
    } else {
      setMessageInput('');
    }
    setSending(false);
  };

  useEffect(() => {
    if (chatIdFromUrl) {
      supabase
        .from('chats')
        .select('*')
        .eq('id', chatIdFromUrl)
        .single()
        .then(({ data }) => {
          if (data) setSelectedChat(data);
        });
    }
  }, [chatIdFromUrl]);

  // Fetch the other user's profile for the chat header and avatars
  useEffect(() => {
    if (selectedChat && selectedChat.id) {
      supabase
        .from('chat_members')
        .select('user_id')
        .eq('chat_id', selectedChat.id)
        .then(async ({ data }) => {
          const currentUser = supabase.auth.user();
          const other = data?.find(m => m.user_id !== currentUser?.id);
          if (other) {
            const { data: profile } = await supabase
              .from('profiles')
              .select('id, display_name, avatar_url')
              .eq('id', other.user_id)
              .single();
            setOtherUserProfile(profile);
          } else {
            setOtherUserProfile(null);
          }
        });
    }
  }, [selectedChat]);

  return {
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
  };
};

export default useChat;
