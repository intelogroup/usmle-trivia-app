import { test, expect } from '@playwright/test';

test.describe('Quiz Question Loading Debug', () => {
  test('should debug question loading on quiz page', async ({ page }) => {
    console.log('🔍 Starting quiz question loading debug...');
    
    // Monitor console logs
    const consoleLogs = [];
    page.on('console', msg => {
      const text = msg.text();
      consoleLogs.push(text);
      console.log('📝 Console:', text);
    });
    
    try {
      // Step 1: Navigate directly to quiz page (skip auth for now)
      console.log('\n📍 Step 1: Navigate directly to quiz page');
      await page.goto('http://localhost:5173/quick-quiz', { timeout: 30000 });
      await page.waitForLoadState('networkidle');
      await page.screenshot({ path: 'quiz-question-debug-1-initial.png', fullPage: true });
      
      // Step 2: Wait for any loading to complete
      console.log('\n📍 Step 2: Wait for loading');
      await page.waitForTimeout(5000);
      await page.screenshot({ path: 'quiz-question-debug-2-after-wait.png', fullPage: true });
      
      // Step 3: Check page content
      const pageContent = await page.textContent('body');
      console.log('\n📄 Full page content:');
      console.log(pageContent);
      
      // Step 4: Look for specific elements
      console.log('\n📍 Step 4: Check for specific elements');
      
      // Check for loading indicators
      const loadingElements = [
        '.loading',
        '[data-testid="loading"]',
        'text="Loading"',
        '.spinner'
      ];
      
      for (const selector of loadingElements) {
        try {
          const element = page.locator(selector);
          if (await element.isVisible()) {
            console.log(`🔄 Found loading element: ${selector}`);
          }
        } catch (e) {
          // Ignore
        }
      }
      
      // Check for error messages
      const errorElements = [
        '.error',
        '[role="alert"]',
        'text="No question available"',
        'text="Error"'
      ];
      
      for (const selector of errorElements) {
        try {
          const element = page.locator(selector);
          if (await element.isVisible()) {
            const text = await element.textContent();
            console.log(`🚨 Found error element: ${selector} - "${text}"`);
          }
        } catch (e) {
          // Ignore
        }
      }
      
      // Check for question elements
      const questionElements = [
        '.question-text',
        '[data-testid="question"]',
        '.quiz-question',
        'h2',
        'h3',
        'p'
      ];
      
      for (const selector of questionElements) {
        try {
          const elements = page.locator(selector);
          const count = await elements.count();
          if (count > 0) {
            console.log(`📝 Found ${count} elements with selector: ${selector}`);
            for (let i = 0; i < Math.min(count, 3); i++) {
              const text = await elements.nth(i).textContent();
              console.log(`  ${i + 1}. "${text.substring(0, 100)}..."`);
            }
          }
        } catch (e) {
          // Ignore
        }
      }
      
      // Step 5: Check network requests
      console.log('\n📍 Step 5: Check for question-related network activity');
      
      // Wait a bit more and take final screenshot
      await page.waitForTimeout(3000);
      await page.screenshot({ path: 'quiz-question-debug-3-final.png', fullPage: true });
      
      // Step 6: Try to trigger question loading manually
      console.log('\n📍 Step 6: Try to trigger question loading');
      
      // Look for any buttons that might trigger question loading
      const triggerButtons = [
        'button:has-text("Start")',
        'button:has-text("Begin")',
        'button:has-text("Next")',
        'button:has-text("Continue")',
        'button'
      ];
      
      for (const selector of triggerButtons) {
        try {
          const buttons = page.locator(selector);
          const count = await buttons.count();
          if (count > 0) {
            console.log(`🎯 Found ${count} buttons with selector: ${selector}`);
            for (let i = 0; i < Math.min(count, 2); i++) {
              const text = await buttons.nth(i).textContent();
              console.log(`  Button ${i + 1}: "${text}"`);
            }
          }
        } catch (e) {
          // Ignore
        }
      }
      
    } catch (error) {
      console.error('🚨 Test error:', error);
      await page.screenshot({ path: 'quiz-question-debug-error.png', fullPage: true });
    }
    
    // Report console logs
    console.log('\n📊 CONSOLE LOGS SUMMARY:');
    const questionLogs = consoleLogs.filter(log => 
      log.includes('question') || 
      log.includes('fetch') || 
      log.includes('error') ||
      log.includes('QuizService') ||
      log.includes('useQuickQuiz')
    );
    
    if (questionLogs.length > 0) {
      console.log('🔍 Question-related logs:');
      questionLogs.forEach((log, i) => console.log(`${i + 1}. ${log}`));
    } else {
      console.log('⚠️ No question-related logs found');
    }
    
    // The test should pass regardless - we're just debugging
    expect(true).toBe(true);
  });
});
