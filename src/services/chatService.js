import { supabase } from '../lib/supabase';

export async function startChatWithUser(otherUserId) {
  const currentUser = supabase.auth.user();
  if (!currentUser) throw new Error('Not logged in');
  const { data: chatId, error } = await supabase.rpc('find_or_create_one_to_one_chat', {
    user1: currentUser.id,
    user2: otherUserId
  });
  if (error) throw error;
  return chatId;
} 