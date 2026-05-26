import { test, expect } from '@playwright/test';

async function hideCityBackground(page: import('@playwright/test').Page) {
  await page.evaluate(() => {
    const el = document.querySelector('#cyberpunk-city-wrapper');
    if (el) (el as HTMLElement).style.display = 'none';
  });
}

async function freezePage(page: import('@playwright/test').Page) {
  await page.evaluate(() => {
    const raf = window.requestAnimationFrame;
    let id = raf(() => {});
    window.requestAnimationFrame = () => id;
    while (id > 0) {
      window.cancelAnimationFrame(id);
      id--;
    }
    const maxId = window.setTimeout(() => {}, 0);
    for (let i = 1; i <= maxId; i++) {
      window.clearTimeout(i);
      window.clearInterval(i);
    }
  });
}

async function waitForSplashDone(page: import('@playwright/test').Page) {
  await page.waitForFunction(() => !document.querySelector('.splash-screen'), { timeout: 5000 }).catch(() => {});
}

test.describe('App shell', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/', { waitUntil: 'domcontentloaded' });
  });

  test('page loads with title and subtitle', async ({ page }) => {
    await expect(page.locator('.site-title h1')).toHaveText('Elliot Dickerson');
    await expect(page.locator('.site-title h2')).toHaveText('Software Engineer');
  });

  test('header nav links are present', async ({ page }) => {
    const labels = page.locator('.nav-label');
    await expect(labels).toHaveText(['Home', 'About', 'Interests']);
  });

  test('Home section renders on load', async ({ page }) => {
    await expect(page.locator('#home')).toBeVisible();
    await expect(page.locator('#home')).toHaveAttribute('data-section', 'home');
  });

  test('toolbar has action buttons', async ({ page }) => {
    await expect(page.locator('[title="Explore City"]')).toBeVisible();
    await expect(page.locator('[title="64k Demo"]')).toBeVisible();
    await expect(page.locator('[title="Toggle Sound"]')).toBeVisible();
    await expect(page.locator('[title="Toggle Visibility"]')).toBeVisible();
    await expect(page.locator('[title="Toggle City Background"]')).toBeVisible();
  });

  test('canvas container renders', async ({ page }) => {
    await expect(page.locator('#cyberpunk-city-wrapper')).toBeVisible({ timeout: 10000 });
  });
});

test.describe('Home section content', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/', { waitUntil: 'domcontentloaded' });
  });

  test('section title and sub-heading are present', async ({ page }) => {
    await expect(page.locator('#home h2.title')).toContainText('Home');
    await expect(page.locator('#home h3.sub-heading')).toHaveText('What I Do');
  });

  test('What I Do cards render with correct content', async ({ page }) => {
    const cards = page.locator('#home .do-card');
    await expect(cards).toHaveCount(3);
    await expect(cards.nth(0)).toContainText('Full-Stack Development');
    await expect(cards.nth(1)).toContainText('Creative UI/UX');
    await expect(cards.nth(2)).toContainText('Interactive 3D');
  });

  test('section divider is present', async ({ page }) => {
    await expect(page.locator('#home .section-divider')).toBeVisible();
  });
});

test.describe('About section content', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/', { waitUntil: 'domcontentloaded' });
    await page.getByText('About').first().click({ force: true });
  });

  test('section title and sub-heading are present', async ({ page }) => {
    await expect(page.locator('#about h2.title')).toContainText('About Me');
    await expect(page.locator('#about h3.sub-heading')).toHaveText('Technical Skills');
  });

  test('skill cards render for each category', async ({ page }) => {
    const categories = page.locator('#about .skill-category');
    await expect(categories).toHaveText(['Backend Development', 'Frontend Development', 'Tools & Platforms']);
  });

  test('skill tags are present in each category', async ({ page }) => {
    const backendTags = page.locator('#about .skill-card').first().locator('.skill-tag');
    await expect(backendTags.first()).toBeVisible();
  });
});

test.describe('Interests section content', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/', { waitUntil: 'domcontentloaded' });
    await page.getByText('Interests').first().click({ force: true });
  });

  test('section title and sub-heading are present', async ({ page }) => {
    await expect(page.locator('#interests h2.title')).toContainText('My Interests');
    await expect(page.locator('#interests h3.sub-heading').first()).toHaveText('Featured Projects');
  });

  test('project gallery renders', async ({ page }) => {
    const projects = page.locator('#interests .project-card');
    await expect(projects).toHaveCount(4);
  });

  test('interest grid renders', async ({ page }) => {
    const items = page.locator('#interests .interest-item');
    await expect(items).toHaveCount(4);
    await expect(items.nth(0)).toContainText('3D Graphics');
    await expect(items.nth(1)).toContainText('Experimentation');
    await expect(items.nth(2)).toContainText('Multi-Instrumentalist');
    await expect(items.nth(3)).toContainText('Tech Discovery');
  });

  test('music section renders with YouTube link', async ({ page }) => {
    await expect(page.locator('#interests .music-card')).toBeVisible();
    await expect(page.locator('#interests .music-card a')).toHaveAttribute('href', 'https://www.youtube.com/@toilled');
  });
});

test.describe('Title interactions', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/', { waitUntil: 'domcontentloaded' });
  });

  test('clicking main title shows Activity component', async ({ page }) => {
    await page.locator('.site-title h1').click();
    await expect(page.getByText('activity', { exact: false })).toBeVisible({ timeout: 7000 });
  });

  test('clicking subtitle shows Suggestion component', async ({ page }) => {
    await page.locator('.site-title h2').click();
    await expect(page.getByText('Have a laugh!')).toBeVisible({ timeout: 7000 });
  });
});

test.describe('Navigation', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/', { waitUntil: 'domcontentloaded' });
  });

  test('clicking About nav item scrolls to About section', async ({ page }) => {
    await page.getByText('About').first().click({ force: true });
    await expect(page.locator('#about')).toBeVisible();
  });

  test('clicking Interests nav item scrolls to Interests section', async ({ page }) => {
    await page.getByText('Interests').first().click({ force: true });
    await expect(page.locator('#interests')).toBeVisible();
  });
});

test.describe('Sub-pages', () => {
  test('Checker page renders', async ({ page }) => {
    await page.goto('/checker');
    await expect(page.getByRole('main', { name: 'Alcohol Checker Tool' })).toBeVisible();
    await expect(page.getByText('Alcohol Checker')).toBeVisible();
  });

  test('checker buttons work', async ({ page }) => {
    await page.goto('/checker');
    await page.getByLabel('Add one unit of alcohol').click({ force: true });
    await expect(page.getByRole('cell').first()).toHaveText('1');
    await page.getByLabel('Reset unit count to zero').click({ force: true });
    await expect(page.getByRole('cell').first()).toHaveText('0');
  });

  test('Noughts and Crosses page renders', async ({ page }) => {
    await page.goto('/noughts-and-crosses');
    await expect(page.getByRole('main', { name: 'Noughts and Crosses Game' })).toBeVisible();
    await expect(page.getByText('Noughts and Crosses')).toBeVisible();
  });

  test('Noughts and Crosses gameplay', async ({ page }) => {
    await page.goto('/noughts-and-crosses');
    await expect(page.getByText('Noughts and Crosses')).toBeVisible();
    const cells = page.getByRole('gridcell');
    await cells.first().click({ force: true });
    await expect(cells.first()).toHaveAttribute('aria-label', /X/);
  });

  test('Ask page renders with suggestion buttons', async ({ page }) => {
    await page.goto('/ask');
    await expect(page.locator('#chat-input')).toBeVisible();
    await expect(page.getByText('What are your skills?')).toBeVisible();
    await expect(page.getByText('Tell me about your experience')).toBeVisible();
    await expect(page.getByText('What are your interests?')).toBeVisible();
    await expect(page.getByText('How can I contact you?')).toBeVisible();
  });

  test('Ask page suggestion triggers bot response', async ({ page }) => {
    await page.goto('/ask');
    await page.getByText('What are your skills?').click();
    await expect(page.getByLabel('Bot is typing')).toBeVisible({ timeout: 3000 });
  });

  test('hidden route renders page sections', async ({ page }) => {
    await page.goto('/hidden');
    await expect(page.locator('#home')).toBeVisible();
    await expect(page.locator('#about')).toBeVisible();
    await expect(page.locator('#interests')).toBeVisible();
  });

  test('unknown route still renders page sections', async ({ page }) => {
    await page.goto('/some-nonexistent-page');
    await expect(page.locator('#home')).toBeVisible();
    await expect(page.locator('#about')).toBeVisible();
    await expect(page.locator('#interests')).toBeVisible();
  });
});

test.describe('Visual regression', () => {
  test('home matches baseline', async ({ page }) => {
    await page.goto('/');
    await waitForSplashDone(page);
    await hideCityBackground(page);
    await freezePage(page);
    await expect(page).toHaveScreenshot('home.png', {
      animations: 'disabled',
      timeout: 10000,
      maxDiffPixelRatio: 0.03,
    });
  });

  test('About section matches baseline', async ({ page }) => {
    await page.goto('/');
    await page.getByText('About').first().click({ force: true });
    await waitForSplashDone(page);
    await hideCityBackground(page);
    await freezePage(page);
    await expect(page).toHaveScreenshot('about.png', {
      animations: 'disabled',
      timeout: 10000,
      maxDiffPixelRatio: 0.03,
    });
  });

  test('Interests section matches baseline', async ({ page }) => {
    await page.goto('/');
    await page.getByText('Interests').first().click({ force: true });
    await waitForSplashDone(page);
    await hideCityBackground(page);
    await freezePage(page);
    await expect(page).toHaveScreenshot('interests.png', {
      animations: 'disabled',
      timeout: 10000,
      maxDiffPixelRatio: 0.03,
    });
  });

  test('Checker page matches baseline', async ({ page }) => {
    await page.goto('/checker');
    await waitForSplashDone(page);
    await hideCityBackground(page);
    await freezePage(page);
    await expect(page).toHaveScreenshot('checker.png', {
      animations: 'disabled',
      timeout: 10000,
      maxDiffPixelRatio: 0.03,
    });
  });

  test('Noughts and Crosses page matches baseline', async ({ page }) => {
    await page.goto('/noughts-and-crosses');
    await waitForSplashDone(page);
    await hideCityBackground(page);
    await freezePage(page);
    await expect(page).toHaveScreenshot('noughts-and-crosses.png', {
      animations: 'disabled',
      timeout: 10000,
      maxDiffPixelRatio: 0.03,
    });
  });

  test('Ask page matches baseline', async ({ page }) => {
    await page.goto('/ask');
    await waitForSplashDone(page);
    await hideCityBackground(page);
    await freezePage(page);
    await expect(page).toHaveScreenshot('ask.png', {
      animations: 'disabled',
      timeout: 10000,
      maxDiffPixelRatio: 0.03,
    });
  });
});
