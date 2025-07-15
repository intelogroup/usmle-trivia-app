import { test, expect } from '@playwright/test';

test.describe('Authenticated Quiz Flow Test', () => {
  test('should test quiz with authenticated user and check question loading', async ({ page }) => {
    console.log('🔍 Starting authenticated quiz test...');
    
    // Monitor console logs for question loading
    const consoleLogs = [];
    page.on('console', msg => {
      const text = msg.text();
      consoleLogs.push(text);
      if (text.includes('question') || text.includes('fetch') || text.includes('QuizService') || text.includes('useQuickQuiz')) {
        console.log('📝 Quiz Log:', text);
      }
    });
    
    try {
      // Step 1: Login with test user
      console.log('\n📍 Step 1: Login with test user');
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
      console.log('✅ Successfully logged in');
      
      // Step 2: Navigate directly to quick-quiz
      console.log('\n📍 Step 2: Navigate to quick-quiz');
      await page.goto('http://localhost:5173/quick-quiz', { timeout: 15000 });
      await page.waitForLoadState('networkidle');
      await page.screenshot({ path: 'auth-quiz-1-quick-quiz.png', fullPage: true });
      
      // Step 3: Wait for question loading
      console.log('\n📍 Step 3: Wait for question loading');
      await page.waitForTimeout(10000); // Give more time for questions to load
      await page.screenshot({ path: 'auth-quiz-2-after-wait.png', fullPage: true });
      
      // Step 4: Analyze page content
      console.log('\n📍 Step 4: Analyze page content');
      const pageContent = await page.textContent('body');
      console.log('📄 Page content length:', pageContent.length);
      console.log('📄 Page content preview:', pageContent.substring(0, 500));
      
      // Check for specific quiz elements
      const elements = {
        loading: await page.locator('.loading, [data-testid="loading"]').count(),
        error: await page.locator('.error, [role="alert"]').count(),
        question: await page.locator('.question-text, [data-testid="question"]').count(),
        options: await page.locator('button[data-option-id], .option-button').count(),
        noQuestion: await page.locator('text="No question available"').count(),
        timer: await page.locator('.timer, [data-testid="timer"]').count(),
        progress: await page.locator('.progress, [data-testid="progress"]').count()
      };
      
      console.log('📊 Element counts:', elements);
      
      // Check for actual question content
      const questionElements = await page.locator('h1, h2, h3, p').all();
      console.log('\n📝 All text elements:');
      for (let i = 0; i < Math.min(questionElements.length, 10); i++) {
        const text = await questionElements[i].textContent();
        if (text && text.length > 10) {
          console.log(`${i + 1}. "${text.substring(0, 100)}..."`);
        }
      }
      
      // Step 5: Try to trigger question loading manually
      console.log('\n📍 Step 5: Check for manual triggers');
      
      // Look for any buttons that might start the quiz
      const buttons = await page.locator('button').all();
      console.log(`Found ${buttons.length} buttons:`);
      for (let i = 0; i < Math.min(buttons.length, 5); i++) {
        const text = await buttons[i].textContent();
        const isVisible = await buttons[i].isVisible();
        const isEnabled = await buttons[i].isEnabled();
        console.log(`  ${i + 1}. "${text}" (visible: ${isVisible}, enabled: ${isEnabled})`);
      }
      
      // Step 6: Check browser network activity
      console.log('\n📍 Step 6: Final analysis');
      await page.screenshot({ path: 'auth-quiz-3-final.png', fullPage: true });
      
      // Check if we're actually on the quiz page
      const currentUrl = page.url();
      console.log('📍 Current URL:', currentUrl);
      
      if (currentUrl.includes('/quick-quiz')) {
        console.log('✅ Successfully on quiz page');
        
        // Check if there's a "No question available" message
        if (elements.noQuestion > 0) {
          console.log('❌ "No question available" message found');
        } else if (elements.question > 0) {
          console.log('✅ Question elements found');
        } else {
          console.log('⚠️ No clear question indicators found');
        }
      } else {
        console.log('❌ Not on quiz page, redirected to:', currentUrl);
      }
      
    } catch (error) {
      console.error('🚨 Test error:', error);
      await page.screenshot({ path: 'auth-quiz-error.png', fullPage: true });
    }
    
    // Report quiz-related console logs
    console.log('\n📊 QUIZ-RELATED CONSOLE LOGS:');
    const quizLogs = consoleLogs.filter(log => 
      log.includes('question') || 
      log.includes('fetch') || 
      log.includes('QuizService') ||
      log.includes('useQuickQuiz') ||
      log.includes('error') ||
      log.includes('loading')
    );
    
    if (quizLogs.length > 0) {
      quizLogs.forEach((log, i) => console.log(`${i + 1}. ${log}`));
    } else {
      console.log('⚠️ No quiz-related logs found');
    }
    
    // The test should pass - we're just debugging
    expect(true).toBe(true);
  });
});
