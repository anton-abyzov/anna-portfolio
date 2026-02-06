const { test, expect } = require('@playwright/test');

test.describe('Music Player', () => {
  test('should show mini-player when Listen button clicked', async ({ page }) => {
    await page.goto('/');

    const listenBtn = page.locator('.listen-btn').first();
    await listenBtn.click();

    const player = page.locator('#musicPlayer');
    await expect(player).toHaveClass(/visible/);

    const title = page.locator('#musicTitle');
    await expect(title).not.toHaveText('Not playing');
  });

  test('should display correct track info', async ({ page }) => {
    await page.goto('/');

    await page.locator('[data-listen="ZVZhNhyyErM"]').click();

    await expect(page.locator('#musicTitle')).toContainText("Tchaikovsky's Sentimental Waltz");
    await expect(page.locator('#musicComposer')).toContainText('Pyotr Ilyich Tchaikovsky');
  });

  test('should toggle play/pause', async ({ page }) => {
    await page.goto('/');
    await page.locator('.listen-btn').first().click();
    await page.waitForTimeout(2000);

    const playBtn = page.locator('#musicPlayBtn');
    const pauseIcon = page.locator('.icon-pause');

    await expect(pauseIcon).toBeVisible();

    await playBtn.click();
    await page.waitForTimeout(500);

    const playIcon = page.locator('.icon-play');
    await expect(playIcon).toBeVisible();
  });

  test('should navigate to next track', async ({ page }) => {
    await page.goto('/');
    await page.locator('[data-listen="ZVZhNhyyErM"]').click();
    await page.waitForTimeout(1000);

    const nextBtn = page.locator('#musicNext');
    await nextBtn.click();
    await page.waitForTimeout(1000);

    const title = page.locator('#musicTitle');
    await expect(title).toContainText('Rachmaninoff');
  });

  test('should navigate to previous track', async ({ page }) => {
    await page.goto('/');
    await page.locator('.listen-btn').first().click();
    await page.waitForTimeout(1000);

    await page.locator('#musicNext').click();
    await page.waitForTimeout(1000);

    await page.locator('#musicPrev').click();
    await page.waitForTimeout(1000);

    await expect(page.locator('#musicTitle')).toContainText("Tchaikovsky's Sentimental Waltz");
  });

  test('should close player', async ({ page }) => {
    await page.goto('/');
    await page.locator('.listen-btn').first().click();

    const player = page.locator('#musicPlayer');
    await expect(player).toHaveClass(/visible/);

    await page.locator('#musicClose').click();
    await expect(player).not.toHaveClass(/visible/);
  });

  test('should update progress bar', async ({ page }) => {
    await page.goto('/');
    await page.locator('.listen-btn').first().click();
    await page.waitForTimeout(3000);

    const progressFill = page.locator('#musicProgressFill');
    const width = await progressFill.evaluate(el => el.style.width);

    expect(parseFloat(width)).toBeGreaterThan(0);
  });
});
