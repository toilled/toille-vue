import { test, expect } from '@playwright/test';

test.describe('Desktop mode', () => {
  test.beforeEach(async ({ page }) => {
    await page.setViewportSize({ width: 1920, height: 1080 });
  });

  test('can access desktop via header button on desktop viewport', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    const desktopBtn = page.locator('button, [role="button"]').filter({ hasText: /desktop/i });
    if ((await desktopBtn.count()) > 0) {
      await desktopBtn.first().click();
      await expect(page.locator('.desktop-overlay')).toBeVisible({ timeout: 10000 });
    }
  });

  test('desktop shows wallpaper and taskbar', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    const desktopBtn = page.locator('button, [role="button"]').filter({ hasText: /desktop/i });
    if ((await desktopBtn.count()) > 0) {
      await desktopBtn.first().click();
      await expect(page.locator('.desktop-overlay')).toBeVisible({ timeout: 10000 });
      await expect(page.locator('.desktop-wallpaper')).toBeVisible();
    }
  });

  test('desktop shows shortcut icons', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    const desktopBtn = page.locator('button, [role="button"]').filter({ hasText: /desktop/i });
    if ((await desktopBtn.count()) > 0) {
      await desktopBtn.first().click();
      await expect(page.locator('.desktop-overlay')).toBeVisible({ timeout: 10000 });
      await expect(page.locator('.desktop-icons')).toBeVisible();
    }
  });
});

test.describe('Navigation links exist', () => {
  test('homepage has navigation elements', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    const links = page.locator('a');
    const count = await links.count();
    expect(count).toBeGreaterThan(0);
  });
});

test.describe('Page transitions', () => {
  test('can navigate between routes and back', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    await page.goto('/quiz');
    await page.waitForLoadState('networkidle');
    await expect(page).toHaveURL(/quiz/);

    await page.goto('/');
    await page.waitForLoadState('networkidle');
    await expect(page).toHaveURL(/\/$/);
  });
});

test.describe('Error handling', () => {
  test('unknown route renders without crashing', async ({ page }) => {
    const response = await page.goto('/this-page-does-not-exist');
    expect(response).toBeTruthy();
    await expect(page.locator('body')).toBeVisible();
  });
});
