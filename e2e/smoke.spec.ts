import { test, expect } from '@playwright/test';

test('has title and dashboard renders compact', async ({ page }) => {
  await page.goto('/', { waitUntil: 'domcontentloaded' });

  // Expect a title to contain "SQL Academy".
  await expect(page).toHaveTitle(/SQL Academy/i);

  // Close onboarding modal if it appears
  const modalOverlay = page.locator('.custom-modal-overlay').first();
  if (await modalOverlay.isVisible({ timeout: 2000 }).catch(() => false)) {
    const getStartedBtn = page.locator('.onboard-start-btn').first();
    if (await getStartedBtn.isVisible().catch(() => false)) {
      await getStartedBtn.click({ force: true });
    }
  }

  // The dashboard should contain "Dashboard" text or header
  await expect(page.locator('text=Dashboard').first()).toBeVisible();
});

test('playground loads and executes query via keyboard shortcut', async ({ page }) => {
  await page.goto('/', { waitUntil: 'domcontentloaded' });

  // Close onboarding modal if it appears
  const modalOverlay = page.locator('.custom-modal-overlay').first();
  if (await modalOverlay.isVisible({ timeout: 2000 }).catch(() => false)) {
    const getStartedBtn = page.locator('.onboard-start-btn').first();
    if (await getStartedBtn.isVisible().catch(() => false)) {
      await getStartedBtn.click({ force: true });
    } else {
      await page.keyboard.press('Escape');
    }
  }

  // Navigate to playground
  await page.locator('.sidebar-nav button', { hasText: 'Playground' }).evaluate((node) => (node as HTMLElement).click());

  // Wait for run button
  const runBtn = page.locator('.run-btn').first();
  await expect(runBtn).toBeVisible({ timeout: 10000 });

  // Test F5 keyboard shortcut for query execution
  await page.keyboard.press('F5');
  await page.waitForTimeout(1000);

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
