import { test, expect } from '@playwright/test';

/**
 * Simple USMLE Trivia App Testing with Debug Tools and Screenshots
 * Test user: jimkalinov@gmail.com
 */

// Configure test settings for debugging
test.use({
  screenshot: 'always',
  video: 'on',
  trace: 'on',
  actionTimeout: 15000,
  navigationTimeout: 30000
});

test.describe('USMLE Trivia App - Simple Debug Test', () => {

  test('should load app and capture debug screenshots', async ({ page }) => {
    console.log('🚀 Starting app debug test...');
    
    // Enable detailed logging
    page.on('console', msg => {
      console.log(`🔍 Console [${msg.type()}]: ${msg.text()}`);
    });
    
    page.on('pageerror', err => {
      console.log(`❌ Page Error: ${err.message}`);
    });
    
    // Navigate to app
    console.log('📱 Navigating to app...');
    await page.goto('http://localhost:5173');
    
    // Wait for page to load
    await page.waitForLoadState('networkidle');
    
    // Take initial screenshot
    await page.screenshot({ 
      path: `test-results/01-app-loaded-${Date.now()}.png`,
      fullPage: true 
    });
    console.log('📸 Initial screenshot taken');
    
    // Check page title
    const title = await page.title();
    console.log(`📄 Page title: ${title}`);
    
    // Look for main elements
    const headings = await page.locator('h1, h2, h3').allTextContents();
    console.log(`📑 Headings found: ${headings.join(', ')}`);
    
    // Look for buttons
    const buttons = await page.locator('button').count();
    console.log(`🔘 Buttons found: ${buttons}`);
    
    // Try to find authentication elements
    const authElements = [
      'text=Login',
      'text=Sign Up', 
      'text=Get Started',
      'input[type="email"]',
      'input[type="password"]'
    ];
    
    for (const selector of authElements) {
      const element = page.locator(selector);
      const count = await element.count();
      if (count > 0) {
        console.log(`✅ Found auth element: ${selector} (${count} instances)`);
      }
    }
    
    // Take screenshot of current state
    await page.screenshot({ 
      path: `test-results/02-auth-elements-check-${Date.now()}.png`,
      fullPage: true 
    });
    
    // Try to navigate to login if available
    try {
      const loginBtn = page.locator('text=Login, button:has-text("Login"), a[href*="login"]').first();
      if (await loginBtn.isVisible({ timeout: 5000 })) {
        console.log('🔐 Found login button, clicking...');
        await loginBtn.click();
        await page.waitForTimeout(3000);
        
        // Screenshot after login click
        await page.screenshot({ 
          path: `test-results/03-after-login-click-${Date.now()}.png`,
          fullPage: true 
        });
        
        // Try to fill login form with test user
        const emailInput = page.locator('input[type="email"], input[name="email"]').first();
        const passwordInput = page.locator('input[type="password"]').first();
        
        if (await emailInput.isVisible({ timeout: 5000 })) {
          console.log('📧 Filling email field...');
          await emailInput.fill('jimkalinov@gmail.com');
          
          await page.screenshot({ 
            path: `test-results/04-email-filled-${Date.now()}.png`,
            fullPage: true 
          });
        }
        
        if (await passwordInput.isVisible({ timeout: 5000 })) {
          console.log('🔒 Filling password field...');
          await passwordInput.fill('TestPassword123!');
          
          await page.screenshot({ 
            path: `test-results/05-password-filled-${Date.now()}.png`,
            fullPage: true 
          });
        }
        
      } else {
        console.log('🔍 No login button found, trying direct navigation...');
        await page.goto('http://localhost:5173/auth/login');
        await page.waitForTimeout(3000);
        
        await page.screenshot({ 
          path: `test-results/03-direct-login-nav-${Date.now()}.png`,
          fullPage: true 
        });
      }
    } catch (error) {
      console.log(`❌ Login test failed: ${error.message}`);
      await page.screenshot({ 
        path: `test-results/error-login-failed-${Date.now()}.png`,
        fullPage: true 
      });
    }
    
    // Test different viewport sizes
    console.log('📱 Testing mobile viewport...');
    await page.setViewportSize({ width: 375, height: 667 });
    await page.waitForTimeout(2000);
    
    await page.screenshot({ 
      path: `test-results/06-mobile-viewport-${Date.now()}.png`,
      fullPage: true 
    });
    
    // Test tablet viewport
    console.log('📱 Testing tablet viewport...');
    await page.setViewportSize({ width: 768, height: 1024 });
    await page.waitForTimeout(2000);
    
    await page.screenshot({ 
      path: `test-results/07-tablet-viewport-${Date.now()}.png`,
      fullPage: true 
    });
    
    // Test desktop viewport
    console.log('🖥️ Testing desktop viewport...');
    await page.setViewportSize({ width: 1920, height: 1080 });
    await page.waitForTimeout(2000);
    
    await page.screenshot({ 
      path: `test-results/08-desktop-viewport-${Date.now()}.png`,
      fullPage: true 
    });
    
    // Try to navigate to quiz sections
    const quizPaths = ['/quiz', '/quick-quiz', '/custom-quiz-setup'];
    
    for (const path of quizPaths) {
      try {
        console.log(`🎯 Testing quiz path: ${path}`);
        await page.goto(`http://localhost:5173${path}`);
        await page.waitForTimeout(3000);
        
        await page.screenshot({ 
          path: `test-results/09-quiz-${path.replace('/', '')}-${Date.now()}.png`,
          fullPage: true 
        });
        
        const content = await page.textContent('body');
        console.log(`📄 ${path} content preview: ${content?.substring(0, 100)}...`);
        
      } catch (error) {
        console.log(`❌ Failed to test ${path}: ${error.message}`);
      }
    }
    
    console.log('✅ Debug test completed successfully!');
  });

});