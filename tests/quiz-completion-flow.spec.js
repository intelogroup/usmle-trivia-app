import { test, expect } from '@playwright/test';

test.describe('Quiz Completion and Real-time UI Updates', () => {
  const TEST_EMAIL = 'testuser@example.com';
  const TEST_PASSWORD = 'password123';

  // Helper function to login
  async function loginUser(page) {
    await page.goto('/login');
    await page.fill('input[type="email"]', TEST_EMAIL);
    await page.fill('input[type="password"]', TEST_PASSWORD);
    await page.click('button[type="submit"]');
    await page.waitForURL('**/dashboard', { timeout: 20000 }).catch(() => {});
  }

  // Helper function to get user's current points
  async function getCurrentPoints(page) {
    await page.goto('/profile');
    await page.waitForLoadState('networkidle');
    const pointsElement = page.locator('text=/points|score/i').first();
    return await pointsElement.isVisible() ? pointsElement.textContent() : '0';
  }

  test('Quick Quiz completion with real-time points update', async ({ page }) => {
    test.setTimeout(120000);
    
    await loginUser(page);
    
    // Get initial points
    const initialPoints = await getCurrentPoints(page);
    console.log('Initial points:', initialPoints);
    
    // Start Quick Quiz
    await page.goto('/quick-quiz-setup');
    await page.waitForLoadState('networkidle');
    
    // Configure and start quiz
    const startButton = page.locator('button:has-text("Start Quiz"), button:has-text("Begin")').first();
    if (await startButton.isVisible({ timeout: 5000 })) {
      await startButton.click();
    }
    
    await page.waitForURL('**/quick-quiz', { timeout: 10000 });
    
    // Complete at least 3 questions
    for (let i = 0; i < 3; i++) {
      await page.waitForSelector('text=/Question \\d+ of/i', { timeout: 30000 });
      
      // Select first available answer option
      const answerOption = page.locator('button[data-option], button:has([aria-label*="Option"]), div[role="button"]:has-text(/^[A-D]/)')
        .first();
      
      if (await answerOption.isVisible({ timeout: 10000 })) {
        await answerOption.click();
        
        // Wait for answer processing and next question or completion
        await page.waitForTimeout(2000);
        
        // Check if next button appears and click it
        const nextButton = page.locator('button:has-text("Next"), button[data-next-btn]').first();
        if (await nextButton.isVisible({ timeout: 5000 })) {
          await nextButton.click();
        }
      }
    }
    
    // Wait for quiz completion
    await expect(page.locator('text=/Quiz Complete|Results|Score/i')).toBeVisible({ timeout: 30000 });
    
    // Verify results page shows points earned
    await expect(page.locator('text=/points|score|earned/i')).toBeVisible({ timeout: 10000 });
    
    // Go back to profile and verify points updated
    await page.goto('/profile');
    await page.waitForLoadState('networkidle');
    const finalPoints = await getCurrentPoints(page);
    console.log('Final points:', finalPoints);
    
    // Verify points increased (basic check)
    expect(finalPoints).not.toBe(initialPoints);
  });

  test('Custom Quiz completion with real-time statistics update', async ({ page }) => {
    test.setTimeout(120000);
    
    await loginUser(page);
    
    // Start Custom Quiz
    await page.goto('/custom-quiz-setup');
    await page.waitForLoadState('networkidle');
    
    // Configure quiz settings
    const questionCountSelect = page.locator('select, input[type="number"]').first();
    if (await questionCountSelect.isVisible({ timeout: 5000 })) {
      await questionCountSelect.fill('5');
    }
    
    const startButton = page.locator('button:has-text("Start Quiz"), button:has-text("Begin")').first();
    if (await startButton.isVisible({ timeout: 5000 })) {
      await startButton.click();
    }
    
    await page.waitForURL('**/custom-quiz', { timeout: 10000 });
    
    // Complete quiz questions
    for (let i = 0; i < 5; i++) {
      await page.waitForSelector('text=/Question \\d+ of/i', { timeout: 30000 });
      
      // Select answer
      const answerOption = page.locator('button:has(span:text-is("A")), button:contains("🅰️")').first();
      if (await answerOption.isVisible({ timeout: 10000 })) {
        await answerOption.click();
        
        // Wait for feedback and proceed
        await page.waitForTimeout(2000);
        const nextButton = page.locator('button:has-text("Next Question"), button:has-text("Finish Quiz")').first();
        if (await nextButton.isVisible({ timeout: 5000 })) {
          await nextButton.click();
        }
      }
    }
    
    // Verify completion
    await expect(page.locator('text=/Quiz Complete|Test Complete/i')).toBeVisible({ timeout: 30000 });
    
    // Go to dashboard to check statistics update
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    
    // Verify stats are updated
    await expect(page.locator('text=/quizzes completed|total score|accuracy/i')).toBeVisible({ timeout: 10000 });
  });

  test('Timed Test completion with session tracking', async ({ page }) => {
    test.setTimeout(180000);
    
    await loginUser(page);
    
    // Start Timed Test
    await page.goto('/timed-test-setup');
    await page.waitForLoadState('networkidle');
    
    const startButton = page.locator('button:has-text("Start Test"), button:has-text("Begin")').first();
    if (await startButton.isVisible({ timeout: 5000 })) {
      await startButton.click();
    }
    
    await page.waitForURL('**/timed-test', { timeout: 10000 });
    
    // Verify timer is running
    await expect(page.locator('text=/Time Left|Timer|:\\d\\d/i')).toBeVisible({ timeout: 10000 });
    
    // Complete several questions quickly
    for (let i = 0; i < 3; i++) {
      await page.waitForSelector('text=/Question \\d+ of/i', { timeout: 30000 });
      
      const answerOption = page.locator('button:has(span:text-is("A")), button:contains("🅰️")').first();
      if (await answerOption.isVisible({ timeout: 10000 })) {
        await answerOption.click();
        await page.waitForTimeout(1000);
        
        const nextButton = page.locator('button:has-text("Next Question"), button:has-text("Finish Test")').first();
        if (await nextButton.isVisible({ timeout: 5000 })) {
          await nextButton.click();
        }
      }
    }
    
    // Verify test completion
    await expect(page.locator('text=/Test Complete|Results/i')).toBeVisible({ timeout: 30000 });
    
    // Check that results include time information
    await expect(page.locator('text=/time|duration|elapsed/i')).toBeVisible({ timeout: 10000 });
  });

  test('Profile statistics real-time update verification', async ({ page }) => {
    test.setTimeout(60000);
    
    await loginUser(page);
    
    // Go to profile and note current statistics
    await page.goto('/profile');
    await page.waitForLoadState('networkidle');
    
    const initialStats = await page.locator('text=/quiz|score|accuracy/i').allTextContents();
    console.log('Initial stats:', initialStats);
    
    // Complete a quick quiz
    await page.goto('/quick-quiz-setup');
    await page.waitForLoadState('networkidle');
    
    const startButton = page.locator('button:has-text("Start"), button:has-text("Begin")').first();
    if (await startButton.isVisible({ timeout: 5000 })) {
      await startButton.click();
    }
    
    // Quick completion of 2 questions
    for (let i = 0; i < 2; i++) {
      await page.waitForSelector('text=/Question/i', { timeout: 20000 });
      const answerButton = page.locator('button').first();
      if (await answerButton.isVisible({ timeout: 5000 })) {
        await answerButton.click();
        await page.waitForTimeout(2000);
      }
    }
    
    // Return to profile immediately after quiz
    await page.goto('/profile');
    await page.waitForLoadState('networkidle');
    
    // Verify statistics have updated
    const updatedStats = await page.locator('text=/quiz|score|accuracy/i').allTextContents();
    console.log('Updated stats:', updatedStats);
    
    // Basic verification that stats changed
    expect(updatedStats.join('')).not.toBe(initialStats.join(''));
  });
});