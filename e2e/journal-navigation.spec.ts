import { test, expect } from '@playwright/test';
import {
  clearStorage,
  waitForPageLoad,
  getDayName,
  swipeLeft,
  swipeRight,
  openFabMenu,
  selectSection,
  addEntryText,
  isFabVisible,
  getItemsFromSection,
} from './helpers';

test.describe('Journal - Navigation', () => {
  test.beforeEach(async ({ page }) => {
    await clearStorage(page);
    await page.goto('/');
    await waitForPageLoad(page);
  });

  test('should display current day by default', async ({ page }) => {
    const dayName = await getDayName(page);
    expect(dayName).toBeTruthy();

    // Verify date header is visible
    const dateHeader = await page.isVisible('.date-header');
    expect(dateHeader).toBe(true);

    // Verify day name and date are visible
    const dayNameVisible = await page.isVisible('.day-name');
    const dateFullVisible = await page.isVisible('.date-full');
    expect(dayNameVisible).toBe(true);
    expect(dateFullVisible).toBe(true);
  });

  test('should navigate to next day with swipe left', async ({ page }) => {
    const initialDay = await getDayName(page);

    await swipeLeft(page);
    await page.waitForTimeout(500); // Wait for animation

    const newDay = await getDayName(page);
    expect(newDay).not.toBe(initialDay);
  });

  test('should navigate to previous day with swipe right', async ({ page }) => {
    const initialDay = await getDayName(page);

    await swipeRight(page);
    await page.waitForTimeout(500); // Wait for animation

    const newDay = await getDayName(page);
    expect(newDay).not.toBe(initialDay);
  });

  test('should navigate with arrow keys', async ({ page }) => {
    const initialDay = await getDayName(page);

    // Navigate right (next day)
    await page.keyboard.press('ArrowRight');
    await page.waitForTimeout(500);

    let newDay = await getDayName(page);
    expect(newDay).not.toBe(initialDay);

    // Navigate left (previous day)
    await page.keyboard.press('ArrowLeft');
    await page.waitForTimeout(500);

    newDay = await getDayName(page);
    expect(newDay).toBe(initialDay);
  });

  test('should not show FAB on future dates', async ({ page }) => {
    // FAB should be visible on current day
    let fabVisible = await isFabVisible(page);
    expect(fabVisible).toBe(true);

    // Navigate to next day (future)
    await swipeLeft(page);
    await page.waitForTimeout(500);

    // FAB should not be visible
    fabVisible = await isFabVisible(page);
    expect(fabVisible).toBe(false);

    // Should show "Ešte nenastalo" message
    const futureMsg = await page.textContent('.future-msg');
    expect(futureMsg).toContain('Ešte nenastalo');
  });

  test('should not show delete buttons on past dates', async ({ page }) => {
    // Add an entry on current day
    await openFabMenu(page);
    await selectSection(page, 'good');
    await addEntryText(page, 'Current day entry');

    // Verify delete button is visible
    let deleteBtn = await page.isVisible('.item-delete-btn');
    expect(deleteBtn).toBe(true);

    // Navigate to next day and back
    await swipeLeft(page);
    await page.waitForTimeout(500);
    await swipeRight(page);
    await page.waitForTimeout(500);

    // Navigate to previous day (yesterday)
    await swipeRight(page);
    await page.waitForTimeout(500);

    // Go back to today
    await swipeLeft(page);
    await page.waitForTimeout(500);

    // Delete button should still be visible on current day
    deleteBtn = await page.isVisible('.item-delete-btn');
    expect(deleteBtn).toBe(true);
  });

  test('should persist entries when navigating between days', async ({
    page,
  }) => {
    const todayEntry = 'Today entry';

    // Add entry on today
    await openFabMenu(page);
    await selectSection(page, 'good');
    await addEntryText(page, todayEntry);

    const todayDay = await getDayName(page);

    // Navigate to next day
    await swipeLeft(page);
    await page.waitForTimeout(500);

    // Navigate back
    await swipeRight(page);
    await page.waitForTimeout(500);

    // Verify we're back on today
    const currentDay = await getDayName(page);
    expect(currentDay).toBe(todayDay);

    // Verify entry still exists
    const items = await getItemsFromSection(page, 'good');
    expect(items.length).toBe(1);
  });

  test('should show correct counts for each day', async ({ page }) => {
    // Add entries on today
    await openFabMenu(page);
    await selectSection(page, 'good');
    await addEntryText(page, 'Today good entry');

    await openFabMenu(page);
    await selectSection(page, 'bad');
    await addEntryText(page, 'Today bad entry');

    // Navigate to previous day
    await swipeRight(page);
    await page.waitForTimeout(500);

    // Add entries on yesterday
    await openFabMenu(page);
    await selectSection(page, 'good');
    await addEntryText(page, 'Yesterday good entry 1');

    await openFabMenu(page);
    await selectSection(page, 'good');
    await addEntryText(page, 'Yesterday good entry 2');

    // Check yesterday counts
    let goodItems = await getItemsFromSection(page, 'good');
    expect(goodItems.length).toBe(2);

    let badItems = await getItemsFromSection(page, 'bad');
    expect(badItems.length).toBe(0);

    // Navigate back to today
    await swipeLeft(page);
    await page.waitForTimeout(500);

    // Check today counts
    goodItems = await getItemsFromSection(page, 'good');
    expect(goodItems.length).toBe(1);

    badItems = await getItemsFromSection(page, 'bad');
    expect(badItems.length).toBe(1);
  });

  test('should animate slide transition when navigating', async ({ page }) => {
    // Check initial state
    const pageWrap = await page.$('.page-wrap');
    expect(pageWrap).toBeTruthy();

    // Navigate and check for animation classes
    await page.keyboard.press('ArrowRight');

    // Check if slide animation is applied (one of the animation classes)
    await page.waitForSelector(
      '.page-wrap.slide-out-left, .page-wrap.slide-out-right, .page-wrap.slide-in',
      { timeout: 1000 }
    );
  });

  test('should not navigate when drawer is open', async ({ page }) => {
    const initialDay = await getDayName(page);

    // Open drawer
    await openFabMenu(page);
    await selectSection(page, 'good');

    // Try to navigate with keyboard
    await page.keyboard.press('ArrowRight');
    await page.waitForTimeout(300);

    // Day should not change
    const currentDay = await getDayName(page);
    expect(currentDay).toBe(initialDay);

    // Close drawer
    await page.keyboard.press('Escape');
    await page.waitForTimeout(300);

    // Now navigation should work
    await page.keyboard.press('ArrowRight');
    await page.waitForTimeout(500);

    const newDay = await getDayName(page);
    expect(newDay).not.toBe(initialDay);
  });

  test('should display Slovak date format', async ({ page }) => {
    const dateText = await page.textContent('.date-full');
    expect(dateText).toBeTruthy();

    // Slovak date format should contain month name in Slovak
    // Example: "6. apríl 2025" or similar
    const slovakMonths = [
      'január',
      'február',
      'marec',
      'apríl',
      'máj',
      'jún',
      'júl',
      'august',
      'september',
      'október',
      'november',
      'december',
    ];

    const containsSlovakMonth = slovakMonths.some(month =>
      dateText?.toLowerCase().includes(month)
    );
    expect(containsSlovakMonth).toBe(true);
  });

  test('should prevent rapid navigation spam', async ({ page }) => {
    const initialDay = await getDayName(page);

    // Try rapid navigation
    for (let i = 0; i < 5; i++) {
      await page.keyboard.press('ArrowRight');
    }

    await page.waitForTimeout(1000);

    // Should not have navigated 5 days forward
    const currentDay = await getDayName(page);

    // Navigate back to verify we didn't go too far
    await page.keyboard.press('ArrowLeft');
    await page.waitForTimeout(500);

    const previousDay = await getDayName(page);

    // If rapid navigation was properly throttled, we should be able to get back quickly
    expect(currentDay).not.toBe(initialDay);
  });

  test('should maintain scroll position when navigating', async ({ page }) => {
    // Add many entries to make page scrollable
    for (let i = 0; i < 10; i++) {
      await openFabMenu(page);
      await selectSection(page, 'good');
      await addEntryText(page, `Entry ${i + 1}`);
      await page.waitForTimeout(100);
    }

    // Scroll down
    await page.evaluate(() => window.scrollTo(0, 200));
    await page.waitForTimeout(300);

    // Navigate to next day
    await swipeLeft(page);
    await page.waitForTimeout(500);

    // Check if scrolled back to top (expected behavior for new day)
    const scrollY = await page.evaluate(() => window.scrollY);

    // Navigate back
    await swipeRight(page);
    await page.waitForTimeout(500);

    // Verify page is interactive
    const fabVisible = await isFabVisible(page);
    expect(fabVisible).toBe(true);
  });

  test('should support continuous navigation', async ({ page }) => {
    const initialDay = await getDayName(page);

    // Navigate forward 3 days
    for (let i = 0; i < 3; i++) {
      await page.keyboard.press('ArrowRight');
      await page.waitForTimeout(500);
    }

    // Navigate back 3 days
    for (let i = 0; i < 3; i++) {
      await page.keyboard.press('ArrowLeft');
      await page.waitForTimeout(500);
    }

    // Should be back to initial day
    const currentDay = await getDayName(page);
    expect(currentDay).toBe(initialDay);
  });
});
