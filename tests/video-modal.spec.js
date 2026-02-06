const { test, expect } = require('@playwright/test');

test.describe('Video Modal', () => {
  test('should open video modal on performance card click', async ({ page }) => {
    await page.goto('/');

    await page.click('.performance-card:first-child');

    const modal = page.locator('#videoModal');
    await expect(modal).toHaveClass(/active/);
  });

  test('should display correct video', async ({ page }) => {
    await page.goto('/');

    await page.click('[data-video="ZVZhNhyyErM"]');

    const iframe = page.locator('#videoFrame');
    const src = await iframe.getAttribute('src');

    expect(src).toContain('ZVZhNhyyErM');
  });

  test('should close modal with close button', async ({ page }) => {
    await page.goto('/');
    await page.click('.performance-card:first-child');

    await page.click('.modal-close');

    const modal = page.locator('#videoModal');
    await expect(modal).not.toHaveClass(/active/);
  });

  test('should close modal with Escape key', async ({ page }) => {
    await page.goto('/');
    await page.click('.performance-card:first-child');

    await page.keyboard.press('Escape');

    const modal = page.locator('#videoModal');
    await expect(modal).not.toHaveClass(/active/);
  });

  test('should autoplay video when modal opens', async ({ page }) => {
    await page.goto('/');

    await page.click('[data-video="ZVZhNhyyErM"]');

    const iframe = page.locator('#videoFrame');
    const src = await iframe.getAttribute('src');

    expect(src).toContain('autoplay=1');
  });
});
