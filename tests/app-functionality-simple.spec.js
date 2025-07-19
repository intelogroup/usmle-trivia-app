import { test, expect } from '@playwright/test';

test.describe('USMLE Trivia App - Core Functionality', () => {
  const TEST_EMAIL = 'testuser@example.com';
  const TEST_PASSWORD = 'password123';

  test.beforeEach(async ({ page }) => {
    // Clear storage
    await page.goto('/');
    await page.evaluate(() => {
      try {
        localStorage.clear();
        sessionStorage.clear();
      } catch (e) {
        console.log('Storage clear failed:', e);
      }
    });
  });

  test('should load home page successfully', async ({ page }) => {
    await page.goto('/');
    
    // Check if page loads (look for any content)
    await expect(page.locator('body')).not.toBeEmpty();
    
    // Should have a title
    await expect(page).toHaveTitle(/USMLE|Trivia|Medical/);
    
    // Should show some content within 10 seconds
    await page.waitForFunction(() => document.body.innerText.length > 100, { timeout: 10000 });
  });

  test('should navigate to quiz section', async ({ page }) => {
    await page.goto('/');
    
    // Try to navigate to quiz
    await page.goto('/quiz-tab');
    
    // Should load quiz page
    await expect(page).toHaveURL(/quiz-tab/);
    await page.waitForTimeout(3000);
    
    // Should show some quiz-related content
    const pageContent = await page.textContent('body');
    expect(pageContent.toLowerCase()).toMatch(/quiz|question|start|begin/);
  });

  test('should show login page', async ({ page }) => {
    await page.goto('/login');
    
    // Should show login form
    await expect(page.locator('input[type="email"]')).toBeVisible({ timeout: 10000 });
    await expect(page.locator('input[type="password"]')).toBeVisible();
    await expect(page.locator('button[type="submit"]')).toBeVisible();
  });

  test('should attempt quiz flow without login', async ({ page }) => {
    await page.goto('/quiz-tab');
    
    // Should either show quiz options or redirect to login
    await page.waitForTimeout(5000);
    
    const currentUrl = page.url();
    const pageContent = await page.textContent('body');
    
    // Should show either quiz content or login prompt
    const hasQuizContent = pageContent.toLowerCase().includes('quiz');
    const hasLoginContent = pageContent.toLowerCase().includes('login') || currentUrl.includes('login');
    
    expect(hasQuizContent || hasLoginContent).toBe(true);
  });

  test('should handle basic authentication flow', async ({ page }) => {
    await page.goto('/login');
    
    // Fill login form
    await page.fill('input[type="email"]', TEST_EMAIL);
    await page.fill('input[type="password"]', TEST_PASSWORD);
    
    // Submit
    await page.click('button[type="submit"]');
    
    // Wait for response (either success or error)
    await page.waitForTimeout(5000);
    
    // Should either redirect or show error
    const currentUrl = page.url();
    const pageContent = await page.textContent('body');
    
    const isLoggedIn = !currentUrl.includes('login') && !pageContent.toLowerCase().includes('invalid');
    const hasError = pageContent.toLowerCase().includes('error') || pageContent.toLowerCase().includes('invalid');
    
    expect(isLoggedIn || hasError).toBe(true);
    
    console.log(`Login attempt result: ${isLoggedIn ? 'Success' : 'Error shown'}`);
  });

  test('should load profile page', async ({ page }) => {
    await page.goto('/profile');
    
    // Should either show profile or redirect to login
    await page.waitForTimeout(5000);
    
    const currentUrl = page.url();
    const pageContent = await page.textContent('body');
    
    const hasProfileContent = pageContent.toLowerCase().includes('profile');
    const redirectedToLogin = currentUrl.includes('login');
    
    expect(hasProfileContent || redirectedToLogin).toBe(true);
  });

  test('should load leaderboard page', async ({ page }) => {
    await page.goto('/leaderboard');
    
    // Should show leaderboard content
    await page.waitForTimeout(3000);
    const pageContent = await page.textContent('body');
    
    expect(pageContent.toLowerCase()).toMatch(/leaderboard|ranking|score|top/);
  });

  test('should load learn page', async ({ page }) => {
    await page.goto('/learn');
    
    // Should show learn content
    await page.waitForTimeout(3000);
    const pageContent = await page.textContent('body');
    
    expect(pageContent.toLowerCase()).toMatch(/learn|study|education|material/);
  });

  test('should handle page refreshes gracefully', async ({ page }) => {
    await page.goto('/');
    await page.waitForTimeout(2000);
    
    // Refresh the page
    await page.reload();
    await page.waitForTimeout(3000);
    
    // Should still load content
    const pageContent = await page.textContent('body');
    expect(pageContent.length).toBeGreaterThan(100);
  });

  test('should handle direct navigation to quiz routes', async ({ page }) => {
    const quizRoutes = ['/quick-quiz', '/custom-quiz-setup', '/timed-test-setup'];
    
    for (const route of quizRoutes) {
      await page.goto(route);
      await page.waitForTimeout(3000);
      
      // Should either show quiz content or redirect appropriately
      const currentUrl = page.url();
      const pageContent = await page.textContent('body');
      
      console.log(`Route ${route}: ${currentUrl.includes(route) ? 'Loaded' : 'Redirected'}`);
      
      // Should load some content
      expect(pageContent.length).toBeGreaterThan(50);
    }
  });

  test('should handle invalid routes gracefully', async ({ page }) => {
    await page.goto('/invalid-route-that-does-not-exist');
    
    // Should show 404 or redirect to valid page
    await page.waitForTimeout(3000);
    
    const currentUrl = page.url();
    const pageContent = await page.textContent('body');
    
    // Should either show 404 content or redirect to valid route
    const shows404 = pageContent.toLowerCase().includes('404') || pageContent.toLowerCase().includes('not found');
    const redirectedToValid = !currentUrl.includes('invalid-route');
    
    expect(shows404 || redirectedToValid).toBe(true);
  });

  test('should load JavaScript and CSS assets', async ({ page }) => {
    const responses = [];
    
    page.on('response', (response) => {
      if (response.url().includes('.js') || response.url().includes('.css')) {
        responses.push({
          url: response.url(),
          status: response.status()
        });
      }
    });
    
    await page.goto('/');
    await page.waitForTimeout(5000);
    
    // Should have loaded some JS/CSS files successfully
    const successfulLoads = responses.filter(r => r.status === 200);
    expect(successfulLoads.length).toBeGreaterThan(0);
    
    console.log(`Loaded ${successfulLoads.length} assets successfully`);
  });

  test('should be responsive on mobile viewport', async ({ page }) => {
    // Set mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });
    
    await page.goto('/');
    await page.waitForTimeout(3000);
    
    // Should still show content on mobile
    const pageContent = await page.textContent('body');
    expect(pageContent.length).toBeGreaterThan(100);
    
    // Navigation should work
    await page.goto('/quiz-tab');
    await page.waitForTimeout(2000);
    
    const quizPageContent = await page.textContent('body');
    expect(quizPageContent.length).toBeGreaterThan(50);
  });

  test('should handle rapid navigation', async ({ page }) => {
    const routes = ['/', '/quiz-tab', '/learn', '/leaderboard', '/'];
    
    for (const route of routes) {
      await page.goto(route);
      await page.waitForTimeout(1000);
    }
    
    // Should end up on home page
    await expect(page).toHaveURL(/\/$|\/home/);
    
    // Should show content
    const pageContent = await page.textContent('body');
    expect(pageContent.length).toBeGreaterThan(100);
  });

  test('should maintain state across navigation', async ({ page }) => {
    await page.goto('/');
    
    // Set some localStorage data
    await page.evaluate(() => {
      localStorage.setItem('test-key', 'test-value');
    });
    
    // Navigate away and back
    await page.goto('/quiz-tab');
    await page.goto('/');
    
    // Should maintain localStorage
    const storedValue = await page.evaluate(() => {
      return localStorage.getItem('test-key');
    });
    
    expect(storedValue).toBe('test-value');
  });

  test('should handle offline scenarios', async ({ page }) => {
    // Load page first
    await page.goto('/');
    await page.waitForTimeout(3000);
    
    // Go offline
    await page.context().setOffline(true);
    
    // Should still show cached content
    await page.reload();
    await page.waitForTimeout(3000);
    
    const pageContent = await page.textContent('body');
    
    // Should show either cached content or offline message
    const hasContent = pageContent.length > 100;
    const hasOfflineMessage = pageContent.toLowerCase().includes('offline');
    
    expect(hasContent || hasOfflineMessage).toBe(true);
    
    // Restore online
    await page.context().setOffline(false);
  });
});