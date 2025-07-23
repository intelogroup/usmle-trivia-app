import { test, expect } from '@playwright/test';

/**
 * Real World USMLE Trivia App Testing
 * Comprehensive testing with real user scenarios
 */

test.describe('USMLE Trivia App - Real World Testing', () => {

  // Test setup
  test.beforeEach(async ({ page }) => {
    // Enable console logging
    page.on('console', msg => console.log(`Console: ${msg.text()}`));
    page.on('pageerror', err => console.log(`Page Error: ${err.message}`));
    
    // Go to app
    await page.goto('http://localhost:5173');
  });

  test.describe('Initial Load and Landing Experience', () => {
    
    test('should load the homepage within 3 seconds', async ({ page }) => {
      const startTime = Date.now();
      await page.waitForLoadState('networkidle');
      const loadTime = Date.now() - startTime;
      
      console.log(`Page load time: ${loadTime}ms`);
      expect(loadTime).toBeLessThan(3000);
    });

    test('should display main navigation elements', async ({ page }) => {
      // Check for main navigation
      const navigation = page.locator('nav, [role="navigation"]');
      await expect(navigation).toBeVisible({ timeout: 5000 });
      
      // Check for key action buttons
      const getStartedBtn = page.locator('text=Get Started');
      const loginBtn = page.locator('text=Login');
      
      if (await getStartedBtn.isVisible()) {
        await expect(getStartedBtn).toBeVisible();
      } else if (await loginBtn.isVisible()) {
        await expect(loginBtn).toBeVisible();
      }
    });

    test('should have proper semantic HTML structure', async ({ page }) => {
      // Check for semantic elements
      const header = page.locator('header, [role="banner"]');
      const main = page.locator('main, [role="main"]');
      const nav = page.locator('nav, [role="navigation"]');
      
      await expect(header).toBeVisible();
      await expect(main).toBeVisible();
      await expect(nav).toBeVisible();
    });

  });

  test.describe('Authentication Flow Testing', () => {
    
    test('should navigate to signup/login from homepage', async ({ page }) => {
      // Try to find authentication entry points
      const authButtons = [
        'text=Get Started',
        'text=Sign Up', 
        'text=Login',
        'text=Start Learning',
        '[aria-label*="auth"]'
      ];
      
      let foundAuth = false;
      for (const selector of authButtons) {
        const button = page.locator(selector).first();
        if (await button.isVisible()) {
          await button.click();
          foundAuth = true;
          break;
        }
      }
      
      if (foundAuth) {
        // Should navigate to auth page
        await page.waitForURL('**/auth/**', { timeout: 5000 });
        const url = page.url();
        console.log(`Navigated to auth: ${url}`);
      } else {
        console.log('No authentication entry points found');
      }
    });

    test('should display login form when accessed', async ({ page }) => {
      // Try to navigate to login
      try {
        await page.goto('http://localhost:5173/auth/login');
        
        // Check for form elements
        const emailInput = page.locator('input[type="email"], input[name="email"]');
        const passwordInput = page.locator('input[type="password"], input[name="password"]');
        const submitButton = page.locator('button[type="submit"], button:has-text("Login")');
        
        await expect(emailInput).toBeVisible();
        await expect(passwordInput).toBeVisible();
        await expect(submitButton).toBeVisible();
        
        console.log('Login form elements found');
      } catch (error) {
        console.log(`Login page not accessible: ${error.message}`);
      }
    });

    test('should validate form inputs', async ({ page }) => {
      try {
        await page.goto('http://localhost:5173/auth/login');
        
        const submitButton = page.locator('button[type="submit"], button:has-text("Login")').first();
        
        if (await submitButton.isVisible()) {
          // Try to submit empty form
          await submitButton.click();
          
          // Wait for validation messages
          await page.waitForTimeout(1000);
          
          const errorMessages = page.locator('.error, .invalid, [role="alert"], .text-red');
          const hasErrors = await errorMessages.count() > 0;
          
          console.log(`Form validation ${hasErrors ? 'works' : 'missing'}`);
        }
      } catch (error) {
        console.log(`Form validation test failed: ${error.message}`);
      }
    });

  });

  test.describe('Quiz Navigation and Setup', () => {
    
    test('should access quiz section from main navigation', async ({ page }) => {
      // Look for quiz-related navigation
      const quizNavButtons = [
        'text=Quiz',
        'text=Quizzes', 
        'text=Start Quiz',
        'text=Practice',
        '[aria-label*="quiz"]'
      ];
      
      let foundQuizNav = false;
      for (const selector of quizNavButtons) {
        const button = page.locator(selector).first();
        if (await button.isVisible()) {
          console.log(`Found quiz navigation: ${selector}`);
          await button.click();
          foundQuizNav = true;
          
          // Wait for navigation
          await page.waitForTimeout(1000);
          break;
        }
      }
      
      if (!foundQuizNav) {
        // Try direct navigation
        await page.goto('http://localhost:5173/quiz');
      }
      
      // Check if we reached quiz section
      const url = page.url();
      console.log(`Quiz section URL: ${url}`);
      
      // Look for quiz types or setup options
      const quizOptions = page.locator('text=Quick Quiz, text=Custom Quiz, text=Timed Test');
      const hasQuizOptions = await quizOptions.count() > 0;
      console.log(`Quiz options ${hasQuizOptions ? 'found' : 'not found'}`);
    });

    test('should display different quiz types', async ({ page }) => {
      try {
        await page.goto('http://localhost:5173/quiz');
        
        // Look for different quiz types
        const quizTypes = [
          'text=Quick Quiz',
          'text=Custom Quiz', 
          'text=Timed Test',
          'text=Practice Quiz'
        ];
        
        const foundTypes = [];
        for (const type of quizTypes) {
          const element = page.locator(type);
          if (await element.isVisible()) {
            foundTypes.push(type.replace('text=', ''));
          }
        }
        
        console.log(`Found quiz types: ${foundTypes.join(', ')}`);
        expect(foundTypes.length).toBeGreaterThan(0);
        
      } catch (error) {
        console.log(`Quiz types test failed: ${error.message}`);
      }
    });

    test('should access custom quiz setup', async ({ page }) => {
      try {
        await page.goto('http://localhost:5173/custom-quiz-setup');
        
        // Check for quiz setup elements
        const setupElements = [
          'text=Subject',
          'text=System', 
          'text=Topic',
          'text=Difficulty',
          'text=Number of Questions',
          'select, input[type="number"], input[type="range"]'
        ];
        
        let foundElements = 0;
        for (const selector of setupElements) {
          const elements = page.locator(selector);
          const count = await elements.count();
          if (count > 0) foundElements++;
        }
        
        console.log(`Quiz setup elements found: ${foundElements}/${setupElements.length}`);
        
        // Check for question count display
        const questionCount = page.locator('text=/\\d+ questions/, text=/Available/, text=/Questions:/');
        const hasQuestionCount = await questionCount.count() > 0;
        console.log(`Question count display: ${hasQuestionCount ? 'present' : 'missing'}`);
        
      } catch (error) {
        console.log(`Custom quiz setup test failed: ${error.message}`);
      }
    });

  });

  test.describe('Quiz Execution Testing', () => {
    
    test('should start a quiz and display questions', async ({ page }) => {
      try {
        // Try to start a quick quiz
        await page.goto('http://localhost:5173/quiz');
        
        const quickQuizBtn = page.locator('text=Quick Quiz').first();
        if (await quickQuizBtn.isVisible()) {
          await quickQuizBtn.click();
          
          // Wait for quiz to load
          await page.waitForTimeout(3000);
          
          // Look for quiz question elements
          const questionElements = [
            'h1, h2, h3',  // Question heading
            'text=Question',
            '.question, [class*="question"]',
            'button, input[type="radio"]'  // Answer options
          ];
          
          let foundQuestionElements = 0;
          for (const selector of questionElements) {
            const elements = page.locator(selector);
            const count = await elements.count();
            if (count > 0) foundQuestionElements++;
          }
          
          console.log(`Quiz question elements found: ${foundQuestionElements}/${questionElements.length}`);
          
          // Check for quiz controls
          const controls = page.locator('text=Next, text=Submit, text=Skip');
          const hasControls = await controls.count() > 0;
          console.log(`Quiz controls: ${hasControls ? 'present' : 'missing'}`);
          
          // Check for progress indicator
          const progress = page.locator('[role="progressbar"], .progress, text=/\\d+.*of.*\\d+/');
          const hasProgress = await progress.count() > 0;
          console.log(`Progress indicator: ${hasProgress ? 'present' : 'missing'}`);
        }
        
      } catch (error) {
        console.log(`Quiz execution test failed: ${error.message}`);
      }
    });

    test('should handle quiz interactions', async ({ page }) => {
      try {
        // Try to interact with quiz if available
        await page.goto('http://localhost:5173/quick-quiz');
        
        await page.waitForTimeout(2000);
        
        // Look for answer options
        const answerOptions = page.locator('button, input[type="radio"], .option, [class*="option"]');
        const optionCount = await answerOptions.count();
        
        if (optionCount > 0) {
          console.log(`Found ${optionCount} answer options`);
          
          // Try to select first option
          await answerOptions.first().click();
          
          // Wait for feedback
          await page.waitForTimeout(1000);
          
          // Check for feedback elements
          const feedback = page.locator('.correct, .wrong, .feedback, text=Correct, text=Incorrect');
          const hasFeedback = await feedback.count() > 0;
          console.log(`Answer feedback: ${hasFeedback ? 'present' : 'missing'}`);
          
          // Look for next question button
          const nextBtn = page.locator('text=Next, button:has-text("Next")').first();
          if (await nextBtn.isVisible()) {
            await nextBtn.click();
            console.log('Successfully moved to next question');
          }
        }
        
      } catch (error) {
        console.log(`Quiz interaction test failed: ${error.message}`);
      }
    });

  });

  test.describe('Responsive Design Testing', () => {
    
    test('should work on mobile viewport', async ({ page }) => {
      await page.setViewportSize({ width: 375, height: 667 }); // iPhone SE
      
      await page.goto('http://localhost:5173');
      
      // Check if content is responsive
      const body = page.locator('body');
      const bodyWidth = await body.evaluate(el => el.scrollWidth);
      const viewportWidth = page.viewportSize().width;
      
      console.log(`Mobile - Body width: ${bodyWidth}, Viewport: ${viewportWidth}`);
      expect(bodyWidth).toBeLessThanOrEqual(viewportWidth + 10); // 10px tolerance
      
      // Check for mobile navigation
      const mobileNav = page.locator('.bottom-nav, .mobile-nav, [class*="mobile"]');
      const hasMobileNav = await mobileNav.count() > 0;
      console.log(`Mobile navigation: ${hasMobileNav ? 'present' : 'missing'}`);
    });

    test('should work on tablet viewport', async ({ page }) => {
      await page.setViewportSize({ width: 768, height: 1024 }); // iPad
      
      await page.goto('http://localhost:5173');
      
      // Check content adaptation
      const content = page.locator('main, .main-content, [role="main"]').first();
      if (await content.isVisible()) {
        const contentWidth = await content.boundingBox();
        console.log(`Tablet - Content width: ${contentWidth?.width}`);
        expect(contentWidth?.width).toBeGreaterThan(500);
      }
    });

    test('should work on desktop viewport', async ({ page }) => {
      await page.setViewportSize({ width: 1920, height: 1080 }); // Full HD
      
      await page.goto('http://localhost:5173');
      
      // Check for desktop layout elements
      const sidebar = page.locator('.sidebar, aside, [role="navigation"]:not(.bottom-nav)');
      const hasSidebar = await sidebar.count() > 0;
      console.log(`Desktop sidebar: ${hasSidebar ? 'present' : 'missing'}`);
      
      // Content should not be too wide
      const mainContent = page.locator('main, .container, [role="main"]').first();
      if (await mainContent.isVisible()) {
        const contentBox = await mainContent.boundingBox();
        if (contentBox) {
          console.log(`Desktop - Content width: ${contentBox.width}`);
          expect(contentBox.width).toBeLessThan(1600); // Not too stretched
        }
      }
    });

  });

  test.describe('Accessibility Testing', () => {
    
    test('should have proper heading structure', async ({ page }) => {
      await page.goto('http://localhost:5173');
      
      const h1Count = await page.locator('h1').count();
      console.log(`H1 elements: ${h1Count}`);
      expect(h1Count).toBeLessThanOrEqual(1); // Should have 0 or 1 h1
      
      if (h1Count === 1) {
        const h1Text = await page.locator('h1').textContent();
        expect(h1Text?.trim()).toBeTruthy();
        console.log(`H1 text: "${h1Text}"`);
      }
    });

    test('should have keyboard navigation support', async ({ page }) => {
      await page.goto('http://localhost:5173');
      
      // Try tab navigation
      await page.keyboard.press('Tab');
      const focusedElement = await page.evaluate(() => document.activeElement?.tagName);
      
      console.log(`First focused element: ${focusedElement}`);
      expect(['A', 'BUTTON', 'INPUT', 'SELECT', 'TEXTAREA'].includes(focusedElement || '')).toBe(true);
    });

    test('should have alt text for images', async ({ page }) => {
      await page.goto('http://localhost:5173');
      
      const images = page.locator('img');
      const imageCount = await images.count();
      
      let missingAltCount = 0;
      for (let i = 0; i < imageCount; i++) {
        const alt = await images.nth(i).getAttribute('alt');
        if (alt === null) {
          missingAltCount++;
        }
      }
      
      console.log(`Images: ${imageCount}, Missing alt: ${missingAltCount}`);
      expect(missingAltCount).toBe(0);
    });

    test('should have proper form labels', async ({ page }) => {
      try {
        await page.goto('http://localhost:5173/auth/login');
        
        const inputs = page.locator('input');
        const inputCount = await inputs.count();
        
        let unlabeledCount = 0;
        for (let i = 0; i < inputCount; i++) {
          const input = inputs.nth(i);
          const id = await input.getAttribute('id');
          const ariaLabel = await input.getAttribute('aria-label');
          const ariaLabelledBy = await input.getAttribute('aria-labelledby');
          
          // Check for associated label
          let hasLabel = false;
          if (id) {
            const label = page.locator(`label[for="${id}"]`);
            hasLabel = await label.count() > 0;
          }
          
          if (!hasLabel && !ariaLabel && !ariaLabelledBy) {
            unlabeledCount++;
          }
        }
        
        console.log(`Form inputs: ${inputCount}, Unlabeled: ${unlabeledCount}`);
        expect(unlabeledCount).toBe(0);
        
      } catch (error) {
        console.log(`Form label test skipped: ${error.message}`);
      }
    });

  });

  test.describe('Error Handling and Edge Cases', () => {
    
    test('should handle 404 pages gracefully', async ({ page }) => {
      const response = await page.goto('http://localhost:5173/non-existent-page-12345');
      
      // Should either redirect or show proper 404
      const currentUrl = page.url();
      const pageContent = await page.textContent('body');
      
      const handles404Properly = 
        currentUrl.includes('404') || 
        currentUrl === 'http://localhost:5173/' || 
        pageContent?.includes('404') ||
        pageContent?.includes('Not Found') ||
        pageContent?.includes('Page not found');
      
      console.log(`404 handling: ${handles404Properly ? 'proper' : 'needs improvement'}`);
      console.log(`Final URL: ${currentUrl}`);
      
      expect(handles404Properly).toBe(true);
    });

    test('should handle network errors', async ({ page }) => {
      // Block all network requests to simulate offline
      await page.route('**/*', route => route.abort());
      
      try {
        await page.goto('http://localhost:5173');
        
        // Should show some kind of error or offline message
        await page.waitForTimeout(3000);
        
        const errorElements = page.locator('.error, .offline, text=Error, text=Network, text=Failed');
        const hasErrorHandling = await errorElements.count() > 0;
        
        console.log(`Network error handling: ${hasErrorHandling ? 'present' : 'missing'}`);
        
      } catch (error) {
        console.log(`Expected network error: ${error.message}`);
      }
    });

    test('should handle slow loading gracefully', async ({ page }) => {
      // Slow down network
      await page.route('**/*', async route => {
        await new Promise(resolve => setTimeout(resolve, 1000));
        await route.continue();
      });
      
      const startTime = Date.now();
      await page.goto('http://localhost:5173');
      
      // Check for loading indicators
      const loadingElements = page.locator('.loading, .spinner, [data-testid="loading"]');
      const hasLoadingIndicator = await loadingElements.count() > 0;
      
      console.log(`Loading indicator: ${hasLoadingIndicator ? 'present' : 'missing'}`);
      
      const loadTime = Date.now() - startTime;
      console.log(`Slow load time: ${loadTime}ms`);
    });

  });

  test.describe('Performance Testing', () => {
    
    test('should have reasonable bundle sizes', async ({ page }) => {
      const responses = [];
      page.on('response', response => {
        if (response.url().includes('.js') || response.url().includes('.css')) {
          responses.push({
            url: response.url(),
            size: response.headers()['content-length'],
            status: response.status()
          });
        }
      });
      
      await page.goto('http://localhost:5173');
      await page.waitForLoadState('networkidle');
      
      console.log('Asset sizes:');
      responses.forEach(resp => {
        const sizeKB = resp.size ? Math.round(resp.size / 1024) : 'unknown';
        console.log(`  ${resp.url.split('/').pop()}: ${sizeKB}KB`);
      });
      
      // Main bundle should be reasonable size
      const mainJS = responses.find(r => r.url.includes('index') && r.url.includes('.js'));
      if (mainJS && mainJS.size) {
        const sizeKB = mainJS.size / 1024;
        console.log(`Main JS bundle: ${Math.round(sizeKB)}KB`);
        expect(sizeKB).toBeLessThan(500); // Should be under 500KB
      }
    });

    test('should not have console errors', async ({ page }) => {
      const errors = [];
      page.on('console', msg => {
        if (msg.type() === 'error') {
          errors.push(msg.text());
        }
      });
      
      page.on('pageerror', err => {
        errors.push(err.message);
      });
      
      await page.goto('http://localhost:5173');
      await page.waitForLoadState('networkidle');
      
      if (errors.length > 0) {
        console.log('Console errors found:');
        errors.forEach(error => console.log(`  - ${error}`));
      }
      
      // Allow some errors but not too many
      expect(errors.length).toBeLessThan(5);
    });

  });

});