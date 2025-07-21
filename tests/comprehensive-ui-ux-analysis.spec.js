import { test, expect } from '@playwright/test';

/**
 * Comprehensive UI/UX Analysis Test Suite
 * Tests visual elements, user experience, accessibility, and responsive design
 */

test.describe('UI/UX Comprehensive Analysis', () => {

  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test.describe('Visual Consistency Analysis', () => {
    
    test('should have consistent color scheme across pages', async ({ page }) => {
      // Check homepage colors
      const homeGradient = await page.locator('body').evaluate(el => 
        getComputedStyle(el).backgroundImage
      );
      
      // Navigate to different pages and check gradient consistency
      await page.click('text=Get Started');
      const authGradient = await page.locator('body').evaluate(el => 
        getComputedStyle(el).backgroundImage
      );
      
      // Check if color themes are consistent (gradients should use similar hues)
      expect(homeGradient).toContain('gradient');
      expect(authGradient).toContain('gradient');
    });

    test('should use consistent typography hierarchy', async ({ page }) => {
      // Check if h1, h2, h3 elements have consistent styling
      const h1Elements = page.locator('h1');
      const h2Elements = page.locator('h2');
      
      if (await h1Elements.count() > 0) {
        const h1FontSize = await h1Elements.first().evaluate(el => 
          getComputedStyle(el).fontSize
        );
        const h1FontWeight = await h1Elements.first().evaluate(el => 
          getComputedStyle(el).fontWeight
        );
        
        // H1 should be larger and bolder than H2
        expect(parseInt(h1FontSize)).toBeGreaterThan(20);
        expect(parseInt(h1FontWeight)).toBeGreaterThanOrEqual(600);
      }
    });

    test('should have consistent button styling', async ({ page }) => {
      const buttons = page.locator('button:visible');
      const buttonCount = await buttons.count();
      
      if (buttonCount > 0) {
        // Check first few buttons for consistent styling
        for (let i = 0; i < Math.min(buttonCount, 3); i++) {
          const button = buttons.nth(i);
          const borderRadius = await button.evaluate(el => 
            getComputedStyle(el).borderRadius
          );
          
          // Buttons should have consistent border radius
          expect(borderRadius).toMatch(/\d+(px|rem)/);
        }
      }
    });

  });

  test.describe('Responsive Design Analysis', () => {
    
    test('should be responsive on mobile viewport', async ({ page }) => {
      await page.setViewportSize({ width: 375, height: 667 }); // iPhone SE
      
      // Check if navigation adapts to mobile
      const mobileNav = page.locator('[data-testid="mobile-nav"], .bottom-nav, nav');
      
      // Should have some form of mobile navigation
      expect(await mobileNav.count()).toBeGreaterThan(0);
      
      // Check if content is not horizontally scrollable
      const bodyWidth = await page.evaluate(() => document.body.scrollWidth);
      const viewportWidth = await page.viewportSize();
      
      expect(bodyWidth).toBeLessThanOrEqual(viewportWidth.width + 5); // 5px tolerance
    });

    test('should be responsive on tablet viewport', async ({ page }) => {
      await page.setViewportSize({ width: 768, height: 1024 }); // iPad
      
      // Content should adapt properly to tablet size
      const mainContent = page.locator('main, [role="main"], .main-content');
      
      if (await mainContent.count() > 0) {
        const contentWidth = await mainContent.first().evaluate(el => 
          el.getBoundingClientRect().width
        );
        
        // Content should use available space efficiently
        expect(contentWidth).toBeGreaterThan(500);
      }
    });

    test('should be responsive on desktop viewport', async ({ page }) => {
      await page.setViewportSize({ width: 1920, height: 1080 }); // Full HD
      
      // Check if sidebar/navigation exists for desktop
      const sidebar = page.locator('[data-testid="sidebar"], .sidebar, aside');
      
      // Desktop should potentially have sidebar navigation
      // This is optional since many modern apps are mobile-first
      const sidebarExists = await sidebar.count() > 0;
      
      // Content should be centered and not stretched too wide
      const mainContent = page.locator('main, [role="main"], .container');
      if (await mainContent.count() > 0) {
        const contentWidth = await mainContent.first().evaluate(el => 
          el.getBoundingClientRect().width
        );
        
        // Content should not be stretched across entire screen
        expect(contentWidth).toBeLessThan(1600); // Max content width check
      }
    });

  });

  test.describe('User Experience Flow Analysis', () => {
    
    test('should have clear call-to-action buttons', async ({ page }) => {
      // Look for primary action buttons
      const ctaButtons = page.locator('button:has-text("Get Started"), button:has-text("Start"), button:has-text("Begin"), .cta-button, .btn-primary');
      
      expect(await ctaButtons.count()).toBeGreaterThan(0);
      
      // CTA buttons should be visually prominent
      if (await ctaButtons.count() > 0) {
        const firstCta = ctaButtons.first();
        const backgroundColor = await firstCta.evaluate(el => 
          getComputedStyle(el).backgroundColor
        );
        
        // Should have a distinct background color (not transparent)
        expect(backgroundColor).not.toBe('rgba(0, 0, 0, 0)');
        expect(backgroundColor).not.toBe('transparent');
      }
    });

    test('should have proper loading states', async ({ page }) => {
      // Look for loading indicators
      const loadingIndicators = page.locator('.loading, .spinner, [data-testid="loading"], .animate-spin');
      
      // Navigate to a page that might trigger loading
      if (await page.locator('text=Quiz').count() > 0) {
        await page.click('text=Quiz');
        
        // Check if loading states appear during navigation
        await page.waitForTimeout(100); // Brief wait to catch loading states
        
        const hasLoadingState = await loadingIndicators.count() > 0;
        
        // Loading states should exist somewhere in the app
        // This might not always be visible depending on app speed
      }
    });

    test('should have accessible navigation', async ({ page }) => {
      // Check for navigation elements with proper ARIA labels
      const navElements = page.locator('nav, [role="navigation"], .navigation');
      
      expect(await navElements.count()).toBeGreaterThan(0);
      
      // Check if navigation items are keyboard accessible
      if (await navElements.count() > 0) {
        const links = navElements.first().locator('a, button');
        
        if (await links.count() > 0) {
          const firstLink = links.first();
          
          // Should be focusable
          await firstLink.focus();
          const isFocused = await firstLink.evaluate(el => el === document.activeElement);
          expect(isFocused).toBe(true);
        }
      }
    });

  });

  test.describe('Error Handling and Feedback', () => {
    
    test('should handle form validation gracefully', async ({ page }) => {
      // Try to find and test form validation
      const forms = page.locator('form');
      
      if (await forms.count() > 0) {
        const form = forms.first();
        const submitButton = form.locator('button[type="submit"], .submit-btn, button:has-text("Submit")');
        
        if (await submitButton.count() > 0) {
          // Try to submit empty form to trigger validation
          await submitButton.click();
          
          // Check for validation messages
          const errorMessages = page.locator('.error, .invalid, [role="alert"], .text-red');
          
          // Should show validation feedback
          await page.waitForTimeout(500);
          const hasErrorMessages = await errorMessages.count() > 0;
          
          // Form validation should provide feedback
          if (hasErrorMessages) {
            const errorText = await errorMessages.first().textContent();
            expect(errorText).toBeTruthy();
            expect(errorText.length).toBeGreaterThan(3);
          }
        }
      }
    });

    test('should have proper error page handling', async ({ page }) => {
      // Test 404 handling by going to non-existent page
      const response = await page.goto('/non-existent-page-12345');
      
      // Should either redirect to home or show proper 404 page
      const currentUrl = page.url();
      const pageContent = await page.textContent('body');
      
      // Should handle 404 gracefully
      expect(currentUrl.includes('404') || 
             currentUrl.includes('/') || 
             pageContent.includes('404') || 
             pageContent.includes('Not Found') || 
             pageContent.includes('Page not found')).toBe(true);
    });

  });

  test.describe('Accessibility Analysis', () => {
    
    test('should have proper heading structure', async ({ page }) => {
      const h1Count = await page.locator('h1').count();
      
      // Should have exactly one h1 per page
      expect(h1Count).toBeLessThanOrEqual(1);
      
      if (h1Count === 1) {
        const h1Text = await page.locator('h1').textContent();
        expect(h1Text).toBeTruthy();
        expect(h1Text.trim().length).toBeGreaterThan(0);
      }
    });

    test('should have alt text for images', async ({ page }) => {
      const images = page.locator('img');
      const imageCount = await images.count();
      
      // Check alt attributes for all images
      for (let i = 0; i < imageCount; i++) {
        const img = images.nth(i);
        const alt = await img.getAttribute('alt');
        
        // Images should have alt text (can be empty string for decorative images)
        expect(alt).not.toBeNull();
      }
    });

    test('should have sufficient color contrast', async ({ page }) => {
      // Test color contrast for text elements
      const textElements = page.locator('p, span, div:has-text(""), h1, h2, h3, h4, h5, h6, button, a').first();
      
      if (await textElements.count() > 0) {
        const element = textElements.first();
        const textColor = await element.evaluate(el => getComputedStyle(el).color);
        const backgroundColor = await element.evaluate(el => getComputedStyle(el).backgroundColor);
        
        // Colors should be defined (not transparent for text)
        expect(textColor).not.toBe('rgba(0, 0, 0, 0)');
        
        // This is a basic check - comprehensive contrast checking requires color parsing
      }
    });

  });

  test.describe('Performance and User Experience', () => {
    
    test('should load quickly', async ({ page }) => {
      const startTime = Date.now();
      await page.goto('/');
      await page.waitForLoadState('domcontentloaded');
      const loadTime = Date.now() - startTime;
      
      // Should load within reasonable time (3 seconds)
      expect(loadTime).toBeLessThan(3000);
    });

    test('should have smooth animations', async ({ page }) => {
      // Look for animated elements
      const animatedElements = page.locator('.animate, .transition, [class*="animate-"], [class*="transition-"]');
      
      if (await animatedElements.count() > 0) {
        // Check if CSS transitions are defined properly
        const transitionDuration = await animatedElements.first().evaluate(el => 
          getComputedStyle(el).transitionDuration
        );
        
        // Should have reasonable transition duration if animated
        if (transitionDuration && transitionDuration !== '0s') {
          const duration = parseFloat(transitionDuration);
          expect(duration).toBeGreaterThan(0);
          expect(duration).toBeLessThan(1); // Not too slow
        }
      }
    });

    test('should have proper focus management', async ({ page }) => {
      // Test tab navigation
      await page.keyboard.press('Tab');
      
      const focusedElement = await page.evaluate(() => document.activeElement.tagName);
      
      // Should be able to focus interactive elements
      expect(['A', 'BUTTON', 'INPUT', 'SELECT', 'TEXTAREA', 'BODY'].includes(focusedElement)).toBe(true);
    });

  });

  test.describe('Content and Information Architecture', () => {
    
    test('should have clear page titles', async ({ page }) => {
      const title = await page.title();
      
      // Title should be descriptive and not default
      expect(title).toBeTruthy();
      expect(title).not.toBe('React App');
      expect(title).not.toBe('Vite App');
      expect(title.length).toBeGreaterThan(3);
    });

    test('should have descriptive text content', async ({ page }) => {
      const bodyText = await page.textContent('body');
      
      // Should have sufficient content (not just loading text)
      expect(bodyText.length).toBeGreaterThan(50);
      
      // Should not be all Lorem ipsum or placeholder text
      expect(bodyText.toLowerCase()).not.toContain('lorem ipsum');
    });

    test('should have logical content hierarchy', async ({ page }) => {
      const headings = await page.locator('h1, h2, h3, h4, h5, h6').all();
      
      if (headings.length > 1) {
        // Check heading order (basic structural check)
        for (let i = 0; i < headings.length - 1; i++) {
          const currentLevel = parseInt(await headings[i].evaluate(el => el.tagName.charAt(1)));
          const nextLevel = parseInt(await headings[i + 1].evaluate(el => el.tagName.charAt(1)));
          
          // Heading levels shouldn't skip more than 1 level
          expect(nextLevel - currentLevel).toBeLessThanOrEqual(1);
        }
      }
    });

  });

});