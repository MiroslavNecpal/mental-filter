import { Page, expect } from '@playwright/test';

/**
 * Clear all localStorage data
 */
export async function clearStorage(page: Page) {
  try {
    await page.evaluate(() => {
      localStorage.clear();
    });
  } catch (error) {
    // If the page hasn't been navigated yet, the error is expected
    // and we can safely ignore it
  }
}

/**
 * Get current date in ISO format (YYYY-MM-DD)
 */
export function getTodayKey(): string {
  return new Date().toISOString().split('T')[0];
}

/**
 * Wait for page to be fully loaded
 */
export async function waitForPageLoad(page: Page) {
  await page.waitForLoadState('networkidle');
  await page.waitForSelector('.page-wrap', { state: 'visible' });
}

/**
 * Open FAB menu
 */
export async function openFabMenu(page: Page) {
  await page.click('.fab');
  await page.waitForSelector('.fab-picker.open', { state: 'visible' });
}

/**
 * Select section from FAB picker
 */
export async function selectSection(page: Page, section: 'good' | 'bad') {
  const selector = section === 'good' ? '.fab-pick-good' : '.fab-pick-bad';
  await page.click(selector);
  await page.waitForSelector('.drawer.open', { state: 'visible' });
}

/**
 * Add entry text and submit
 */
export async function addEntryText(page: Page, text: string) {
  await page.fill('.drawer-textarea', text);
  await page.click('.drawer-submit');
  await page.waitForSelector('.drawer.open', { state: 'hidden' });
}

/**
 * Get all items from a section
 */
export async function getItemsFromSection(page: Page, variant: 'good' | 'bad') {
  const items = await page.$$(`.item-row-${variant}`);
  return items;
}

/**
 * Get item text content
 */
export async function getItemText(
  page: Page,
  variant: 'good' | 'bad',
  index: number
) {
  const selector = `.item-row-${variant}:nth-child(${index + 1}) .item-text`;
  return await page.textContent(selector);
}

/**
 * Delete item by clicking delete button
 */
export async function deleteItem(
  page: Page,
  variant: 'good' | 'bad',
  index: number
) {
  const selector = `.item-row-${variant}:nth-child(${index + 1}) .item-delete-btn`;
  await page.click(selector);
  await page.waitForSelector('.delete-drawer.open', { state: 'visible' });
}

/**
 * Confirm delete in drawer
 */
export async function confirmDelete(page: Page) {
  await page.click('.delete-btn-confirm');
  await page.waitForSelector('.delete-drawer.open', { state: 'hidden' });
}

/**
 * Cancel delete in drawer
 */
export async function cancelDelete(page: Page) {
  await page.click('.delete-btn-cancel');
  await page.waitForSelector('.delete-drawer.open', { state: 'hidden' });
}

/**
 * Swipe left (navigate to next day)
 */
export async function swipeLeft(page: Page) {
  const shell = await page.$('.shell');
  if (!shell) throw new Error('Shell element not found');

  const box = await shell.boundingBox();
  if (!box) throw new Error('Shell bounding box not found');

  const startX = box.x + box.width * 0.8;
  const endX = box.x + box.width * 0.2;
  const y = box.y + box.height * 0.5;

  await page.touchscreen.tap(startX, y);
  await page.mouse.move(startX, y);
  await page.mouse.down();
  await page.mouse.move(endX, y, { steps: 10 });
  await page.mouse.up();
}

/**
 * Swipe right (navigate to previous day)
 */
export async function swipeRight(page: Page) {
  const shell = await page.$('.shell');
  if (!shell) throw new Error('Shell element not found');

  const box = await shell.boundingBox();
  if (!box) throw new Error('Shell bounding box not found');

  const startX = box.x + box.width * 0.2;
  const endX = box.x + box.width * 0.8;
  const y = box.y + box.height * 0.5;

  await page.touchscreen.tap(startX, y);
  await page.mouse.move(startX, y);
  await page.mouse.down();
  await page.mouse.move(endX, y, { steps: 10 });
  await page.mouse.up();
}

/**
 * Get displayed day name
 */
export async function getDayName(page: Page): Promise<string | null> {
  return await page.textContent('.day-name');
}

/**
 * Get count from summary card
 */
export async function getSummaryCount(
  page: Page,
  type: 'good' | 'bad'
): Promise<number> {
  const selector = `.summary-card-${type} .summary-count`;
  const text = await page.textContent(selector);
  return parseInt(text || '0', 10);
}

/**
 * Check if FAB button is visible
 */
export async function isFabVisible(page: Page): Promise<boolean> {
  return await page.isVisible('.fab');
}

/**
 * Upload photo to drawer
 */
export async function uploadPhoto(page: Page, filePath: string) {
  const fileInput = await page.$('input[type="file"]');
  if (!fileInput) throw new Error('File input not found');
  await fileInput.setInputFiles(filePath);
  await page.waitForSelector('.drawer-photo-preview', { state: 'visible' });
}

/**
 * Check if photo preview is visible in drawer
 */
export async function isPhotoPreviewVisible(page: Page): Promise<boolean> {
  return await page.isVisible('.drawer-photo-preview');
}

/**
 * Remove photo from drawer
 */
export async function removePhoto(page: Page) {
  await page.click('.drawer-photo-remove');
  await page.waitForSelector('.drawer-photo-preview', { state: 'hidden' });
}
