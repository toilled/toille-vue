import { test, expect } from '@playwright/test';

test('take screenshot', async ({ page }) => {
  await page.goto('http://localhost:3000');
  await page.screenshot({ path: 'jules-scratch/verification/verification.png' });
});
