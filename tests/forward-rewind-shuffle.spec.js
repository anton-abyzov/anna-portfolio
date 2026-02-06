const { test, expect } = require('@playwright/test');

// Helper to enable shuffle via JS (avoids queue panel overlap issues)
async function enableShuffle(page) {
  await page.evaluate(() => {
    const shuffleBtn = document.getElementById('shuffleBtn');
    if (shuffleBtn) shuffleBtn.click();
  });
}

// Helper to set repeat mode via JS
async function setRepeatMode(page, mode) {
  await page.evaluate((targetMode) => {
    const repeatBtn = document.getElementById('repeatBtn');
    if (!repeatBtn) return;
    // Click until we reach the target mode
    const modes = ['off', 'all', 'one'];
    let current = repeatBtn.dataset.mode || 'off';
    while (current !== targetMode) {
      repeatBtn.click();
      current = modes[(modes.indexOf(current) + 1) % modes.length];
    }
  }, mode);
}

test.describe('Forward/Rewind with Shuffle', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    // Start playing first track to activate player
    await page.locator('.listen-btn').first().click();
    await page.waitForTimeout(1500);
  });

  test('forward button advances to next track sequentially', async ({ page }) => {
    const firstTitle = await page.locator('#musicTitle').textContent();
    await page.locator('#musicNext').click();
    await page.waitForTimeout(1000);

    const secondTitle = await page.locator('#musicTitle').textContent();
    expect(secondTitle).not.toBe(firstTitle);
    expect(secondTitle).toContain('Rachmaninoff');
  });

  test('rewind button goes to previous track', async ({ page }) => {
    // Go to second track
    await page.locator('#musicNext').click();
    await page.waitForTimeout(1000);
    await expect(page.locator('#musicTitle')).toContainText('Rachmaninoff');

    // Go back
    await page.locator('#musicPrev').click();
    await page.waitForTimeout(1000);
    await expect(page.locator('#musicTitle')).toContainText("Tchaikovsky");
  });

  test('forward with shuffle changes track', async ({ page }) => {
    await enableShuffle(page);

    // Press forward multiple times - with shuffle, each should differ from previous
    const titles = [await page.locator('#musicTitle').textContent()];
    for (let i = 0; i < 5; i++) {
      await page.locator('#musicNext').click();
      await page.waitForTimeout(800);
      titles.push(await page.locator('#musicTitle').textContent());
    }

    // With shuffle on, track should change each time (never same as previous)
    for (let i = 1; i < titles.length; i++) {
      expect(titles[i]).not.toBe(titles[i - 1]);
    }
  });

  test('rewind after shuffle forward returns to previous track', async ({ page }) => {
    await enableShuffle(page);

    const firstTitle = await page.locator('#musicTitle').textContent();

    // Go forward (shuffle picks random)
    await page.locator('#musicNext').click();
    await page.waitForTimeout(800);
    const shuffledTitle = await page.locator('#musicTitle').textContent();
    expect(shuffledTitle).not.toBe(firstTitle);

    // Go back - should return to the original track via history
    await page.locator('#musicPrev').click();
    await page.waitForTimeout(800);
    const backTitle = await page.locator('#musicTitle').textContent();
    expect(backTitle).toBe(firstTitle);
  });

  test('shuffle history supports multi-step back navigation', async ({ page }) => {
    await enableShuffle(page);

    // Record track at each step
    const track0 = await page.locator('#musicTitle').textContent();

    await page.locator('#musicNext').click();
    await page.waitForTimeout(800);
    const track1 = await page.locator('#musicTitle').textContent();

    await page.locator('#musicNext').click();
    await page.waitForTimeout(800);

    // Navigate back two steps
    await page.locator('#musicPrev').click();
    await page.waitForTimeout(800);
    expect(await page.locator('#musicTitle').textContent()).toBe(track1);

    await page.locator('#musicPrev').click();
    await page.waitForTimeout(800);
    expect(await page.locator('#musicTitle').textContent()).toBe(track0);
  });

  test('repeat one restarts current track on forward', async ({ page }) => {
    await setRepeatMode(page, 'one');

    const currentTitle = await page.locator('#musicTitle').textContent();

    // Forward should keep same track (repeat one)
    await page.locator('#musicNext').click();
    await page.waitForTimeout(800);

    expect(await page.locator('#musicTitle').textContent()).toBe(currentTitle);
  });

  test('chillout track forward navigates within category queue', async ({ page }) => {
    // Open chillout library and play a lofi track
    await page.locator('#sidebarLibraryBtn').click();
    await page.waitForTimeout(500);

    // Filter to lofi for predictable results
    await page.click('[data-filter="lofi"]');
    await page.waitForTimeout(300);

    // Click first lofi track
    await page.locator('.chillout-card').first().click();
    await page.waitForTimeout(1000);

    const firstChillTitle = await page.locator('#musicTitle').textContent();
    expect(firstChillTitle).toBeTruthy();

    // Forward should go to next track in the lofi category queue
    await page.locator('#musicNext').click();
    await page.waitForTimeout(800);

    const secondChillTitle = await page.locator('#musicTitle').textContent();
    expect(secondChillTitle).not.toBe(firstChillTitle);
  });

  test('chillout track rewind goes to previous in queue', async ({ page }) => {
    // Play a chillout track
    await page.locator('#sidebarLibraryBtn').click();
    await page.waitForTimeout(500);
    await page.click('[data-filter="focus"]');
    await page.waitForTimeout(300);
    await page.locator('.chillout-card').first().click();
    await page.waitForTimeout(1000);

    const firstTitle = await page.locator('#musicTitle').textContent();

    // Go forward
    await page.locator('#musicNext').click();
    await page.waitForTimeout(800);
    const secondTitle = await page.locator('#musicTitle').textContent();
    expect(secondTitle).not.toBe(firstTitle);

    // Rewind back
    await page.locator('#musicPrev').click();
    await page.waitForTimeout(800);
    expect(await page.locator('#musicTitle').textContent()).toBe(firstTitle);
  });
});
