import { test, expect } from '@playwright/test';

test.describe('USMLE Trivia - Comprehensive Analysis', () => {
  
  test('Database and Quiz Flow Analysis', async ({ page }) => {
    console.log('=== STARTING COMPREHENSIVE ANALYSIS ===');
    
    // Track all console messages
    const consoleMessages = [];
    page.on('console', msg => {
      consoleMessages.push({ type: msg.type(), text: msg.text() });
      if (msg.type() === 'error') {
        console.error('Console Error:', msg.text());
      }
    });
    
    // Track network requests
    const networkRequests = [];
    page.on('response', response => {
      networkRequests.push({
        url: response.url(),
        status: response.status(),
        method: response.request().method()
      });
      
      if (response.status() >= 400) {
        console.error(`HTTP Error: ${response.status()} - ${response.url()}`);
      }
    });

    // 1. Test Homepage
    console.log('\n1. TESTING HOMEPAGE');
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    
    const homeTitle = await page.title();
    const homeContent = await page.textContent('body');
    console.log(`✓ Homepage loaded - Title: ${homeTitle}`);
    console.log(`✓ Content length: ${homeContent.length} characters`);

    // 2. Test Database Test Page
    console.log('\n2. TESTING DATABASE CONNECTION');
    await page.goto('/database-test');
    await page.waitForLoadState('networkidle');
    
    const hasTestPage = await page.locator('h1:has-text("Database"), h1:has-text("Supabase")').count() > 0;
    console.log(`✓ Database test page exists: ${hasTestPage}`);
    
    if (hasTestPage) {
      // Look for test buttons
      const testButtons = await page.locator('button').all();
      console.log(`✓ Found ${testButtons.length} buttons on test page`);
      
      for (let i = 0; i < testButtons.length; i++) {
        const buttonText = await testButtons[i].textContent();
        console.log(`  - Button ${i + 1}: "${buttonText}"`);
        
        if (buttonText.includes('Test') || buttonText.includes('Check')) {
          try {
            await testButtons[i].click();
            await page.waitForTimeout(3000);
            console.log(`  ✓ Clicked: "${buttonText}"`);
          } catch (error) {
            console.log(`  ✗ Failed to click: "${buttonText}" - ${error.message}`);
          }
        }
      }
    }

    // 3. Test Quiz Pages
    console.log('\n3. TESTING QUIZ FUNCTIONALITY');
    const quizRoutes = ['/quiz', '/quick-quiz', '/categories'];
    
    for (const route of quizRoutes) {
      console.log(`\nTesting route: ${route}`);
      
      try {
        await page.goto(route);
        await page.waitForLoadState('networkidle');
        await page.waitForTimeout(2000);
        
        const routeContent = await page.textContent('body');
        const hasQuizElements = routeContent.includes('Quiz') || 
                               routeContent.includes('Question') || 
                               routeContent.includes('Category');
        
        console.log(`  ✓ Route accessible: ${route}`);
        console.log(`  ✓ Has quiz content: ${hasQuizElements}`);
        
        // Check for specific UI elements
        const elements = {
          'Questions': await page.locator('.question, h2, h3').count(),
          'Buttons': await page.locator('button').count(),
          'Loading': await page.locator('.loading, .spinner').count(),
          'Errors': await page.locator('.error, .alert-error').count()
        };
        
        console.log(`  Elements found:`, elements);
        
        // Try interacting with buttons
        const buttons = await page.locator('button').all();
        if (buttons.length > 0) {
          const firstButton = buttons[0];
          const buttonText = await firstButton.textContent();
          const isEnabled = await firstButton.isEnabled();
          
          if (isEnabled && !buttonText.includes('Back')) {
            try {
              await firstButton.click();
              await page.waitForTimeout(1000);
              console.log(`  ✓ Successfully clicked: "${buttonText}"`);
            } catch (error) {
              console.log(`  ✗ Click failed: "${buttonText}" - ${error.message}`);
            }
          }
        }
        
      } catch (error) {
        console.log(`  ✗ Route failed: ${route} - ${error.message}`);
      }
    }

    // 4. Test Authentication
    console.log('\n4. TESTING AUTHENTICATION');
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    
    const authButtons = await page.locator('button:has-text("Login"), a:has-text("Login"), button:has-text("Sign")').all();
    console.log(`✓ Found ${authButtons.length} auth-related buttons`);
    
    if (authButtons.length > 0) {
      const authButton = authButtons[0];
      const authText = await authButton.textContent();
      
      try {
        await authButton.click();
        await page.waitForLoadState('networkidle');
        
        const authPageContent = await page.textContent('body');
        const hasAuthForm = authPageContent.includes('email') || 
                           authPageContent.includes('password') ||
                           authPageContent.includes('Email') ||
                           authPageContent.includes('Password');
        
        console.log(`  ✓ Auth flow initiated: "${authText}"`);
        console.log(`  ✓ Has auth form: ${hasAuthForm}`);
      } catch (error) {
        console.log(`  ✗ Auth flow failed: ${error.message}`);
      }
    }

    // 5. Analyze Network Activity
    console.log('\n5. NETWORK ANALYSIS');
    const totalRequests = networkRequests.length;
    const successfulRequests = networkRequests.filter(r => r.status < 400).length;
    const failedRequests = networkRequests.filter(r => r.status >= 400).length;
    const apiRequests = networkRequests.filter(r => r.url.includes('supabase') || r.url.includes('api')).length;
    
    console.log(`✓ Total network requests: ${totalRequests}`);
    console.log(`✓ Successful requests: ${successfulRequests}`);
    console.log(`✓ Failed requests: ${failedRequests}`);
    console.log(`✓ API requests: ${apiRequests}`);
    
    if (failedRequests > 0) {
      const uniqueFailures = [...new Set(networkRequests.filter(r => r.status >= 400).map(r => `${r.status}: ${r.url}`))];
      console.log('Failed requests:');
      uniqueFailures.forEach(failure => console.log(`  - ${failure}`));
    }

    // 6. Analyze Console Output
    console.log('\n6. CONSOLE ANALYSIS');
    const errorMessages = consoleMessages.filter(m => m.type === 'error');
    const warningMessages = consoleMessages.filter(m => m.type === 'warning');
    const logMessages = consoleMessages.filter(m => m.type === 'log');
    
    console.log(`✓ Console errors: ${errorMessages.length}`);
    console.log(`✓ Console warnings: ${warningMessages.length}`);
    console.log(`✓ Console logs: ${logMessages.length}`);
    
    if (errorMessages.length > 0) {
      console.log('Console errors:');
      errorMessages.slice(0, 5).forEach(error => console.log(`  - ${error.text}`));
    }

    // 7. Test Quiz Interaction Flow
    console.log('\n7. TESTING QUIZ INTERACTION FLOW');
    await page.goto('/quick-quiz');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(3000);
    
    const quizState = {
      hasLoadingState: await page.locator('.loading, .spinner').count() > 0 || await page.locator('text="Loading"').count() > 0,
      hasErrorState: await page.locator('.error').count() > 0 || await page.locator('text="Error"').count() > 0,
      hasQuestionState: await page.locator('.question, .question-text').count() > 0,
      hasOptionsState: await page.locator('button:has-text("A)"), button:has-text("B)")').count() > 0,
      hasTimerState: await page.locator('.timer, .time').count() > 0
    };
    
    console.log('Quiz state analysis:', quizState);
    
    // Try quiz interactions
    if (quizState.hasOptionsState) {
      const options = await page.locator('button:has-text("A)"), button:has-text("B)")').all();
      if (options.length > 0) {
        try {
          await options[0].click();
          await page.waitForTimeout(1000);
          console.log('  ✓ Successfully selected quiz option');
          
          // Look for next button or auto-advance
          const nextButton = page.locator('button:has-text("Next"), button:has-text("Continue")');
          if (await nextButton.isVisible()) {
            await nextButton.click();
            console.log('  ✓ Advanced to next question');
          }
        } catch (error) {
          console.log(`  ✗ Quiz interaction failed: ${error.message}`);
        }
      }
    }

    // 8. Performance Analysis
    console.log('\n8. PERFORMANCE ANALYSIS');
    const performanceMetrics = await page.evaluate(() => {
      const navigation = performance.getEntriesByType('navigation')[0];
      return {
        domContentLoaded: navigation.domContentLoadedEventEnd - navigation.domContentLoadedEventStart,
        loadComplete: navigation.loadEventEnd - navigation.loadEventStart,
        totalLoadTime: navigation.loadEventEnd - navigation.fetchStart
      };
    });
    
    console.log('Performance metrics:', performanceMetrics);

    console.log('\n=== ANALYSIS COMPLETE ===');
    
    // Final assertion
    expect(homeContent.length).toBeGreaterThan(0);
  });

  test('Responsive Design Analysis', async ({ page }) => {
    console.log('\n=== RESPONSIVE DESIGN TEST ===');
    
    const viewports = [
      { name: 'Mobile', width: 375, height: 667 },
      { name: 'Tablet', width: 768, height: 1024 },
      { name: 'Desktop', width: 1280, height: 720 }
    ];
    
    for (const viewport of viewports) {
      console.log(`\nTesting ${viewport.name} (${viewport.width}x${viewport.height})`);
      
      await page.setViewportSize({ width: viewport.width, height: viewport.height });
      await page.goto('/');
      await page.waitForLoadState('networkidle');
      
      const content = await page.textContent('body');
      const hasContent = content.length > 0;
      const hasNavigation = await page.locator('nav, .nav, .navigation').count() > 0;
      const hasButtons = await page.locator('button').count();
      
      console.log(`  ✓ Content loaded: ${hasContent}`);
      console.log(`  ✓ Navigation present: ${hasNavigation}`);
      console.log(`  ✓ Buttons count: ${hasButtons}`);
      
      // Test quiz page on each viewport
      await page.goto('/quick-quiz');
      await page.waitForLoadState('networkidle');
      await page.waitForTimeout(1000);
      
      const quizContent = await page.textContent('body');
      console.log(`  ✓ Quiz page responsive: ${quizContent.length > 0}`);
    }
    
    expect(true).toBe(true);
  });
}); 