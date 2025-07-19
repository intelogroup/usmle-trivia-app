import { test, expect } from '@playwright/test';

test('Detailed app loading test with console capture', async ({ page }) => {
  const logs = [];
  const errors = [];

  // Capture console messages
  page.on('console', (msg) => {
    const text = msg.text();
    logs.push(`${msg.type().toUpperCase()}: ${text}`);
    
    if (msg.type() === 'error') {
      errors.push(text);
    }
  });

  // Capture JavaScript errors
  page.on('pageerror', (error) => {
    errors.push(`PAGE ERROR: ${error.toString()}`);
  });

  console.log('🔄 Loading app...');
  await page.goto('/', { 
    waitUntil: 'networkidle',
    timeout: 30000 
  });

  // Wait for potential React rendering
  await page.waitForTimeout(15000);

  // Check basic page elements
  const title = await page.title();
  const bodyText = await page.textContent('body');
  const rootElement = await page.locator('#root');
  const rootCount = await rootElement.count();
  const rootHTML = await rootElement.innerHTML().catch(() => '');

  console.log('\n📊 Page Analysis:');
  console.log('Title:', title);
  console.log('Body text length:', bodyText.length);
  console.log('Root element found:', rootCount > 0);
  console.log('Root HTML length:', rootHTML.length);
  console.log('Root HTML preview:', rootHTML.substring(0, 200));

  // Check for React mounting
  const reactMounted = await page.evaluate(() => {
    const root = document.getElementById('root');
    if (!root) return false;
    
    // Check for React fiber node (React 18+)
    const hasReactFiber = root._reactInternalFiber || root._reactInternalInstance || 
                         Object.keys(root).some(key => key.startsWith('__reactInternalInstance'));
    
    // Check for actual DOM content
    const hasContent = root.children.length > 0;
    
    return { hasReactFiber, hasContent, innerHTML: root.innerHTML.substring(0, 100) };
  });

  console.log('\n⚛️  React Status:');
  console.log('React mounted:', reactMounted);

  // Check environment variables in browser
  const envCheck = await page.evaluate(() => {
    return {
      nodeEnv: typeof process !== 'undefined' ? process.env.NODE_ENV : 'undefined',
      hasModules: document.querySelector('script[type="module"]') !== null,
      hasViteClient: document.querySelector('script[src*="@vite/client"]') !== null
    };
  });

  console.log('\n🔧 Environment Check:');
  console.log('Environment:', envCheck);

  // Print all logs and errors
  console.log('\n📝 Console Logs:');
  logs.forEach(log => console.log('  ', log));

  if (errors.length > 0) {
    console.log('\n❌ Errors Found:');
    errors.forEach(error => console.log('  ', error));
  } else {
    console.log('\n✅ No JavaScript errors detected');
  }

  // Check network tab for failed requests
  const failedRequests = [];
  page.on('response', (response) => {
    if (!response.ok()) {
      failedRequests.push({
        url: response.url(),
        status: response.status(),
        statusText: response.statusText()
      });
    }
  });

  // Wait a bit more to catch any late requests
  await page.waitForTimeout(5000);

  if (failedRequests.length > 0) {
    console.log('\n🚫 Failed Network Requests:');
    failedRequests.forEach(req => {
      console.log(`  ${req.status} ${req.statusText}: ${req.url}`);
    });
  } else {
    console.log('\n✅ No failed network requests');
  }

  // Try to manually check if the app should work
  const basicTest = await page.evaluate(() => {
    // Check if React and other dependencies are available
    return {
      hasReact: typeof React !== 'undefined' || document.querySelector('[data-reactroot]') !== null,
      hasRouter: typeof window.history !== 'undefined',
      hasRoot: document.getElementById('root') !== null,
      currentURL: window.location.href,
      readyState: document.readyState
    };
  });

  console.log('\n🔍 Basic Functionality Test:');
  console.log('Basic test results:', basicTest);

  // Check if the issue is with Supabase
  const supabaseTest = await page.evaluate(() => {
    const scripts = Array.from(document.querySelectorAll('script')).map(s => s.src);
    const hasSupabaseScript = scripts.some(src => src.includes('supabase'));
    
    return {
      hasSupabaseScript,
      totalScripts: scripts.length,
      moduleScripts: scripts.filter(src => src.includes('.js')).length
    };
  });

  console.log('\n🗄️  Supabase Check:');
  console.log('Supabase test:', supabaseTest);

  // Final recommendation
  console.log('\n💡 Recommendations:');
  if (errors.length > 0) {
    console.log('  - Fix JavaScript errors listed above');
  }
  if (!reactMounted.hasContent) {
    console.log('  - Check React component mounting');
    console.log('  - Verify AuthProvider and other context providers');
  }
  if (failedRequests.length > 0) {
    console.log('  - Resolve failed network requests');
  }

  // Take screenshot for debugging
  await page.screenshot({ path: 'app-loading-debug.png', fullPage: true });
  console.log('\n📸 Screenshot saved as app-loading-debug.png');
});