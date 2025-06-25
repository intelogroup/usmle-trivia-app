import { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';

const SecurityContext = createContext();

export const useSecurity = () => {
  const context = useContext(SecurityContext);
  if (!context) {
    throw new Error('useSecurity must be used within a SecurityProvider');
  }
  return context;
};

export const SecurityProvider = ({ children }) => {
  const { user } = useAuth();
  const [securityVerified, setSecurityVerified] = useState(false);
  const [securityError, setSecurityError] = useState(null);

  useEffect(() => {
    const verifyUserSecurity = async () => {
      if (!user) {
        setSecurityVerified(false);
        return;
      }

      try {
        // Verify user can only access their own data
        const { data: profile, error: profileError } = await supabase
          .from('profiles')
          .select('id, email')
          .eq('id', user.id)
          .single();

        if (profileError) {
          throw new Error('Profile access verification failed');
        }

        if (profile.id !== user.id) {
          throw new Error('Security violation: Profile ID mismatch');
        }

        // Test RLS policies by trying to access other users' data (should fail)
        const { data: otherUsersData, error: otherUsersError } = await supabase
          .from('user_question_history')
          .select('*')
          .neq('user_id', user.id)
          .limit(1);

        // If we get data back, RLS is not working properly
        if (otherUsersData && otherUsersData.length > 0) {
          throw new Error('Security violation: Can access other users\' data');
        }

        setSecurityVerified(true);
        setSecurityError(null);
      } catch (error) {
        console.error('Security verification failed:', error);
        setSecurityError(error.message);
        setSecurityVerified(false);
      }
    };

    verifyUserSecurity();
  }, [user]);

  /**
   * Secure query wrapper that automatically adds user filtering
   */
  const secureQuery = (tableName) => {
    if (!user) {
      throw new Error('User not authenticated');
    }

    const query = supabase.from(tableName);
    
    // Add user filtering for user-specific tables
    const userTables = [
      'user_question_history',
      'quiz_sessions', 
      'quiz_responses',
      'user_tag_scores',
      'question_feedback',
      'learning_history'
    ];

    if (userTables.includes(tableName)) {
      return query.eq('user_id', user.id);
    }

    return query;
  };

  /**
   * Secure insert wrapper that automatically adds user ID
   */
  const secureInsert = (tableName, data) => {
    if (!user) {
      throw new Error('User not authenticated');
    }

    const userTables = [
      'user_question_history',
      'quiz_sessions',
      'user_tag_scores', 
      'question_feedback',
      'learning_history'
    ];

    if (userTables.includes(tableName)) {
      return supabase
        .from(tableName)
        .insert({ ...data, user_id: user.id });
    }

    return supabase.from(tableName).insert(data);
  };

  /**
   * Secure update wrapper that ensures user can only update their own data
   */
  const secureUpdate = (tableName, data, filters = {}) => {
    if (!user) {
      throw new Error('User not authenticated');
    }

    const userTables = [
      'profiles',
      'user_question_history',
      'quiz_sessions',
      'user_tag_scores',
      'question_feedback'
    ];

    let query = supabase.from(tableName).update(data);

    // Add user filtering for user-specific tables
    if (userTables.includes(tableName)) {
      query = query.eq('user_id', user.id);
    }

    // Add additional filters
    Object.entries(filters).forEach(([key, value]) => {
      query = query.eq(key, value);
    });

    return query;
  };

  /**
   * Verify user owns a resource before allowing access
   */
  const verifyOwnership = async (tableName, resourceId, userIdField = 'user_id') => {
    if (!user) {
      throw new Error('User not authenticated');
    }

    const { data, error } = await supabase
      .from(tableName)
      .select(userIdField)
      .eq('id', resourceId)
      .single();

    if (error) {
      throw new Error(`Resource verification failed: ${error.message}`);
    }

    if (data[userIdField] !== user.id) {
      throw new Error('Access denied: You do not own this resource');
    }

    return true;
  };

  const value = {
    securityVerified,
    securityError,
    secureQuery,
    secureInsert,
    secureUpdate,
    verifyOwnership,
    userId: user?.id || null
  };

  return (
    <SecurityContext.Provider value={value}>
      {children}
    </SecurityContext.Provider>
  );
};

export default SecurityProvider; 