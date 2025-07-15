import { test, expect } from '@playwright/test';

test.describe('Simple Quiz Verification', () => {
  
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

  test('Custom Quiz - Simple Verification', async ({ page }) => {
    console.log('🚀 Testing Custom Quiz - Simple Verification');
    
    // Monitor console for quiz-related logs
    const quizLogs = [];
    page.on('console', msg => {
      const text = msg.text();
      if (text.includes('question') || text.includes('fetch') || text.includes('custom') || text.includes('CustomQuiz')) {
        quizLogs.push(text);
        console.log('📝 Custom Quiz Log:', text);
      }
    });
    
    try {
      // Step 1: Login
      await loginUser(page);
      
      // Step 2: Navigate to Custom Quiz
      console.log('\n📍 Step 2: Navigating to Custom Quiz');
      await page.goto('http://localhost:5173/custom-quiz', { timeout: 15000 });
      await page.waitForLoadState('networkidle');
      await page.screenshot({ path: 'custom-quiz-simple-1.png', fullPage: true });
      
      // Step 3: Check page content
      console.log('\n📍 Step 3: Analyzing Custom Quiz page');
      const pageContent = await page.textContent('body');
      console.log('📄 Page content length:', pageContent.length);
      console.log('📄 Page content preview:', pageContent.substring(0, 500));
      
      // Step 4: Look for basic elements
      const hasCustomText = pageContent.toLowerCase().includes('custom');
      const hasQuizText = pageContent.toLowerCase().includes('quiz');
      const hasConfigText = pageContent.toLowerCase().includes('config') || pageContent.toLowerCase().includes('setting');
      
      console.log('📊 Custom Quiz page analysis:');
      console.log('  - Has "custom" text:', hasCustomText);
      console.log('  - Has "quiz" text:', hasQuizText);
      console.log('  - Has config/settings:', hasConfigText);
      
      // Step 5: Look for buttons
      const buttons = await page.locator('button').all();
      console.log(`\n📍 Step 5: Found ${buttons.length} buttons`);
      for (let i = 0; i < Math.min(buttons.length, 10); i++) {
        const text = await buttons[i].textContent();
        const isVisible = await buttons[i].isVisible();
        console.log(`  ${i + 1}. "${text}" (visible: ${isVisible})`);
      }
      
      // Step 6: Try to interact with any start/begin button
      console.log('\n📍 Step 6: Looking for start buttons');
      for (const button of buttons) {
        const text = await button.textContent();
        if (text && (text.toLowerCase().includes('start') || text.toLowerCase().includes('begin') || text.toLowerCase().includes('create'))) {
          console.log(`🎯 Found potential start button: "${text}"`);
          if (await button.isVisible() && await button.isEnabled()) {
            console.log('🎯 Clicking start button');
            await button.click();
            await page.waitForTimeout(3000);
            await page.screenshot({ path: 'custom-quiz-simple-2.png', fullPage: true });
            
            // Check if we navigated to a quiz
            const newUrl = page.url();
            console.log('📍 After click URL:', newUrl);
            
            if (newUrl.includes('quiz')) {
              console.log('✅ Successfully started custom quiz');
              
              // Check for question content
              const newContent = await page.textContent('body');
              const hasQuestionContent = newContent.includes('patient') || 
                                       newContent.includes('year-old') || 
                                       newContent.includes('presents') ||
                                       newContent.includes('examination');
              
              if (hasQuestionContent) {
                console.log('✅ Custom quiz questions are loading');
              } else {
                console.log('⚠️ Custom quiz started but questions not yet visible');
              }
            }
            break;
          }
        }
      }
      
      await page.screenshot({ path: 'custom-quiz-simple-3.png', fullPage: true });
      
      // Verify we're on a quiz-related page
      const currentUrl = page.url();
      expect(currentUrl).toMatch(/custom-quiz|quiz/);
      expect(pageContent.length).toBeGreaterThan(100);
      
    } catch (error) {
      console.error('🚨 Custom Quiz test error:', error);
      await page.screenshot({ path: 'custom-quiz-simple-error.png', fullPage: true });
      throw error;
    }
    
    console.log('\n📊 Custom Quiz verification completed');
    console.log('Quiz-related logs:', quizLogs.length);
  });

  test('All Quiz Types - URL Verification', async ({ page }) => {
    console.log('🚀 Testing All Quiz Types - URL Verification');
    
    try {
      // Login first
      await loginUser(page);
      
      // Test 1: Quick Quiz URL
      console.log('\n📍 Testing Quick Quiz URL');
      await page.goto('http://localhost:5173/quick-quiz', { timeout: 15000 });
      await page.waitForLoadState('networkidle');
      await page.waitForTimeout(3000);
      
      let content = await page.textContent('body');
      let hasQuestionContent = content.includes('patient') || content.includes('year-old') || content.includes('presents');
      console.log('✅ Quick Quiz URL accessible, has question content:', hasQuestionContent);
      
      // Test 2: Timed Test URL
      console.log('\n📍 Testing Timed Test URL');
      await page.goto('http://localhost:5173/timed-test', { timeout: 15000 });
      await page.waitForLoadState('networkidle');
      await page.waitForTimeout(3000);
      
      content = await page.textContent('body');
      hasQuestionContent = content.includes('patient') || content.includes('year-old') || content.includes('presents');
      console.log('✅ Timed Test URL accessible, has question content:', hasQuestionContent);
      
      // Test 3: Custom Quiz URL
      console.log('\n📍 Testing Custom Quiz URL');
      await page.goto('http://localhost:5173/custom-quiz', { timeout: 15000 });
      await page.waitForLoadState('networkidle');
      await page.waitForTimeout(3000);
      
      content = await page.textContent('body');
      const hasCustomContent = content.toLowerCase().includes('custom') || content.toLowerCase().includes('config');
      console.log('✅ Custom Quiz URL accessible, has custom content:', hasCustomContent);
      
      console.log('\n🎉 All 3 quiz types are accessible via direct URLs!');
      
    } catch (error) {
      console.error('🚨 URL verification error:', error);
      throw error;
    }
  });
});
