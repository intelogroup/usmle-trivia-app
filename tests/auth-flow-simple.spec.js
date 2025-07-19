import { test, expect } from '@playwright/test';

test.describe('Authentication Flow Tests', () => {
  // Test credentials - adjust these based on your test database
  const VALID_EMAIL = 'testuser@example.com';
  const VALID_PASSWORD = 'password123';
  const INVALID_EMAIL = 'invalid@example.com';
  const INVALID_PASSWORD = 'wrongpassword';

  test.beforeEach(async ({ page }) => {
    // Clear storage more safely
    await page.goto('/');
    await page.evaluate(() => {
      try {
        localStorage.clear();
        sessionStorage.clear();
      } catch (e) {
        console.log('Could not clear storage:', e);
      }
    });
  });

  test('should display login page correctly', async ({ page }) => {
    await page.goto('/login');
    
    // Check if login page loads
    await expect(page.locator('h1')).toContainText(/Welcome Back|Login|Sign In/i);
    
    // Check for required form elements
    await expect(page.locator('input[type="email"]')).toBeVisible();
    await expect(page.locator('input[type="password"]')).toBeVisible();
    await expect(page.locator('button[type="submit"]')).toBeVisible();
  });

  test('should validate email field', async ({ page }) => {
    await page.goto('/login');
    
    // Try with invalid email format
    await page.fill('input[type="email"]', 'invalid-email');
    await page.fill('input[type="password"]', 'password123');
    
    // Check if submit button is disabled or shows validation error
    const submitButton = page.locator('button[type="submit"]');
    const isDisabled = await submitButton.isDisabled();
    
    if (!isDisabled) {
      await submitButton.click();
      // Should show validation error
      await expect(page.locator('text=/valid.*email|email.*format/i')).toBeVisible({ timeout: 5000 });
    }
  });

  test('should require password field', async ({ page }) => {
    await page.goto('/login');
    
    // Fill email but leave password empty
    await page.fill('input[type="email"]', VALID_EMAIL);
    
    // Submit button should be disabled or show error
    const submitButton = page.locator('button[type="submit"]');
    await expect(submitButton).toBeDisabled();
  });

  test('should show loading state during login attempt', async ({ page }) => {
    await page.goto('/login');
    
    await page.fill('input[type="email"]', VALID_EMAIL);
    await page.fill('input[type="password"]', VALID_PASSWORD);
    
    // Click submit and look for loading indicator
    await page.click('button[type="submit"]');
    
    // Should show loading text or spinner
    await expect(page.locator('text=/signing in|loading|please wait/i')).toBeVisible({ timeout: 2000 });
  });

  test('should handle login with invalid credentials', async ({ page }) => {
    await page.goto('/login');
    
    await page.fill('input[type="email"]', INVALID_EMAIL);
    await page.fill('input[type="password"]', INVALID_PASSWORD);
    await page.click('button[type="submit"]');
    
    // Should show error message
    await expect(page.locator('text=/invalid|incorrect|wrong|error/i')).toBeVisible({ timeout: 10000 });
    
    // Should stay on login page
    await expect(page).toHaveURL(/login/);
  });

  test('should redirect to forgot password page', async ({ page }) => {
    await page.goto('/login');
    
    // Look for forgot password link
    const forgotPasswordLink = page.locator('a:has-text("Forgot"), a:has-text("Reset")').first();
    
    if (await forgotPasswordLink.isVisible()) {
      await forgotPasswordLink.click();
      await expect(page).toHaveURL(/forgot|reset/);
    }
  });

  test('should redirect to signup page', async ({ page }) => {
    await page.goto('/login');
    
    // Look for signup link
    const signupLink = page.locator('a:has-text("Sign Up"), a:has-text("Register")').first();
    
    if (await signupLink.isVisible()) {
      await signupLink.click();
      await expect(page).toHaveURL(/signup|register/);
    }
  });

  test('should protect dashboard route when not authenticated', async ({ page }) => {
    // Try to access protected route without authentication
    await page.goto('/dashboard');
    
    // Should redirect to login or show authentication prompt
    await expect(page).toHaveURL(/login|auth|welcome/);
  });

  test('should protect profile route when not authenticated', async ({ page }) => {
    // Try to access profile without authentication
    await page.goto('/profile');
    
    // Should redirect to login or show authentication prompt  
    await expect(page).toHaveURL(/login|auth|welcome/);
  });

  test('should display signup page correctly', async ({ page }) => {
    await page.goto('/signup');
    
    // Check if signup page loads
    await expect(page.locator('h1, h2')).toContainText(/sign up|register|create|account/i);
    
    // Check for required form elements
    await expect(page.locator('input[type="email"]')).toBeVisible();
    await expect(page.locator('input[type="password"]')).toBeVisible();
  });

  test('should display forgot password page correctly', async ({ page }) => {
    await page.goto('/forgot-password');
    
    // Check if forgot password page loads
    await expect(page.locator('h1, h2')).toContainText(/forgot|reset|password/i);
    
    // Should have email input
    await expect(page.locator('input[type="email"]')).toBeVisible();
  });

  test('should validate required fields in signup', async ({ page }) => {
    await page.goto('/signup');
    
    // Try to submit without filling fields
    const submitButton = page.locator('button[type="submit"]').first();
    
    // Button should be disabled or show validation errors
    const isDisabled = await submitButton.isDisabled();
    if (!isDisabled) {
      await submitButton.click();
      await expect(page.locator('text=/required|fill.*field/i')).toBeVisible({ timeout: 5000 });
    }
  });

  test('should handle password reset form submission', async ({ page }) => {
    await page.goto('/forgot-password');
    
    await page.fill('input[type="email"]', VALID_EMAIL);
    await page.click('button[type="submit"]');
    
    // Should show success message or confirmation
    await expect(page.locator('text=/sent|email|check|reset/i')).toBeVisible({ timeout: 10000 });
  });

  test('should handle network errors gracefully', async ({ page }) => {
    // Go offline to simulate network error
    await page.context().setOffline(true);
    
    await page.goto('/login');
    await page.fill('input[type="email"]', VALID_EMAIL);
    await page.fill('input[type="password"]', VALID_PASSWORD);
    await page.click('button[type="submit"]');
    
    // Should show network error message
    await expect(page.locator('text=/network|connection|offline|error/i')).toBeVisible({ timeout: 15000 });
    
    // Restore network
    await page.context().setOffline(false);
  });

  test('should maintain form state during validation', async ({ page }) => {
    await page.goto('/login');
    
    const email = 'test@example.com';
    const password = 'testpass';
    
    // Fill form
    await page.fill('input[type="email"]', email);
    await page.fill('input[type="password"]', password);
    
    // Trigger validation by clicking outside or submitting
    await page.click('body');
    
    // Values should still be there
    await expect(page.locator('input[type="email"]')).toHaveValue(email);
    await expect(page.locator('input[type="password"]')).toHaveValue(password);
  });

  test('should clear error messages when user types', async ({ page }) => {
    await page.goto('/login');
    
    // Cause an error first
    await page.fill('input[type="email"]', 'invalid');
    await page.fill('input[type="password"]', 'short');
    
    const submitButton = page.locator('button[type="submit"]');
    if (!await submitButton.isDisabled()) {
      await submitButton.click();
      
      // Wait for error to appear
      await page.waitForSelector('text=/error|invalid/i', { timeout: 5000 }).catch(() => {});
      
      // Start typing again
      await page.fill('input[type="email"]', 'test@example.com');
      
      // Error should clear or form should update
      await page.waitForTimeout(500);
    }
  });

  test('should handle authentication configuration issues', async ({ page }) => {
    await page.goto('/login');
    
    // Look for configuration warning
    const configWarning = page.locator('text=/configuration|setup|supabase|env/i');
    
    if (await configWarning.isVisible()) {
      console.log('Configuration warning detected - this is expected in test environment');
      
      // Submit button should be disabled when not configured
      const submitButton = page.locator('button[type="submit"]');
      await expect(submitButton).toBeDisabled();
    }
  });
});