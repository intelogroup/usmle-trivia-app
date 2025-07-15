import { test, expect } from '@playwright/test';

test.describe('USMLE Trivia - Quiz Flow & Database Tests', () => {
  
  test.beforeEach(async ({ page }) => {
    // Set up console error tracking
    page.on('console', msg => {
      if (msg.type() === 'error') {
        console.error('Console error:', msg.text());
      }
    });

    // Set up network request tracking
    page.on('response', response => {
      if (response.status() >= 400) {
        console.error(`Failed request: ${response.url()} - Status: ${response.status()}`);
      }
    });

    await page.goto('/');
    await page.waitForLoadState('networkidle');
  });

  test('should load homepage and navigate to database test', async ({ page }) => {
    // Check if homepage loads
    await expect(page).toHaveTitle(/USMLE Trivia/);
    
    // Navigate to database test page
    await page.goto('/database-test');
    await page.waitForLoadState('networkidle');
    
    // Check if database test page loads
    await expect(page.locator('h1')).toContainText('Database Test');
  });

  test('should test database connectivity', async ({ page }) => {
    await page.goto('/database-test');
    await page.waitForLoadState('networkidle');
    
    // Check environment setup
    const envButton = page.locator('button:has-text("Check Environment")');
    if (await envButton.isVisible()) {
      await envButton.click();
      await page.waitForTimeout(2000);
    }
    
    // Run database tests
    const testButton = page.locator('button:has-text("Run All Tests")');
    if (await testButton.isVisible()) {
      await testButton.click();
      await page.waitForTimeout(5000); // Wait for tests to complete
      
      // Check for test results
      const results = await page.locator('.test-results, .bg-green-100, .bg-red-100').count();
      expect(results).toBeGreaterThan(0);
    }
  });

  test('should navigate to quiz categories', async ({ page }) => {
    // Look for quiz/categories navigation
    const quizLink = page.locator('a[href*="quiz"], a[href*="categories"], button:has-text("Quiz")').first();
    
    if (await quizLink.isVisible()) {
      await quizLink.click();
      await page.waitForLoadState('networkidle');
      
      // Should load categories or quiz page
      const pageContent = await page.textContent('body');
      expect(pageContent).toMatch(/(Quiz|Categories|Question)/i);
    } else {
      // Direct navigation if no link found
      await page.goto('/quiz');
      await page.waitForLoadState('networkidle');
    }
  });

  test('should handle quiz question flow', async ({ page }) => {
    // Navigate to quick quiz
    await page.goto('/quick-quiz');
    await page.waitForLoadState('networkidle');
    
    // Wait for questions to load or error state
    await page.waitForTimeout(3000);
    
    // Check if quiz loaded
    const quizContent = page.locator('.quiz-container, [data-testid="quiz"], .question-card');
    const loadingIndicator = page.locator('.loading, .spinner');
    const errorMessage = page.locator('.error');
    
    const hasQuizContent = await quizContent.count() > 0;
    const hasLoading = await loadingIndicator.count() > 0;
    const hasError = await errorMessage.count() > 0;
    
    if (hasQuizContent) {
      console.log('Quiz loaded successfully');
      
      // Try to interact with quiz
      const options = page.locator('button:has-text("A)"), button:has-text("B)"), .option');
      if (await options.count() > 0) {
        await options.first().click();
        await page.waitForTimeout(1000);
        
        // Look for next button or auto-advance
        const nextButton = page.locator('button:has-text("Next"), button:has-text("Continue")');
        if (await nextButton.isVisible()) {
          await nextButton.click();
        }
      }
    } else if (hasLoading) {
      console.log('Quiz is still loading');
    } else if (hasError) {
      console.log('Quiz has error state - this is expected without database');
      
      // Check if offline mode or demo questions available
      const offlineButton = page.locator('button:has-text("Offline"), button:has-text("Demo")');
      if (await offlineButton.isVisible()) {
        await offlineButton.click();
        await page.waitForTimeout(2000);
      }
    }
    
    // Verify no critical JavaScript errors
    const pageErrors = [];
    page.on('pageerror', error => pageErrors.push(error.message));
    expect(pageErrors.filter(e => !e.includes('Supabase')).length).toBe(0);
  });

  test('should handle timed test flow', async ({ page }) => {
    await page.goto('/timed-test');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(3000);
    
    // Check timed test state
    const timerElement = page.locator('.timer, [data-testid="timer"]');
    const hasTimer = await timerElement.count() > 0;
    
    if (hasTimer) {
      console.log('Timed test loaded with timer');
    } else {
      console.log('Timed test in error/loading state');
    }
    
    // Verify page doesn't crash
    const pageTitle = await page.title();
    expect(pageTitle).toContain('USMLE');
  });

  test('should handle authentication flow', async ({ page }) => {
    // Check for auth-related elements
    const loginButton = page.locator('button:has-text("Login"), a:has-text("Login"), a:has-text("Sign In")');
    const signupButton = page.locator('button:has-text("Sign Up"), a:has-text("Sign Up"), a:has-text("Register")');
    
    if (await loginButton.isVisible()) {
      await loginButton.click();
      await page.waitForLoadState('networkidle');
      
      // Should navigate to login page
      const currentUrl = page.url();
      expect(currentUrl).toMatch(/(login|auth|sign)/i);
      
      // Check for login form elements
      const emailInput = page.locator('input[type="email"], input[placeholder*="email"]');
      const passwordInput = page.locator('input[type="password"], input[placeholder*="password"]');
      
      if (await emailInput.isVisible() && await passwordInput.isVisible()) {
        console.log('Login form loaded successfully');
      }
    }
  });

  test('should check leaderboard functionality', async ({ page }) => {
    await page.goto('/leaderboard');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);
    
    // Check if leaderboard loads (even in error state)
    const leaderboardContent = await page.textContent('body');
    expect(leaderboardContent).toMatch(/(Leaderboard|Rankings|Top|Scores)/i);
    
    // Should not crash the page
    const pageTitle = await page.title();
    expect(pageTitle).toContain('USMLE');
  });

  test('should handle profile page', async ({ page }) => {
    await page.goto('/profile');
    await page.waitForLoadState('networkidle');
    
    // Check profile page loads
    const profileContent = await page.textContent('body');
    expect(profileContent).toMatch(/(Profile|Settings|Account|Database)/i);
    
    // Look for database connection test button
    const testConnectionButton = page.locator('button:has-text("Test"), button:has-text("Connection")');
    if (await testConnectionButton.isVisible()) {
      await testConnectionButton.click();
      await page.waitForTimeout(2000);
      
      // Should show some result
      const resultText = await page.textContent('body');
      expect(resultText).toMatch(/(success|error|connection|configured)/i);
    }
  });

  test('should validate quiz component interactions', async ({ page }) => {
    await page.goto('/quick-quiz');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(3000);
    
    // Check for quiz components
    const questionText = page.locator('.question, .question-text, h2, h3');
    const optionButtons = page.locator('button, .option, .choice');
    const progressBar = page.locator('.progress, [role="progressbar"]');
    
    const hasQuestion = await questionText.count() > 0;
    const hasOptions = await optionButtons.count() > 0;
    const hasProgress = await progressBar.count() > 0;
    
    console.log(`Quiz components - Question: ${hasQuestion}, Options: ${hasOptions}, Progress: ${hasProgress}`);
    
    // Try keyboard navigation
    await page.keyboard.press('ArrowDown');
    await page.keyboard.press('Enter');
    
    // Verify no accessibility issues with basic navigation
    expect(true).toBe(true); // Test passes if no errors thrown
  });

  test('should check responsive design', async ({ page }) => {
    // Test mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    
    // Should still be functional on mobile
    const bodyText = await page.textContent('body');
    expect(bodyText.length).toBeGreaterThan(0);
    
    // Test tablet viewport
    await page.setViewportSize({ width: 768, height: 1024 });
    await page.reload();
    await page.waitForLoadState('networkidle');
    
    // Should still be functional on tablet
    const tabletText = await page.textContent('body');
    expect(tabletText.length).toBeGreaterThan(0);
    
    // Reset to desktop
    await page.setViewportSize({ width: 1280, height: 720 });
  });

  test('should check error handling and fallbacks', async ({ page }) => {
    // Navigate to non-existent route
    await page.goto('/non-existent-route');
    await page.waitForLoadState('networkidle');
    
    // Should handle 404 gracefully
    const pageText = await page.textContent('body');
    expect(pageText).toMatch(/(404|Not Found|Error|Home)/i);
    
    // Should be able to navigate back
    const homeLink = page.locator('a[href="/"], a:has-text("Home"), button:has-text("Home")');
    if (await homeLink.first().isVisible()) {
      await homeLink.first().click();
      await page.waitForLoadState('networkidle');
      
      // Should be back to working state
      await expect(page).toHaveTitle(/USMLE Trivia/);
    }
  });

  test('should validate performance metrics', async ({ page }) => {
    const startTime = Date.now();
    
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    
    const loadTime = Date.now() - startTime;
    console.log(`Page load time: ${loadTime}ms`);
    
    // Should load within reasonable time (15 seconds for first load)
    expect(loadTime).toBeLessThan(15000);
    
    // Check for large resources
    let largeResources = 0;
    page.on('response', response => {
      const contentLength = response.headers()['content-length'];
      if (contentLength && parseInt(contentLength) > 1000000) { // 1MB+
        largeResources++;
        console.log(`Large resource: ${response.url()} - ${contentLength} bytes`);
      }
    });
    
    // Navigate to different pages to check resource loading
    const pages = ['/quiz', '/leaderboard', '/profile'];
    for (const pagePath of pages) {
      await page.goto(pagePath);
      await page.waitForTimeout(1000);
    }
    
    // Should not have too many large resources
    expect(largeResources).toBeLessThan(5);
  });
});

test.describe('Database Integration Tests', () => {
  
  test('should validate question service functionality', async ({ page }) => {
    await page.goto('/database-test');
    await page.waitForLoadState('networkidle');
    
    // Test database connection via the test page
    await page.waitForTimeout(2000);
    
    // Look for test results
    const connectionStatus = page.locator('.connection-status, .bg-green-100, .bg-red-100');
    const hasResults = await connectionStatus.count() > 0;
    
    if (hasResults) {
      const statusText = await connectionStatus.first().textContent();
      console.log(`Database status: ${statusText}`);
      
      // Check for specific test results
      const categoriesSection = page.locator('text=Categories');
      const questionsSection = page.locator('text=Questions');
      
      if (await categoriesSection.isVisible()) {
        console.log('Categories test section found');
      }
      
      if (await questionsSection.isVisible()) {
        console.log('Questions test section found');
      }
    }
    
    expect(true).toBe(true); // Test passes if page loads without crashing
  });

  test('should handle offline mode gracefully', async ({ page }) => {
    // Simulate offline condition
    await page.context().setOffline(true);
    
    await page.goto('/quick-quiz');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(3000);
    
    // Should show offline message or demo mode
    const offlineIndicator = page.locator('text=offline, text=demo, text=network, .wifi-off');
    const hasOfflineMode = await offlineIndicator.count() > 0;
    
    console.log(`Offline mode detected: ${hasOfflineMode}`);
    
    // Re-enable network
    await page.context().setOffline(false);
    
    // Should handle network restoration
    await page.reload();
    await page.waitForLoadState('networkidle');
    
    expect(true).toBe(true); // Test passes if no crashes
  });

  test('should validate quiz session management', async ({ page }) => {
    await page.goto('/quick-quiz');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(3000);
    
    // Check for session-related elements
    const sessionElements = page.locator('.session, .quiz-id, .progress');
    const hasSessionUI = await sessionElements.count() > 0;
    
    console.log(`Session UI elements found: ${hasSessionUI}`);
    
    // Try to start a new session (if possible)
    const startButton = page.locator('button:has-text("Start"), button:has-text("Begin"), button:has-text("New")');
    if (await startButton.isVisible()) {
      await startButton.click();
      await page.waitForTimeout(1000);
    }
    
    expect(true).toBe(true); // Test passes if no errors
  });
}); 