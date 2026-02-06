const { test, expect } = require('@playwright/test');

test.describe('Music Library Modal', () => {
  test('should open library modal', async ({ page }) => {
    await page.goto('/');

    await page.click('#libraryToggleBtn');

    const modal = page.locator('#libraryModal');
    await expect(modal).toHaveClass(/active/);
  });

  test('should display all tracks by default', async ({ page }) => {
    await page.goto('/');
    await page.click('#libraryToggleBtn');

    const cards = page.locator('.library-card');
    await expect(cards).toHaveCount(6);
  });

  test('should filter by Romantic category', async ({ page }) => {
    await page.goto('/');
    await page.click('#libraryToggleBtn');

    await page.click('[data-filter="romantic"]');

    const cards = page.locator('.library-card');
    const count = await cards.count();
    expect(count).toBe(3);
  });

  test('should filter by Baroque category', async ({ page }) => {
    await page.goto('/');
    await page.click('#libraryToggleBtn');

    await page.click('[data-filter="baroque"]');

    const cards = page.locator('.library-card');
    const count = await cards.count();
    expect(count).toBe(1);
    await expect(cards.first()).toContainText('Bach');
  });

  test('should search tracks', async ({ page }) => {
    await page.goto('/');
    await page.click('#libraryToggleBtn');

    await page.fill('#librarySearch', 'chopin');

    const cards = page.locator('.library-card');
    const count = await cards.count();
    expect(count).toBe(1);
    await expect(cards.first()).toContainText('Chopin');
  });

  test('should play track from library', async ({ page }) => {
    await page.goto('/');
    await page.click('#libraryToggleBtn');

    await page.click('.library-card:first-child');

    const modal = page.locator('#libraryModal');
    await expect(modal).not.toHaveClass(/active/);

    const player = page.locator('#musicPlayer');
    await expect(player).toHaveClass(/visible/);
  });

  test('should close modal with close button', async ({ page }) => {
    await page.goto('/');
    await page.click('#libraryToggleBtn');

    await page.click('.library-modal .modal-close');

    const modal = page.locator('#libraryModal');
    await expect(modal).not.toHaveClass(/active/);
  });

  test('should close modal with Escape key', async ({ page }) => {
    await page.goto('/');
    await page.click('#libraryToggleBtn');

    await page.keyboard.press('Escape');

    const modal = page.locator('#libraryModal');
    await expect(modal).not.toHaveClass(/active/);
  });

  test('should show featured tracks only', async ({ page }) => {
    await page.goto('/');
    await page.click('#libraryToggleBtn');

    await page.click('[data-filter="featured"]');

    const cards = page.locator('.library-card');
    const count = await cards.count();
    expect(count).toBe(2);
  });
});
