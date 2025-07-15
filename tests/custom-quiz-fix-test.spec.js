import { test, expect } from '@playwright/test';

test.describe('Custom Quiz Fix Verification', () => {
  
  // Helper function to login
  async function loginUser(page) {
    await page.goto('http://localhost:5173/login', { timeout: 30000 });
    await page.waitForLoadState('networkidle');
    
    await page.fill('input[type="email"]', 'jimkalinov@gmail.com');
    await page.fill('input[type="password"]', 'Jimkali90#');
    
    await page.waitForFunction(() => {
      const button = document.querySelector('button[type="submit"]');
      return button && !button.disabled;
    }, { timeout: 10000 });
    
    await page.click('button[type="submit"]');
    await page.waitForURL('http://localhost:5173/', { timeout: 10000 });
    console.log('✅ User logged in successfully');
  }

  test('Custom Quiz Setup - UUID Error Fix', async ({ page }) => {
    console.log('🚀 Testing Custom Quiz UUID Error Fix');
    
    // Capture console errors specifically
    const consoleErrors = [];
    
    page.on('console', msg => {
      if (msg.type() === 'error') {
        const text = msg.text();
        consoleErrors.push(text);
        console.log('🚨 Console Error:', text);
      }
    });
    
    try {
      // Step 1: Login
      await loginUser(page);
      
      // Step 2: Navigate to Custom Quiz Setup
      console.log('\n📍 Step 2: Navigate to Custom Quiz Setup');
      await page.goto('http://localhost:5173/custom-quiz-setup', { timeout: 15000 });
      await page.waitForLoadState('networkidle');
      
      // Step 3: Select Cardiology (this previously caused UUID error)
      console.log('\n📍 Step 3: Select Cardiology category');
      const cardiologyButton = page.locator('button').filter({ hasText: /cardiology/i }).first();
      if (await cardiologyButton.isVisible()) {
        await cardiologyButton.click();
        await page.waitForTimeout(2000); // Wait for systems to load
        console.log('✅ Selected Cardiology category');
      }
      
      // Step 4: Check for UUID errors
      console.log('\n📍 Step 4: Check for UUID-related errors');
      
      const uuidErrors = consoleErrors.filter(error => 
        error.includes('uuid') || 
        error.includes('UUID') ||
        error.includes('invalid input syntax')
      );
      
      if (uuidErrors.length === 0) {
        console.log('✅ No UUID errors detected - fix successful!');
      } else {
        console.log('❌ UUID errors still present:');
        uuidErrors.forEach((error, i) => console.log(`${i + 1}. ${error}`));
      }
      
      // Step 5: Try to start a quiz to ensure functionality still works
      console.log('\n📍 Step 5: Test quiz start functionality');
      
      const startButton = page.locator('button').filter({ hasText: /start.*quiz/i }).first();
      if (await startButton.isVisible() && await startButton.isEnabled()) {
        await startButton.click();
        await page.waitForTimeout(3000);
        
        const currentUrl = page.url();
        if (currentUrl.includes('/custom-quiz')) {
          console.log('✅ Custom quiz started successfully');
          
          // Check if questions are loading
          const pageContent = await page.textContent('body');
          if (pageContent.includes('patient') || pageContent.includes('year-old')) {
            console.log('✅ Questions are loading properly');
          } else {
            console.log('⚠️ Questions may not be loading yet');
          }
        } else {
          console.log('❌ Did not navigate to custom quiz');
        }
      } else {
        console.log('⚠️ Start button not available or enabled');
      }
      
      await page.screenshot({ path: 'custom-quiz-fix-test.png', fullPage: true });
      
      // Verify no critical UUID errors
      expect(uuidErrors.length).toBe(0);
      
    } catch (error) {
      console.error('🚨 Test error:', error);
      await page.screenshot({ path: 'custom-quiz-fix-error.png', fullPage: true });
      throw error;
    }
    
    console.log('\n📊 Test Summary:');
    console.log(`Total console errors: ${consoleErrors.length}`);
    console.log(`UUID-related errors: ${consoleErrors.filter(e => e.includes('uuid') || e.includes('UUID')).length}`);
  });
});
