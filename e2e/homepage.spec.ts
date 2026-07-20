import { test, expect } from '@playwright/test';

test.describe('Homepage', () => {
  test('loads and displays main content', async ({ page }) => {
    await page.goto('/');
    await expect(page.locator('body')).toBeVisible();
    await expect(page.locator('#content-wrapper')).toBeVisible();
  });

  test('has correct page title', async ({ page }) => {
    await page.goto('/');
    await expect(page).toHaveTitle(/Elliot Dickerson/);
  });

  test('displays header navigation', async ({ page }) => {
    await page.goto('/');
    await expect(page.locator('.app-header')).toBeVisible();
  });
});

test.describe('Routing', () => {
  test('navigates to quiz page', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    const quizLink = page.locator('a[href="/quiz"]');
    if (await quizLink.count() > 0) {
      await quizLink.first().click();
      await expect(page).toHaveURL(/quiz/);
    }
  });

  test('navigates to checker page', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    const checkerLink = page.locator('a[href="/checker"]');
    if (await checkerLink.count() > 0) {
      await checkerLink.first().click();
      await expect(page).toHaveURL(/checker/);
    }
  });

  test('navigates to noughts and crosses page', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    const nocLink = page.locator('a[href="/noughts-and-crosses"]');
    if (await nocLink.count() > 0) {
      await nocLink.first().click();
      await expect(page).toHaveURL(/noughts-and-crosses/);
    }
  });
});

test.describe('Keyboard navigation', () => {
  test('Escape key on game route returns to home', async ({ page }) => {
    await page.goto('/checker');
    await page.waitForLoadState('networkidle');
    await page.keyboard.press('Escape');
    await expect(page).toHaveURL(/\/$/);
  });
});

test.describe('Responsive behavior', () => {
  test('header is visible on mobile viewport', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto('/');
    await expect(page.locator('.app-header')).toBeVisible();
  });

  test('content wrapper is visible on desktop viewport', async ({ page }) => {
    await page.setViewportSize({ width: 1920, height: 1080 });
    await page.goto('/');
    await expect(page.locator('#content-wrapper')).toBeVisible();
  });
});
