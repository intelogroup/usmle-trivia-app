#!/usr/bin/env node

/**
 * Fix Test User Password
 * Updates the test user password using admin privileges
 */

import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseSecretKey = process.env.SUPABASE_SECRET_KEY;
const supabasePublishableKey = process.env.VITE_SUPABASE_PUBLISHABLE_KEY;
const testUserEmail = process.env.TEST_USER_EMAIL || 'jimkalinov@gmail.com';
const testUserPassword = process.env.TEST_USER_PW || 'Jimkali90#';

console.log('🔧 Fixing Test User Password...');
console.log(`📧 Email: ${testUserEmail}`);
console.log(`🔑 New Password: ${testUserPassword}`);

// Create admin client
const supabaseAdmin = createClient(supabaseUrl, supabaseSecretKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

// Create client for testing
const supabaseClient = createClient(supabaseUrl, supabasePublishableKey);

async function fixUserPassword() {
  try {
    // Find the user
    console.log('\n1️⃣ Finding test user...');
    const { data: { users }, error: listError } = await supabaseAdmin.auth.admin.listUsers();
    
    if (listError) {
      throw new Error(`Failed to list users: ${listError.message}`);
    }
    
    const user = users.find(u => u.email === testUserEmail);
    
    if (!user) {
      throw new Error('Test user not found');
    }
    
    console.log('✅ User found:', user.id);
    
    // Update the password
    console.log('\n2️⃣ Updating password...');
    const { data: updateData, error: updateError } = await supabaseAdmin.auth.admin.updateUserById(
      user.id,
      { password: testUserPassword }
    );
    
    if (updateError) {
      throw new Error(`Failed to update password: ${updateError.message}`);
    }
    
    console.log('✅ Password updated successfully');
    
    // Test the new password
    console.log('\n3️⃣ Testing new password...');
    const { data: signInData, error: signInError } = await supabaseClient.auth.signInWithPassword({
      email: testUserEmail,
      password: testUserPassword
    });
    
    if (signInError) {
      throw new Error(`Sign in test failed: ${signInError.message}`);
    }
    
    console.log('✅ Sign in test successful');
    console.log('👤 User ID:', signInData.user.id);
    
    // Sign out
    await supabaseClient.auth.signOut();
    
    console.log('\n🎉 Password fix completed successfully!');
    console.log('📝 Test Credentials:');
    console.log(`Email: ${testUserEmail}`);
    console.log(`Password: ${testUserPassword}`);
    
    return true;
    
  } catch (error) {
    console.error('❌ Password fix failed:', error.message);
    return false;
  }
}

// Run the fix
fixUserPassword().then(success => {
  if (success) {
    console.log('\n✅ Ready for authentication testing!');
  } else {
    console.log('\n❌ Fix failed. Please check the errors above.');
    process.exit(1);
  }
}).catch(error => {
  console.error('💥 Script failed:', error);
  process.exit(1);
});