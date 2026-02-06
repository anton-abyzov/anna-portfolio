const { test, expect } = require('@playwright/test');

test.describe('Queue Panel Close', () => {
  test('should close queue panel with close button', async ({ page }) => {
    await page.goto('/');

    // Start playing to show player
    await page.locator('.listen-btn').first().click();
    await page.waitForTimeout(500);

    // Open queue
    await page.click('#queueToggleBtn');
    const panel = page.locator('#queuePanel');
    await expect(panel).toHaveClass(/visible/);

    // Close with X button
    await page.click('#queueCloseBtn');
    await expect(panel).not.toHaveClass(/visible/);
  });

  test('close button is visible in queue header', async ({ page }) => {
    await page.goto('/');

    await page.locator('.listen-btn').first().click();
    await page.waitForTimeout(500);

    await page.click('#queueToggleBtn');
    await expect(page.locator('#queuePanel')).toHaveClass(/visible/);

    const closeBtn = page.locator('#queueCloseBtn');
    await expect(closeBtn).toBeVisible();
  });

  test('clear button and close button are both in header', async ({ page }) => {
    await page.goto('/');

    await page.locator('.listen-btn').first().click();
    await page.waitForTimeout(500);

    await page.click('#queueToggleBtn');

    await expect(page.locator('#queueClearBtn')).toBeVisible();
    await expect(page.locator('#queueCloseBtn')).toBeVisible();
  });
});

test.describe('Pause and Replay', () => {
  test('play button is visible when player is active', async ({ page }) => {
    await page.goto('/');

    await page.locator('.listen-btn').first().click();
    await page.waitForTimeout(500);

    const player = page.locator('#musicPlayer');
    await expect(player).toHaveClass(/visible/);

    const playBtn = page.locator('#musicPlayBtn');
    await expect(playBtn).toBeVisible();
  });

  test('pause toggles play icon state', async ({ page }) => {
    await page.goto('/');

    await page.locator('.listen-btn').first().click();
    await page.waitForTimeout(2000);

    // Click to pause
    await page.click('#musicPlayBtn');
    await page.waitForTimeout(500);

    // After pause, play icon should be visible (display block), pause hidden
    const isPaused = await page.evaluate(() => {
      const playIcon = document.querySelector('#musicPlayBtn .icon-play');
      const pauseIcon = document.querySelector('#musicPlayBtn .icon-pause');
      return playIcon.style.display === 'block' && pauseIcon.style.display === 'none';
    });
    expect(isPaused).toBe(true);
  });

  test('replay after pause resumes playback', async ({ page }) => {
    await page.goto('/');

    await page.locator('.listen-btn').first().click();
    await page.waitForTimeout(2000);

    // Pause
    await page.click('#musicPlayBtn');
    await page.waitForTimeout(500);

    // After pause, isPlaying should be false
    const isPausedState = await page.evaluate(() => {
      const playIcon = document.querySelector('#musicPlayBtn .icon-play');
      return playIcon && playIcon.style.display !== 'none';
    });
    expect(isPausedState).toBe(true);

    // Resume
    await page.click('#musicPlayBtn');
    await page.waitForTimeout(500);

    // After resume, isPlaying should be true
    const isPlayingState = await page.evaluate(() => {
      const pauseIcon = document.querySelector('#musicPlayBtn .icon-pause');
      return pauseIcon && pauseIcon.style.display !== 'none';
    });
    expect(isPlayingState).toBe(true);
  });

  test('multiple pause/resume cycles work', async ({ page }) => {
    await page.goto('/');

    await page.locator('.listen-btn').first().click();
    await page.waitForTimeout(2000);

    for (let i = 0; i < 3; i++) {
      // Pause
      await page.click('#musicPlayBtn');
      await page.waitForTimeout(500);
      const isPaused = await page.evaluate(() => {
        return document.querySelector('#musicPlayBtn .icon-play').style.display === 'block';
      });
      expect(isPaused).toBe(true);

      // Resume
      await page.click('#musicPlayBtn');
      await page.waitForTimeout(500);
      const isPlaying = await page.evaluate(() => {
        return document.querySelector('#musicPlayBtn .icon-pause').style.display === 'block';
      });
      expect(isPlaying).toBe(true);
    }
  });

  test('track title stays same after pause/resume', async ({ page }) => {
    await page.goto('/');

    await page.locator('.listen-btn').first().click();
    await page.waitForTimeout(1500);

    const titleBefore = await page.locator('#musicTitle').textContent();

    // Pause and resume
    await page.click('#musicPlayBtn');
    await page.waitForTimeout(300);
    await page.click('#musicPlayBtn');
    await page.waitForTimeout(300);

    const titleAfter = await page.locator('#musicTitle').textContent();
    expect(titleAfter).toBe(titleBefore);
  });

  test('player does not auto-play on page load', async ({ page }) => {
    await page.goto('/');
    await page.waitForTimeout(500);

    const player = page.locator('#musicPlayer');
    await expect(player).not.toHaveClass(/visible/);
  });

  test('close button stops playback and hides player', async ({ page }) => {
    await page.goto('/');

    await page.locator('.listen-btn').first().click();
    await page.waitForTimeout(1000);

    await expect(page.locator('#musicPlayer')).toHaveClass(/visible/);

    await page.click('#musicClose');
    await page.waitForTimeout(300);

    await expect(page.locator('#musicPlayer')).not.toHaveClass(/visible/);
  });
});

test.describe('Queue with Chillout Tracks', () => {
  test('playing chillout track populates queue', async ({ page }) => {
    await page.goto('/');

    // Open library and play a track
    await page.click('#sidebarLibraryBtn');
    await page.waitForSelector('.chillout-card');

    await page.click('[data-filter="lofi"]');
    await page.waitForTimeout(300);

    await page.locator('.chillout-card').first().click();
    await page.waitForTimeout(1000);

    // Queue should have tracks from the lofi category
    const queueCount = await page.evaluate(() => {
      const btn = document.getElementById('queueToggleBtn');
      return btn ? btn.textContent : '';
    });
    expect(queueCount).not.toContain('Queue (0)');
  });

  test('queue shows currently playing track highlighted', async ({ page }) => {
    await page.goto('/');

    await page.click('#sidebarLibraryBtn');
    await page.waitForSelector('.chillout-card');
    await page.locator('.chillout-card').first().click();
    await page.waitForTimeout(1000);

    // Open queue panel
    await page.click('#queueToggleBtn');
    await page.waitForTimeout(300);

    // Should have a current item highlighted
    const currentItem = page.locator('.queue-item.current');
    await expect(currentItem).toBeVisible();
  });

  test('queue items have thumbnails', async ({ page }) => {
    await page.goto('/');

    await page.click('#sidebarLibraryBtn');
    await page.waitForSelector('.chillout-card');
    await page.locator('.chillout-card').first().click();
    await page.waitForTimeout(1000);

    await page.click('#queueToggleBtn');
    await page.waitForTimeout(300);

    const thumbs = page.locator('.queue-item-thumb');
    const count = await thumbs.count();
    expect(count).toBeGreaterThan(0);

    // First thumb should have a youtube image src
    const src = await thumbs.first().getAttribute('src');
    expect(src).toContain('img.youtube.com');
  });

  test('clicking queue item changes current track', async ({ page }) => {
    await page.goto('/');

    // Play a chillout track to fill queue
    await page.click('#sidebarLibraryBtn');
    await page.waitForSelector('.chillout-card');
    await page.locator('.chillout-card').first().click();
    await page.waitForTimeout(1000);

    const firstTitle = await page.locator('#musicTitle').textContent();

    // Open queue and click second item
    await page.click('#queueToggleBtn');
    await page.waitForTimeout(300);

    const queueItems = page.locator('.queue-item');
    const count = await queueItems.count();
    if (count >= 2) {
      await queueItems.nth(1).click();
      await page.waitForTimeout(800);

      const newTitle = await page.locator('#musicTitle').textContent();
      expect(newTitle).not.toBe(firstTitle);
    }
  });

  test('removing queue item updates queue list', async ({ page }) => {
    await page.goto('/');

    await page.click('#sidebarLibraryBtn');
    await page.waitForSelector('.chillout-card');
    await page.locator('.chillout-card').first().click();
    await page.waitForTimeout(1000);

    await page.click('#queueToggleBtn');
    await page.waitForTimeout(300);

    const countBefore = await page.locator('.queue-item').count();
    if (countBefore >= 2) {
      // Remove the last item (not current)
      await page.locator('.queue-item-remove').last().click();
      await page.waitForTimeout(300);

      const countAfter = await page.locator('.queue-item').count();
      expect(countAfter).toBe(countBefore - 1);
    }
  });

  test('clear queue empties the list', async ({ page }) => {
    await page.goto('/');

    await page.click('#sidebarLibraryBtn');
    await page.waitForSelector('.chillout-card');
    await page.locator('.chillout-card').first().click();
    await page.waitForTimeout(1000);

    await page.click('#queueToggleBtn');
    await page.waitForTimeout(300);

    expect(await page.locator('.queue-item').count()).toBeGreaterThan(0);

    await page.click('#queueClearBtn');
    await page.waitForTimeout(300);

    expect(await page.locator('.queue-item').count()).toBe(0);
  });
});
