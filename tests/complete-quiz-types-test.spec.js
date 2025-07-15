import { test, expect } from '@playwright/test';

test.describe('Complete Quiz Types Testing', () => {
  
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

  // Helper function to wait for questions to load
  async function waitForQuestionLoad(page, testName) {
    console.log(`\n⏳ Waiting for ${testName} questions to load...`);
    
    // Wait for loading to complete
    await page.waitForTimeout(5000);
    
    // Check for question content
    const hasQuestion = await page.evaluate(() => {
      const body = document.body.textContent;
      // Look for medical question patterns
      return body.includes('patient') || 
             body.includes('year-old') || 
             body.includes('presents with') ||
             body.includes('examination') ||
             body.includes('Which of the following') ||
             body.includes('most likely') ||
             body.includes('diagnosis');
    });
    
    if (hasQuestion) {
      console.log(`✅ ${testName} question content detected`);
    } else {
      console.log(`⚠️ ${testName} question content not clearly detected`);
    }
    
    return hasQuestion;
  }

  test('1. Quick Quiz - Complete Flow', async ({ page }) => {
    console.log('🚀 Testing Quick Quiz - Complete Flow');
    
    // Monitor console for quiz-related logs
    const quizLogs = [];
    page.on('console', msg => {
      const text = msg.text();
      if (text.includes('question') || text.includes('fetch') || text.includes('QuizService') || text.includes('useQuickQuiz')) {
        quizLogs.push(text);
        console.log('📝 Quiz Log:', text);
      }
    });
    
    try {
      // Step 1: Login
      await loginUser(page);
      
      // Step 2: Navigate to Quick Quiz
      console.log('\n📍 Step 2: Starting Quick Quiz');
      await page.goto('http://localhost:5173/quick-quiz', { timeout: 15000 });
      await page.waitForLoadState('networkidle');
      await page.screenshot({ path: 'quick-quiz-1-start.png', fullPage: true });
      
      // Step 3: Wait for questions to load
      const hasQuestions = await waitForQuestionLoad(page, 'Quick Quiz');
      
      // Step 4: Analyze the quiz interface
      console.log('\n📍 Step 4: Analyzing Quick Quiz interface');
      const pageContent = await page.textContent('body');
      console.log('📄 Page content length:', pageContent.length);
      
      // Look for quiz elements
      const elements = {
        timer: await page.locator('.timer, [data-testid="timer"], text=/\\d+s/').count(),
        progress: await page.locator('.progress, [data-testid="progress"], text=/\\d+\\s*\\/\\s*\\d+/').count(),
        questionText: await page.locator('p, div, h1, h2, h3').filter({ hasText: /patient|year-old|presents|examination/ }).count(),
        options: await page.locator('button, div').filter({ hasText: /^[A-D][\\.\\)]/ }).count(),
        nextButton: await page.locator('button').filter({ hasText: /next|continue|submit/i }).count()
      };
      
      console.log('📊 Quick Quiz elements found:', elements);
      
      // Step 5: Try to interact with the quiz
      console.log('\n📍 Step 5: Attempting to interact with Quick Quiz');
      
      if (elements.options > 0) {
        console.log('🎯 Found answer options, attempting to select one');
        const firstOption = page.locator('button, div').filter({ hasText: /^[A-D][\\.\\)]/ }).first();
        if (await firstOption.isVisible()) {
          await firstOption.click();
          await page.waitForTimeout(2000);
          console.log('✅ Successfully clicked an answer option');
          await page.screenshot({ path: 'quick-quiz-2-answered.png', fullPage: true });
        }
      }
      
      // Step 6: Look for navigation or completion
      const buttons = await page.locator('button').all();
      console.log(`\n📍 Step 6: Found ${buttons.length} buttons`);
      for (let i = 0; i < Math.min(buttons.length, 5); i++) {
        const text = await buttons[i].textContent();
        const isVisible = await buttons[i].isVisible();
        console.log(`  ${i + 1}. "${text}" (visible: ${isVisible})`);
      }
      
      await page.screenshot({ path: 'quick-quiz-3-final.png', fullPage: true });
      
      // Verify we're on the quiz page
      expect(page.url()).toContain('/quick-quiz');
      expect(hasQuestions || elements.questionText > 0).toBeTruthy();
      
    } catch (error) {
      console.error('🚨 Quick Quiz test error:', error);
      await page.screenshot({ path: 'quick-quiz-error.png', fullPage: true });
      throw error;
    }
    
    console.log('\n📊 Quick Quiz test completed');
    console.log('Quiz-related logs:', quizLogs.length);
  });

  test('2. Timed Test - Complete Flow', async ({ page }) => {
    console.log('🚀 Testing Timed Test - Complete Flow');
    
    const quizLogs = [];
    page.on('console', msg => {
      const text = msg.text();
      if (text.includes('question') || text.includes('fetch') || text.includes('timed') || text.includes('TimedTest')) {
        quizLogs.push(text);
        console.log('📝 Timed Test Log:', text);
      }
    });
    
    try {
      // Step 1: Login
      await loginUser(page);
      
      // Step 2: Navigate to Timed Test
      console.log('\n📍 Step 2: Starting Timed Test');
      await page.goto('http://localhost:5173/timed-test', { timeout: 15000 });
      await page.waitForLoadState('networkidle');
      await page.screenshot({ path: 'timed-test-1-start.png', fullPage: true });
      
      // Step 3: Wait for questions to load
      const hasQuestions = await waitForQuestionLoad(page, 'Timed Test');
      
      // Step 4: Analyze the timed test interface
      console.log('\n📍 Step 4: Analyzing Timed Test interface');
      const pageContent = await page.textContent('body');
      console.log('📄 Page content length:', pageContent.length);
      
      // Look for timed test specific elements
      const elements = {
        timer: await page.locator('text=/\\d+:\\d+|\\d+\\s*min|\\d+\\s*sec/').count(),
        progress: await page.locator('text=/\\d+\\s*\\/\\s*\\d+|\\d+\\s*of\\s*\\d+/').count(),
        questionText: await page.locator('p, div, h1, h2, h3').filter({ hasText: /patient|year-old|presents|examination/ }).count(),
        options: await page.locator('button, div').filter({ hasText: /^[A-D][\\.\\)]/ }).count(),
        timedElements: await page.locator('text=/30\\s*min|timed|timer/i').count()
      };
      
      console.log('📊 Timed Test elements found:', elements);
      
      // Step 5: Try to interact with the timed test
      console.log('\n📍 Step 5: Attempting to interact with Timed Test');
      
      if (elements.options > 0) {
        console.log('🎯 Found answer options, attempting to select one');
        const firstOption = page.locator('button, div').filter({ hasText: /^[A-D][\\.\\)]/ }).first();
        if (await firstOption.isVisible()) {
          await firstOption.click();
          await page.waitForTimeout(2000);
          console.log('✅ Successfully clicked an answer option');
          await page.screenshot({ path: 'timed-test-2-answered.png', fullPage: true });
        }
      }
      
      await page.screenshot({ path: 'timed-test-3-final.png', fullPage: true });
      
      // Verify we're on the timed test page
      expect(page.url()).toContain('/timed-test');
      expect(hasQuestions || elements.questionText > 0).toBeTruthy();
      
    } catch (error) {
      console.error('🚨 Timed Test error:', error);
      await page.screenshot({ path: 'timed-test-error.png', fullPage: true });
      throw error;
    }
    
    console.log('\n📊 Timed Test completed');
    console.log('Quiz-related logs:', quizLogs.length);
  });

  test('3. Custom Quiz - Complete Flow', async ({ page }) => {
    console.log('🚀 Testing Custom Quiz - Complete Flow');
    
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
      
      // Step 2: Navigate to Custom Quiz setup
      console.log('\n📍 Step 2: Setting up Custom Quiz');
      await page.goto('http://localhost:5173/custom-quiz', { timeout: 15000 });
      await page.waitForLoadState('networkidle');
      await page.screenshot({ path: 'custom-quiz-1-setup.png', fullPage: true });
      
      // Step 3: Configure custom quiz settings
      console.log('\n📍 Step 3: Configuring Custom Quiz settings');
      
      // Look for configuration options
      const configElements = {
        categories: await page.locator('button, div').filter({ hasText: /cardiology|neurology|medicine/i }).count(),
        questionCount: await page.locator('input[type="range"], input[type="number"], text=/\\d+\\s*questions/').count(),
        difficulty: await page.locator('button, select').filter({ hasText: /easy|medium|hard|beginner|intermediate|advanced/i }).count(),
        startButton: await page.locator('button').filter({ hasText: /start|begin|create/i }).count()
      };
      
      console.log('📊 Custom Quiz config elements:', configElements);
      
      // Try to select a category
      if (configElements.categories > 0) {
        console.log('🎯 Selecting a category');
        const categoryButton = page.locator('button, div').filter({ hasText: /cardiology|neurology|medicine/i }).first();
        if (await categoryButton.isVisible()) {
          await categoryButton.click();
          await page.waitForTimeout(1000);
          console.log('✅ Selected a category');
        }
      }
      
      // Try to start the quiz
      if (configElements.startButton > 0) {
        console.log('🎯 Starting custom quiz');
        const startButton = page.locator('button').filter({ hasText: /start|begin|create/i }).first();
        if (await startButton.isVisible()) {
          await startButton.click();
          await page.waitForTimeout(3000);
          console.log('✅ Started custom quiz');
          await page.screenshot({ path: 'custom-quiz-2-started.png', fullPage: true });
        }
      }
      
      // Step 4: Wait for questions to load
      const hasQuestions = await waitForQuestionLoad(page, 'Custom Quiz');
      
      // Step 5: Analyze the custom quiz interface
      console.log('\n📍 Step 5: Analyzing Custom Quiz interface');
      const pageContent = await page.textContent('body');
      console.log('📄 Page content length:', pageContent.length);
      
      const elements = {
        questionText: await page.locator('p, div, h1, h2, h3').filter({ hasText: /patient|year-old|presents|examination/ }).count(),
        options: await page.locator('button, div').filter({ hasText: /^[A-D][\\.\\)]/ }).count(),
        customElements: await page.locator('text=/custom|configured/i').count()
      };
      
      console.log('📊 Custom Quiz elements found:', elements);
      
      // Step 6: Try to interact with the custom quiz
      console.log('\n📍 Step 6: Attempting to interact with Custom Quiz');
      
      if (elements.options > 0) {
        console.log('🎯 Found answer options, attempting to select one');
        const firstOption = page.locator('button, div').filter({ hasText: /^[A-D][\\.\\)]/ }).first();
        if (await firstOption.isVisible()) {
          await firstOption.click();
          await page.waitForTimeout(2000);
          console.log('✅ Successfully clicked an answer option');
          await page.screenshot({ path: 'custom-quiz-3-answered.png', fullPage: true });
        }
      }
      
      await page.screenshot({ path: 'custom-quiz-4-final.png', fullPage: true });
      
      // Verify we're on a quiz-related page
      const currentUrl = page.url();
      expect(currentUrl).toMatch(/custom-quiz|quiz/);
      
    } catch (error) {
      console.error('🚨 Custom Quiz test error:', error);
      await page.screenshot({ path: 'custom-quiz-error.png', fullPage: true });
      throw error;
    }
    
    console.log('\n📊 Custom Quiz test completed');
    console.log('Quiz-related logs:', quizLogs.length);
  });
});
