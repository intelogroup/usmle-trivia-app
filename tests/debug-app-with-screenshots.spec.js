import { test, expect } from '@playwright/test';

/**
 * USMLE Trivia App Testing with Debug Tools and Screenshots
 * Test user: jimkalinov@gmail.com
 * With comprehensive debugging and screenshot capture
 */

// Configure test settings for debugging
test.use({
  // Enable screenshot on failure
  screenshot: 'only-on-failure',
  // Enable video recording
  video: 'retain-on-failure',
  // Enable trace collection for debugging
  trace: 'on-first-retry',
  // Slow down actions for better visibility
  actionTimeout: 10000,
  navigationTimeout: 30000
});

test.describe('USMLE Trivia App - Debug Testing with Screenshots', () => {

  test.beforeEach(async ({ page }) => {
    // Enable console logging for debugging
    page.on('console', msg => {
      console.log(`🔍 Console [${msg.type()}]: ${msg.text()}`);
    });
    
    // Log page errors
    page.on('pageerror', err => {
      console.log(`❌ Page Error: ${err.message}`);
    });
    
    // Log network requests for debugging
    page.on('request', request => {
      console.log(`📤 Request: ${request.method()} ${request.url()}`);
    });
    
    // Log network responses
    page.on('response', response => {
      if (!response.ok()) {
        console.log(`📥 Response Error: ${response.status()} ${response.url()}`);
      }
    });
    
    // Navigate to app
    console.log('🚀 Starting test - navigating to app...');
    await page.goto('http://localhost:5173');
    
    // Take initial screenshot
    await page.screenshot({ 
      path: `test-results/initial-load-${Date.now()}.png`,
      fullPage: true 
    });
  });

  test.describe('🔐 Authentication Flow with jimkalinov@gmail.com', () => {
    
    test('should complete full authentication flow with screenshots', async ({ page }) => {
      console.log('🔐 Testing authentication flow...');
      
      // Take screenshot of landing page
      await page.screenshot({ 
        path: `test-results/01-landing-page-${Date.now()}.png`,
        fullPage: true 
      });
      
      // Try to find authentication entry points
      const authButtons = [
        'text=Get Started',
        'text=Sign Up', 
        'text=Login',
        'text=Start Learning',
        'button:has-text("Login")',
        'a[href*="auth"]',
        'a[href*="login"]'
      ];
      
      let authButton = null;
      for (const selector of authButtons) {
        const button = page.locator(selector).first();
        if (await button.isVisible({ timeout: 2000 })) {
          authButton = button;
          console.log(`✅ Found auth button: ${selector}`);
          break;
        }
      }
      
      if (authButton) {
        await authButton.click();
        await page.waitForTimeout(2000);
        
        // Screenshot after clicking auth button
        await page.screenshot({ 
          path: `test-results/02-after-auth-click-${Date.now()}.png`,
          fullPage: true 
        });
      } else {
        // Try direct navigation to login
        console.log('🔄 No auth button found, trying direct navigation...');
        await page.goto('http://localhost:5173/auth/login');
      }
      
      // Wait for login form to appear
      await page.waitForTimeout(3000);
      
      // Take screenshot of login page
      await page.screenshot({ 
        path: `test-results/03-login-page-${Date.now()}.png`,
        fullPage: true 
      });
      
      // Find login form elements
      const emailInput = page.locator('input[type="email"], input[name="email"], input[placeholder*="email" i]').first();
      const passwordInput = page.locator('input[type="password"], input[name="password"], input[placeholder*="password" i]').first();
      const submitButton = page.locator('button[type="submit"], button:has-text("Login"), button:has-text("Sign In")').first();
      
      // Check if form elements are visible
      console.log('🔍 Checking form elements...');
      const emailVisible = await emailInput.isVisible({ timeout: 5000 });
      const passwordVisible = await passwordInput.isVisible({ timeout: 5000 });
      const submitVisible = await submitButton.isVisible({ timeout: 5000 });
      
      console.log(`📧 Email input visible: ${emailVisible}`);
      console.log(`🔒 Password input visible: ${passwordVisible}`);
      console.log(`🔘 Submit button visible: ${submitVisible}`);
      
      if (emailVisible && passwordVisible && submitVisible) {
        // Fill in the test user credentials
        console.log('📝 Filling login form with test user...');
        await emailInput.fill('jimkalinov@gmail.com');
        
        // Take screenshot after filling email
        await page.screenshot({ 
          path: `test-results/04-email-filled-${Date.now()}.png`,
          fullPage: true 
        });
        
        // Note: Using a test password - in real scenarios, you'd use environment variables
        await passwordInput.fill('TestPassword123!');
        
        // Take screenshot with form filled
        await page.screenshot({ 
          path: `test-results/05-form-filled-${Date.now()}.png`,
          fullPage: true 
        });
        
        // Submit the form
        console.log('🚀 Submitting login form...');
        await submitButton.click();
        
        // Wait for response
        await page.waitForTimeout(5000);
        
        // Take screenshot after submission
        await page.screenshot({ 
          path: `test-results/06-after-login-submit-${Date.now()}.png`,
          fullPage: true 
        });
        
        // Check for successful login or error messages
        const errorElements = page.locator('.error, .alert-error, [role="alert"], .text-red-500, .text-red-600');
        const successElements = page.locator('.success, .alert-success, text=Welcome, text=Dashboard');
        
        const hasErrors = await errorElements.count() > 0;
        const hasSuccess = await successElements.count() > 0;
        
        console.log(`❌ Login errors: ${hasErrors}`);
        console.log(`✅ Login success indicators: ${hasSuccess}`);
        
        if (hasErrors) {
          const errorText = await errorElements.first().textContent();
          console.log(`❌ Error message: ${errorText}`);
        }
        
        // Check URL change
        const currentUrl = page.url();
        console.log(`🌐 Current URL after login: ${currentUrl}`);
        
        // Take final screenshot of current state
        await page.screenshot({ 
          path: `test-results/07-login-final-state-${Date.now()}.png`,
          fullPage: true 
        });
        
      } else {
        console.log('❌ Login form elements not found');
        // Take screenshot of current page for debugging
        await page.screenshot({ 
          path: `test-results/debug-login-form-missing-${Date.now()}.png`,
          fullPage: true 
        });
      }
    });

    test('should handle login form validation with screenshots', async ({ page }) => {
      console.log('🔍 Testing form validation...');
      
      await page.goto('http://localhost:5173/auth/login');
      await page.waitForTimeout(3000);
      
      // Screenshot login page
      await page.screenshot({ 
        path: `test-results/validation-01-login-page-${Date.now()}.png`,
        fullPage: true 
      });
      
      // Try to submit empty form
      const submitButton = page.locator('button[type="submit"], button:has-text("Login")').first();
      
      if (await submitButton.isVisible()) {
        console.log('🧪 Testing empty form submission...');
        await submitButton.click();
        await page.waitForTimeout(2000);
        
        // Screenshot after empty submission
        await page.screenshot({ 
          path: `test-results/validation-02-empty-submit-${Date.now()}.png`,
          fullPage: true 
        });
        
        // Test invalid email format
        const emailInput = page.locator('input[type="email"], input[name="email"]').first();
        if (await emailInput.isVisible()) {
          console.log('🧪 Testing invalid email format...');
          await emailInput.fill('invalid-email');
          await submitButton.click();
          await page.waitForTimeout(2000);
          
          // Screenshot after invalid email
          await page.screenshot({ 
            path: `test-results/validation-03-invalid-email-${Date.now()}.png`,
            fullPage: true 
          });
        }
        
        // Test valid email but invalid password
        if (await emailInput.isVisible()) {
          console.log('🧪 Testing valid email with empty password...');
          await emailInput.fill('jimkalinov@gmail.com');
          await submitButton.click();
          await page.waitForTimeout(2000);
          
          // Screenshot after valid email, empty password
          await page.screenshot({ 
            path: `test-results/validation-04-empty-password-${Date.now()}.png`,
            fullPage: true 
          });
        }
      }
    });

  });

  test.describe('🎯 Quiz Functionality with Debug Screenshots', () => {
    
    test('should navigate through quiz sections with screenshots', async ({ page }) => {
      console.log('🎯 Testing quiz navigation...');
      
      // Try various quiz navigation paths
      const quizPaths = [
        '/quiz',
        '/quick-quiz',
        '/custom-quiz-setup',
        '/timed-test'
      ];
      
      for (const path of quizPaths) {
        try {
          console.log(`🔄 Testing path: ${path}`);
          await page.goto(`http://localhost:5173${path}`);
          await page.waitForTimeout(3000);
          
          // Take screenshot of each quiz path
          await page.screenshot({ 
            path: `test-results/quiz-nav-${path.replace('/', '')}-${Date.now()}.png`,
            fullPage: true 
          });
          
          // Log page content summary
          const title = await page.title();
          const headings = await page.locator('h1, h2, h3').allTextContents();
          console.log(`📄 Page: ${path} - Title: ${title}`);
          console.log(`📑 Headings: ${headings.join(', ')}`);
          
        } catch (error) {
          console.log(`❌ Failed to load ${path}: ${error.message}`);
        }
      }
    });

    test('should interact with quiz setup and capture detailed screenshots', async ({ page }) => {
      console.log('⚙️ Testing quiz setup...');
      
      await page.goto('http://localhost:5173/custom-quiz-setup');
      await page.waitForTimeout(3000);
      
      // Initial setup page screenshot
      await page.screenshot({ 
        path: `test-results/quiz-setup-01-initial-${Date.now()}.png`,
        fullPage: true 
      });
      
      // Look for setup controls
      const selects = page.locator('select');
      const inputs = page.locator('input[type="number"], input[type="range"]');
      const checkboxes = page.locator('input[type="checkbox"]');
      const buttons = page.locator('button');
      
      console.log(`🔍 Found ${await selects.count()} select elements`);
      console.log(`🔍 Found ${await inputs.count()} input elements`);
      console.log(`🔍 Found ${await checkboxes.count()} checkbox elements`);
      console.log(`🔍 Found ${await buttons.count()} button elements`);
      
      // Interact with first select if available
      if (await selects.count() > 0) {
        const firstSelect = selects.first();
        const options = await firstSelect.locator('option').allTextContents();
        console.log(`📋 Select options: ${options.join(', ')}`);
        
        if (options.length > 1) {
          await firstSelect.selectOption({ index: 1 });
          
          // Screenshot after selection
          await page.screenshot({ 
            path: `test-results/quiz-setup-02-after-select-${Date.now()}.png`,
            fullPage: true 
          });
        }
      }
      
      // Interact with number inputs if available
      if (await inputs.count() > 0) {
        const firstInput = inputs.first();
        const inputType = await firstInput.getAttribute('type');
        console.log(`🔢 Input type: ${inputType}`);
        
        if (inputType === 'number') {
          await firstInput.fill('10');
        } else if (inputType === 'range') {
          await firstInput.fill('5');
        }
        
        // Screenshot after input
        await page.screenshot({ 
          path: `test-results/quiz-setup-03-after-input-${Date.now()}.png`,
          fullPage: true 
        });
      }
      
      // Look for start quiz button
      const startButton = page.locator('text=Start Quiz, text=Begin Quiz, button:has-text("Start")').first();
      if (await startButton.isVisible()) {
        console.log('🚀 Found start quiz button');
        await startButton.click();
        await page.waitForTimeout(3000);
        
        // Screenshot after starting quiz
        await page.screenshot({ 
          path: `test-results/quiz-setup-04-quiz-started-${Date.now()}.png`,
          fullPage: true 
        });
      }
    });

    test('should capture quiz question interaction screenshots', async ({ page }) => {
      console.log('❓ Testing quiz question interactions...');
      
      // Try to access a quick quiz
      await page.goto('http://localhost:5173/quick-quiz');
      await page.waitForTimeout(5000);
      
      // Initial quiz page screenshot
      await page.screenshot({ 
        path: `test-results/quiz-question-01-initial-${Date.now()}.png`,
        fullPage: true 
      });
      
      // Look for quiz elements
      const questions = page.locator('h1, h2, h3, .question, [class*="question"]');
      const options = page.locator('button, input[type="radio"], .option, [class*="option"]');
      const controls = page.locator('text=Next, text=Submit, text=Skip, .btn, [class*="btn"]');
      
      console.log(`❓ Questions found: ${await questions.count()}`);
      console.log(`📊 Options found: ${await options.count()}`);
      console.log(`🎮 Controls found: ${await controls.count()}`);
      
      // If quiz is loaded, interact with it
      if (await options.count() > 0) {
        console.log('🎯 Interacting with quiz options...');
        
        // Click first option
        await options.first().click();
        await page.waitForTimeout(2000);
        
        // Screenshot after selecting option
        await page.screenshot({ 
          path: `test-results/quiz-question-02-option-selected-${Date.now()}.png`,
          fullPage: true 
        });
        
        // Look for feedback
        const feedback = page.locator('.correct, .wrong, .feedback, text=Correct, text=Incorrect');
        const hasFeedback = await feedback.count() > 0;
        console.log(`💬 Feedback shown: ${hasFeedback}`);
        
        if (hasFeedback) {
          const feedbackText = await feedback.first().textContent();
          console.log(`💬 Feedback: ${feedbackText}`);
        }
        
        // Try to proceed to next question
        const nextButton = page.locator('text=Next, button:has-text("Next")').first();
        if (await nextButton.isVisible()) {
          await nextButton.click();
          await page.waitForTimeout(2000);
          
          // Screenshot after next question
          await page.screenshot({ 
            path: `test-results/quiz-question-03-next-question-${Date.now()}.png`,
            fullPage: true 
          });
        }
      }
    });

  });

  test.describe('📱 Responsive Design Debug Testing', () => {
    
    test('should test mobile viewport with debug screenshots', async ({ page }) => {
      console.log('📱 Testing mobile viewport...');
      
      // Set mobile viewport
      await page.setViewportSize({ width: 375, height: 667 });
      await page.goto('http://localhost:5173');
      await page.waitForTimeout(3000);
      
      // Mobile homepage screenshot
      await page.screenshot({ 
        path: `test-results/mobile-01-homepage-${Date.now()}.png`,
        fullPage: true 
      });
      
      // Test mobile navigation
      const mobileNavElements = [
        '.bottom-nav',
        '.mobile-nav', 
        '[class*="mobile"]',
        'nav button',
        '.hamburger'
      ];
      
      for (const selector of mobileNavElements) {
        const element = page.locator(selector);
        if (await element.isVisible()) {
          console.log(`📱 Found mobile nav: ${selector}`);
          // Screenshot with mobile nav highlighted
          await element.highlight();
          await page.screenshot({ 
            path: `test-results/mobile-nav-${selector.replace(/\W/g, '_')}-${Date.now()}.png`,
            fullPage: true 
          });
        }
      }
      
      // Test mobile quiz interface
      await page.goto('http://localhost:5173/quiz');
      await page.waitForTimeout(3000);
      
      await page.screenshot({ 
        path: `test-results/mobile-02-quiz-${Date.now()}.png`,
        fullPage: true 
      });
    });

    test('should test tablet viewport with debug screenshots', async ({ page }) => {
      console.log('📱 Testing tablet viewport...');
      
      await page.setViewportSize({ width: 768, height: 1024 });
      await page.goto('http://localhost:5173');
      await page.waitForTimeout(3000);
      
      await page.screenshot({ 
        path: `test-results/tablet-01-homepage-${Date.now()}.png`,
        fullPage: true 
      });
      
      // Test tablet navigation
      await page.goto('http://localhost:5173/quiz');
      await page.waitForTimeout(3000);
      
      await page.screenshot({ 
        path: `test-results/tablet-02-quiz-${Date.now()}.png`,
        fullPage: true 
      });
    });

  });

  test.describe('🔧 Error Handling and Debug Scenarios', () => {
    
    test('should capture error states with screenshots', async ({ page }) => {
      console.log('🔧 Testing error scenarios...');
      
      // Test 404 page
      await page.goto('http://localhost:5173/non-existent-page-debug-test');
      await page.waitForTimeout(3000);
      
      await page.screenshot({ 
        path: `test-results/error-01-404-page-${Date.now()}.png`,
        fullPage: true 
      });
      
      // Test network error simulation
      await page.route('**/*api*', route => route.abort());
      await page.goto('http://localhost:5173');
      await page.waitForTimeout(5000);
      
      await page.screenshot({ 
        path: `test-results/error-02-network-blocked-${Date.now()}.png`,
        fullPage: true 
      });
      
      // Reset network routing
      await page.unroute('**/*api*');
    });

    test('should test performance with debug information', async ({ page }) => {
      console.log('⚡ Testing performance with debug info...');
      
      // Collect timing information
      const startTime = Date.now();
      
      await page.goto('http://localhost:5173');
      await page.waitForLoadState('networkidle');
      
      const loadTime = Date.now() - startTime;
      console.log(`⏱️ Page load time: ${loadTime}ms`);
      
      // Take performance screenshot
      await page.screenshot({ 
        path: `test-results/performance-01-loaded-${loadTime}ms-${Date.now()}.png`,
        fullPage: true 
      });
      
      // Collect browser metrics
      const metrics = await page.evaluate(() => {
        const nav = performance.getEntriesByType('navigation')[0];
        return {
          domContentLoaded: nav.domContentLoadedEventEnd - nav.domContentLoadedEventStart,
          loadComplete: nav.loadEventEnd - nav.loadEventStart,
          firstPaint: performance.getEntriesByName('first-paint')[0]?.startTime || 0,
          firstContentfulPaint: performance.getEntriesByName('first-contentful-paint')[0]?.startTime || 0
        };
      });
      
      console.log('📊 Browser metrics:', metrics);
    });

  });

  test.afterEach(async ({ page }, testInfo) => {
    // Always take a final screenshot after each test
    if (testInfo.status !== 'passed') {
      await page.screenshot({ 
        path: `test-results/final-failure-${testInfo.title.replace(/\W/g, '_')}-${Date.now()}.png`,
        fullPage: true 
      });
    }
    
    console.log(`✅ Test completed: ${testInfo.title} - Status: ${testInfo.status}`);
  });

});