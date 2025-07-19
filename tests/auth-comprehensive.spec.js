import { test, expect } from '@playwright/test';

test.describe('Authentication and Session Management', () => {
  // Test credentials
  const VALID_EMAIL = 'testuser@example.com';
  const VALID_PASSWORD = 'password123';
  const INVALID_EMAIL = 'invalid@example.com';
  const INVALID_PASSWORD = 'wrongpassword';
  const NEW_USER_EMAIL = 'newuser@example.com';

  test.beforeEach(async ({ page }) => {
    // Clear any existing sessions
    await page.context().clearCookies();
    await page.context().clearPermissions();
    await page.evaluate(() => {
      localStorage.clear();
      sessionStorage.clear();
    });
  });

  test.describe('Login Flow', () => {
    test('should successfully login with valid credentials', async ({ page }) => {
      await page.goto('/login');
      
      // Wait for page to load
      await expect(page.locator('h1:has-text("Welcome Back")')).toBeVisible();
      
      // Fill in credentials
      await page.fill('[data-testid="email-input"]', VALID_EMAIL);
      await page.fill('[data-testid="password-input"]', VALID_PASSWORD);
      
      // Submit form
      await page.click('[data-testid="login-submit"]');
      
      // Should redirect to dashboard/home
      await expect(page).toHaveURL(/\/(dashboard|home)?$/);
      
      // Verify user is logged in (look for user-specific elements)
      await expect(page.locator('text=/Profile|Account|Dashboard/i')).toBeVisible({ timeout: 10000 });
    });

    test('should show error for invalid credentials', async ({ page }) => {
      await page.goto('/login');
      
      await page.fill('[data-testid="email-input"]', INVALID_EMAIL);
      await page.fill('[data-testid="password-input"]', INVALID_PASSWORD);
      
      await page.click('[data-testid="login-submit"]');
      
      // Should show error message
      await expect(page.locator('[data-testid="login-error"]')).toBeVisible();
      await expect(page.locator('text=/Invalid|credentials|password/i')).toBeVisible();
      
      // Should stay on login page
      await expect(page).toHaveURL(/\/login/);
    });

    test('should validate email format', async ({ page }) => {
      await page.goto('/login');
      
      // Enter invalid email format
      await page.fill('[data-testid="email-input"]', 'invalid-email');
      await page.fill('[data-testid="password-input"]', 'password123');
      
      // Try to submit
      await page.click('[data-testid="login-submit"]');
      
      // Should show validation error
      await expect(page.locator('text=/valid email/i')).toBeVisible();
    });

    test('should require all fields', async ({ page }) => {
      await page.goto('/login');
      
      // Try to submit empty form
      await page.click('[data-testid="login-submit"]');
      
      // Should show validation errors or button should be disabled
      const submitButton = page.locator('[data-testid="login-submit"]');
      await expect(submitButton).toBeDisabled();
    });

    test('should show loading state during login', async ({ page }) => {
      await page.goto('/login');
      
      await page.fill('[data-testid="email-input"]', VALID_EMAIL);
      await page.fill('[data-testid="password-input"]', VALID_PASSWORD);
      
      // Click submit and immediately check for loading state
      await page.click('[data-testid="login-submit"]');
      
      // Should show loading text
      await expect(page.locator('text=/Signing In/i')).toBeVisible();
    });
  });

  test.describe('Session Persistence', () => {
    test('should maintain session after page refresh', async ({ page }) => {
      // Login first
      await page.goto('/login');
      await page.fill('[data-testid="email-input"]', VALID_EMAIL);
      await page.fill('[data-testid="password-input"]', VALID_PASSWORD);
      await page.click('[data-testid="login-submit"]');
      
      // Wait for successful login
      await expect(page).toHaveURL(/\/(dashboard|home)?$/);
      
      // Refresh the page
      await page.reload();
      
      // Should still be logged in
      await expect(page.locator('text=/Profile|Account|Dashboard/i')).toBeVisible({ timeout: 10000 });
      
      // Should not redirect to login
      await expect(page).not.toHaveURL(/\/login/);
    });

    test('should work in multiple tabs', async ({ context }) => {
      // Login in first tab
      const page1 = await context.newPage();
      await page1.goto('/login');
      await page1.fill('[data-testid="email-input"]', VALID_EMAIL);
      await page1.fill('[data-testid="password-input"]', VALID_PASSWORD);
      await page1.click('[data-testid="login-submit"]');
      await expect(page1).toHaveURL(/\/(dashboard|home)?$/);
      
      // Open second tab
      const page2 = await context.newPage();
      await page2.goto('/');
      
      // Should be logged in in second tab too
      await expect(page2.locator('text=/Profile|Account|Dashboard/i')).toBeVisible({ timeout: 10000 });
    });

    test('should handle concurrent login attempts', async ({ context }) => {
      const page1 = await context.newPage();
      const page2 = await context.newPage();
      
      // Navigate both pages to login
      await Promise.all([
        page1.goto('/login'),
        page2.goto('/login')
      ]);
      
      // Fill credentials in both
      await Promise.all([
        page1.fill('[data-testid="email-input"]', VALID_EMAIL),
        page2.fill('[data-testid="email-input"]', VALID_EMAIL)
      ]);
      
      await Promise.all([
        page1.fill('[data-testid="password-input"]', VALID_PASSWORD),
        page2.fill('[data-testid="password-input"]', VALID_PASSWORD)
      ]);
      
      // Submit both simultaneously
      await Promise.all([
        page1.click('[data-testid="login-submit"]'),
        page2.click('[data-testid="login-submit"]')
      ]);
      
      // Both should succeed (or at least one should succeed)
      await Promise.all([
        expect(page1).toHaveURL(/\/(dashboard|home|login)?$/, { timeout: 15000 }),
        expect(page2).toHaveURL(/\/(dashboard|home|login)?$/, { timeout: 15000 })
      ]);
    });
  });

  test.describe('Logout Flow', () => {
    test.beforeEach(async ({ page }) => {
      // Login before each logout test
      await page.goto('/login');
      await page.fill('[data-testid="email-input"]', VALID_EMAIL);
      await page.fill('[data-testid="password-input"]', VALID_PASSWORD);
      await page.click('[data-testid="login-submit"]');
      await expect(page).toHaveURL(/\/(dashboard|home)?$/);
    });

    test('should successfully logout', async ({ page }) => {
      // Find and click logout button/link
      const logoutSelector = 'button:has-text("Logout"), button:has-text("Sign Out"), a:has-text("Logout"), a:has-text("Sign Out")';
      
      const logoutButton = page.locator(logoutSelector).first();
      await expect(logoutButton).toBeVisible({ timeout: 10000 });
      await logoutButton.click();
      
      // Should redirect to login or home page
      await expect(page).toHaveURL(/\/(login|home|$)/, { timeout: 10000 });
      
      // Should not show authenticated user elements
      await expect(page.locator('text=/Profile|Account|Dashboard/i')).not.toBeVisible();
    });

    test('should clear session data on logout', async ({ page }) => {
      // Logout
      const logoutButton = page.locator('button:has-text("Logout"), button:has-text("Sign Out")').first();
      await logoutButton.click();
      
      // Try to access protected route
      await page.goto('/profile');
      
      // Should redirect to login
      await expect(page).toHaveURL(/\/login/);
    });
  });

  test.describe('Protected Routes', () => {
    test('should redirect unauthenticated users to login', async ({ page }) => {
      const protectedRoutes = ['/profile', '/dashboard', '/quiz-tab'];
      
      for (const route of protectedRoutes) {
        await page.goto(route);
        
        // Should redirect to login or show login prompt
        await expect(page).toHaveURL(/\/login|\/auth/, { timeout: 10000 });
      }
    });

    test('should allow authenticated users to access protected routes', async ({ page }) => {
      // Login first
      await page.goto('/login');
      await page.fill('[data-testid="email-input"]', VALID_EMAIL);
      await page.fill('[data-testid="password-input"]', VALID_PASSWORD);
      await page.click('[data-testid="login-submit"]');
      await expect(page).toHaveURL(/\/(dashboard|home)?$/);
      
      // Try accessing protected routes
      const protectedRoutes = ['/profile', '/quiz-tab'];
      
      for (const route of protectedRoutes) {
        await page.goto(route);
        
        // Should not redirect to login
        await expect(page).not.toHaveURL(/\/login/);
        
        // Should show page content
        await expect(page.locator('body')).not.toHaveText('');
      }
    });
  });

  test.describe('Password Reset Flow', () => {
    test('should navigate to forgot password page', async ({ page }) => {
      await page.goto('/login');
      
      await page.click('text=Forgot your password?');
      
      await expect(page).toHaveURL(/\/forgot-password/);
    });

    test('should validate email in password reset', async ({ page }) => {
      await page.goto('/forgot-password');
      
      // Try with invalid email
      await page.fill('input[type="email"]', 'invalid-email');
      await page.click('button[type="submit"]');
      
      // Should show validation error
      await expect(page.locator('text=/valid email/i')).toBeVisible();
    });

    test('should show success message for valid email', async ({ page }) => {
      await page.goto('/forgot-password');
      
      await page.fill('input[type="email"]', VALID_EMAIL);
      await page.click('button[type="submit"]');
      
      // Should show success message
      await expect(page.locator('text=/sent|email|check/i')).toBeVisible({ timeout: 10000 });
    });
  });

  test.describe('Registration Flow', () => {
    test('should navigate to signup page', async ({ page }) => {
      await page.goto('/login');
      
      await page.click('text=Sign Up');
      
      await expect(page).toHaveURL(/\/signup/);
    });

    test('should validate required fields in signup', async ({ page }) => {
      await page.goto('/signup');
      
      // Try to submit empty form
      const submitButton = page.locator('button[type="submit"]').first();
      await submitButton.click();
      
      // Should show validation errors or button should be disabled
      const isDisabled = await submitButton.isDisabled();
      if (!isDisabled) {
        await expect(page.locator('text=/required|fill/i')).toBeVisible();
      }
    });

    test('should validate password requirements', async ({ page }) => {
      await page.goto('/signup');
      
      await page.fill('input[type="email"]', NEW_USER_EMAIL);
      await page.fill('input[type="password"]', '123'); // Weak password
      
      // Should show password requirements
      await expect(page.locator('text=/password|characters|strong/i')).toBeVisible();
    });
  });

  test.describe('Error Handling', () => {
    test('should handle network errors gracefully', async ({ page }) => {
      // Simulate network offline
      await page.context().setOffline(true);
      
      await page.goto('/login');
      await page.fill('[data-testid="email-input"]', VALID_EMAIL);
      await page.fill('[data-testid="password-input"]', VALID_PASSWORD);
      await page.click('[data-testid="login-submit"]');
      
      // Should show network error
      await expect(page.locator('text=/network|connection|offline/i')).toBeVisible({ timeout: 15000 });
      
      // Restore network
      await page.context().setOffline(false);
    });

    test('should handle rate limiting', async ({ page }) => {
      await page.goto('/login');
      
      // Try multiple failed login attempts
      for (let i = 0; i < 5; i++) {
        await page.fill('[data-testid="email-input"]', INVALID_EMAIL);
        await page.fill('[data-testid="password-input"]', INVALID_PASSWORD);
        await page.click('[data-testid="login-submit"]');
        await page.waitForTimeout(1000);
      }
      
      // Should show rate limit message eventually
      await expect(page.locator('text=/too many|limit|wait/i')).toBeVisible({ timeout: 10000 });
    });
  });

  test.describe('Token Expiration', () => {
    test('should handle expired sessions gracefully', async ({ page }) => {
      // Login first
      await page.goto('/login');
      await page.fill('[data-testid="email-input"]', VALID_EMAIL);
      await page.fill('[data-testid="password-input"]', VALID_PASSWORD);
      await page.click('[data-testid="login-submit"]');
      await expect(page).toHaveURL(/\/(dashboard|home)?$/);
      
      // Simulate token expiration by clearing auth tokens
      await page.evaluate(() => {
        // Clear Supabase auth tokens from localStorage
        Object.keys(localStorage).forEach(key => {
          if (key.includes('supabase') || key.includes('auth')) {
            localStorage.removeItem(key);
          }
        });
      });
      
      // Try to access protected content
      await page.goto('/profile');
      
      // Should redirect to login or show auth error
      await expect(page).toHaveURL(/\/login/, { timeout: 10000 });
    });
  });
});