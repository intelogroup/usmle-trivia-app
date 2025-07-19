import { test, expect } from '@playwright/test';

test('Debug app loading issues', async ({ page }) => {
  // Listen for console errors
  const errors = [];
  const networkErrors = [];
  
  page.on('console', (msg) => {
    if (msg.type() === 'error') {
      errors.push(msg.text());
    }
  });
  
  page.on('response', (response) => {
    if (!response.ok()) {
      networkErrors.push({
        url: response.url(),
        status: response.status(),
        statusText: response.statusText()
      });
    }
  });
  
  await page.goto('/');
  
  // Wait for page to load
  await page.waitForTimeout(10000);
  
  // Log what we see
  const title = await page.title();
  const bodyContent = await page.textContent('body');
  const htmlContent = await page.content();
  
  console.log('Page title:', title);
  console.log('Body content length:', bodyContent.length);
  console.log('Body content preview:', bodyContent.substring(0, 200));
  console.log('Console errors:', errors);
  console.log('Network errors:', networkErrors);
  console.log('HTML snippet:', htmlContent.substring(0, 500));
  
  // Check if React has mounted
  const reactMounted = await page.evaluate(() => {
    return document.querySelector('#root') && document.querySelector('#root').children.length > 0;
  });
  
  console.log('React mounted:', reactMounted);
  
  // Check for common loading indicators
  const hasLoadingIndicator = await page.locator('text=/loading|spinner/i').isVisible();
  const hasErrorMessage = await page.locator('text=/error|failed/i').isVisible();
  
  console.log('Has loading indicator:', hasLoadingIndicator);
  console.log('Has error message:', hasErrorMessage);
  
  // Take a screenshot for debugging
  await page.screenshot({ path: 'debug-screenshot.png', fullPage: true });
  
  console.log('Screenshot saved as debug-screenshot.png');
});