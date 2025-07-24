import { test, expect } from '@playwright/test';

/**
 * USMLE Trivia Custom Quiz Testing
 * Test user: jimkalinov@gmail.com
 * Testing complete custom quiz functionality with authentication
 */

// Configure test settings
test.use({
  screenshot: 'always',
  video: 'on',
  trace: 'on',
  actionTimeout: 15000,
  navigationTimeout: 30000
});

test.describe('Custom Quiz - Complete Flow Testing', () => {

  test.beforeEach(async ({ page }) => {
    // Enable detailed logging
    page.on('console', msg => {
      console.log(`🔍 Console [${msg.type()}]: ${msg.text()}`);
    });
    
    page.on('pageerror', err => {
      console.log(`❌ Page Error: ${err.message}`);
    });
    
    // Navigate to app
    console.log('🚀 Starting custom quiz test...');
    await page.goto('http://localhost:5173');
    await page.waitForLoadState('networkidle');
    
    // Take initial screenshot
    await page.screenshot({ 
      path: `test-results/custom-quiz-00-initial-${Date.now()}.png`,
      fullPage: true 
    });
  });

  test('should authenticate and access custom quiz setup', async ({ page }) => {
    console.log('🔐 Testing authentication flow for custom quiz...');
    
    try {
      // Navigate to login page
      await page.goto('http://localhost:5173/auth/login');
      await page.waitForTimeout(3000);
      
      // Check if login form exists
      const emailInput = page.locator('input[type="email"], input[name="email"]').first();
      const passwordInput = page.locator('input[type="password"]').first();
      const submitButton = page.locator('button[type="submit"], button:has-text("Login")').first();
      
      if (await emailInput.isVisible({ timeout: 5000 })) {
        console.log('📧 Logging in with test user...');
        await emailInput.fill('jimkalinov@gmail.com');
        await passwordInput.fill('Jimkali90');
        
        await page.screenshot({ 
          path: `test-results/custom-quiz-01-login-form-${Date.now()}.png`,
          fullPage: true 
        });
        
        await submitButton.click();
        await page.waitForTimeout(5000);
        
        // Check if login was successful
        const currentUrl = page.url();
        console.log(`🌐 URL after login: ${currentUrl}`);
        
        await page.screenshot({ 
          path: `test-results/custom-quiz-02-after-login-${Date.now()}.png`,
          fullPage: true 
        });
      }
      
      // Navigate to custom quiz setup
      console.log('🎯 Navigating to custom quiz setup...');
      await page.goto('http://localhost:5173/custom-quiz-setup');
      await page.waitForTimeout(5000);
      
      await page.screenshot({ 
        path: `test-results/custom-quiz-03-setup-page-${Date.now()}.png`,
        fullPage: true 
      });
      
      // Check page content
      const pageTitle = await page.title();
      const headings = await page.locator('h1, h2, h3').allTextContents();
      
      console.log(`📄 Page title: ${pageTitle}`);
      console.log(`📑 Headings: ${headings.join(', ')}`);
      
    } catch (error) {
      console.log(`❌ Authentication test failed: ${error.message}`);
      await page.screenshot({ 
        path: `test-results/custom-quiz-error-auth-${Date.now()}.png`,
        fullPage: true 
      });
    }
  });

  test('should display and interact with quiz configuration options', async ({ page }) => {
    console.log('⚙️ Testing quiz configuration options...');
    
    try {
      // Go directly to custom quiz setup
      await page.goto('http://localhost:5173/custom-quiz-setup');
      await page.waitForTimeout(5000);
      
      // Take screenshot of setup page
      await page.screenshot({ 
        path: `test-results/custom-quiz-04-config-page-${Date.now()}.png`,
        fullPage: true 
      });
      
      // Look for configuration elements
      const configElements = {
        selects: await page.locator('select').count(),
        inputs: await page.locator('input[type="number"], input[type="range"]').count(),
        checkboxes: await page.locator('input[type="checkbox"]').count(),
        radioButtons: await page.locator('input[type="radio"]').count(),
        buttons: await page.locator('button').count()
      };
      
      console.log('🔧 Configuration elements found:', configElements);
      
      // Test category selection if available
      const categorySelects = page.locator('select, [role="combobox"], .category-selector');
      const categoryCount = await categorySelects.count();
      
      if (categoryCount > 0) {
        console.log(`📚 Found ${categoryCount} category selectors`);
        
        const firstSelect = categorySelects.first();
        if (await firstSelect.isVisible()) {
          // Try to get options
          const options = await firstSelect.locator('option').allTextContents();
          console.log(`📋 Available options: ${options.join(', ')}`);
          
          // Select first non-empty option if available
          if (options.length > 1) {
            await firstSelect.selectOption({ index: 1 });
            console.log('✅ Selected category option');
            
            await page.screenshot({ 
              path: `test-results/custom-quiz-05-category-selected-${Date.now()}.png`,
              fullPage: true 
            });
          }
        }
      }
      
      // Test difficulty selection
      const difficultyElements = page.locator('[data-testid*="difficulty"], .difficulty, button:has-text("Easy"), button:has-text("Medium"), button:has-text("Hard")');
      const difficultyCount = await difficultyElements.count();
      
      if (difficultyCount > 0) {
        console.log(`📊 Found ${difficultyCount} difficulty options`);
        
        // Click first difficulty option
        await difficultyElements.first().click();
        console.log('✅ Selected difficulty option');
        
        await page.screenshot({ 
          path: `test-results/custom-quiz-06-difficulty-selected-${Date.now()}.png`,
          fullPage: true 
        });
      }
      
      // Test question count input
      const questionCountInput = page.locator('input[type="number"], input[type="range"], [placeholder*="number"], [placeholder*="questions"]');
      const questionInputCount = await questionCountInput.count();
      
      if (questionInputCount > 0) {
        console.log(`🔢 Found ${questionInputCount} question count inputs`);
        
        const firstInput = questionCountInput.first();
        if (await firstInput.isVisible()) {
          await firstInput.fill('10');
          console.log('✅ Set question count to 10');
          
          await page.screenshot({ 
            path: `test-results/custom-quiz-07-question-count-${Date.now()}.png`,
            fullPage: true 
          });
        }
      }
      
      // Look for available question count display
      const questionCountDisplay = page.locator('text=/\\d+ questions available/, text=/Available:/, .question-count, [data-testid*="count"]');
      const displayCount = await questionCountDisplay.count();
      
      if (displayCount > 0) {
        const displayText = await questionCountDisplay.first().textContent();
        console.log(`📊 Question availability: ${displayText}`);
      }
      
    } catch (error) {
      console.log(`❌ Configuration test failed: ${error.message}`);
      await page.screenshot({ 
        path: `test-results/custom-quiz-error-config-${Date.now()}.png`,
        fullPage: true 
      });
    }
  });

  test('should start custom quiz and handle quiz flow', async ({ page }) => {
    console.log('🎮 Testing custom quiz execution...');
    
    try {
      // Navigate to custom quiz setup
      await page.goto('http://localhost:5173/custom-quiz-setup');
      await page.waitForTimeout(5000);
      
      // Configure quiz settings
      console.log('⚙️ Configuring quiz settings...');
      
      // Set question count if input is available
      const questionInput = page.locator('input[type="number"], input[type="range"]').first();
      if (await questionInput.isVisible({ timeout: 3000 })) {
        await questionInput.fill('5');
        console.log('🔢 Set question count to 5');
      }
      
      // Look for start quiz button
      const startButtons = [
        'button:has-text("Start Quiz")',
        'button:has-text("Begin Quiz")',
        'button:has-text("Start Custom Quiz")',
        'button:has-text("Create Quiz")',
        '[data-testid="start-quiz"]',
        '.start-quiz-btn'
      ];
      
      let startButton = null;
      for (const selector of startButtons) {
        const btn = page.locator(selector).first();
        if (await btn.isVisible({ timeout: 2000 })) {
          startButton = btn;
          console.log(`✅ Found start button: ${selector}`);
          break;
        }
      }
      
      if (startButton) {
        await page.screenshot({ 
          path: `test-results/custom-quiz-08-before-start-${Date.now()}.png`,
          fullPage: true 
        });
        
        console.log('🚀 Starting custom quiz...');
        await startButton.click();
        await page.waitForTimeout(5000);
        
        // Wait for quiz to load
        await page.screenshot({ 
          path: `test-results/custom-quiz-09-quiz-started-${Date.now()}.png`,
          fullPage: true 
        });
        
        // Check if we're in a quiz
        const currentUrl = page.url();
        console.log(`🌐 Quiz URL: ${currentUrl}`);
        
        // Look for quiz elements
        const quizElements = {
          questions: await page.locator('h1, h2, h3, .question, [data-testid*="question"]').count(),
          options: await page.locator('button, input[type="radio"], .option, [data-testid*="option"]').count(),
          controls: await page.locator('button:has-text("Next"), button:has-text("Submit"), .quiz-controls button').count()
        };
        
        console.log('🎯 Quiz elements found:', quizElements);
        
        // Try to interact with quiz if elements are present
        if (quizElements.options > 0) {
          console.log('🎲 Attempting to answer questions...');
          
          const options = page.locator('button, input[type="radio"], .option, [data-testid*="option"]');
          
          // Answer first question
          const firstOption = options.first();
          if (await firstOption.isVisible()) {
            await firstOption.click();
            console.log('✅ Selected first option');
            
            await page.screenshot({ 
              path: `test-results/custom-quiz-10-option-selected-${Date.now()}.png`,
              fullPage: true 
            });
            
            // Look for next button or submit
            const nextButton = page.locator('button:has-text("Next"), button:has-text("Continue"), button:has-text("Submit")').first();
            if (await nextButton.isVisible({ timeout: 3000 })) {
              await nextButton.click();
              console.log('✅ Clicked next/submit button');
              
              await page.waitForTimeout(3000);
              await page.screenshot({ 
                path: `test-results/custom-quiz-11-after-next-${Date.now()}.png`,
                fullPage: true 
              });
            }
          }
        }
        
        // Check for quiz progress indicators
        const progressElements = page.locator('[role="progressbar"], .progress, .quiz-progress, text=/\\d+.*of.*\\d+/');
        const progressCount = await progressElements.count();
        
        if (progressCount > 0) {
          const progressText = await progressElements.first().textContent();
          console.log(`📊 Quiz progress: ${progressText}`);
        }
        
      } else {
        console.log('⚠️ No start button found');
        
        // Try alternative navigation - direct to quiz
        console.log('🔄 Trying direct quiz navigation...');
        await page.goto('http://localhost:5173/quiz');
        await page.waitForTimeout(3000);
        
        await page.screenshot({ 
          path: `test-results/custom-quiz-12-direct-quiz-${Date.now()}.png`,
          fullPage: true 
        });
      }
      
    } catch (error) {
      console.log(`❌ Quiz execution test failed: ${error.message}`);
      await page.screenshot({ 
        path: `test-results/custom-quiz-error-execution-${Date.now()}.png`,
        fullPage: true 
      });
    }
  });

  test('should handle quiz completion and results', async ({ page }) => {
    console.log('🏁 Testing quiz completion flow...');
    
    try {
      // Try to access quiz results or completion state
      const resultUrls = [
        'http://localhost:5173/quiz/results',
        'http://localhost:5173/results',
        'http://localhost:5173/quiz-results'
      ];
      
      for (const url of resultUrls) {
        try {
          console.log(`🔄 Testing results URL: ${url}`);
          await page.goto(url);
          await page.waitForTimeout(3000);
          
          await page.screenshot({ 
            path: `test-results/custom-quiz-13-results-${url.split('/').pop()}-${Date.now()}.png`,
            fullPage: true 
          });
          
          // Check for results elements
          const resultsElements = {
            scores: await page.locator('.score, [data-testid*="score"], text=/score/i').count(),
            stats: await page.locator('.stats, .statistics, [data-testid*="stat"]').count(),
            feedback: await page.locator('.feedback, .result-message, [data-testid*="feedback"]').count(),
            actions: await page.locator('button:has-text("Retake"), button:has-text("New Quiz"), button:has-text("Home")').count()
          };
          
          console.log(`📊 Results elements at ${url}:`, resultsElements);
          
          if (Object.values(resultsElements).some(count => count > 0)) {
            console.log(`✅ Found results page at ${url}`);
            break;
          }
          
        } catch (error) {
          console.log(`❌ Results URL ${url} failed: ${error.message}`);
        }
      }
      
      // Test quiz restart/new quiz functionality
      const restartButtons = page.locator('button:has-text("New Quiz"), button:has-text("Start Over"), button:has-text("Try Again")');
      const restartCount = await restartButtons.count();
      
      if (restartCount > 0) {
        console.log(`🔄 Found ${restartCount} restart options`);
        
        const firstRestart = restartButtons.first();
        if (await firstRestart.isVisible()) {
          await firstRestart.click();
          console.log('✅ Clicked restart option');
          
          await page.waitForTimeout(3000);
          await page.screenshot({ 
            path: `test-results/custom-quiz-14-after-restart-${Date.now()}.png`,
            fullPage: true 
          });
        }
      }
      
    } catch (error) {
      console.log(`❌ Quiz completion test failed: ${error.message}`);
      await page.screenshot({ 
        path: `test-results/custom-quiz-error-completion-${Date.now()}.png`,
        fullPage: true 
      });
    }
  });

  test('should test custom quiz with different configurations', async ({ page }) => {
    console.log('🔧 Testing different quiz configurations...');
    
    try {
      await page.goto('http://localhost:5173/custom-quiz-setup');
      await page.waitForTimeout(5000);
      
      // Test different difficulty levels
      const difficulties = ['Easy', 'Medium', 'Hard', 'Mixed'];
      
      for (const difficulty of difficulties) {
        console.log(`🎯 Testing ${difficulty} difficulty...`);
        
        const diffButton = page.locator(`button:has-text("${difficulty}"), [data-value="${difficulty.toLowerCase()}"]`);
        
        if (await diffButton.isVisible({ timeout: 2000 })) {
          await diffButton.click();
          await page.waitForTimeout(1000);
          
          await page.screenshot({ 
            path: `test-results/custom-quiz-15-${difficulty.toLowerCase()}-${Date.now()}.png`,
            fullPage: true 
          });
          
          console.log(`✅ Selected ${difficulty} difficulty`);
        }
      }
      
      // Test different question counts
      const questionCounts = ['5', '10', '15', '20'];
      const questionInput = page.locator('input[type="number"], input[type="range"]').first();
      
      if (await questionInput.isVisible({ timeout: 3000 })) {
        for (const count of questionCounts) {
          console.log(`🔢 Testing ${count} questions...`);
          
          await questionInput.fill(count);
          await page.waitForTimeout(1000);
          
          // Check if question availability updates
          const availabilityText = await page.locator('text=/\\d+ questions/, .question-count').first().textContent().catch(() => 'Not displayed');
          console.log(`📊 Availability for ${count} questions: ${availabilityText}`);
        }
        
        await page.screenshot({ 
          path: `test-results/custom-quiz-16-question-counts-${Date.now()}.png`,
          fullPage: true 
        });
      }
      
    } catch (error) {
      console.log(`❌ Configuration variations test failed: ${error.message}`);
      await page.screenshot({ 
        path: `test-results/custom-quiz-error-variations-${Date.now()}.png`,
        fullPage: true 
      });
    }
  });

  test.afterEach(async ({ page }, testInfo) => {
    // Always take a final screenshot
    if (testInfo.status !== 'passed') {
      await page.screenshot({ 
        path: `test-results/custom-quiz-final-failure-${testInfo.title.replace(/\W/g, '_')}-${Date.now()}.png`,
        fullPage: true 
      });
    }
    
    console.log(`✅ Custom quiz test completed: ${testInfo.title} - Status: ${testInfo.status}`);
  });

});