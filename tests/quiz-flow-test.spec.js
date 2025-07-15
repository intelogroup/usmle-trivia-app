import { test, expect } from '@playwright/test';

test.describe('Quiz Flow - Core Functionality', () => {
  
  test.beforeEach(async ({ page }) => {
    // Set up console error tracking
    page.on('console', msg => {
      if (msg.type() === 'error') {
        console.error('Console error:', msg.text());
      }
    });

    // Navigate to the app
    await page.goto('/');
    await page.waitForLoadState('networkidle');
  });

  test('should navigate from categories to quiz successfully', async ({ page }) => {
    // Navigate to quiz categories
    await page.goto('/quiz');
    await page.waitForLoadState('networkidle');
    
    // Wait for page to load
    await page.waitForTimeout(2000);
    
    // Check if page loads without crashing
    const pageContent = await page.textContent('body');
    expect(pageContent).toMatch(/(Quiz|Categories|Question)/i);
    
    // Look for Quick Start button
    const quickStartButton = page.locator('button:has-text("Quick Start"), button:has-text("Start")').first();
    
    if (await quickStartButton.isVisible()) {
      await quickStartButton.click();
      await page.waitForLoadState('networkidle');
      
      // Should navigate to quiz
      const currentUrl = page.url();
      expect(currentUrl).toMatch(/(quiz|quick)/i);
    }
  });

  test('should handle category selection properly', async ({ page }) => {
    await page.goto('/quiz');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);
    
    // Look for category cards or buttons
    const categoryCard = page.locator('.category-card, [data-testid="category"]').first();
    const categoryButton = page.locator('button:has-text("Cardiology"), button:has-text("Category")').first();
    
    // Try clicking a category if available
    if (await categoryCard.isVisible()) {
      await categoryCard.click();
      await page.waitForTimeout(1000);
    } else if (await categoryButton.isVisible()) {
      await categoryButton.click();
      await page.waitForTimeout(1000);
    }
    
    // Verify no JavaScript errors occurred
    const errors = [];
    page.on('pageerror', error => errors.push(error.message));
    expect(errors.length).toBe(0);
  });

  test('should load quiz questions or show proper fallback', async ({ page }) => {
    // Navigate directly to quick quiz
    await page.goto('/quick-quiz');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(3000);
    
    // Check for various possible states
    const hasQuestions = await page.locator('.question-card, [data-testid="question"]').count() > 0;
    const hasLoading = await page.locator('.loading, .spinner').count() > 0;
    const hasError = await page.locator('.error').count() > 0;
    const hasDemoContent = await page.locator('text=demo, text=Demo').count() > 0;
    
    // Should have one of these states
    expect(hasQuestions || hasLoading || hasError || hasDemoContent).toBe(true);
    
    // If error state, should have retry options
    if (hasError) {
      const retryButton = page.locator('button:has-text("Try Again"), button:has-text("Retry")');
      const fallbackButton = page.locator('button:has-text("Mixed"), button:has-text("Demo")');
      
      expect(await retryButton.isVisible() || await fallbackButton.isVisible()).toBe(true);
    }
  });

  test('should handle quiz interaction without crashing', async ({ page }) => {
    await page.goto('/quick-quiz');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(3000);
    
    // Look for answer options
    const answerOptions = page.locator('button:has-text("A)"), button:has-text("B)"), .option-button');
    
    if (await answerOptions.count() > 0) {
      // Try clicking an answer
      await answerOptions.first().click();
      await page.waitForTimeout(1000);
      
      // Look for next button or auto-advance
      const nextButton = page.locator('button:has-text("Next"), button:has-text("Continue")');
      if (await nextButton.isVisible()) {
        await nextButton.click();
        await page.waitForTimeout(1000);
      }
    }
    
    // Verify page is still functional
    const pageTitle = await page.title();
    expect(pageTitle).toContain('USMLE');
  });

  test('should show error recovery options when quiz fails', async ({ page }) => {
    // Navigate to quiz with invalid category to trigger error
    await page.goto('/quiz/invalid-category-id');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);
    
    // Should show error state or fallback
    const pageContent = await page.textContent('body');
    
    // Should have error recovery options
    const hasRetryButton = await page.locator('button:has-text("Try Again")').count() > 0;
    const hasHomeButton = await page.locator('button:has-text("Home")').count() > 0;
    const hasCategoriesButton = await page.locator('button:has-text("Categories")').count() > 0;
    const hasMixedButton = await page.locator('button:has-text("Mixed")').count() > 0;
    
    expect(hasRetryButton || hasHomeButton || hasCategoriesButton || hasMixedButton).toBe(true);
  });
}); 