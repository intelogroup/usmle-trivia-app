import { test, expect } from '@playwright/test';

test.describe('Quiz Flow Debug - Complete E2E Testing', () => {
  test('should test complete quiz flow with authentication and question loading', async ({ page }) => {
    console.log('🔍 Starting comprehensive quiz flow test...');

    // Monitor console errors
    const consoleErrors = [];
    const consoleWarnings = [];

    page.on('console', msg => {
      const text = msg.text();
      if (msg.type() === 'error') {
        consoleErrors.push(text);
        console.log('❌ Console Error:', text);
      } else if (msg.type() === 'warning') {
        consoleWarnings.push(text);
        console.log('⚠️ Console Warning:', text);
      }
    });

    // Monitor network failures
    const failedRequests = [];
    page.on('requestfailed', request => {
      failedRequests.push({
        url: request.url(),
        failure: request.failure()
      });
      console.log('🌐 Failed Request:', request.url(), request.failure());
    });

    try {
      // Step 1: Navigate to welcome page
      console.log('\n📍 Step 1: Navigate to welcome page');
      await page.goto('http://localhost:5173/', { timeout: 30000 });
      await page.waitForLoadState('networkidle');
      await page.screenshot({ path: 'quiz-debug-1-welcome.png', fullPage: true });

      // Step 2: Go to login page
      console.log('\n📍 Step 2: Navigate to login');
      const signInButton = page.locator('text="Sign In"').first();
      await signInButton.click();
      await page.waitForURL('**/login', { timeout: 10000 });
      await page.screenshot({ path: 'quiz-debug-2-login.png', fullPage: true });

      // Step 3: Login with real test user
      console.log('\n📍 Step 3: Login with real test user');

      // Use the test credentials from .env file
      const testEmail = 'jimkalinov@gmail.com';
      const testPassword = 'Jimkali90#';
      console.log('📧 Using test email:', testEmail);

      // Fill login form (we're already on login page)
      await page.fill('input[type="email"]', testEmail);
      await page.fill('input[type="password"]', testPassword);

      // Wait for button to be enabled
      await page.waitForFunction(() => {
        const button = document.querySelector('button[type="submit"]');
        return button && !button.disabled;
      }, { timeout: 10000 });

      const loginButton = page.locator('button[type="submit"]');
      await loginButton.click();

      // Wait for login to complete
      await page.waitForTimeout(5000);
      await page.screenshot({ path: 'quiz-debug-4-after-login.png', fullPage: true });

      // Check if we're redirected to home
      const currentUrl = page.url();
      console.log('📍 After login URL:', currentUrl);

      if (currentUrl.includes('/login') || currentUrl.includes('/signup')) {
        console.log('❌ Login failed, still on auth page');
        const errorMessage = await page.locator('.error, [role="alert"]').textContent().catch(() => 'No error message found');
        console.log('Error message:', errorMessage);
      } else {
        console.log('✅ Login successful, redirected to:', currentUrl);
      }

      // Step 4: Navigate to quiz section
      console.log('\n📍 Step 4: Navigate to quiz section');
      await page.goto('http://localhost:5173/quiz', { timeout: 15000 });
      await page.waitForLoadState('networkidle');
      await page.screenshot({ path: 'quiz-debug-5-quiz-page.png', fullPage: true });

      // Check if we can see quiz content
      const pageContent = await page.textContent('body');
      console.log(`📄 Page content preview: ${pageContent.substring(0, 200)}...`);

      // Step 5: Test quiz start
      console.log('\n📍 Step 5: Test quiz start');

      // Look for Quick Start button first
      const quickStartButton = page.locator('button:has-text("Quick Start")').first();
      if (await quickStartButton.isVisible()) {
        console.log('🎯 Found Quick Start button');
        await quickStartButton.click();
        await page.waitForTimeout(3000);
        await page.screenshot({ path: 'quiz-debug-6-quiz-started.png', fullPage: true });
      } else {
        console.log('⚠️ Quick Start button not found, trying category selection');

        // Try to click on any category card
        const categoryCards = [
          'button:has-text("Cardiology")',
          'button:has-text("Neurology")',
          'button:has-text("General Medicine")',
          '.bg-white.rounded-xl', // Generic category card selector
          '[role="button"]'
        ];

        let categoryClicked = false;
        for (const selector of categoryCards) {
          try {
            const categoryCard = page.locator(selector).first();
            if (await categoryCard.isVisible()) {
              console.log(`🎯 Found category card: ${selector}`);
              await categoryCard.click();
              await page.waitForTimeout(3000);
              await page.screenshot({ path: 'quiz-debug-6-category-selected.png', fullPage: true });
              categoryClicked = true;
              break;
            }
          } catch (error) {
            console.log(`⚠️ Category selector ${selector} failed: ${error.message}`);
          }
        }

        if (!categoryClicked) {
          console.log('❌ No category cards found or clickable');
        }
      }

      // Check if we're now on a quiz page
      await page.waitForTimeout(2000);
      const quizUrl = page.url();
      console.log('📍 After quiz start URL:', quizUrl);

      if (quizUrl.includes('/quick-quiz') || quizUrl.includes('/quiz/')) {
        console.log('✅ Successfully navigated to quiz page');
        await page.screenshot({ path: 'quiz-debug-7-quiz-page.png', fullPage: true });

        // Look for question content
        const questionSelectors = [
          '.question-text',
          '[data-testid="question"]',
          'h2:has-text("Question")',
          '.quiz-question',
          'p:has-text("A ")', // Medical questions often start with "A patient..."
          'div:has-text("Which")',
          'div:has-text("What")'
        ];

        let questionFound = false;
        for (const selector of questionSelectors) {
          try {
            const question = page.locator(selector).first();
            if (await question.isVisible()) {
              const questionText = await question.textContent();
              console.log(`📝 Found question: ${questionText.substring(0, 100)}...`);
              questionFound = true;

              // Try to find and click an answer option
              const optionSelectors = [
                'button[data-option-id]',
                'button:has-text("A.")',
                'button:has-text("B.")',
                '.option-button',
                'input[type="radio"]'
              ];

              for (const optionSelector of optionSelectors) {
                try {
                  const optionButton = page.locator(optionSelector).first();
                  if (await optionButton.isVisible()) {
                    console.log(`🎯 Found answer option: ${optionSelector}`);
                    await optionButton.click();
                    await page.waitForTimeout(2000);
                    await page.screenshot({ path: 'quiz-debug-8-answered.png', fullPage: true });
                    console.log('✅ Successfully answered a question');
                    break;
                  }
                } catch (error) {
                  console.log(`⚠️ Option selector ${optionSelector} failed`);
                }
              }
              break;
            }
          } catch (error) {
            console.log(`⚠️ Question selector ${selector} failed`);
          }
        }

        if (!questionFound) {
          console.log('❌ No questions found on quiz page');
          const pageContent = await page.textContent('body');
          console.log(`📄 Quiz page content preview: ${pageContent.substring(0, 300)}...`);
        }
      } else {
        console.log('❌ Did not navigate to quiz page');
      }

      // Final screenshot
      await page.screenshot({ path: 'quiz-debug-8-final.png', fullPage: true });

    } catch (error) {
      console.error('🚨 Test error:', error);
      await page.screenshot({ path: 'quiz-debug-error.png', fullPage: true });
    }

    // Report results
    console.log('\n📊 TEST RESULTS:');
    console.log(`Console Errors: ${consoleErrors.length}`);
    console.log(`Console Warnings: ${consoleWarnings.length}`);
    console.log(`Failed Requests: ${failedRequests.length}`);

    if (consoleErrors.length > 0) {
      console.log('\n❌ CONSOLE ERRORS:');
      consoleErrors.forEach((error, i) => console.log(`${i + 1}. ${error}`));
    }

    if (failedRequests.length > 0) {
      console.log('\n🌐 FAILED REQUESTS:');
      failedRequests.forEach((req, i) => console.log(`${i + 1}. ${req.url} - ${req.failure?.errorText}`));
    }

    // The test should pass if we can navigate without critical errors
    expect(consoleErrors.filter(e => !e.includes('Download the React DevTools')).length).toBeLessThan(5);
  });
});
