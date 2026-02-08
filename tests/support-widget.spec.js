const { test, expect } = require('@playwright/test');

test.describe('Support Widget', () => {
  test('should open support overlay when floating button is clicked', async ({ page }) => {
    await page.goto('/');

    const floatBtn = page.locator('#supportFloatBtn');
    await expect(floatBtn).toBeVisible();

    await floatBtn.click();

    const overlay = page.locator('#supportOverlay');
    await expect(overlay).toHaveClass(/active/);
  });

  test('should show Anna info in overlay', async ({ page }) => {
    await page.goto('/');
    await page.locator('#supportFloatBtn').click();

    const panel = page.locator('.support-panel');
    await expect(panel).toBeVisible();
    await expect(panel.locator('.support-name')).toHaveText('Anna Abyzova');
    await expect(panel.locator('.support-avatar')).toBeVisible();
  });

  test('should NOT contain any Anton info in the support widget', async ({ page }) => {
    await page.goto('/');
    await page.locator('#supportFloatBtn').click();

    const panel = page.locator('.support-panel');
    await expect(panel).toBeVisible();

    // Get all visible text in the support panel
    const panelText = await panel.innerText();

    // Must not contain "Anton" anywhere in visible text
    expect(panelText).not.toContain('Anton');

    // Must not contain "Support Anton Abyzov" header
    expect(panelText).not.toContain('Support Anton');

    // Must not contain ko-fi.com/antonabyzov footer
    expect(panelText).not.toContain('ko-fi.com/antonabyzov');

    // No iframes should exist inside the panel
    const iframes = panel.locator('iframe');
    await expect(iframes).toHaveCount(0);
  });

  test('should have working donation links', async ({ page }) => {
    await page.goto('/');
    await page.locator('#supportFloatBtn').click();

    const links = page.locator('.support-amount-btn');
    await expect(links).toHaveCount(3);

    // All links should point to ko-fi and open in new tab
    for (let i = 0; i < 3; i++) {
      const link = links.nth(i);
      await expect(link).toHaveAttribute('href', 'https://ko-fi.com/antonabyzov');
      await expect(link).toHaveAttribute('target', '_blank');
    }
  });

  test('should close overlay with close button', async ({ page }) => {
    await page.goto('/');
    await page.locator('#supportFloatBtn').click();

    const overlay = page.locator('#supportOverlay');
    await expect(overlay).toHaveClass(/active/);

    await page.locator('#supportClose').click();
    await expect(overlay).not.toHaveClass(/active/);
  });

  test('should close overlay with Escape key', async ({ page }) => {
    await page.goto('/');
    await page.locator('#supportFloatBtn').click();

    const overlay = page.locator('#supportOverlay');
    await expect(overlay).toHaveClass(/active/);

    await page.keyboard.press('Escape');
    await expect(overlay).not.toHaveClass(/active/);
  });

  test('should close overlay on backdrop click', async ({ page }) => {
    await page.goto('/');
    await page.locator('#supportFloatBtn').click();

    const overlay = page.locator('#supportOverlay');
    await expect(overlay).toHaveClass(/active/);

    // Click in the top-left corner of the viewport (outside the centered panel)
    await page.mouse.click(10, 10);
    await expect(overlay).not.toHaveClass(/active/);
  });
});
