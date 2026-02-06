const { test, expect } = require('@playwright/test');

test.describe('Birthday Celebration Feature', () => {
  test('should show birthday banner during birthday period (Feb 5-7)', async ({ page }) => {
    // Mock date to Feb 5
    await page.addInitScript(() => {
      Date = class extends Date {
        constructor(...args) {
          if (args.length === 0) {
            super(2026, 1, 5); // Feb 5, 2026
          } else {
            super(...args);
          }
        }
      };
    });

    await page.goto('/');

    const banner = page.locator('#birthdayBanner');
    await expect(banner).toBeVisible();
    await expect(banner).toContainText("It's Anna's Birthday!");
  });

  test('should open celebration overlay when banner clicked', async ({ page }) => {
    await page.addInitScript(() => {
      Date = class extends Date {
        constructor() { super(2026, 1, 5); }
      };
    });

    await page.goto('/');
    await page.click('#birthdayBanner');

    const overlay = page.locator('#birthdayOverlay');
    await expect(overlay).toBeVisible();
    await expect(page.locator('#birthdayTitle')).toContainText('Happy Birthday, Anna!');
  });

  test('should blow out candles on click', async ({ page }) => {
    await page.addInitScript(() => {
      Date = class extends Date {
        constructor() { super(2026, 1, 5); }
      };
    });

    await page.goto('/');
    await page.click('#birthdayBanner');

    const candles = page.locator('.candle');
    const firstCandle = candles.first();

    await firstCandle.click();
    await expect(firstCandle).toHaveClass(/blown/);
  });

  test('should show celebration when all candles blown', async ({ page }) => {
    await page.addInitScript(() => {
      Date = class extends Date {
        constructor() { super(2026, 1, 5); }
      };
    });

    await page.goto('/');
    await page.click('#birthdayBanner');

    // Blow all 5 candles
    const candles = await page.locator('.candle').all();
    for (const candle of candles) {
      await candle.click();
      await page.waitForTimeout(100);
    }

    // Check celebration elements appear
    await expect(page.locator('#birthdayTitle')).toHaveClass(/visible/);
    await expect(page.locator('#birthdaySubtitle')).toHaveClass(/visible/);
  });

  test('should NOT show banner outside birthday period', async ({ page }) => {
    await page.addInitScript(() => {
      Date = class extends Date {
        constructor() { super(2026, 2, 10); } // March 10
      };
    });

    await page.goto('/');

    const banner = page.locator('#birthdayBanner');
    await expect(banner).not.toBeVisible();
  });

  test('should close overlay with Escape key', async ({ page }) => {
    await page.addInitScript(() => {
      Date = class extends Date {
        constructor() { super(2026, 1, 5); }
      };
    });

    await page.goto('/');
    await page.click('#birthdayBanner');

    const overlay = page.locator('#birthdayOverlay');
    await expect(overlay).toBeVisible();

    await page.keyboard.press('Escape');
    await page.waitForTimeout(1500);

    await expect(overlay).not.toBeVisible();
  });
});
