const { test, expect } = require('@playwright/test');

test.describe('Playlist Queue', () => {
  test('should toggle queue panel', async ({ page }) => {
    await page.goto('/');

    // Start playing to show player
    await page.locator('.listen-btn').first().click();
    await page.waitForSelector('#musicPlayer.visible');

    await page.click('#queueToggleBtn');

    const panel = page.locator('#queuePanel');
    await expect(panel).toHaveClass(/visible/);

    // Close via the close button (toggle btn is behind panel)
    await page.click('#queueCloseBtn');
    await expect(panel).not.toHaveClass(/visible/);
  });

  test('should cycle repeat modes', async ({ page }) => {
    await page.goto('/');

    // Start playing to show player
    await page.locator('.listen-btn').first().click();
    await page.waitForTimeout(500);

    await page.click('#queueToggleBtn');

    const repeatBtn = page.locator('#repeatBtn');

    await expect(repeatBtn).toContainText('Repeat: Off');

    await repeatBtn.click();
    await expect(repeatBtn).toContainText('Repeat: All');

    await repeatBtn.click();
    await expect(repeatBtn).toContainText('Repeat: One');

    await repeatBtn.click();
    await expect(repeatBtn).toContainText('Repeat: Off');
  });

  test('should toggle shuffle', async ({ page }) => {
    await page.goto('/');

    // Start playing to show player
    await page.locator('.listen-btn').first().click();
    await page.waitForTimeout(500);

    await page.click('#queueToggleBtn');

    const shuffleBtn = page.locator('#shuffleBtn');

    await expect(shuffleBtn).toContainText('Shuffle: Off');
    await expect(shuffleBtn).not.toHaveClass(/active/);

    await shuffleBtn.click();
    await expect(shuffleBtn).toContainText('Shuffle: On');
    await expect(shuffleBtn).toHaveClass(/active/);
  });

  test('should show queue count in toggle button', async ({ page }) => {
    await page.goto('/');

    // Start playing to show player — auto-populates queue with 6 performances
    await page.locator('.listen-btn').first().click();
    await page.waitForSelector('#musicPlayer.visible');

    const queueToggleBtn = page.locator('#queueToggleBtn');
    await expect(queueToggleBtn).toContainText('Queue (6)');
  });
});
