import { test, expect } from '@playwright/test';
import {
  clearStorage,
  waitForPageLoad,
  openFabMenu,
  selectSection,
  addEntryText,
  getItemsFromSection,
  deleteItem,
  confirmDelete,
  cancelDelete,
  getSummaryCount,
} from './helpers';

test.describe('Journal - Delete Entries', () => {
  test.beforeEach(async ({ page }) => {
    await clearStorage(page);
    await page.goto('/');
    await waitForPageLoad(page);
  });

  test('should show delete button for entries on current day', async ({
    page,
  }) => {
    // Add an entry
    await openFabMenu(page);
    await selectSection(page, 'good');
    await addEntryText(page, 'Test entry');

    // Check delete button is visible
    const deleteBtn = await page.isVisible('.item-delete-btn');
    expect(deleteBtn).toBe(true);
  });

  test('should open delete drawer when delete button is clicked', async ({
    page,
  }) => {
    // Add an entry
    await openFabMenu(page);
    await selectSection(page, 'good');
    await addEntryText(page, 'Entry to delete');

    // Click delete button
    await deleteItem(page, 'good', 0);

    // Verify delete drawer is open
    const drawerVisible = await page.isVisible('.delete-drawer.open');
    expect(drawerVisible).toBe(true);

    // Verify drawer content
    const label = await page.textContent('.delete-drawer-label');
    expect(label).toContain('Vymazať záznam?');

    const preview = await page.textContent('.delete-drawer-preview');
    expect(preview).toContain('Entry to delete');
  });

  test('should delete entry when confirmed', async ({ page }) => {
    const entryText = 'Entry to be deleted';

    // Add an entry
    await openFabMenu(page);
    await selectSection(page, 'good');
    await addEntryText(page, entryText);

    // Verify entry exists
    let items = await getItemsFromSection(page, 'good');
    expect(items.length).toBe(1);

    // Delete entry
    await deleteItem(page, 'good', 0);
    await confirmDelete(page);

    // Wait for animation
    await page.waitForTimeout(500);

    // Verify entry is deleted
    items = await getItemsFromSection(page, 'good');
    expect(items.length).toBe(0);

    // Verify count is updated
    const count = await getSummaryCount(page, 'good');
    expect(count).toBe(0);

    // Verify empty state is shown
    const emptyVisible = await page.isVisible('.item-empty');
    expect(emptyVisible).toBe(true);
  });

  test('should not delete entry when cancelled', async ({ page }) => {
    const entryText = 'Entry to keep';

    // Add an entry
    await openFabMenu(page);
    await selectSection(page, 'good');
    await addEntryText(page, entryText);

    // Try to delete but cancel
    await deleteItem(page, 'good', 0);
    await cancelDelete(page);

    // Verify entry still exists
    const items = await getItemsFromSection(page, 'good');
    expect(items.length).toBe(1);

    // Verify count is unchanged
    const count = await getSummaryCount(page, 'good');
    expect(count).toBe(1);
  });

  test('should close delete drawer when backdrop is clicked', async ({
    page,
  }) => {
    // Add an entry
    await openFabMenu(page);
    await selectSection(page, 'good');
    await addEntryText(page, 'Test entry');

    // Open delete drawer
    await deleteItem(page, 'good', 0);

    // Click backdrop
    await page.click('.drawer-backdrop');

    // Verify drawer is closed
    await page.waitForSelector('.delete-drawer.open', { state: 'hidden' });
    const drawerVisible = await page.isVisible('.delete-drawer.open');
    expect(drawerVisible).toBe(false);

    // Verify entry still exists
    const items = await getItemsFromSection(page, 'good');
    expect(items.length).toBe(1);
  });

  test('should delete specific entry from multiple entries', async ({
    page,
  }) => {
    const entries = ['First entry', 'Second entry', 'Third entry'];

    // Add multiple entries
    for (const entry of entries) {
      await openFabMenu(page);
      await selectSection(page, 'good');
      await addEntryText(page, entry);
      await page.waitForTimeout(100);
    }

    // Verify all entries exist
    let items = await getItemsFromSection(page, 'good');
    expect(items.length).toBe(3);

    // Delete second entry (index 1)
    await deleteItem(page, 'good', 1);
    await confirmDelete(page);
    await page.waitForTimeout(500);

    // Verify only 2 entries remain
    items = await getItemsFromSection(page, 'good');
    expect(items.length).toBe(2);

    // Verify count is updated
    const count = await getSummaryCount(page, 'good');
    expect(count).toBe(2);
  });

  test('should delete entries from both sections independently', async ({
    page,
  }) => {
    // Add entries to both sections
    await openFabMenu(page);
    await selectSection(page, 'good');
    await addEntryText(page, 'Good entry 1');

    await openFabMenu(page);
    await selectSection(page, 'good');
    await addEntryText(page, 'Good entry 2');

    await openFabMenu(page);
    await selectSection(page, 'bad');
    await addEntryText(page, 'Bad entry 1');

    // Verify counts
    let goodCount = await getSummaryCount(page, 'good');
    let badCount = await getSummaryCount(page, 'bad');
    expect(goodCount).toBe(2);
    expect(badCount).toBe(1);

    // Delete one good entry
    await deleteItem(page, 'good', 0);
    await confirmDelete(page);
    await page.waitForTimeout(500);

    // Verify good count decreased, bad count unchanged
    goodCount = await getSummaryCount(page, 'good');
    badCount = await getSummaryCount(page, 'bad');
    expect(goodCount).toBe(1);
    expect(badCount).toBe(1);

    // Delete bad entry
    await deleteItem(page, 'bad', 0);
    await confirmDelete(page);
    await page.waitForTimeout(500);

    // Verify bad count decreased, good count unchanged
    goodCount = await getSummaryCount(page, 'good');
    badCount = await getSummaryCount(page, 'bad');
    expect(goodCount).toBe(1);
    expect(badCount).toBe(0);
  });

  test('should persist deletion after page reload', async ({ page }) => {
    // Add two entries
    await openFabMenu(page);
    await selectSection(page, 'good');
    await addEntryText(page, 'Entry 1');

    await openFabMenu(page);
    await selectSection(page, 'good');
    await addEntryText(page, 'Entry 2');

    // Delete one entry
    await deleteItem(page, 'good', 0);
    await confirmDelete(page);
    await page.waitForTimeout(500);

    // Reload page
    await page.reload();
    await waitForPageLoad(page);

    // Verify only one entry remains
    const items = await getItemsFromSection(page, 'good');
    expect(items.length).toBe(1);

    const count = await getSummaryCount(page, 'good');
    expect(count).toBe(1);
  });

  test('should show correct preview text in delete drawer', async ({
    page,
  }) => {
    const longText =
      'This is a very long entry text that should be truncated in the preview';

    // Add entry with long text
    await openFabMenu(page);
    await selectSection(page, 'good');
    await addEntryText(page, longText);

    // Open delete drawer
    await deleteItem(page, 'good', 0);

    // Verify preview shows the text
    const preview = await page.textContent('.delete-drawer-preview');
    expect(preview).toContain(longText);
  });

  test('should handle rapid delete operations', async ({ page }) => {
    // Add multiple entries quickly
    const entries = ['Entry 1', 'Entry 2', 'Entry 3', 'Entry 4'];
    for (const entry of entries) {
      await openFabMenu(page);
      await selectSection(page, 'good');
      await addEntryText(page, entry);
    }

    // Delete all entries rapidly
    for (let i = 0; i < entries.length; i++) {
      await deleteItem(page, 'good', 0); // Always delete first item
      await confirmDelete(page);
      await page.waitForTimeout(300);
    }

    // Verify all entries are deleted
    const items = await getItemsFromSection(page, 'good');
    expect(items.length).toBe(0);

    const count = await getSummaryCount(page, 'good');
    expect(count).toBe(0);
  });

  test('should close delete drawer with Escape key', async ({ page }) => {
    // Add entry
    await openFabMenu(page);
    await selectSection(page, 'good');
    await addEntryText(page, 'Test entry');

    // Open delete drawer
    await deleteItem(page, 'good', 0);

    // Press Escape
    await page.keyboard.press('Escape');

    // Verify drawer is closed
    await page.waitForSelector('.delete-drawer.open', { state: 'hidden' });
    const drawerVisible = await page.isVisible('.delete-drawer.open');
    expect(drawerVisible).toBe(false);

    // Verify entry still exists
    const items = await getItemsFromSection(page, 'good');
    expect(items.length).toBe(1);
  });
});
