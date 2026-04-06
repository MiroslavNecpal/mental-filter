import { test, expect } from '@playwright/test';
import { waitForPageLoad } from './helpers';

test.describe('Dark Mode Support', () => {
  test('should have theme-color meta tag', async ({ page }) => {
    await page.goto('/');
    await waitForPageLoad(page);

    const themeColor = await page.evaluate(() => {
      const meta = document.querySelector('meta[name="theme-color"]');
      return meta?.getAttribute('content');
    });

    // Should have a theme color set (either light or dark)
    expect(themeColor).toBeTruthy();
    expect(['#fdfcfa', '#1c1c1e']).toContain(themeColor);
  });

  test('should load ThemeManager component', async ({ page }) => {
    await page.goto('/');
    await waitForPageLoad(page);

    // Verify ThemeManager is loaded by checking if it creates necessary meta tags
    const hasAppleStatusBar = await page.evaluate(() => {
      const meta = document.querySelector(
        'meta[name="apple-mobile-web-app-status-bar-style"]'
      );
      return meta !== null;
    });

    expect(hasAppleStatusBar).toBe(true);
  });
});
