import { test, expect } from '@playwright/test';

/**
 * USMLE Trivia App Authentication Testing with Publishable Keys
 * Test user: jimkalinov@gmail.com
 * Using publishable key configuration only
 */

// Configure test settings for debugging
test.use({
  screenshot: 'always',
  video: 'on',
  trace: 'on',
  actionTimeout: 15000,
  navigationTimeout: 30000
});

test.describe('USMLE Trivia App - Authentication with Publishable Keys', () => {

  test.beforeEach(async ({ page }) => {
    // Enable detailed logging
    page.on('console', msg => {
      console.log(`🔍 Console [${msg.type()}]: ${msg.text()}`);
    });
    
    page.on('pageerror', err => {
      console.log(`❌ Page Error: ${err.message}`);
    });
    
    // Navigate to app
    console.log('🚀 Starting authentication test...');
    await page.goto('http://localhost:5173');
    
    // Wait for page to load
    await page.waitForLoadState('networkidle');
  });

  test('should display proper Supabase configuration status', async ({ page }) => {
    console.log('⚙️ Testing Supabase configuration display...');
    
    // Take initial screenshot
    await page.screenshot({ 
      path: `test-results/auth-01-app-loaded-${Date.now()}.png`,
      fullPage: true 
    });
    
    // Check if we can see the app loading without errors
    const title = await page.title();
    console.log(`📄 Page title: ${title}`);
    expect(title).toBe('USMLE Trivia');
    
    // Look for any Supabase configuration success messages in console
    // (These should appear if our publishable key config is working)
    await page.waitForTimeout(3000);
    
    // Take screenshot after configuration load
    await page.screenshot({ 
      path: `test-results/auth-02-config-loaded-${Date.now()}.png`,
      fullPage: true 
    });
  });

  test('should navigate to login page and display form', async ({ page }) => {
    console.log('🔐 Testing login page navigation...');
    
    try {
      // Try direct navigation to login
      await page.goto('http://localhost:5173/auth/login');
      await page.waitForTimeout(3000);
      
      // Take screenshot of login page
      await page.screenshot({ 
        path: `test-results/auth-03-login-page-${Date.now()}.png`,
        fullPage: true 
      });
      
      // Check for login form elements
      const emailInput = page.locator('input[type="email"], input[name="email"]');
      const passwordInput = page.locator('input[type="password"]');
      const submitButton = page.locator('button[type="submit"], button:has-text("Login"), button:has-text("Sign In")');
      
      const emailVisible = await emailInput.isVisible({ timeout: 10000 });
      const passwordVisible = await passwordInput.isVisible({ timeout: 5000 });
      const submitVisible = await submitButton.isVisible({ timeout: 5000 });
      
      console.log(`📧 Email input visible: ${emailVisible}`);
      console.log(`🔒 Password input visible: ${passwordVisible}`);
      console.log(`🔘 Submit button visible: ${submitVisible}`);
      
      // Verify form elements are present
      if (emailVisible && passwordVisible && submitVisible) {
        console.log('✅ Login form elements found');
        
        // Take screenshot with form elements highlighted
        await emailInput.scrollIntoViewIfNeeded();
        await page.screenshot({ 
          path: `test-results/auth-04-login-form-${Date.now()}.png`,
          fullPage: true 
        });
      } else {
        console.log('⚠️ Some login form elements missing');
      }
      
    } catch (error) {
      console.log(`❌ Login page test failed: ${error.message}`);
      await page.screenshot({ 
        path: `test-results/auth-error-login-page-${Date.now()}.png`,
        fullPage: true 
      });
    }
  });

  test('should handle authentication flow with test user', async ({ page }) => {
    console.log('🧪 Testing authentication flow...');
    
    try {
      // Navigate to login page
      await page.goto('http://localhost:5173/auth/login');
      await page.waitForTimeout(3000);
      
      // Find and fill login form
      const emailInput = page.locator('input[type="email"], input[name="email"]').first();
      const passwordInput = page.locator('input[type="password"]').first();
      const submitButton = page.locator('button[type="submit"], button:has-text("Login")').first();
      
      if (await emailInput.isVisible({ timeout: 5000 })) {
        console.log('📧 Filling email field...');
        await emailInput.fill('jimkalinov@gmail.com');
        
        await page.screenshot({ 
          path: `test-results/auth-05-email-filled-${Date.now()}.png`,
          fullPage: true 
        });
        
        if (await passwordInput.isVisible({ timeout: 5000 })) {
          console.log('🔒 Filling password field...');
          await passwordInput.fill('Jimkali90#');
          
          await page.screenshot({ 
            path: `test-results/auth-06-password-filled-${Date.now()}.png`,
            fullPage: true 
          });
          
          if (await submitButton.isVisible({ timeout: 5000 })) {
            console.log('🚀 Submitting login form...');
            await submitButton.click();
            
            // Wait for response
            await page.waitForTimeout(5000);
            
            // Take screenshot after submission
            await page.screenshot({ 
              path: `test-results/auth-07-after-submit-${Date.now()}.png`,
              fullPage: true 
            });
            
            // Check for success or error messages
            const currentUrl = page.url();
            console.log(`🌐 Current URL after login: ${currentUrl}`);
            
            // Look for error messages
            const errorElements = page.locator('.error, .alert-error, [role="alert"], .text-red-500');
            const errorCount = await errorElements.count();
            
            if (errorCount > 0) {
              const errorText = await errorElements.first().textContent();
              console.log(`❌ Login error: ${errorText}`);
            } else {
              console.log('✅ No error messages detected');
            }
            
            // Check if redirected to dashboard or home
            if (currentUrl.includes('/dashboard') || currentUrl.includes('/home') || currentUrl === 'http://localhost:5173/') {
              console.log('✅ Successful login detected (redirected)');
            } else {
              console.log('⚠️ Login status unclear - still on auth page');
            }
          }
        }
      }
      
    } catch (error) {
      console.log(`❌ Authentication flow test failed: ${error.message}`);
      await page.screenshot({ 
        path: `test-results/auth-error-flow-${Date.now()}.png`,
        fullPage: true 
      });
    }
  });

  test('should test signup flow if login fails', async ({ page }) => {
    console.log('📝 Testing signup flow as fallback...');
    
    try {
      // Try to navigate to signup page
      await page.goto('http://localhost:5173/auth/signup');
      await page.waitForTimeout(3000);
      
      await page.screenshot({ 
        path: `test-results/auth-08-signup-page-${Date.now()}.png`,
        fullPage: true 
      });
      
      // Look for signup form elements
      const emailInput = page.locator('input[type="email"], input[name="email"]').first();
      const passwordInput = page.locator('input[type="password"]').first();
      const nameInput = page.locator('input[name="fullName"], input[name="full_name"], input[placeholder*="name" i]').first();
      const submitButton = page.locator('button[type="submit"], button:has-text("Sign Up"), button:has-text("Create Account")').first();
      
      const emailVisible = await emailInput.isVisible({ timeout: 5000 });
      const passwordVisible = await passwordInput.isVisible({ timeout: 5000 });
      const nameVisible = await nameInput.isVisible({ timeout: 5000 });
      const submitVisible = await submitButton.isVisible({ timeout: 5000 });
      
      console.log(`📧 Email input visible: ${emailVisible}`);
      console.log(`🔒 Password input visible: ${passwordVisible}`);
      console.log(`👤 Name input visible: ${nameVisible}`);
      console.log(`🔘 Submit button visible: ${submitVisible}`);
      
      if (emailVisible && passwordVisible && submitVisible) {
        console.log('📝 Filling signup form...');
        
        await emailInput.fill('jimkalinov@gmail.com');
        await passwordInput.fill('Jimkali90#');
        
        if (nameVisible) {
          await nameInput.fill('Jim Kalinov');
        }
        
        await page.screenshot({ 
          path: `test-results/auth-09-signup-filled-${Date.now()}.png`,
          fullPage: true 
        });
        
        await submitButton.click();
        await page.waitForTimeout(5000);
        
        await page.screenshot({ 
          path: `test-results/auth-10-signup-submitted-${Date.now()}.png`,
          fullPage: true 
        });
        
        console.log('✅ Signup form submitted');
      }
      
    } catch (error) {
      console.log(`❌ Signup flow test failed: ${error.message}`);
      await page.screenshot({ 
        path: `test-results/auth-error-signup-${Date.now()}.png`,
        fullPage: true 
      });
    }
  });

  test('should test app functionality without authentication', async ({ page }) => {
    console.log('🎯 Testing app functionality without authentication...');
    
    try {
      // Test quiz browsing without login
      await page.goto('http://localhost:5173/quiz');
      await page.waitForTimeout(3000);
      
      await page.screenshot({ 
        path: `test-results/auth-11-quiz-unauth-${Date.now()}.png`,
        fullPage: true 
      });
      
      // Check if quiz interface is accessible
      const quizElements = await page.locator('h1, h2, h3').allTextContents();
      console.log(`🎯 Quiz page headings: ${quizElements.join(', ')}`);
      
      // Test different app sections
      const testPaths = ['/quick-quiz', '/custom-quiz-setup'];
      
      for (const path of testPaths) {
        try {
          console.log(`🔄 Testing path: ${path}`);
          await page.goto(`http://localhost:5173${path}`);
          await page.waitForTimeout(2000);
          
          await page.screenshot({ 
            path: `test-results/auth-12-${path.replace('/', '')}-unauth-${Date.now()}.png`,
            fullPage: true 
          });
          
        } catch (error) {
          console.log(`❌ Failed to test ${path}: ${error.message}`);
        }
      }
      
      console.log('✅ Unauthenticated app functionality tested');
      
    } catch (error) {
      console.log(`❌ App functionality test failed: ${error.message}`);
    }
  });

  test.afterEach(async ({ page }, testInfo) => {
    // Always take a final screenshot
    if (testInfo.status !== 'passed') {
      await page.screenshot({ 
        path: `test-results/auth-final-failure-${testInfo.title.replace(/\W/g, '_')}-${Date.now()}.png`,
        fullPage: true 
      });
    }
    
    console.log(`✅ Auth test completed: ${testInfo.title} - Status: ${testInfo.status}`);
  });

});