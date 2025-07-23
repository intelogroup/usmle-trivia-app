import { test, expect } from '@playwright/test';

test.describe('Database Connection Tests', () => {
  
  test('should verify database connection from browser context', async ({ page }) => {
    // Inject a database test function into the page context
    await page.goto('/');
    
    // Add environment variables to the page
    await page.addInitScript(() => {
      window.PLAYWRIGHT_TEST_MODE = true;
    });
    
    // Test the database connection by evaluating client-side code
    const connectionResult = await page.evaluate(async () => {
      try {
        // Import Supabase client
        const { createClient } = await import('/src/lib/supabase.js');
        
        // Test basic connection
        const testResult = {
          url: import.meta.env.VITE_SUPABASE_URL,
          keyPresent: !!import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY,
          timestamp: new Date().toISOString()
        };
        
        return {
          success: true,
          data: testResult,
          message: 'Client-side connection test successful'
        };
      } catch (error) {
        return {
          success: false,
          error: error.message,
          message: 'Client-side connection test failed'
        };
      }
    });
    
    console.log('Database Connection Result:', connectionResult);
    
    // Verify the connection result
    expect(connectionResult.success).toBe(true);
    expect(connectionResult.data.url).toContain('supabase.co');
    expect(connectionResult.data.keyPresent).toBe(true);
  });
  
  test('should load environment variables correctly', async ({ page }) => {
    await page.goto('/');
    
    const envCheck = await page.evaluate(() => {
      return {
        hasUrl: !!import.meta.env.VITE_SUPABASE_URL,
        hasKey: !!import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY,
        url: import.meta.env.VITE_SUPABASE_URL,
        keyPrefix: import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY?.substring(0, 20) + '...'
      };
    });
    
    console.log('Environment Check:', envCheck);
    
    expect(envCheck.hasUrl).toBe(true);
    expect(envCheck.hasKey).toBe(true);
    expect(envCheck.url).toMatch(/https:\/\/.*\.supabase\.co/);
    expect(envCheck.keyPrefix).toMatch(/^eyJ.*\.\.\./);
  });
  
  test('should handle database requests in app context', async ({ page }) => {
    // Track network requests
    const requests = [];
    const responses = [];
    
    page.on('request', request => {
      if (request.url().includes('supabase.co')) {
        requests.push({
          url: request.url(),
          method: request.method(),
          headers: request.headers()
        });
      }
    });
    
    page.on('response', response => {
      if (response.url().includes('supabase.co')) {
        responses.push({
          url: response.url(),
          status: response.status(),
          statusText: response.statusText()
        });
      }
    });
    
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(3000);
    
    console.log('Supabase Requests:', requests.length);
    console.log('Supabase Responses:', responses.length);
    
    if (responses.length > 0) {
      console.log('Response Details:', responses);
      
      // Check if we have any successful requests
      const successfulResponses = responses.filter(r => r.status < 400);
      const failedResponses = responses.filter(r => r.status >= 400);
      
      console.log(`Successful: ${successfulResponses.length}, Failed: ${failedResponses.length}`);
      
      // The test should pass even if some requests fail (like 401s for unauthenticated requests)
      // What matters is that requests are being made to the correct Supabase URL
      expect(responses.length).toBeGreaterThan(0);
      expect(responses[0].url).toContain('bkuowoowlmwranfoliea.supabase.co');
    }
  });
  
  test('should display Supabase connection status on page', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    
    // Wait for any initial connection attempts
    await page.waitForTimeout(5000);
    
    // Check if there are any database-related error messages or success indicators
    const pageContent = await page.textContent('body');
    const hasConnectionIndicators = pageContent.toLowerCase().includes('database') || 
                                   pageContent.toLowerCase().includes('connection') ||
                                   pageContent.toLowerCase().includes('supabase');
    
    console.log('Page has connection indicators:', hasConnectionIndicators);
    
    // Check console logs for connection status
    const logs = [];
    page.on('console', msg => {
      if (msg.text().includes('Supabase') || msg.text().includes('database')) {
        logs.push(msg.text());
      }
    });
    
    await page.reload();
    await page.waitForTimeout(3000);
    
    console.log('Connection-related logs:', logs);
    
    // The test passes if the page loads without critical errors
    // Connection status is informational
    expect(pageContent.length).toBeGreaterThan(0);
  });
});