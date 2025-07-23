#!/usr/bin/env node

/**
 * Test .env.local file configuration
 */

import fs from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

console.log('🔧 Testing .env.local Configuration\n' + '='.repeat(50));

// Check if .env.local exists
const envLocalPath = join(__dirname, '.env.local');

try {
  const envLocalContent = fs.readFileSync(envLocalPath, 'utf8');
  console.log('✅ .env.local file found and readable');
  
  // Parse environment variables
  const envVars = {};
  envLocalContent.split('\n').forEach(line => {
    if (line.trim() && !line.startsWith('#')) {
      const [key, value] = line.split('=');
      if (key && value) {
        envVars[key.trim()] = value.trim();
      }
    }
  });
  
  console.log('\n📊 Environment Variables in .env.local:');
  console.log('='.repeat(50));
  
  const requiredVars = [
    'VITE_SUPABASE_URL',
    'VITE_SUPABASE_PUBLISHABLE_KEY'
  ];
  
  let allGood = true;
  
  requiredVars.forEach(varName => {
    if (envVars[varName]) {
      console.log(`✅ ${varName}: ${varName.includes('KEY') ? '***HIDDEN***' : envVars[varName]}`);
    } else {
      console.log(`❌ ${varName}: MISSING`);
      allGood = false;
    }
  });
  
  // Check optional vars
  const optionalVars = ['SUPABASE_SECRET_KEY', 'TEST_USER_EMAIL', 'TEST_USER_PW'];
  
  optionalVars.forEach(varName => {
    if (envVars[varName]) {
      console.log(`🔸 ${varName}: ${varName.includes('KEY') || varName.includes('PW') ? '***HIDDEN***' : envVars[varName]}`);
    }
  });
  
  console.log('\n🔍 Validation:');
  console.log('='.repeat(50));
  
  // Validate Supabase URL
  if (envVars.VITE_SUPABASE_URL && envVars.VITE_SUPABASE_URL.includes('supabase.co')) {
    console.log('✅ Supabase URL format looks correct');
  } else {
    console.log('⚠️  Supabase URL format may be incorrect');
    allGood = false;
  }
  
  // Validate publishable key
  if (envVars.VITE_SUPABASE_PUBLISHABLE_KEY && envVars.VITE_SUPABASE_PUBLISHABLE_KEY.startsWith('sb_publishable_')) {
    console.log('✅ Publishable key format is correct');
  } else {
    console.log('⚠️  Publishable key format is incorrect (should start with sb_publishable_)');
    allGood = false;
  }
  
  console.log('\n' + '='.repeat(50));
  console.log('📋 SUMMARY');
  console.log('='.repeat(50));
  
  if (allGood) {
    console.log('🎉 EXCELLENT! .env.local is properly configured');
    console.log('✅ Vite will now read these environment variables');
    console.log('✅ Authentication should work in the browser');
  } else {
    console.log('⚠️  Issues detected in .env.local configuration');
  }
  
} catch (error) {
  console.log(`❌ Could not read .env.local file: ${error.message}`);
  console.log('\n💡 The app expects a .env.local file for Vite to read environment variables');
  console.log('This is likely why you\'re seeing the "Supabase Not Configured" error');
}

console.log('\n📝 Instructions for Development:');
console.log('• The .env.local file is for local development');
console.log('• It should NOT be committed to git (already in .gitignore)');
console.log('• Restart your dev server after creating/modifying .env.local');
console.log('• The app should now recognize the Supabase configuration');