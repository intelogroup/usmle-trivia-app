import { supabase } from '../lib/supabase';

class AuthError extends Error {
  constructor(message) {
    super(message);
    this.name = 'AuthError';
  }
}

const signUp = async ({ email, password, fullName }) => {
  console.log('🔐 [AuthService] Attempting signup:', { email, fullName });

  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        full_name: fullName,
      },
    },
  });

  if (error) {
    console.error('❌ [AuthService] Signup error:', error);
    throw new AuthError(error.message);
  }

  if (data.user && data.user.identities && data.user.identities.length === 0) {
    console.warn('⚠️ [AuthService] Email already in use:', email);
    throw new AuthError('This email is already in use. Please try another email.');
  }

  console.log('✅ [AuthService] Signup successful:', { userId: data.user?.id });
  return { user: data.user, error: null };
};

const signIn = async ({ email, password }) => {
  console.log('🔐 [AuthService] Attempting signin:', { email });

  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    console.error('❌ [AuthService] Signin error:', error);
    throw new AuthError(error.message);
  }

  console.log('✅ [AuthService] Signin successful:', { userId: data.user?.id });
  return { user: data.user, error: null };
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
