import { supabase } from '../lib/supabase';

class AuthError extends Error {
  constructor(message) {
    super(message);
    this.name = 'AuthError';
  }
}

const signUp = async (credentials) => {
  // Handle both object and individual parameter formats
  const { email, password, fullName } = typeof credentials === 'object' ? credentials : { email: arguments[0], password: arguments[1], fullName: arguments[2] };
  
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        full_name: fullName,
        display_name: fullName,
        name: fullName
      },
    },
  });

  if (error) {
    throw new AuthError(error.message);
  }

  if (data.user && data.user.identities && data.user.identities.length === 0) {
    throw new AuthError('This email is already in use. Please try another email.');
  }

  return data;
};

const signIn = async (email, password) => {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    throw new AuthError(error.message);
  }

  return data;
};

const signOut = async () => {
  const { error } = await supabase.auth.signOut();

  if (error) {
    throw new AuthError(error.message);
  }
};

const resetPassword = async (email) => {
  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${window.location.origin}/reset-password`,
  });

  if (error) {
    throw new AuthError(error.message);
  }
};

const updateProfile = async (updates) => {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    throw new AuthError('User not authenticated');
  }
  
  const { data, error } = await supabase
    .from('profiles')
    .update(updates)
    .eq('id', user.id)
    .select()
    .single();

  if (error) {
    throw new AuthError(error.message);
  }

  return data;
};

export const authService = {
  signUp,
  signIn,
  signOut,
  resetPassword,
  updateProfile,
};
