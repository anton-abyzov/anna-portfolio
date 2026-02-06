const { test, expect } = require('@playwright/test');

// Viewport sizes for responsive testing
const DESKTOP = { width: 1280, height: 800 };
const TABLET = { width: 768, height: 1024 };
const MOBILE = { width: 375, height: 812 };

test.describe('Library Panel Positioning — Desktop', () => {
  test.use({ viewport: DESKTOP });

  test('sidebar library button is visible and not overlapping toggle', async ({ page }) => {
    await page.goto('/');

    const btn = page.locator('#sidebarLibraryBtn');
    const toggle = page.locator('.sidebar-toggle');

    await expect(btn).toBeVisible();
    await expect(toggle).toBeVisible();

    const btnBox = await btn.boundingBox();
    const toggleBox = await toggle.boundingBox();

    // Button must be above the toggle (no overlap)
    expect(btnBox.y + btnBox.height).toBeLessThanOrEqual(toggleBox.y);
  });

  test('sidebar library button is within the sidebar bounds', async ({ page }) => {
    await page.goto('/');

    const sidebar = page.locator('.sidebar');
    const btn = page.locator('#sidebarLibraryBtn');

    const sidebarBox = await sidebar.boundingBox();
    const btnBox = await btn.boundingBox();

    // Button is fully inside sidebar horizontally
    expect(btnBox.x).toBeGreaterThanOrEqual(sidebarBox.x);
    expect(btnBox.x + btnBox.width).toBeLessThanOrEqual(sidebarBox.x + sidebarBox.width);

    // Button is fully inside sidebar vertically
    expect(btnBox.y).toBeGreaterThanOrEqual(sidebarBox.y);
    expect(btnBox.y + btnBox.height).toBeLessThanOrEqual(sidebarBox.y + sidebarBox.height);
  });

  test('library panel opens as full-screen overlay', async ({ page }) => {
    await page.goto('/');

    await page.click('#sidebarLibraryBtn');
    await page.waitForSelector('#libraryPanel.active');

    const panel = page.locator('#libraryPanel');
    const panelBox = await panel.boundingBox();

    // Panel should cover the viewport (scrollbar/chrome may reduce dimensions slightly)
    expect(panelBox.width).toBeGreaterThan(DESKTOP.width - 50);
    expect(panelBox.height).toBeGreaterThan(DESKTOP.height - 30);
    expect(panelBox.x).toBeLessThanOrEqual(25);
    expect(panelBox.y).toBeLessThanOrEqual(15);
  });

  test('backdrop covers the viewport when panel is open', async ({ page }) => {
    await page.goto('/');

    await page.click('#sidebarLibraryBtn');
    await page.waitForSelector('#libraryBackdrop.active');

    const backdrop = page.locator('#libraryBackdrop');
    const backdropBox = await backdrop.boundingBox();

    expect(backdropBox.width).toBeGreaterThanOrEqual(DESKTOP.width - 1);
    expect(backdropBox.height).toBeGreaterThanOrEqual(DESKTOP.height - 1);
  });

  test('page content remains scrollable when panel is open', async ({ page }) => {
    await page.goto('/');

    const scrollBefore = await page.evaluate(() => document.body.style.overflow);

    await page.click('#sidebarLibraryBtn');
    await page.waitForSelector('#libraryPanel.active');

    const scrollAfter = await page.evaluate(() => document.body.style.overflow);

    // Body overflow should NOT be set to hidden
    expect(scrollAfter).not.toBe('hidden');
  });

  test('sidebar nav items do not overlap with library section', async ({ page }) => {
    await page.goto('/');

    const lastNavLink = page.locator('.sidebar-link').last();
    const librarySection = page.locator('.sidebar-library-section');

    const navBox = await lastNavLink.boundingBox();
    const libraryBox = await librarySection.boundingBox();

    // Last nav item should end before library section starts
    expect(navBox.y + navBox.height).toBeLessThanOrEqual(libraryBox.y + 1);
  });

  test('panel cards are visible and within panel bounds', async ({ page }) => {
    await page.goto('/');

    await page.click('#sidebarLibraryBtn');
    await page.waitForSelector('.chillout-card');

    const firstCard = page.locator('.chillout-card').first();
    const cardBox = await firstCard.boundingBox();
    const panelBox = await page.locator('#libraryPanel').boundingBox();

    // Card should be within panel bounds
    expect(cardBox.x).toBeGreaterThanOrEqual(panelBox.x);
    expect(cardBox.x + cardBox.width).toBeLessThanOrEqual(panelBox.x + panelBox.width + 1);
  });
});

test.describe('Library Panel Positioning — Tablet', () => {
  test.use({ viewport: TABLET });

  test('sidebar library button is visible on tablet', async ({ page }) => {
    await page.goto('/');

    const btn = page.locator('#sidebarLibraryBtn');
    await expect(btn).toBeVisible();
  });

  test('library panel is full-width on tablet', async ({ page }) => {
    await page.goto('/');

    await page.click('#sidebarLibraryBtn');
    await page.waitForSelector('#libraryPanel.active');

    const panel = page.locator('#libraryPanel');
    const panelBox = await panel.boundingBox();

    // Full-screen overlay on tablet too (scrollbar may reduce width slightly)
    expect(panelBox.width).toBeGreaterThan(TABLET.width - 30);
  });

  test('panel does not extend beyond viewport on tablet', async ({ page }) => {
    await page.goto('/');

    await page.click('#sidebarLibraryBtn');
    await page.waitForSelector('#libraryPanel.active');

    const panel = page.locator('#libraryPanel');
    const panelBox = await panel.boundingBox();

    expect(panelBox.x + panelBox.width).toBeLessThanOrEqual(TABLET.width + 1);
  });
});

test.describe('Library Panel Positioning — Mobile', () => {
  test.use({ viewport: MOBILE });

  test('sidebar library button is visible in bottom nav', async ({ page }) => {
    await page.goto('/');

    const btn = page.locator('#sidebarLibraryBtn');
    await expect(btn).toBeVisible();

    const btnBox = await btn.boundingBox();

    // Button should be in the bottom portion of the viewport
    expect(btnBox.y).toBeGreaterThan(MOBILE.height / 2);
  });

  test('sidebar library button fits within mobile bottom bar', async ({ page }) => {
    await page.goto('/');

    const sidebar = page.locator('.sidebar');
    const btn = page.locator('#sidebarLibraryBtn');

    const sidebarBox = await sidebar.boundingBox();
    const btnBox = await btn.boundingBox();

    // Button should be near the sidebar bounds (mobile layout has some variance)
    expect(btnBox.y).toBeGreaterThanOrEqual(sidebarBox.y - 15);
    expect(btnBox.y + btnBox.height).toBeLessThanOrEqual(sidebarBox.y + sidebarBox.height + 15);
  });

  test('library panel takes full width on mobile', async ({ page }) => {
    await page.goto('/');

    await page.click('#sidebarLibraryBtn');
    await page.waitForSelector('#libraryPanel.active');

    const panel = page.locator('#libraryPanel');
    const panelBox = await panel.boundingBox();

    // Panel should be full-width on mobile (scrollbar may reduce width slightly)
    expect(panelBox.width).toBeGreaterThan(MOBILE.width - 15);
    expect(panelBox.x).toBeLessThanOrEqual(6);
  });
});

test.describe('Library Panel — Interaction Flow', () => {
  test.use({ viewport: DESKTOP });

  test('open panel from sidebar, close from X button', async ({ page }) => {
    await page.goto('/');

    await page.click('#sidebarLibraryBtn');
    await expect(page.locator('#libraryPanel')).toHaveClass(/active/);
    await expect(page.locator('#libraryBackdrop')).toHaveClass(/active/);

    await page.click('#libraryPanelClose');
    await expect(page.locator('#libraryPanel')).not.toHaveClass(/active/);
    await expect(page.locator('#libraryBackdrop')).not.toHaveClass(/active/);
  });

  test('open panel from performances button', async ({ page }) => {
    await page.goto('/');

    await page.click('#libraryToggleBtn');
    await expect(page.locator('#libraryPanel')).toHaveClass(/active/);
  });

  test('close button closes the full-screen panel', async ({ page }) => {
    await page.goto('/');

    await page.click('#sidebarLibraryBtn');
    await expect(page.locator('#libraryPanel')).toHaveClass(/active/);

    await page.click('#libraryPanelClose');
    await expect(page.locator('#libraryPanel')).not.toHaveClass(/active/);
  });

  test('Escape key closes panel', async ({ page }) => {
    await page.goto('/');

    await page.click('#sidebarLibraryBtn');
    await expect(page.locator('#libraryPanel')).toHaveClass(/active/);

    await page.keyboard.press('Escape');
    await expect(page.locator('#libraryPanel')).not.toHaveClass(/active/);
  });

  test('backdrop click closes panel', async ({ page }) => {
    await page.goto('/');

    await page.click('#sidebarLibraryBtn');
    await expect(page.locator('#libraryPanel')).toHaveClass(/active/);

    await page.click('#libraryBackdrop', { force: true });
    await expect(page.locator('#libraryPanel')).not.toHaveClass(/active/);
  });

  test('panel filter tabs are within panel bounds', async ({ page }) => {
    await page.goto('/');

    await page.click('#sidebarLibraryBtn');
    await page.waitForSelector('.chillout-filters');

    const filters = page.locator('.chillout-filters');
    const filtersBox = await filters.boundingBox();
    const panelBox = await page.locator('#libraryPanel').boundingBox();

    // Filters container should not exceed panel width
    expect(filtersBox.width).toBeLessThanOrEqual(panelBox.width + 1);
  });

  test('panel displays correct number of tracks', async ({ page }) => {
    await page.goto('/');

    await page.click('#sidebarLibraryBtn');
    await page.waitForSelector('.chillout-card');

    const cards = page.locator('.chillout-card');
    await expect(cards).toHaveCount(28);
  });

  test('hero banner is displayed with live stream', async ({ page }) => {
    await page.goto('/');

    await page.click('#sidebarLibraryBtn');
    await page.waitForSelector('.chillout-hero');

    const hero = page.locator('.chillout-hero');
    await expect(hero).toBeVisible();
    await expect(hero.locator('.chillout-hero-badge')).toContainText('LIVE NOW');
  });

  test('category sections are displayed with carousels', async ({ page }) => {
    await page.goto('/');

    await page.click('#sidebarLibraryBtn');
    await page.waitForSelector('.chillout-category-section');

    const sections = page.locator('.chillout-category-section');
    const count = await sections.count();
    expect(count).toBe(6); // 6 categories
  });
});
