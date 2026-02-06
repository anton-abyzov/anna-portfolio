const { test, expect } = require('@playwright/test');

test.describe('Chill-out Library Panel', () => {
  test('should open library panel from performances button', async ({ page }) => {
    await page.goto('/');

    await page.click('#libraryToggleBtn');

    const panel = page.locator('#libraryPanel');
    await expect(panel).toHaveClass(/active/);
  });

  test('should open library panel from sidebar button', async ({ page }) => {
    await page.goto('/');

    await page.click('#sidebarLibraryBtn');

    const panel = page.locator('#libraryPanel');
    await expect(panel).toHaveClass(/active/);
  });

  test('should close library panel with close button', async ({ page }) => {
    await page.goto('/');

    await page.click('#sidebarLibraryBtn');
    await expect(page.locator('#libraryPanel')).toHaveClass(/active/);

    await page.click('#libraryPanelClose');
    await expect(page.locator('#libraryPanel')).not.toHaveClass(/active/);
  });

  test('should display all chillout tracks by default', async ({ page }) => {
    await page.goto('/');
    await page.click('#sidebarLibraryBtn');

    const cards = page.locator('.chillout-card');
    await expect(cards).toHaveCount(28);
  });

  test('should filter by Lofi Beats category', async ({ page }) => {
    await page.goto('/');
    await page.click('#sidebarLibraryBtn');

    await page.click('[data-filter="lofi"]');

    const cards = page.locator('.chillout-card');
    const count = await cards.count();
    expect(count).toBe(4);
  });

  test('should filter by Classical category', async ({ page }) => {
    await page.goto('/');
    await page.click('#sidebarLibraryBtn');

    await page.click('[data-filter="classical"]');

    const cards = page.locator('.chillout-card');
    const count = await cards.count();
    expect(count).toBe(6);
    await expect(cards.first()).toContainText('Beethoven');
  });

  test('should search tracks', async ({ page }) => {
    await page.goto('/');
    await page.click('#sidebarLibraryBtn');

    await page.fill('#librarySearch', 'lofi girl');

    const cards = page.locator('.chillout-card');
    const count = await cards.count();
    expect(count).toBe(2);
  });

  test('should play track from library', async ({ page }) => {
    await page.goto('/');
    await page.click('#sidebarLibraryBtn');

    await page.click('.chillout-card:first-child');

    const panel = page.locator('#libraryPanel');
    await expect(panel).not.toHaveClass(/active/);

    const player = page.locator('#musicPlayer');
    await expect(player).toHaveClass(/visible/);
  });

  test('should close panel with close button', async ({ page }) => {
    await page.goto('/');
    await page.click('#sidebarLibraryBtn');

    await page.click('#libraryPanelClose');

    const panel = page.locator('#libraryPanel');
    await expect(panel).not.toHaveClass(/active/);
  });

  test('should close panel with Escape key', async ({ page }) => {
    await page.goto('/');
    await page.click('#sidebarLibraryBtn');

    await page.keyboard.press('Escape');

    const panel = page.locator('#libraryPanel');
    await expect(panel).not.toHaveClass(/active/);
  });

  test('should close panel when clicking backdrop', async ({ page }) => {
    await page.goto('/');
    await page.click('#sidebarLibraryBtn');

    await page.click('#libraryBackdrop', { force: true });

    const panel = page.locator('#libraryPanel');
    await expect(panel).not.toHaveClass(/active/);
  });

  test('should filter by Nature Sounds category', async ({ page }) => {
    await page.goto('/');
    await page.click('#sidebarLibraryBtn');

    await page.click('[data-filter="nature"]');

    const cards = page.locator('.chillout-card');
    const count = await cards.count();
    expect(count).toBe(4);
  });

  test('should show LIVE badges on live streams', async ({ page }) => {
    await page.goto('/');
    await page.click('#sidebarLibraryBtn');

    await page.click('[data-filter="lofi"]');

    const liveBadges = page.locator('.chillout-live-badge');
    const count = await liveBadges.count();
    expect(count).toBe(4);
  });
});
