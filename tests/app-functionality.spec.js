import { test, expect } from '@playwright/test';

test('App basic functionality test', async ({ page }) => {
  // Go to the app
  await page.goto('/');
  
  // Wait for the app to load
  await page.waitForTimeout(3000);
  
  // Check if we're on the welcome page or home page
  const currentUrl = page.url();
  console.log('Current URL:', currentUrl);
  
  // Check if basic navigation works
  const bodyText = await page.textContent('body');
  console.log('Body text length:', bodyText.length);
  
  // Look for key UI elements that indicate the app is working
  const hasNavigationElements = await page.evaluate(() => {
    // Check for common navigation elements
    const hasButtons = document.querySelectorAll('button').length > 0;
    const hasLinks = document.querySelectorAll('a').length > 0;
    const hasContent = document.body.innerText.length > 100;
    const hasGradient = document.querySelector('[class*="gradient"]') !== null;
    
    return {
      hasButtons,
      hasLinks,
      hasContent,
      hasGradient,
      totalElements: document.querySelectorAll('*').length
    };
  });
  
  console.log('UI Elements Check:', hasNavigationElements);
  
  // Check if we can see typical app content
  const appContent = await page.evaluate(() => {
    const text = document.body.innerText.toLowerCase();
    return {
      hasTrivia: text.includes('trivia'),
      hasQuiz: text.includes('quiz'),
      hasUSMLE: text.includes('usmle'),
      hasWelcome: text.includes('welcome'),
      hasStart: text.includes('start'),
      hasLogin: text.includes('login') || text.includes('sign'),
    };
  });
  
  console.log('App Content Check:', appContent);
  
  // Try clicking a button if available
  const buttons = await page.locator('button').count();
  console.log('Number of buttons found:', buttons);
  
  if (buttons > 0) {
    const firstButton = page.locator('button').first();
    const buttonText = await firstButton.textContent();
    console.log('First button text:', buttonText);
    
    // Try to click it if it's not a form submit or dangerous action
    if (buttonText && !buttonText.toLowerCase().includes('delete') && !buttonText.toLowerCase().includes('submit')) {
      try {
        await firstButton.click();
        await page.waitForTimeout(1000);
        console.log('Successfully clicked button:', buttonText);
        
        // Check if navigation occurred
        const newUrl = page.url();
        console.log('URL after click:', newUrl);
      } catch (error) {
        console.log('Could not click button:', error.message);
      }
    }
  }
  
  // Take a screenshot for debugging
  await page.screenshot({ path: 'app-functionality-test.png', fullPage: true });
  console.log('Screenshot saved as app-functionality-test.png');
  
  // Assertions
  expect(hasNavigationElements.hasContent).toBe(true);
  expect(hasNavigationElements.totalElements).toBeGreaterThan(10);
  expect(bodyText.length).toBeGreaterThan(50);
});