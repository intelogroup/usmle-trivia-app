import { test, expect } from '@playwright/test';

test('Debug login page elements', async ({ page }) => {
  // Capture console errors
  const consoleErrors = [];
  const allConsoleMessages = [];
  page.on('console', msg => {
    allConsoleMessages.push(`${msg.type()}: ${msg.text()}`);
    if (msg.type() === 'error') {
      consoleErrors.push(msg.text());
    }
  });

  // Capture page errors
  const pageErrors = [];
  page.on('pageerror', error => {
    pageErrors.push(error.message);
    console.log('Page error details:', error.stack);
  });

  // Capture failed requests
  const failedRequests = [];
  page.on('response', response => {
    if (!response.ok()) {
      failedRequests.push(`${response.status()} ${response.url()}`);
    }
  });

  // Mock Supabase configuration with real values
  await page.addInitScript(() => {
    window.process = { env: {} };
    if (!window.import) {
      window.import = { meta: { env: {} } };
    }
    if (!window.import.meta) {
      window.import.meta = { env: {} };
    }
    window.import.meta.env.VITE_SUPABASE_URL = 'https://bkuowoowlmwranfoliea.supabase.co';
    window.import.meta.env.VITE_SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJrdW93b293bG13cmFuZm9saWVhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTAyMDA4NTQsImV4cCI6MjA2NTc3Njg1NH0.lNbEJRUEOl3nVtRPNqKsJu4w031DHae5bjOxZIFlSpI';
    window.import.meta.env.DEV = false;
  });

  await page.goto('http://localhost:5173/', { timeout: 60000 });

  // Wait for redirect to welcome or login
  await page.waitForURL('**/welcome', { timeout: 10000 });
  await page.waitForLoadState('networkidle');

  // Take a screenshot
  await page.screenshot({ path: 'welcome-page.png', fullPage: true });

  // Log all input elements
  const inputs = await page.locator('input').all();
  console.log(`Found ${inputs.length} input elements`);
  
  for (let i = 0; i < inputs.length; i++) {
    const input = inputs[i];
    const type = await input.getAttribute('type');
    const name = await input.getAttribute('name');
    const testId = await input.getAttribute('data-testid');
    const placeholder = await input.getAttribute('placeholder');
    console.log(`Input ${i}: type=${type}, name=${name}, testId=${testId}, placeholder=${placeholder}`);
  }

  // Log all elements with data-testid
  const testIdElements = await page.locator('[data-testid]').all();
  console.log(`Found ${testIdElements.length} elements with data-testid`);
  
  for (let i = 0; i < testIdElements.length; i++) {
    const element = testIdElements[i];
    const testId = await element.getAttribute('data-testid');
    const tagName = await element.evaluate(el => el.tagName);
    console.log(`TestId element ${i}: ${tagName} with data-testid="${testId}"`);
  }

  // Check page content
  const content = await page.content();
  console.log('Page title:', await page.title());
  console.log('Page contains "Sign In":', content.includes('Sign In'));
  console.log('Page contains "email":', content.includes('email'));
  console.log('Current URL:', page.url());

  // Log the body content to see what's actually rendered
  const bodyText = await page.locator('body').textContent();
  console.log('Body text content:', bodyText.substring(0, 500));

  // Log console and page errors
  console.log('All console messages:', allConsoleMessages);
  console.log('Console errors:', consoleErrors);
  console.log('Page errors:', pageErrors);
  console.log('Failed requests:', failedRequests);
});
