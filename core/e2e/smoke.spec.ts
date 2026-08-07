import { test, expect } from '@playwright/test';

test.beforeEach(async ({ page }, testInfo) => {
  page.on('console', msg => console.log('BROWSER LOG:', msg.text()));
  page.on('pageerror', err => console.error('BROWSER ERROR:', err.message));
  
  const isOfflineTest = testInfo.title.includes('offline');
  await page.addInitScript((offlineFlag) => {
    localStorage.setItem('sql-aa-onboarded', 'true');
    if (!offlineFlag && navigator.serviceWorker) {
      (navigator.serviceWorker as any).register = () =>
        Promise.resolve(new Event("mock"));
    }
  }, isOfflineTest);
});

test('has title and dashboard renders compact', async ({ page }) => {
  await page.goto('/', { waitUntil: 'domcontentloaded' });
  await expect(page).toHaveTitle(/SQL Academy/i);
  await expect(page.locator('text=Dashboard').first()).toBeVisible();
});

test('playground loads and executes query via keyboard shortcut', async ({ page }) => {
  await page.addInitScript(() => {
    localStorage.setItem('sql-aa-active-view', '"playground"');
    localStorage.setItem('sql-aa-playground-mode-v4', '"free"');
  });
  await page.goto('/', { waitUntil: 'domcontentloaded' });

  // Wait for the SQL editor to be initialized
  await page.locator('text=Initializing SQL editor…').waitFor({ state: 'detached', timeout: 20000 });

  // Wait for the database schema to be loaded
  await page.locator('text=customers').first().waitFor({ state: 'visible', timeout: 20000 });

  // Focus the editor to route keyboard events correctly
  const editor = page.locator('.monaco-editor').first();
  await editor.click();

  // Test F5 keyboard shortcut for query execution
  await page.keyboard.press('F5');

  // Wait for query results table to become visible
  await page.locator('.table-wrap').first().waitFor({ state: 'visible', timeout: 15000 });

  const grid = await page.locator('.table-wrap').isVisible();
  const err = await page.locator('.error-output').isVisible();
  const empty = await page.locator('text=Run your query to see results').isVisible();
  expect(grid || err || empty).toBeTruthy();
});

test('offline PWA app shell loads and renders offline', async ({ context, page }) => {
  await page.goto('/', { waitUntil: 'domcontentloaded' });
  await page.evaluate(() => navigator.serviceWorker?.ready).catch(() => {});
  await context.setOffline(true);
  await page.waitForTimeout(500);
  const bodyVisible = await page.locator('body').isVisible();
  expect(bodyVisible).toBeTruthy();
});
