
import { test, expect } from '@playwright/test';

test('Starfield background verification', async ({ page }) => {
  await page.goto('http://localhost:3000/');
  await page.screenshot({ path: 'jules-scratch/screenshot.png', fullPage: true });
});
