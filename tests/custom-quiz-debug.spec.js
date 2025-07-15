import { test, expect } from '@playwright/test';

test.describe('Custom Quiz Debug - Complete Flow', () => {
  
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

  test('Custom Quiz Setup - Complete Debug Flow', async ({ page }) => {
    console.log('🚀 Starting Custom Quiz Setup Debug');
    
    // Capture all console logs
    const consoleLogs = [];
    const consoleErrors = [];
    
    page.on('console', msg => {
      const text = msg.text();
      consoleLogs.push(text);
      
      if (msg.type() === 'error') {
        consoleErrors.push(text);
        console.log('🚨 Console Error:', text);
      } else if (text.includes('custom') || text.includes('quiz') || text.includes('config') || text.includes('setup')) {
        console.log('📝 Custom Quiz Log:', text);
      }
    });
    
    // Capture network requests
    const networkRequests = [];
    page.on('request', request => {
      networkRequests.push({
        url: request.url(),
        method: request.method(),
        headers: request.headers()
      });
    });
    
    try {
      // Step 1: Login
      await loginUser(page);
      
      // Step 2: Navigate to Custom Quiz Setup
      console.log('\n📍 Step 2: Navigate to Custom Quiz Setup');
      await page.goto('http://localhost:5173/custom-quiz-setup', { timeout: 15000 });
      await page.waitForLoadState('networkidle');
      await page.screenshot({ path: 'custom-debug-1-setup.png', fullPage: true });
      
      // Step 3: Analyze setup page
      console.log('\n📍 Step 3: Analyze Custom Quiz Setup page');
      const setupContent = await page.textContent('body');
      console.log('📄 Setup page content length:', setupContent.length);
      console.log('📄 Setup page preview:', setupContent.substring(0, 500));
      
      // Check for setup elements
      const setupElements = {
        title: await page.locator('h1, h2').filter({ hasText: /custom.*quiz.*setup/i }).count(),
        modeToggle: await page.locator('button, input').filter({ hasText: /simple|advanced|mode/i }).count(),
        categories: await page.locator('button, select, option').filter({ hasText: /cardiology|neurology|medicine|category/i }).count(),
        questionCount: await page.locator('input[type="range"], input[type="number"], select').count(),
        difficulty: await page.locator('button, select, option').filter({ hasText: /easy|medium|hard|difficulty/i }).count(),
        startButton: await page.locator('button').filter({ hasText: /start.*quiz|create.*quiz|begin/i }).count()
      };
      
      console.log('📊 Setup page elements:', setupElements);
      
      // Step 4: Try to configure the quiz
      console.log('\n📍 Step 4: Configure Custom Quiz');
      
      // Try to select a category/subject
      const categoryButtons = await page.locator('button').filter({ hasText: /cardiology|neurology|medicine|general/i }).all();
      if (categoryButtons.length > 0) {
        console.log(`🎯 Found ${categoryButtons.length} category buttons`);
        const firstCategory = categoryButtons[0];
        const categoryText = await firstCategory.textContent();
        console.log(`🎯 Selecting category: "${categoryText}"`);
        await firstCategory.click();
        await page.waitForTimeout(1000);
        await page.screenshot({ path: 'custom-debug-2-category-selected.png', fullPage: true });
      }
      
      // Try to adjust question count
      const questionCountInputs = await page.locator('input[type="range"], input[type="number"]').all();
      if (questionCountInputs.length > 0) {
        console.log(`🎯 Found ${questionCountInputs.length} question count inputs`);
        const questionInput = questionCountInputs[0];
        await questionInput.fill('5');
        console.log('🎯 Set question count to 5');
        await page.waitForTimeout(500);
      }
      
      // Try to select difficulty
      const difficultyButtons = await page.locator('button, select').filter({ hasText: /easy|medium|hard/i }).all();
      if (difficultyButtons.length > 0) {
        console.log(`🎯 Found ${difficultyButtons.length} difficulty options`);
        const firstDifficulty = difficultyButtons[0];
        const difficultyText = await firstDifficulty.textContent();
        console.log(`🎯 Selecting difficulty: "${difficultyText}"`);
        await firstDifficulty.click();
        await page.waitForTimeout(500);
      }
      
      await page.screenshot({ path: 'custom-debug-3-configured.png', fullPage: true });
      
      // Step 5: Try to start the quiz
      console.log('\n📍 Step 5: Start Custom Quiz');
      
      const startButtons = await page.locator('button').filter({ hasText: /start.*quiz|create.*quiz|begin/i }).all();
      if (startButtons.length > 0) {
        console.log(`🎯 Found ${startButtons.length} start buttons`);
        const startButton = startButtons[0];
        const startText = await startButton.textContent();
        const isEnabled = await startButton.isEnabled();
        const isVisible = await startButton.isVisible();
        
        console.log(`🎯 Start button: "${startText}" (enabled: ${isEnabled}, visible: ${isVisible})`);
        
        if (isEnabled && isVisible) {
          console.log('🎯 Clicking start button');
          await startButton.click();
          await page.waitForTimeout(3000);
          await page.screenshot({ path: 'custom-debug-4-after-start.png', fullPage: true });
          
          // Check where we navigated
          const newUrl = page.url();
          console.log('📍 After start URL:', newUrl);
          
          if (newUrl.includes('/custom-quiz')) {
            console.log('✅ Successfully navigated to custom quiz');
            
            // Check for quiz content or error
            const quizContent = await page.textContent('body');
            console.log('📄 Quiz page content length:', quizContent.length);
            
            if (quizContent.includes('Unable to Load Quiz') || quizContent.includes('Quiz configuration is missing')) {
              console.log('❌ Quiz configuration error detected');
              console.log('📄 Error content:', quizContent.substring(0, 800));
              
              // Look for technical details
              const technicalDetails = await page.locator('text=/technical.*details/i').textContent().catch(() => 'No technical details found');
              console.log('🔧 Technical details:', technicalDetails);
              
            } else if (quizContent.includes('patient') || quizContent.includes('year-old') || quizContent.includes('presents')) {
              console.log('✅ Quiz questions are loading successfully');
            } else {
              console.log('⚠️ Quiz page loaded but content unclear');
              console.log('📄 Quiz content preview:', quizContent.substring(0, 500));
            }
          } else {
            console.log('❌ Did not navigate to custom quiz page');
          }
        } else {
          console.log('❌ Start button is not enabled or visible');
        }
      } else {
        console.log('❌ No start buttons found');
      }
      
      await page.screenshot({ path: 'custom-debug-5-final.png', fullPage: true });
      
      // Step 6: Analyze all collected data
      console.log('\n📍 Step 6: Analysis Summary');
      
      console.log('\n🚨 Console Errors:');
      if (consoleErrors.length > 0) {
        consoleErrors.forEach((error, i) => console.log(`${i + 1}. ${error}`));
      } else {
        console.log('✅ No console errors detected');
      }
      
      console.log('\n📡 Network Requests:');
      const relevantRequests = networkRequests.filter(req => 
        req.url.includes('supabase') || 
        req.url.includes('question') || 
        req.url.includes('quiz') ||
        req.url.includes('custom')
      );
      
      if (relevantRequests.length > 0) {
        relevantRequests.forEach((req, i) => {
          console.log(`${i + 1}. ${req.method} ${req.url}`);
        });
      } else {
        console.log('⚠️ No relevant network requests detected');
      }
      
      console.log('\n📝 All Console Logs:');
      const customLogs = consoleLogs.filter(log => 
        log.includes('custom') || 
        log.includes('quiz') || 
        log.includes('config') ||
        log.includes('setup') ||
        log.includes('navigation') ||
        log.includes('state')
      );
      
      if (customLogs.length > 0) {
        customLogs.forEach((log, i) => console.log(`${i + 1}. ${log}`));
      } else {
        console.log('⚠️ No custom quiz related logs found');
      }
      
    } catch (error) {
      console.error('🚨 Custom Quiz Debug test error:', error);
      await page.screenshot({ path: 'custom-debug-error.png', fullPage: true });
      throw error;
    }
    
    // Test should pass - we're debugging
    expect(true).toBe(true);
  });
});
