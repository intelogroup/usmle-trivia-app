import { test, expect } from '@playwright/test';

test.describe('Form Validation - Real-time', () => {
  test.beforeEach(async ({ page }) => {
    // Mock Supabase configuration to enable form testing
    await page.addInitScript(() => {
      // Mock the environment variables to simulate configured Supabase
      window.process = { env: {} };
      
      // Mock import.meta.env
      if (!window.import) {
        window.import = { meta: { env: {} } };
      }
      if (!window.import.meta) {
        window.import.meta = { env: {} };
      }
      
      window.import.meta.env.VITE_SUPABASE_URL = 'https://test.supabase.co';
      window.import.meta.env.VITE_SUPABASE_ANON_KEY = 'test-key';
      window.import.meta.env.DEV = false; // Disable dev connection test
    });
    
    // Navigate to login page
    await page.goto('/login');
    
    // Wait for page to be fully loaded
    await page.waitForLoadState('networkidle');
  });

  test('should show real-time email validation on login form', async ({ page }) => {
    const emailInput = page.getByTestId('email-input');
    
    // Type invalid email
    await emailInput.fill('invalid-email');
    await emailInput.blur();
    
    // Should show error
    await expect(page.locator('text=Please enter a valid email address')).toBeVisible();
    
    // Type valid email
    await emailInput.fill('test@example.com');
    
    // Error should disappear and show success
    await expect(page.locator('text=Please enter a valid email address')).not.toBeVisible();
    await expect(page.locator('text=Looks good!')).toBeVisible();
  });

  test('should show real-time password validation on login form', async ({ page }) => {
    const passwordInput = page.getByTestId('password-input');
    
    // Focus and blur without typing
    await passwordInput.focus();
    await passwordInput.blur();
    
    // Should show required error
    await expect(page.locator('text=Password is required')).toBeVisible();
    
    // Type password
    await passwordInput.fill('password123');
    
    // Error should disappear and show success
    await expect(page.locator('text=Password is required')).not.toBeVisible();
    await expect(page.locator('text=Looks good!')).toBeVisible();
  });

  test('should disable submit button until form is valid', async ({ page }) => {
    const submitButton = page.getByTestId('login-submit');
    
    // Submit button should be disabled initially
    await expect(submitButton).toBeDisabled();
    
    // Fill valid email
    await page.getByTestId('email-input').fill('test@example.com');
    
    // Still disabled (password not filled)
    await expect(submitButton).toBeDisabled();
    
    // Fill valid password
    await page.getByTestId('password-input').fill('password123');
    
    // Now should be enabled
    await expect(submitButton).toBeEnabled();
  });

  test('should handle JSON error gracefully', async ({ page }) => {
    // Mock a JSON parsing error
    await page.route('**/auth/v1/**', route => {
      route.fulfill({
        status: 200,
        contentType: 'text/html',
        body: '<html>Unexpected HTML response</html>'
      });
    });
    
    // Fill form and submit
    await page.getByTestId('email-input').fill('test@example.com');
    await page.getByTestId('password-input').fill('password123');
    await page.getByTestId('login-submit').click();
    
    // Should show JSON error message
    await expect(page.getByTestId('login-error')).toContainText('Server communication error');
  });

  test('should handle network error gracefully', async ({ page }) => {
    // Mock a network error
    await page.route('**/auth/v1/**', route => {
      route.abort('failed');
    });
    
    // Fill form and submit
    await page.getByTestId('email-input').fill('test@example.com');
    await page.getByTestId('password-input').fill('password123');
    await page.getByTestId('login-submit').click();
    
    // Should show network error message
    await expect(page.getByTestId('login-error')).toContainText('Network error');
  });
});

test.describe('Form Validation - SignUp', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to signup page
    await page.goto('/signup');
  });

  test('should show real-time validation for all signup fields', async ({ page }) => {
    // Test full name validation
    const nameInput = page.getByTestId('fullname-input');
    await nameInput.fill('A'); // Too short
    await nameInput.blur();
    await expect(page.locator('text=Name must be at least 2 characters')).toBeVisible();
    
    await nameInput.fill('John Doe');
    await expect(page.locator('text=Name must be at least 2 characters')).not.toBeVisible();
    
    // Test email validation
    const emailInput = page.getByTestId('email-input');
    await emailInput.fill('invalid-email');
    await emailInput.blur();
    await expect(page.locator('text=Please enter a valid email address')).toBeVisible();
    
    await emailInput.fill('john@example.com');
    await expect(page.locator('text=Please enter a valid email address')).not.toBeVisible();
    
    // Test password validation
    const passwordInput = page.getByTestId('password-input');
    await passwordInput.fill('123'); // Too short
    await passwordInput.blur();
    await expect(page.locator('text=Password must be at least 6 characters')).toBeVisible();
    
    await passwordInput.fill('password123');
    await expect(page.locator('text=Password must be at least 6 characters')).not.toBeVisible();
    
    // Test confirm password validation
    const confirmPasswordInput = page.getByTestId('confirm-password-input');
    await confirmPasswordInput.fill('different');
    await confirmPasswordInput.blur();
    await expect(page.locator('text=Passwords do not match')).toBeVisible();
    
    await confirmPasswordInput.fill('password123');
    await expect(page.locator('text=Passwords do not match')).not.toBeVisible();
  });

  test('should update confirm password validation when password changes', async ({ page }) => {
    // Fill passwords that match
    await page.getByTestId('password-input').fill('password123');
    await page.getByTestId('confirm-password-input').fill('password123');
    await page.getByTestId('confirm-password-input').blur();
    
    // Should show success
    await expect(page.locator('text=Looks good!')).toBeVisible();
    
    // Change password
    await page.getByTestId('password-input').fill('newpassword');
    
    // Confirm password should now show error
    await expect(page.locator('text=Passwords do not match')).toBeVisible();
  });

  test('should show password strength requirements', async ({ page }) => {
    const passwordInput = page.getByTestId('password-input');
    
    // Fill password without numbers
    await passwordInput.fill('password');
    await passwordInput.blur();
    
    // Should show strength warning
    await expect(page.locator('text=Password should contain both letters and numbers')).toBeVisible();
    
    // Fill strong password
    await passwordInput.fill('password123');
    
    // Should show success
    await expect(page.locator('text=Password should contain both letters and numbers')).not.toBeVisible();
    await expect(page.locator('text=Looks good!')).toBeVisible();
  });

  test('should handle signup success flow', async ({ page }) => {
    // Mock successful signup
    await page.route('**/auth/v1/signup', route => {
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          user: { id: '123', email: 'test@example.com' },
          session: null
        })
      });
    });
    
    // Fill form with valid data
    await page.getByTestId('fullname-input').fill('John Doe');
    await page.getByTestId('email-input').fill('test@example.com');
    await page.getByTestId('password-input').fill('password123');
    await page.getByTestId('confirm-password-input').fill('password123');
    
    // Submit form
    await page.getByTestId('signup-submit').click();
    
    // Should show success screen
    await expect(page.locator('text=Account Created!')).toBeVisible();
    await expect(page.locator('text=Please check your email to verify')).toBeVisible();
    
    // Should have "Go to Sign In" button
    await expect(page.getByTestId('go-to-login')).toBeVisible();
  });

  test('should handle duplicate email error', async ({ page }) => {
    // Mock duplicate email error
    await page.route('**/auth/v1/signup', route => {
      route.fulfill({
        status: 400,
        contentType: 'application/json',
        body: JSON.stringify({
          error: 'User already registered',
          error_description: 'This email is already in use'
        })
      });
    });
    
    // Fill form and submit
    await page.getByTestId('fullname-input').fill('John Doe');
    await page.getByTestId('email-input').fill('existing@example.com');
    await page.getByTestId('password-input').fill('password123');
    await page.getByTestId('confirm-password-input').fill('password123');
    await page.getByTestId('signup-submit').click();
    
    // Should show duplicate email error
    await expect(page.getByTestId('signup-error')).toContainText('already registered');
  });
});

test.describe('Form Accessibility', () => {
  test('should have proper ARIA labels and keyboard navigation', async ({ page }) => {
    await page.goto('/login');
    
    // Check for proper labels
    await expect(page.locator('label:has-text("Email Address")')).toBeVisible();
    await expect(page.locator('label:has-text("Password")')).toBeVisible();
    
    // Test keyboard navigation
    await page.keyboard.press('Tab'); // Should focus email input
    await expect(page.getByTestId('email-input')).toBeFocused();
    
    await page.keyboard.press('Tab'); // Should focus password input
    await expect(page.getByTestId('password-input')).toBeFocused();
    
    await page.keyboard.press('Tab'); // Should focus submit button
    await expect(page.getByTestId('login-submit')).toBeFocused();
  });

  test('should show password toggle functionality', async ({ page }) => {
    await page.goto('/login');
    
    const passwordInput = page.getByTestId('password-input');
    const passwordToggle = page.locator('[data-testid="password-input"] ~ div button');
    
    // Fill password
    await passwordInput.fill('mypassword');
    
    // Password should be hidden by default
    await expect(passwordInput).toHaveAttribute('type', 'password');
    
    // Click toggle
    await passwordToggle.click();
    
    // Password should now be visible
    await expect(passwordInput).toHaveAttribute('type', 'text');
    
    // Click toggle again
    await passwordToggle.click();
    
    // Password should be hidden again
    await expect(passwordInput).toHaveAttribute('type', 'password');
  });
});

test.describe('Form Error Recovery', () => {
  test('should clear submit errors when user starts typing', async ({ page }) => {
    // Mock an auth error
    await page.route('**/auth/v1/**', route => {
      route.fulfill({
        status: 400,
        contentType: 'application/json',
        body: JSON.stringify({
          error: 'invalid_credentials',
          error_description: 'Invalid login credentials'
        })
      });
    });
    
    await page.goto('/login');
    
    // Fill form and submit to trigger error
    await page.getByTestId('email-input').fill('test@example.com');
    await page.getByTestId('password-input').fill('wrongpassword');
    await page.getByTestId('login-submit').click();
    
    // Should show error
    await expect(page.getByTestId('login-error')).toBeVisible();
    
    // Start typing in email field
    await page.getByTestId('email-input').fill('newtest@example.com');
    
    // Error should be cleared
    await expect(page.getByTestId('login-error')).not.toBeVisible();
  });
});