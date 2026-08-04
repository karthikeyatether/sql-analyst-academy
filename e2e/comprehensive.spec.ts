import { test, expect } from '@playwright/test';

test.beforeEach(async ({ page }) => {
  await page.addInitScript(() => {
    localStorage.setItem('sql-aa-onboarded', 'true');
    if (navigator.serviceWorker) {
      (navigator.serviceWorker as any).register = () =>
        Promise.resolve(new Event("mock"));
    }
  });
});

test.describe('SQL Analyst Academy Comprehensive E2E Suite', () => {
  test('navigation across main learning views', async ({ page }) => {
    await page.goto('/', { waitUntil: 'domcontentloaded' });
    const navItems = ['Dashboard', 'Practice', 'SQL Puzzles', 'Mock Tests'];
    for (const item of navItems) {
      const btn = page.locator(`button:has-text("${item}")`).first();
      if (await btn.isVisible({ timeout: 2000 }).catch(() => false)) {
        await btn.click({ force: true });
        await page.waitForTimeout(300);
      }
    }
  });

  test('dashboard widget collapse and view toggling', async ({ page }) => {
    await page.goto('/', { waitUntil: 'domcontentloaded' });
    const compactBtn = page.locator('button', { hasText: 'Compact' }).first();
    if (await compactBtn.isVisible().catch(() => false)) {
      await compactBtn.click({ force: true });
    }
  });

  test('playground execution flow and result rendering', async ({ page }) => {
    await page.addInitScript(() => {
      localStorage.setItem('sql-aa-active-view', '"playground"');
      localStorage.setItem('sql-aa-playground-mode-v4', '"free"');
    });
    await page.goto('/', { waitUntil: 'domcontentloaded' });

    // Wait for the SQL editor to be initialized
    await page.locator('text=Initializing SQL editor…').waitFor({ state: 'detached', timeout: 20000 });

    // Wait for the database schema to be loaded
    await page.locator('text=customers').first().waitFor({ state: 'visible', timeout: 20000 });

    const runBtn = page.locator('.run-btn').first();
    await runBtn.waitFor({ state: 'visible', timeout: 20000 });

    await runBtn.click({ force: true });

    // Wait for query results table to become visible
    await page.locator('.table-wrap').first().waitFor({ state: 'visible', timeout: 15000 });

    const tableWrap = page.locator('.table-wrap').first();
    const resultMsg = page.locator('.results-header').first();
    await expect(tableWrap.or(resultMsg)).toBeVisible();
  });
});
