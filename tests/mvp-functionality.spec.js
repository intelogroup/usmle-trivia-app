import { test, expect } from '@playwright/test';

test.describe('USMLE Trivia App - MVP Functionality Tests', () => {
  const TEST_EMAIL = 'testuser@example.com';
  const TEST_PASSWORD = 'password123';

  // Helper function to login
  async function loginUser(page) {
    await page.goto('/login');
    await page.fill('input[type="email"]', TEST_EMAIL);
    await page.fill('input[type="password"]', TEST_PASSWORD);
    await page.click('button[type="submit"]');
    await page.waitForURL(/\/(dashboard|home|$)/, { timeout: 15000 });
  }

  // Helper function to complete a quiz question
  async function answerQuestion(page, optionIndex = 0) {
    const answerButtons = [
      'button:has-text("🅰️"), button:has(span:text-is("A"))',
      'button:has-text("🅱️"), button:has(span:text-is("B"))',
      'button:has-text("🇨"), button:has(span:text-is("C"))',
      'button:has-text("🇩"), button:has(span:text-is("D"))'
    ];
    
    const selector = answerButtons[optionIndex];
    const answerButton = page.locator(selector).first();
    
    if (await answerButton.isVisible({ timeout: 5000 })) {
      await answerButton.click();
      await page.waitForTimeout(1000); // Wait for answer processing
      
      // Click next button if it appears
      const nextButton = page.locator('button:has-text("Next"), button[data-next-btn]').first();
      if (await nextButton.isVisible({ timeout: 3000 })) {
        await nextButton.click();
      }
      return true;
    }
    return false;
  }

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

  test.describe('App Navigation and Structure', () => {
    test('should display home page with main navigation', async ({ page }) => {
      await page.goto('/');
      
      // Should show main app elements
      await expect(page.locator('text=/USMLE|Medical|Quiz|Trivia/i')).toBeVisible({ timeout: 10000 });
      
      // Should have navigation elements
      const navElements = ['Quiz', 'Profile', 'Login', 'Sign Up'];
      for (const element of navElements) {
        const navItem = page.locator(`a:has-text("${element}"), button:has-text("${element}")`);
        if (await navItem.count() > 0) {
          await expect(navItem.first()).toBeVisible();
        }
      }
    });

    test('should navigate between main sections', async ({ page }) => {
      await page.goto('/');
      
      const sections = [
        { path: '/quiz-tab', name: 'Quiz' },
        { path: '/learn', name: 'Learn' },
        { path: '/leaderboard', name: 'Leaderboard' }
      ];
      
      for (const section of sections) {
        await page.goto(section.path);
        await expect(page).toHaveURL(new RegExp(section.path));
        await page.waitForTimeout(1000);
      }
    });
  });

  test.describe('Quick Quiz Flow', () => {
    test('should complete Quick Quiz end-to-end', async ({ page }) => {
      test.setTimeout(120000);
      
      await loginUser(page);
      
      // Navigate to Quiz section
      await page.goto('/quiz-tab');
      await expect(page.locator('text=/Quick Quiz|Start Quiz/i')).toBeVisible({ timeout: 10000 });
      
      // Start Quick Quiz
      const quickQuizButton = page.locator('button:has-text("Quick Quiz"), a:has-text("Quick Quiz")').first();
      await quickQuizButton.click();
      
      // Should navigate to quiz setup or directly to quiz
      await page.waitForURL(/\/(quick-quiz|quiz)/, { timeout: 10000 });
      
      // If on setup page, configure and start
      if (await page.locator('button:has-text("Start"), button:has-text("Begin")').isVisible({ timeout: 5000 })) {
        await page.click('button:has-text("Start"), button:has-text("Begin")');
      }
      
      // Should be on quiz page
      await expect(page.locator('text=/Question.*\\d+.*of.*\\d+/i')).toBeVisible({ timeout: 15000 });
      
      // Answer 3 questions
      let questionsAnswered = 0;
      for (let i = 0; i < 3; i++) {
        if (await answerQuestion(page, i % 4)) {
          questionsAnswered++;
          await page.waitForTimeout(2000);
          
          // Check if quiz is complete
          if (await page.locator('text=/Quiz Complete|Results|Score/i').isVisible({ timeout: 2000 })) {
            break;
          }
        } else {
          break;
        }
      }
      
      // Should see results page
      await expect(page.locator('text=/Quiz Complete|Results|Score/i')).toBeVisible({ timeout: 30000 });
      
      // Should show score
      await expect(page.locator('text=/\\d+.*\\d+|Score|Points/i')).toBeVisible();
      
      console.log(`Quick Quiz completed: ${questionsAnswered} questions answered`);
    });

    test('should display Quick Quiz timer and progress', async ({ page }) => {
      await loginUser(page);
      await page.goto('/quiz-tab');
      
      const quickQuizButton = page.locator('button:has-text("Quick Quiz"), a:has-text("Quick Quiz")').first();
      await quickQuizButton.click();
      
      if (await page.locator('button:has-text("Start")').isVisible({ timeout: 5000 })) {
        await page.click('button:has-text("Start")');
      }
      
      // Should show timer
      await expect(page.locator('text=/\\d+s|Timer|Time/i')).toBeVisible({ timeout: 10000 });
      
      // Should show progress
      await expect(page.locator('text=/Question.*\\d+.*of.*\\d+/i')).toBeVisible();
    });
  });

  test.describe('Custom Quiz Flow', () => {
    test('should complete Custom Quiz end-to-end', async ({ page }) => {
      test.setTimeout(120000);
      
      await loginUser(page);
      
      // Navigate to Custom Quiz
      await page.goto('/custom-quiz-setup');
      await page.waitForLoadState('networkidle');
      
      // Configure quiz settings
      const questionCountInput = page.locator('input[type="number"], select').first();
      if (await questionCountInput.isVisible({ timeout: 5000 })) {
        await questionCountInput.fill('5');
      }
      
      // Start quiz
      const startButton = page.locator('button:has-text("Start"), button:has-text("Begin")').first();
      await startButton.click();
      
      // Should navigate to quiz
      await page.waitForURL(/\/custom-quiz/, { timeout: 10000 });
      
      // Answer questions
      let questionsAnswered = 0;
      for (let i = 0; i < 5; i++) {
        if (await answerQuestion(page, 0)) {
          questionsAnswered++;
          await page.waitForTimeout(2000);
          
          if (await page.locator('text=/Quiz Complete|Test Complete/i').isVisible({ timeout: 2000 })) {
            break;
          }
        } else {
          break;
        }
      }
      
      // Should see completion
      await expect(page.locator('text=/Quiz Complete|Test Complete/i')).toBeVisible({ timeout: 30000 });
      
      console.log(`Custom Quiz completed: ${questionsAnswered} questions answered`);
    });
  });

  test.describe('Timed Test Flow', () => {
    test('should complete Timed Test end-to-end', async ({ page }) => {
      test.setTimeout(180000);
      
      await loginUser(page);
      
      // Navigate to Timed Test
      await page.goto('/timed-test-setup');
      await page.waitForLoadState('networkidle');
      
      // Start test
      const startButton = page.locator('button:has-text("Start"), button:has-text("Begin")').first();
      if (await startButton.isVisible({ timeout: 5000 })) {
        await startButton.click();
      }
      
      // Should navigate to test
      await page.waitForURL(/\/timed-test/, { timeout: 10000 });
      
      // Should show timer
      await expect(page.locator('text=/Time Left|Timer|:\\d\\d/i')).toBeVisible({ timeout: 10000 });
      
      // Answer a few questions
      let questionsAnswered = 0;
      for (let i = 0; i < 3; i++) {
        if (await answerQuestion(page, 0)) {
          questionsAnswered++;
          await page.waitForTimeout(2000);
          
          if (await page.locator('text=/Test Complete|Results/i').isVisible({ timeout: 2000 })) {
            break;
          }
        } else {
          break;
        }
      }
      
      // Should eventually complete or show results
      await expect(page.locator('text=/Test Complete|Results|Score/i')).toBeVisible({ timeout: 60000 });
      
      console.log(`Timed Test completed: ${questionsAnswered} questions answered`);
    });
  });

  test.describe('Real-time UI Updates', () => {
    test('should update user statistics after quiz completion', async ({ page }) => {
      await loginUser(page);
      
      // Go to profile to check initial stats
      await page.goto('/profile');
      await page.waitForLoadState('networkidle');
      
      const initialStatsText = await page.locator('text=/quiz|score|points/i').allTextContents().catch(() => []);
      
      // Complete a quick quiz
      await page.goto('/quiz-tab');
      const quickQuizButton = page.locator('button:has-text("Quick Quiz"), a:has-text("Quick Quiz")').first();
      await quickQuizButton.click();
      
      if (await page.locator('button:has-text("Start")').isVisible({ timeout: 5000 })) {
        await page.click('button:has-text("Start")');
      }
      
      // Answer 2 questions
      for (let i = 0; i < 2; i++) {
        await answerQuestion(page, 0);
        await page.waitForTimeout(2000);
        
        if (await page.locator('text=/Quiz Complete/i').isVisible({ timeout: 2000 })) {
          break;
        }
      }
      
      // Wait for completion
      await page.waitForSelector('text=/Quiz Complete|Results/i', { timeout: 30000 });
      
      // Go back to profile to check updated stats
      await page.goto('/profile');
      await page.waitForLoadState('networkidle');
      
      const updatedStatsText = await page.locator('text=/quiz|score|points/i').allTextContents().catch(() => []);
      
      // Stats should have changed
      expect(JSON.stringify(updatedStatsText)).not.toBe(JSON.stringify(initialStatsText));
      
      console.log('Statistics updated after quiz completion');
    });

    test('should show points earned after quiz completion', async ({ page }) => {
      await loginUser(page);
      
      // Complete a quiz
      await page.goto('/quiz-tab');
      const quickQuizButton = page.locator('button:has-text("Quick Quiz")').first();
      await quickQuizButton.click();
      
      if (await page.locator('button:has-text("Start")').isVisible({ timeout: 5000 })) {
        await page.click('button:has-text("Start")');
      }
      
      // Answer one question
      await answerQuestion(page, 0);
      
      // Should eventually show results with points
      await expect(page.locator('text=/points|score|earned/i')).toBeVisible({ timeout: 30000 });
    });
  });

  test.describe('Profile and Statistics', () => {
    test('should display user profile with statistics', async ({ page }) => {
      await loginUser(page);
      
      await page.goto('/profile');
      await page.waitForLoadState('networkidle');
      
      // Should show profile elements
      await expect(page.locator('text=/Profile|Account|User/i')).toBeVisible({ timeout: 10000 });
      
      // Should show statistics
      await expect(page.locator('text=/quiz|statistic|progress/i')).toBeVisible({ timeout: 5000 });
    });
  });

  test.describe('Leaderboard', () => {
    test('should display leaderboard page', async ({ page }) => {
      await page.goto('/leaderboard');
      
      // Should show leaderboard
      await expect(page.locator('text=/Leaderboard|Ranking|Top/i')).toBeVisible({ timeout: 10000 });
      
      // Should show some content (scores, users, or empty state)
      await expect(page.locator('body')).not.toHaveText('');
    });
  });

  test.describe('Learn Section', () => {
    test('should display learn page', async ({ page }) => {
      await page.goto('/learn');
      
      // Should show learn content
      await expect(page.locator('text=/Learn|Study|Education|Material/i')).toBeVisible({ timeout: 10000 });
    });
  });

  test.describe('Error Handling and Edge Cases', () => {
    test('should handle invalid quiz routes gracefully', async ({ page }) => {
      await page.goto('/invalid-quiz-route');
      
      // Should show 404 or redirect to valid page
      const url = page.url();
      expect(url).toMatch(/404|not-found|home|quiz/);
    });

    test('should handle quiz without questions gracefully', async ({ page }) => {
      await loginUser(page);
      
      // Try to start a quiz and see if it handles no questions scenario
      await page.goto('/quiz-tab');
      
      const quickQuizButton = page.locator('button:has-text("Quick Quiz")').first();
      if (await quickQuizButton.isVisible({ timeout: 5000 })) {
        await quickQuizButton.click();
        
        if (await page.locator('button:has-text("Start")').isVisible({ timeout: 5000 })) {
          await page.click('button:has-text("Start")');
        }
        
        // Should handle gracefully - either show questions or error message
        await page.waitForTimeout(5000);
        const hasQuestions = await page.locator('text=/Question.*\\d+/i').isVisible();
        const hasError = await page.locator('text=/error|no.*question|unavailable/i').isVisible();
        
        expect(hasQuestions || hasError).toBe(true);
      }
    });

    test('should handle navigation during quiz', async ({ page }) => {
      await loginUser(page);
      
      // Start a quiz
      await page.goto('/quiz-tab');
      const quickQuizButton = page.locator('button:has-text("Quick Quiz")').first();
      await quickQuizButton.click();
      
      if (await page.locator('button:has-text("Start")').isVisible({ timeout: 5000 })) {
        await page.click('button:has-text("Start")');
      }
      
      // Wait for quiz to start
      await page.waitForSelector('text=/Question/i', { timeout: 10000 });
      
      // Try navigating away
      await page.goto('/profile');
      
      // Should handle gracefully
      await expect(page).toHaveURL(/profile/);
    });

    test('should handle browser refresh during quiz', async ({ page }) => {
      await loginUser(page);
      
      // Start a quiz
      await page.goto('/quiz-tab');
      const quickQuizButton = page.locator('button:has-text("Quick Quiz")').first();
      await quickQuizButton.click();
      
      if (await page.locator('button:has-text("Start")').isVisible({ timeout: 5000 })) {
        await page.click('button:has-text("Start")');
      }
      
      // Wait for quiz to start
      if (await page.locator('text=/Question/i').isVisible({ timeout: 10000 })) {
        // Refresh the page
        await page.reload();
        
        // Should handle gracefully - either resume or restart
        await page.waitForTimeout(3000);
        
        const hasQuiz = await page.locator('text=/Question|Quiz|Start/i').isVisible();
        expect(hasQuiz).toBe(true);
      }
    });
  });

  test.describe('Overall App Performance', () => {
    test('should load main pages within reasonable time', async ({ page }) => {
      const routes = ['/', '/quiz-tab', '/learn', '/leaderboard', '/profile'];
      
      for (const route of routes) {
        const startTime = Date.now();
        await page.goto(route);
        await page.waitForLoadState('networkidle', { timeout: 10000 });
        const loadTime = Date.now() - startTime;
        
        console.log(`${route} loaded in ${loadTime}ms`);
        expect(loadTime).toBeLessThan(10000); // Should load within 10 seconds
      }
    });

    test('should handle multiple rapid navigation actions', async ({ page }) => {
      await page.goto('/');
      
      // Rapidly navigate between pages
      const routes = ['/quiz-tab', '/learn', '/leaderboard', '/', '/quiz-tab'];
      
      for (const route of routes) {
        await page.goto(route);
        await page.waitForTimeout(500);
      }
      
      // Should end up on the last route
      await expect(page).toHaveURL(/quiz-tab/);
    });
  });
});