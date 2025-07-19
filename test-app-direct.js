// Test the app loading directly
import { test, expect } from '@playwright/test';

test('Test app loading with console debugging', async ({ page }) => {
  const logs = [];
  const errors = [];
  const networkRequests = [];

  // Capture all console messages
  page.on('console', (msg) => {
    logs.push(`${msg.type()}: ${msg.text()}`);
  });

  // Capture all errors
  page.on('pageerror', (error) => {
    errors.push(error.toString());
  });

  // Capture network requests
  page.on('request', (request) => {
    networkRequests.push({
      url: request.url(),
      method: request.method(),
      resourceType: request.resourceType()
    });
  });

  // Navigate to the page
  await page.goto('http://localhost:5173/', { 
    waitUntil: 'networkidle',
    timeout: 30000 
  });

  // Wait for potential React rendering
  await page.waitForTimeout(10000);

  // Check if root element exists
  const rootElement = await page.locator('#root').count();
  console.log('Root element found:', rootElement > 0);

  // Check if any React component rendered
  const hasContent = await page.evaluate(() => {
    const root = document.getElementById('root');
    return root && root.innerHTML.length > 50;
  });
  console.log('Root has content:', hasContent);

  // Print debugging info
  console.log('\n=== CONSOLE LOGS ===');
  logs.forEach(log => console.log(log));

  console.log('\n=== ERRORS ===');
  errors.forEach(error => console.log(error));

  console.log('\n=== KEY NETWORK REQUESTS ===');
  networkRequests
    .filter(req => req.resourceType === 'script' || req.resourceType === 'document')
    .forEach(req => console.log(`${req.method} ${req.url}`));

  // Check current page content
  const pageContent = await page.content();
  console.log('\n=== PAGE HTML (first 1000 chars) ===');
  console.log(pageContent.substring(0, 1000));

  // Try to find specific elements
  const hasViteClient = pageContent.includes('@vite/client');
  const hasReactRefresh = pageContent.includes('@react-refresh');
  const hasMainJs = pageContent.includes('src/main.jsx');
  
  console.log('\n=== ELEMENT CHECKS ===');
  console.log('Has Vite client:', hasViteClient);
  console.log('Has React refresh:', hasReactRefresh);
  console.log('Has main.jsx:', hasMainJs);

  // Check if main.jsx is loading
  if (!hasMainJs) {
    console.log('❌ main.jsx not found in HTML - possible build issue');
  }
});