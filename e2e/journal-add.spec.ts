import { test, expect } from '@playwright/test';
import {
  clearStorage,
  waitForPageLoad,
  openFabMenu,
  selectSection,
  addEntryText,
  getItemsFromSection,
  getItemText,
  getSummaryCount,
  isFabVisible,
} from './helpers';

test.describe('Journal - Add Entries', () => {
  test.beforeEach(async ({ page }) => {
    await clearStorage(page);
    await page.goto('/');
    await waitForPageLoad(page);
  });

  test('should display FAB button on current day', async ({ page }) => {
    const fabVisible = await isFabVisible(page);
    expect(fabVisible).toBe(true);
  });

  test('should open FAB menu when clicked', async ({ page }) => {
    await openFabMenu(page);

    // Check if picker is visible
    const pickerVisible = await page.isVisible('.fab-picker.open');
    expect(pickerVisible).toBe(true);

    // Check if both options are visible
    const goodBtnVisible = await page.isVisible('.fab-pick-good');
    const badBtnVisible = await page.isVisible('.fab-pick-bad');
    expect(goodBtnVisible).toBe(true);
    expect(badBtnVisible).toBe(true);
  });

  test('should close FAB menu when cancel is clicked', async ({ page }) => {
    await openFabMenu(page);
    await page.click('.fab-pick-cancel');

    await page.waitForSelector('.fab-picker.open', { state: 'hidden' });
    const pickerVisible = await page.isVisible('.fab-picker.open');
    expect(pickerVisible).toBe(false);
  });

  test('should add entry to "Zvládol som" section', async ({ page }) => {
    const entryText = 'Dokončil som prácu načas';

    await openFabMenu(page);
    await selectSection(page, 'good');
    await addEntryText(page, entryText);

    // Wait for entry to appear
    await page.waitForSelector('.item-row-good');

    // Verify entry exists
    const items = await getItemsFromSection(page, 'good');
    expect(items.length).toBe(1);

    // Verify entry text
    const text = await getItemText(page, 'good', 0);
    expect(text).toBe(entryText);

    // Verify summary count
    const count = await getSummaryCount(page, 'good');
    expect(count).toBe(1);
  });

  test('should add entry to "Na budúce" section', async ({ page }) => {
    const entryText = 'Nestihnúť deadline';

    await openFabMenu(page);
    await selectSection(page, 'bad');
    await addEntryText(page, entryText);

    // Wait for entry to appear
    await page.waitForSelector('.item-row-bad');

    // Verify entry exists
    const items = await getItemsFromSection(page, 'bad');
    expect(items.length).toBe(1);

    // Verify entry text
    const text = await getItemText(page, 'bad', 0);
    expect(text).toBe(entryText);

    // Verify summary count
    const count = await getSummaryCount(page, 'bad');
    expect(count).toBe(1);
  });

  test('should add multiple entries to both sections', async ({ page }) => {
    const goodEntries = [
      'Dokončil som projekt',
      'Zacvičil som ráno',
      'Prečítal som knihu',
    ];
    const badEntries = ['Zabudol som na meeting', 'Nejedol som zdravo'];

    // Add good entries
    for (const entry of goodEntries) {
      await openFabMenu(page);
      await selectSection(page, 'good');
      await addEntryText(page, entry);
      await page.waitForTimeout(100); // Small delay between adds
    }

    // Add bad entries
    for (const entry of badEntries) {
      await openFabMenu(page);
      await selectSection(page, 'bad');
      await addEntryText(page, entry);
      await page.waitForTimeout(100);
    }

    // Verify counts
    const goodCount = await getSummaryCount(page, 'good');
    const badCount = await getSummaryCount(page, 'bad');
    expect(goodCount).toBe(goodEntries.length);
    expect(badCount).toBe(badEntries.length);

    // Verify all entries exist
    const goodItems = await getItemsFromSection(page, 'good');
    const badItems = await getItemsFromSection(page, 'bad');
    expect(goodItems.length).toBe(goodEntries.length);
    expect(badItems.length).toBe(badEntries.length);
  });

  test('should not submit empty entry', async ({ page }) => {
    await openFabMenu(page);
    await selectSection(page, 'good');

    // Try to submit without text
    const submitBtn = await page.$('.drawer-submit');
    const isDisabled = await submitBtn?.isDisabled();
    expect(isDisabled).toBe(true);

    // Type and then clear
    await page.fill('.drawer-textarea', 'Some text');
    await page.fill('.drawer-textarea', '');

    const isStillDisabled = await submitBtn?.isDisabled();
    expect(isStillDisabled).toBe(true);
  });

  test('should enable submit button when text is entered', async ({ page }) => {
    await openFabMenu(page);
    await selectSection(page, 'good');

    // Initially disabled
    const submitBtn = await page.$('.drawer-submit');
    let isDisabled = await submitBtn?.isDisabled();
    expect(isDisabled).toBe(true);

    // Enter text
    await page.fill('.drawer-textarea', 'Test entry');

    // Should be enabled
    isDisabled = await submitBtn?.isDisabled();
    expect(isDisabled).toBe(false);
  });

  test('should persist entries after page reload', async ({ page }) => {
    const entryText = 'Persisted entry';

    await openFabMenu(page);
    await selectSection(page, 'good');
    await addEntryText(page, entryText);

    // Reload page
    await page.reload();
    await waitForPageLoad(page);

    // Verify entry still exists
    const items = await getItemsFromSection(page, 'good');
    expect(items.length).toBe(1);

    const text = await getItemText(page, 'good', 0);
    expect(text).toBe(entryText);
  });

  test('should close drawer when clicking backdrop', async ({ page }) => {
    await openFabMenu(page);
    await selectSection(page, 'good');

    // Click backdrop
    await page.click('.drawer-backdrop');

    // Drawer should be closed
    await page.waitForSelector('.drawer.open', { state: 'hidden' });
    const drawerVisible = await page.isVisible('.drawer.open');
    expect(drawerVisible).toBe(false);
  });

  test('should display correct drawer title for each section', async ({
    page,
  }) => {
    // Test "Zvládol som" section
    await openFabMenu(page);
    await selectSection(page, 'good');

    let title = await page.textContent('.drawer-title');
    expect(title).toContain('Zvládol som');

    await page.click('.drawer-close');
    await page.waitForTimeout(500);

    // Test "Na budúce" section
    await openFabMenu(page);
    await selectSection(page, 'bad');

    title = await page.textContent('.drawer-title');
    expect(title).toContain('Na budúce');
  });

  test('should respect 300 character limit', async ({ page }) => {
    await openFabMenu(page);
    await selectSection(page, 'good');

    const longText = 'a'.repeat(350); // More than 300
    await page.fill('.drawer-textarea', longText);

    const value = await page.inputValue('.drawer-textarea');
    expect(value.length).toBeLessThanOrEqual(300);
  });

  test('should show empty state when no entries exist', async ({ page }) => {
    // Check if empty state is shown
    const goodEmptyVisible = await page.isVisible(
      '.section:has(.dot-good-solid) .item-empty'
    );
    const badEmptyVisible = await page.isVisible(
      '.section:has(.dot-bad-solid) .item-empty'
    );

    expect(goodEmptyVisible).toBe(true);
    expect(badEmptyVisible).toBe(true);

    // Verify counts are 0
    const goodCount = await getSummaryCount(page, 'good');
    const badCount = await getSummaryCount(page, 'bad');
    expect(goodCount).toBe(0);
    expect(badCount).toBe(0);
  });
});
