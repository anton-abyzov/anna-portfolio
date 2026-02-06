const { test, expect } = require('@playwright/test');

test.describe('Sidebar Navigation', () => {
  test('should expand sidebar on toggle', async ({ page }) => {
    await page.goto('/');

    const sidebar = page.locator('.sidebar');
    await expect(sidebar).not.toHaveClass(/expanded/);

    await page.click('.sidebar-toggle');
    await expect(sidebar).toHaveClass(/expanded/);
  });

  test('should navigate to sections', async ({ page }) => {
    await page.goto('/');

    await page.click('a[href="#about"]');
    await page.waitForTimeout(1000);

    expect(page.url()).toContain('#about');
  });

  test('should update active link on scroll', async ({ page }) => {
    await page.goto('/');

    await page.evaluate(() => window.scrollTo(0, 1000));
    await page.waitForTimeout(500);

    const activeLink = page.locator('.sidebar-link.active');
    await expect(activeLink).toBeVisible();
  });

  test('should show tooltips on hover (collapsed sidebar)', async ({ page }) => {
    await page.goto('/');

    const sidebar = page.locator('.sidebar');
    await expect(sidebar).not.toHaveClass(/expanded/);

    const aboutLink = page.locator('a[href="#about"]');
    await aboutLink.hover();

    await expect(aboutLink).toHaveAttribute('data-tooltip', 'About');
  });
});
