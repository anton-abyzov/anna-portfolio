const { test, expect } = require('@playwright/test');

test.describe('Contact Form', () => {
  test('should validate required fields', async ({ page }) => {
    await page.goto('/');
    await page.click('a[href="#contact"]');
    await page.waitForTimeout(1000);

    await page.click('.btn-contact');

    const nameInput = page.locator('#name');
    const isInvalid = await nameInput.evaluate(el => !el.validity.valid);
    expect(isInvalid).toBe(true);
  });

  test('should validate email format', async ({ page }) => {
    await page.goto('/');
    await page.click('a[href="#contact"]');
    await page.waitForTimeout(1000);

    await page.fill('#name', 'Test User');
    await page.fill('#email', 'invalid-email');
    await page.selectOption('#service', 'math');
    await page.fill('#message', 'Test message');

    await page.click('.btn-contact');

    const emailInput = page.locator('#email');
    const isInvalid = await emailInput.evaluate(el => !el.validity.valid);
    expect(isInvalid).toBe(true);
  });

  test('should show notification on valid submission', async ({ page }) => {
    await page.goto('/');
    await page.click('a[href="#contact"]');
    await page.waitForTimeout(1000);

    await page.fill('#name', 'Test User');
    await page.fill('#email', 'test@example.com');
    await page.selectOption('#service', 'math');
    await page.fill('#message', 'Test message');

    await page.click('.btn-contact');
    await page.waitForTimeout(500);

    const notification = page.locator('.fun-notification');
    await expect(notification).toBeVisible();
  });

  test('should clear form after submission', async ({ page }) => {
    await page.goto('/');
    await page.click('a[href="#contact"]');
    await page.waitForTimeout(1000);

    await page.fill('#name', 'Test User');
    await page.fill('#email', 'test@example.com');
    await page.selectOption('#service', 'math');
    await page.fill('#message', 'Test message');

    await page.click('.btn-contact');
    await page.waitForTimeout(1000);

    const nameInput = page.locator('#name');
    const nameValue = await nameInput.inputValue();
    expect(nameValue).toBe('');
  });
});
