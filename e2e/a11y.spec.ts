import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

test.describe('Accessibility', () => {
  test('homepage has no a11y violations', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('domcontentloaded');
    await page.waitForTimeout(1000);
    const results = await new AxeBuilder({ page })
      .disableRules(['nested-interactive', 'region'])
      .analyze();
    expect(results.violations).toEqual([]);
  });

  test('checker page has no a11y violations', async ({ page }) => {
    await page.goto('/checker');
    await page.waitForLoadState('domcontentloaded');
    await page.waitForTimeout(1000);
    const results = await new AxeBuilder({ page })
      .disableRules(['nested-interactive', 'region'])
      .analyze();
    expect(results.violations).toEqual([]);
  });

  test('quiz page has no a11y violations', async ({ page }) => {
    await page.goto('/quiz');
    await page.waitForLoadState('domcontentloaded');
    await page.waitForTimeout(1000);
    const results = await new AxeBuilder({ page })
      .disableRules(['nested-interactive', 'region'])
      .analyze();
    expect(results.violations).toEqual([]);
  });

  test('noughts and crosses page has no a11y violations', async ({ page }) => {
    await page.goto('/noughts-and-crosses');
    await page.waitForLoadState('domcontentloaded');
    await page.waitForTimeout(1000);
    const results = await new AxeBuilder({ page })
      .disableRules([
        'aria-required-children',
        'aria-required-parent',
        'landmark-main-is-top-level',
        'landmark-no-duplicate-main',
        'nested-interactive',
        'region',
      ])
      .analyze();
    expect(results.violations).toEqual([]);
  });

  test('playground page has no a11y violations', async ({ page }) => {
    await page.goto('/playground');
    await page.waitForLoadState('domcontentloaded');
    await page.waitForTimeout(1000);
    const results = await new AxeBuilder({ page })
      .disableRules(['aria-input-field-name', 'nested-interactive', 'region'])
      .analyze();
    expect(results.violations).toEqual([]);
  });
});
