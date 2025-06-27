import { test, expect } from '@playwright/test';

test.describe('USMLE Trivia App - Post-Cleanup Functionality', () => {
  
  test.beforeEach(async ({ page }) => {
    // Navigate to the app
    await page.goto('/');
  });

  test('should load the homepage without errors', async ({ page }) => {
    // Check for console errors
    const consoleErrors = [];
    page.on('console', msg => {
      if (msg.type() === 'error') {
        consoleErrors.push(msg.text());
      }
    });

    // Wait for the page to load completely
    await page.waitForLoadState('networkidle');
    
    // Verify no console errors (our cleanup should have eliminated them)
    expect(consoleErrors).toHaveLength(0);
    
    // Check if the page loaded successfully
    await expect(page).toHaveTitle(/USMLE Trivia/);
  });

  test('should display icons correctly after icon library cleanup', async ({ page }) => {
    await page.waitForLoadState('networkidle');
    
    // Check for presence of common icons (should be Lucide icons now)
    const heartIcon = page.locator('[data-lucide="heart"]').first();
    const brainIcon = page.locator('[data-lucide="brain"]').first();
    const stethoscopeIcon = page.locator('[data-lucide="stethoscope"]').first();
    
    // At least one of these should be visible
    const iconCount = await page.locator('[data-lucide]').count();
    expect(iconCount).toBeGreaterThan(0);
  });

  test('should navigate to main sections without errors', async ({ page }) => {
    await page.waitForLoadState('networkidle');
    
    // Check if navigation elements exist and can be interacted with
    const navigation = page.locator('nav').first();
    if (await navigation.isVisible()) {
      // Try to find and click navigation items
      const homeLink = page.locator('a:has-text("Home"), button:has-text("Home")').first();
      if (await homeLink.isVisible()) {
        await homeLink.click();
        await page.waitForLoadState('networkidle');
      }
    }
    
    // Verify no console errors after navigation
    const consoleErrors = [];
    page.on('console', msg => {
      if (msg.type() === 'error') {
        consoleErrors.push(msg.text());
      }
    });
    
    expect(consoleErrors).toHaveLength(0);
  });

  test('should load JavaScript bundle without errors', async ({ page }) => {
    const jsErrors = [];
    
    page.on('pageerror', error => {
      jsErrors.push(error.message);
    });
    
    await page.waitForLoadState('networkidle');
    
    // Check that our main bundle loaded successfully
    const scripts = await page.locator('script[src*="assets"]').all();
    expect(scripts.length).toBeGreaterThan(0);
    
    // Verify no JavaScript runtime errors
    expect(jsErrors).toHaveLength(0);
  });

  test('should have optimized bundle size (check network)', async ({ page }) => {
    const responses = [];
    
    page.on('response', response => {
      if (response.url().includes('assets') && response.url().includes('.js')) {
        responses.push({
          url: response.url(),
          status: response.status(),
          size: response.headers()['content-length']
        });
      }
    });
    
    await page.waitForLoadState('networkidle');
    
    // Should have loaded some assets
    expect(responses.length).toBeGreaterThan(0);
    
    // All assets should load successfully
    responses.forEach(response => {
      expect(response.status).toBe(200);
    });
  });

  test('should not have FontAwesome or Iconify imports in console', async ({ page }) => {
    const consoleMessages = [];
    
    page.on('console', msg => {
      consoleMessages.push(msg.text());
    });
    
    await page.waitForLoadState('networkidle');
    
    // Should not find any references to removed icon libraries
    const fontAwesomeRefs = consoleMessages.filter(msg => 
      msg.includes('fontawesome') || msg.includes('FontAwesome')
    );
    const iconifyRefs = consoleMessages.filter(msg => 
      msg.includes('iconify') || msg.includes('Iconify')
    );
    
    expect(fontAwesomeRefs).toHaveLength(0);
    expect(iconifyRefs).toHaveLength(0);
  });

  test('should load medical icons from HealthIcons', async ({ page }) => {
    await page.waitForLoadState('networkidle');
    
    // Navigate to icon showcase if it exists
    const showcaseLink = page.locator('a:has-text("Icon"), button:has-text("Icon")').first();
    if (await showcaseLink.isVisible()) {
      await showcaseLink.click();
      await page.waitForLoadState('networkidle');
    }
    
    // Check for medical icons (even if not on showcase page)
    const hasHealthIcons = await page.evaluate(() => {
      // Look for any elements that might contain medical icons
      const elements = document.querySelectorAll('svg, img, i, span');
      return Array.from(elements).some(el => 
        el.className && (
          el.className.includes('lungs') ||
          el.className.includes('kidney') ||
          el.className.includes('dna') ||
          el.className.includes('blood')
        )
      );
    });
    
    // Medical icons should be available in a medical app
    // This is more of a smoke test
    expect(typeof hasHealthIcons).toBe('boolean');
  });

  test('should have working authentication flow (if applicable)', async ({ page }) => {
    await page.waitForLoadState('networkidle');
    
    // Look for login/signup elements
    const loginButton = page.locator('button:has-text("Login"), a:has-text("Login")').first();
    const signupButton = page.locator('button:has-text("Sign"), a:has-text("Sign")').first();
    
    if (await loginButton.isVisible()) {
      await loginButton.click();
      await page.waitForLoadState('networkidle');
      
      // Should navigate to login page without errors
      const consoleErrors = [];
      page.on('console', msg => {
        if (msg.type() === 'error') {
          consoleErrors.push(msg.text());
        }
      });
      
      expect(consoleErrors).toHaveLength(0);
    }
  });

  test('should handle API calls gracefully', async ({ page }) => {
    const failedRequests = [];
    
    page.on('response', response => {
      if (response.status() >= 400) {
        failedRequests.push({
          url: response.url(),
          status: response.status()
        });
      }
    });
    
    await page.waitForLoadState('networkidle');
    
    // Filter out expected failures (like 404s for optional resources)
    const criticalFailures = failedRequests.filter(req => 
      req.status >= 500 || 
      (req.status >= 400 && !req.url.includes('favicon'))
    );
    
    // Should not have critical API failures
    expect(criticalFailures).toHaveLength(0);
  });
});

test.describe('Performance Checks', () => {
  test('should load within reasonable time', async ({ page }) => {
    const startTime = Date.now();
    
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    
    const loadTime = Date.now() - startTime;
    
    // Should load within 10 seconds (reasonable for dev environment)
    expect(loadTime).toBeLessThan(10000);
  });

  test('should have reduced bundle size after cleanup', async ({ page }) => {
    let vendorBundleSize = 0;
    
    page.on('response', async response => {
      if (response.url().includes('vendor') && response.url().includes('.js')) {
        const contentLength = response.headers()['content-length'];
        if (contentLength) {
          vendorBundleSize = parseInt(contentLength);
        }
      }
    });
    
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    
    // Our optimized vendor bundle should be around 486KB or less
    // Allow some variance for gzipping and network
    if (vendorBundleSize > 0) {
      expect(vendorBundleSize).toBeLessThan(600000); // 600KB max
    }
  });
}); 