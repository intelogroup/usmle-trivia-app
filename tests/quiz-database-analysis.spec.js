import { test, expect } from '@playwright/test';

test.describe('USMLE Trivia - Database & Quiz Analysis', () => {
  
  test.beforeEach(async ({ page }) => {
    // Track console messages and errors
    const logs = [];
    page.on('console', msg => {
      logs.push({ type: msg.type(), text: msg.text() });
      if (msg.type() === 'error') {
        console.error('Console error:', msg.text());
      }
    });
    
    // Track network requests
    page.on('response', response => {
      if (response.status() >= 400) {
        console.error(`HTTP ${response.status()}: ${response.url()}`);
      }
    });
  });

  test('Database Connection Analysis', async ({ page }) => {
    console.log('=== DATABASE CONNECTION ANALYSIS ===');
    
    // Navigate to database test page
    await page.goto('/database-test');
    await page.waitForLoadState('networkidle');
    
    // Check if database test page exists and loads
    const pageTitle = await page.title();
    const bodyText = await page.textContent('body');
    
    console.log(`Page title: ${pageTitle}`);
    console.log(`Page contains database test: ${bodyText.includes('Database') || bodyText.includes('Supabase')}`);
    
    // Look for environment check
    const envButton = page.locator('button:has-text("Environment"), button:has-text("Check")');
    if (await envButton.count() > 0) {
      console.log('Environment check button found');
      await envButton.first().click();
      await page.waitForTimeout(2000);
      
      // Check results
      const envResults = await page.locator('.env-status, .bg-red-50, .bg-green-50').textContent();
      console.log(`Environment status: ${envResults}`);
    } else {
      console.log('No environment check button found');
    }
    
    // Look for database test button
    const testButton = page.locator('button:has-text("Test"), button:has-text("Run")');
    if (await testButton.count() > 0) {
      console.log('Database test button found');
      await testButton.first().click();
      await page.waitForTimeout(5000);
      
      // Analyze test results
      const testResults = await page.locator('.test-result, .connection-status').all();
      for (let i = 0; i < testResults.length; i++) {
        const result = await testResults[i].textContent();
        console.log(`Test result ${i + 1}: ${result}`);
      }
    } else {
      console.log('No database test button found');
    }
    
    expect(bodyText.length).toBeGreaterThan(0);
  });

  test('Quiz Page Flow Analysis', async ({ page }) => {
    console.log('=== QUIZ FLOW ANALYSIS ===');
    
    // Test different quiz entry points
    const quizPaths = ['/quiz', '/quick-quiz', '/categories'];
    
    for (const path of quizPaths) {
      console.log(`\nTesting quiz path: ${path}`);
      
      try {
        await page.goto(path);
        await page.waitForLoadState('networkidle');
        await page.waitForTimeout(2000);
        
        const bodyText = await page.textContent('body');
        const hasQuizContent = bodyText.includes('Quiz') || bodyText.includes('Question') || bodyText.includes('Category');
        
        console.log(`${path} - Has quiz content: ${hasQuizContent}`);
        
        // Look for loading states
        const loadingElements = await page.locator('.loading, .spinner, text=Loading').count();
        console.log(`${path} - Loading elements: ${loadingElements}`);
        
        // Look for error states
        const errorElements = await page.locator('.error, text=Error, text=Failed').count();
        console.log(`${path} - Error elements: ${errorElements}`);
        
        // Look for question components
        const questionElements = await page.locator('.question, .question-text, h2, h3').count();
        console.log(`${path} - Question elements: ${questionElements}`);
        
        // Look for option buttons
        const optionElements = await page.locator('button:has-text("A)"), button:has-text("B)"), .option').count();
        console.log(`${path} - Option elements: ${optionElements}`);
        
      } catch (error) {
        console.log(`${path} - Failed to load: ${error.message}`);
      }
    }
    
    expect(true).toBe(true);
  });

  test('Quiz Interaction Analysis', async ({ page }) => {
    console.log('=== QUIZ INTERACTION ANALYSIS ===');
    
    await page.goto('/quick-quiz');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(3000);
    
    // Analyze current state
    const bodyText = await page.textContent('body');
    
    console.log('Current page state analysis:');
    console.log(`- Contains "Loading": ${bodyText.includes('Loading')}`);
    console.log(`- Contains "Error": ${bodyText.includes('Error')}`);
    console.log(`- Contains "Question": ${bodyText.includes('Question')}`);
    console.log(`- Contains "Supabase": ${bodyText.includes('Supabase')}`);
    console.log(`- Contains "Database": ${bodyText.includes('Database')}`);
    
    // Check for specific quiz components
    const components = {
      'Quiz Header': await page.locator('.quiz-header, h1, h2').count(),
      'Progress Bar': await page.locator('.progress, [role="progressbar"]').count(),
      'Question Card': await page.locator('.question-card, .question').count(),
      'Option Buttons': await page.locator('button').count(),
      'Timer': await page.locator('.timer, .time').count(),
      'Score Display': await page.locator('.score').count()
    };
    
    console.log('\nComponent counts:');
    Object.entries(components).forEach(([name, count]) => {
      console.log(`- ${name}: ${count}`);
    });
    
    // Try basic interactions
    const buttons = await page.locator('button').all();
    console.log(`\nFound ${buttons.length} buttons`);
    
    for (let i = 0; i < Math.min(buttons.length, 3); i++) {
      const button = buttons[i];
      const isVisible = await button.isVisible();
      const isEnabled = await button.isEnabled();
      const text = await button.textContent();
      
      console.log(`Button ${i + 1}: "${text}" - Visible: ${isVisible}, Enabled: ${isEnabled}`);
      
      if (isVisible && isEnabled && text && !text.includes('Back')) {
        try {
          await button.click();
          await page.waitForTimeout(1000);
          console.log(`Successfully clicked button: "${text}"`);
        } catch (error) {
          console.log(`Failed to click button: "${text}" - ${error.message}`);
        }
      }
    }
    
    expect(true).toBe(true);
  });

  test('Authentication Flow Analysis', async ({ page }) => {
    console.log('=== AUTHENTICATION ANALYSIS ===');
    
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    
    // Look for auth-related elements
    const authElements = {
      'Login Button': await page.locator('button:has-text("Login"), a:has-text("Login")').count(),
      'Sign Up Button': await page.locator('button:has-text("Sign"), a:has-text("Sign")').count(),
      'Profile Link': await page.locator('a:has-text("Profile"), button:has-text("Profile")').count(),
      'User Menu': await page.locator('.user-menu, .avatar').count()
    };
    
    console.log('Authentication elements:');
    Object.entries(authElements).forEach(([name, count]) => {
      console.log(`- ${name}: ${count}`);
    });
    
    // Test login flow if available
    const loginButton = page.locator('button:has-text("Login"), a:has-text("Login")').first();
    if (await loginButton.isVisible()) {
      console.log('Testing login flow...');
      await loginButton.click();
      await page.waitForLoadState('networkidle');
      
      const currentUrl = page.url();
      const pageText = await page.textContent('body');
      
      console.log(`Login page URL: ${currentUrl}`);
      console.log(`Has email input: ${pageText.includes('email') || pageText.includes('Email')}`);
      console.log(`Has password input: ${pageText.includes('password') || pageText.includes('Password')}`);
    }
    
    expect(true).toBe(true);
  });

  test('Performance & Resource Analysis', async ({ page }) => {
    console.log('=== PERFORMANCE ANALYSIS ===');
    
    const startTime = Date.now();
    
    // Track network requests
    const requests = [];
    page.on('response', response => {
      requests.push({
        url: response.url(),
        status: response.status(),
        contentType: response.headers()['content-type'],
        size: response.headers()['content-length']
      });
    });
    
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    
    const loadTime = Date.now() - startTime;
    console.log(`Initial load time: ${loadTime}ms`);
    
    // Analyze requests
    const jsRequests = requests.filter(r => r.contentType && r.contentType.includes('javascript'));
    const cssRequests = requests.filter(r => r.contentType && r.contentType.includes('css'));
    const imageRequests = requests.filter(r => r.contentType && r.contentType.includes('image'));
    const failedRequests = requests.filter(r => r.status >= 400);
    
    console.log(`\nResource analysis:`);
    console.log(`- Total requests: ${requests.length}`);
    console.log(`- JavaScript files: ${jsRequests.length}`);
    console.log(`- CSS files: ${cssRequests.length}`);
    console.log(`- Images: ${imageRequests.length}`);
    console.log(`- Failed requests: ${failedRequests.length}`);
    
    if (failedRequests.length > 0) {
      console.log('\nFailed requests:');
      failedRequests.forEach(req => {
        console.log(`- ${req.status}: ${req.url}`);
      });
    }
    
    // Test navigation performance
    const navigationTests = ['/quiz', '/leaderboard', '/profile'];
    for (const path of navigationTests) {
      const navStart = Date.now();
      try {
        await page.goto(path);
        await page.waitForLoadState('networkidle');
        const navTime = Date.now() - navStart;
        console.log(`${path} navigation time: ${navTime}ms`);
      } catch (error) {
        console.log(`${path} navigation failed: ${error.message}`);
      }
    }
    
    expect(loadTime).toBeLessThan(20000); // 20 second max for initial load
  });

  test('Error Handling Analysis', async ({ page }) => {
    console.log('=== ERROR HANDLING ANALYSIS ===');
    
    // Test 404 handling
    await page.goto('/non-existent-page');
    await page.waitForLoadState('networkidle');
    
    const notFoundText = await page.textContent('body');
    console.log(`404 page contains: ${notFoundText.substring(0, 200)}...`);
    console.log(`Has 404 indicators: ${notFoundText.includes('404') || notFoundText.includes('Not Found')}`);
    
    // Test invalid quiz routes
    const invalidRoutes = ['/quiz/invalid-category', '/quiz/999', '/quick-quiz/invalid'];
    
    for (const route of invalidRoutes) {
      try {
        await page.goto(route);
        await page.waitForLoadState('networkidle');
        await page.waitForTimeout(1000);
        
        const pageText = await page.textContent('body');
        const hasErrorHandling = pageText.includes('Error') || 
                                pageText.includes('Not Found') || 
                                pageText.includes('Invalid') ||
                                pageText.includes('Back');
        
        console.log(`${route} - Has error handling: ${hasErrorHandling}`);
      } catch (error) {
        console.log(`${route} - Navigation error: ${error.message}`);
      }
    }
    
    // Test offline behavior
    console.log('\nTesting offline behavior...');
    await page.context().setOffline(true);
    
    await page.goto('/quick-quiz');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);
    
    const offlineText = await page.textContent('body');
    const hasOfflineHandling = offlineText.includes('offline') || 
                              offlineText.includes('network') || 
                              offlineText.includes('connection');
    
    console.log(`Offline handling detected: ${hasOfflineHandling}`);
    
    // Re-enable network
    await page.context().setOffline(false);
    
    expect(true).toBe(true);
  });
}); 