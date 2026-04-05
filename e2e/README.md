# E2E Tests

Komplexné Playwright E2E testy pre Mental Filter PWA aplikáciu.

## 🎯 Test Coverage

### 📝 Journal Add Tests (`journal-add.spec.ts`)

- ✅ FAB button display and functionality
- ✅ Opening and closing FAB menu
- ✅ Adding entries to "Zvládol som" section
- ✅ Adding entries to "Na budúce" section
- ✅ Multiple entries in both sections
- ✅ Empty state validation
- ✅ Submit button enable/disable logic
- ✅ 300 character limit enforcement
- ✅ Persistence after page reload
- ✅ Drawer backdrop click handling
- ✅ Correct drawer titles
- ✅ Empty entry prevention

### 🗑️ Journal Delete Tests (`journal-delete.spec.ts`)

- ✅ Delete button visibility on current day
- ✅ Delete drawer opening and closing
- ✅ Confirming deletion
- ✅ Canceling deletion
- ✅ Backdrop click to close
- ✅ Deleting specific entry from multiple
- ✅ Independent deletion in both sections
- ✅ Persistence after reload
- ✅ Preview text display
- ✅ Rapid delete operations
- ✅ Escape key to close drawer

### 🔄 Navigation Tests (`journal-navigation.spec.ts`)

- ✅ Current day display
- ✅ Swipe left navigation (next day)
- ✅ Swipe right navigation (previous day)
- ✅ Arrow key navigation
- ✅ FAB hidden on future dates
- ✅ Delete buttons on editable days only
- ✅ Entry persistence between days
- ✅ Correct counts per day
- ✅ Slide animations
- ✅ Navigation prevention when drawer open
- ✅ Slovak date format display
- ✅ Navigation throttling
- ✅ Scroll position handling
- ✅ Continuous navigation

### 📱 PWA Manifest Tests (`pwa-manifest.spec.ts`)

- ✅ Valid manifest.json serving
- ✅ Correct manifest structure
- ✅ Icon configuration (192x192, 512x512)
- ✅ Manifest link in HTML
- ✅ Theme color meta tag (#FDFCFA)
- ✅ Viewport configuration
- ✅ Apple touch icon
- ✅ Apple mobile web app capability
- ✅ Service worker in production
- ✅ iPhone 14 Pro viewport (393x852)
- ✅ Portrait orientation
- ✅ Safe area insets for notch
- ✅ Installability as PWA
- ✅ Icon loading
- ✅ iOS home screen meta tags
- ✅ Offline functionality
- ✅ Slovak language setting
- ✅ Document title

## 🚀 Running Tests

### Run all tests

```bash
npm run test:e2e
```

### Run tests in UI mode

```bash
npm run test:e2e:ui
```

### Run specific test file

```bash
npx playwright test e2e/journal-add.spec.ts
```

### Run tests for specific browser

```bash
npx playwright test --project="iPhone 14 Pro"
```

### Show test report

```bash
npm run test:e2e:report
```

## 📱 Test Configuration

### iPhone 14 Pro Viewport

- Width: 393px
- Height: 852px
- Device scale factor: 3
- Touch enabled
- Mobile mode
- WebKit browser

### Other Browsers

- Chromium (Desktop)
- Firefox (Desktop)
- WebKit/Safari (Desktop)

## 🔧 Helper Functions (`helpers.ts`)

### Storage

- `clearStorage(page)` - Clear localStorage
- `getTodayKey()` - Get current date key

### Page Actions

- `waitForPageLoad(page)` - Wait for page to load
- `openFabMenu(page)` - Open FAB menu
- `selectSection(page, section)` - Select good/bad section
- `addEntryText(page, text)` - Add and submit entry

### Item Operations

- `getItemsFromSection(page, variant)` - Get all items
- `getItemText(page, variant, index)` - Get item text
- `deleteItem(page, variant, index)` - Delete item
- `confirmDelete(page)` - Confirm deletion
- `cancelDelete(page)` - Cancel deletion

### Navigation

- `swipeLeft(page)` - Navigate to next day
- `swipeRight(page)` - Navigate to previous day
- `getDayName(page)` - Get displayed day name

### Utilities

- `getSummaryCount(page, type)` - Get summary count
- `isFabVisible(page)` - Check FAB visibility
- `uploadPhoto(page, filePath)` - Upload photo
- `isPhotoPreviewVisible(page)` - Check photo preview
- `removePhoto(page)` - Remove photo from drawer

## 📊 Test Statistics

- **Total test files:** 4
- **Total tests:** ~80+
- **Coverage areas:**
  - Journal functionality
  - Navigation & gestures
  - PWA features
  - Mobile optimization

## 🐛 Debugging Tests

### Run tests in headed mode

```bash
npx playwright test --headed
```

### Run with debug mode

```bash
npx playwright test --debug
```

### Generate trace

```bash
npx playwright test --trace on
```

### View trace

```bash
npx playwright show-trace trace.zip
```

## 📝 Writing New Tests

1. Create test file in `e2e/` directory
2. Import helpers from `./helpers`
3. Use `test.describe()` for test suites
4. Use `test.beforeEach()` for setup
5. Clear storage before each test
6. Use descriptive test names
7. Add comments for complex assertions

Example:

```typescript
import { test, expect } from '@playwright/test';
import { clearStorage, waitForPageLoad } from './helpers';

test.describe('My Feature', () => {
  test.beforeEach(async ({ page }) => {
    await clearStorage(page);
    await page.goto('/');
    await waitForPageLoad(page);
  });

  test('should do something', async ({ page }) => {
    // Your test code
    expect(true).toBe(true);
  });
});
```

## 🔍 Best Practices

1. **Always clear storage** before tests
2. **Wait for animations** with `page.waitForTimeout()`
3. **Use semantic selectors** (.fab, .drawer, etc.)
4. **Test user flows**, not implementation details
5. **Verify visual feedback** (visibility, counts)
6. **Test edge cases** (empty states, limits)
7. **Check persistence** (reload, navigation)
8. **Mobile-first** testing approach

## 📱 Mobile Testing Notes

- Tests run on iPhone 14 Pro viewport by default
- Touch events are enabled
- Swipe gestures are simulated
- Safe area insets are tested
- PWA installability is verified
- Offline mode is tested

## 🎯 Future Test Ideas

- [ ] Photo upload and lightbox
- [ ] Keyboard shortcuts
- [ ] Performance metrics
- [ ] Accessibility tests
- [ ] Cross-browser compatibility
- [ ] Network conditions
- [ ] Data migration tests
- [ ] Error boundary tests
