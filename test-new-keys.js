#!/usr/bin/env node

/**
 * Test the updated environment configuration with new keys
 */

import fs from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

console.log('🔑 Testing Updated Environment Configuration\n='.repeat(50));

// Read the env file
const envPath = join(__dirname, 'env');
let envContent = '';

try {
  envContent = fs.readFileSync(envPath, 'utf8');
  console.log('✅ Environment file found');
} catch (error) {
  console.log('❌ Could not read environment file:', error.message);
  process.exit(1);
}

// Parse environment variables
const envVars = {};
envContent.split('\n').forEach(line => {
  if (line.trim() && !line.startsWith('#')) {
    const [key, value] = line.split('=');
    if (key && value) {
      envVars[key.trim()] = value.trim();
    }
  }
});

console.log('\n📊 Environment Variables Status:');
console.log('='.repeat(50));

// Check required variables
const requiredVars = [
  'VITE_SUPABASE_URL',
  'VITE_SUPABASE_PUBLISHABLE_KEY'
];

const optionalVars = [
  'SUPABASE_SECRET_KEY',
  'TEST_USER_EMAIL',
  'TEST_USER_PW'
];

let allGood = true;

// Check required variables
requiredVars.forEach(varName => {
  if (envVars[varName]) {
    console.log(`✅ ${varName}: Present (${varName.includes('KEY') ? '***HIDDEN***' : envVars[varName]})`);
  } else {
    console.log(`❌ ${varName}: MISSING`);
    allGood = false;
  }
});

// Check optional variables
optionalVars.forEach(varName => {
  if (envVars[varName]) {
    console.log(`🔸 ${varName}: Present (${varName.includes('KEY') || varName.includes('PW') ? '***HIDDEN***' : envVars[varName]})`);
  } else {
    console.log(`⚪ ${varName}: Not set (optional)`);
  }
});

// Check for legacy variables that should be removed
const legacyVars = [
  'VITE_SUPABASE_ANON_KEY',
  'SERVICE_ROLE_KEY',
  'JWT_SECRET',
  'SUPABASE_ACCESS_TOKEN'
];

console.log('\n🗑️ Legacy Variables Check:');
console.log('='.repeat(50));

let legacyFound = false;
legacyVars.forEach(varName => {
  if (envVars[varName]) {
    console.log(`⚠️  ${varName}: STILL PRESENT (should be removed)`);
    legacyFound = true;
  } else {
    console.log(`✅ ${varName}: Properly removed`);
  }
});

// Validate Supabase URL format
if (envVars.VITE_SUPABASE_URL) {
  const urlPattern = /^https:\/\/[a-zA-Z0-9-]+\.supabase\.co$/;
  if (urlPattern.test(envVars.VITE_SUPABASE_URL)) {
    console.log('\n✅ Supabase URL format is valid');
  } else {
    console.log('\n⚠️  Supabase URL format may be incorrect');
    allGood = false;
  }
}

// Validate publishable key format
if (envVars.VITE_SUPABASE_PUBLISHABLE_KEY) {
  if (envVars.VITE_SUPABASE_PUBLISHABLE_KEY.startsWith('sb_publishable_')) {
    console.log('✅ Publishable key format is valid');
  } else {
    console.log('⚠️  Publishable key format may be incorrect (should start with sb_publishable_)');
    allGood = false;
  }
}

// Validate secret key format
if (envVars.SUPABASE_SECRET_KEY) {
  if (envVars.SUPABASE_SECRET_KEY.startsWith('sb_secret_')) {
    console.log('✅ Secret key format is valid');
  } else {
    console.log('⚠️  Secret key format may be incorrect (should start with sb_secret_)');
  }
}

console.log('\n' + '='.repeat(50));
console.log('📋 SUMMARY');
console.log('='.repeat(50));

if (allGood && !legacyFound) {
  console.log('🎉 EXCELLENT! Environment configuration is properly updated');
  console.log('✅ All required variables are present');
  console.log('✅ Legacy keys have been removed');
  console.log('✅ New publishable key format is correct');
} else if (!legacyFound) {
  console.log('⚠️  Configuration has issues but legacy keys are removed');
} else {
  console.log('🚨 Issues detected - please review the configuration');
}

console.log('\n📝 Next Steps:');
console.log('• Test database connectivity with new keys');
console.log('• Update any remaining test files');
console.log('• Run application to verify authentication works');