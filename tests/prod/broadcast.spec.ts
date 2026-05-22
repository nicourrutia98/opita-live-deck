import { test, expect } from '@playwright/test';

test.describe('E2E: Opita Live Deck Broadcast', () => {
  
  test('Presenter should be able to broadcast slide changes to the Viewer', async ({ browser }) => {
    // 1. Arrange: Open two independent contexts to simulate two different devices
    const presenterContext = await browser.newContext();
    const viewerContext = await browser.newContext();

    const presenterPage = await presenterContext.newPage();
    const viewerPage = await viewerContext.newPage();

    presenterPage.on('console', msg => console.log('PRESENTER:', msg.text()));
    presenterPage.on('pageerror', err => console.log('PRESENTER ERROR:', err));
    viewerPage.on('console', msg => console.log('VIEWER:', msg.text()));
    viewerPage.on('pageerror', err => console.log('VIEWER ERROR:', err));

    // 2. Act: Both navigate to the production app
    const roomId = `test-room-${Math.random().toString(36).substring(2, 9)}`;
    await Promise.all([
      presenterPage.goto(`/?room=${roomId}#/admin`),
      viewerPage.goto(`/?room=${roomId}#/`)
    ]);

    // Authenticate presenter through PasswordGate
    const pinInput = presenterPage.locator('input[type="password"]');
    if (await pinInput.isVisible({ timeout: 3000 }).catch(() => false)) {
      await pinInput.fill('8822');
      await presenterPage.locator('button[type="submit"]').click({ force: true });
    }

    // Wait for WebSocket connection status (LIVE) on both
    await expect(presenterPage.locator('text="LIVE"')).toBeVisible({ timeout: 15000 });
    await expect(viewerPage.locator('text="LIVE"')).toBeVisible({ timeout: 15000 });

    // Reset to slide 1 — PartyKit persists state, so we can't assume slide 1.
    // Click "Anterior" until disabled (we're at slide 1)
    const prevButton = presenterPage.locator('#prev-slide-btn');
    while (await prevButton.isEnabled()) {
      await prevButton.click({ force: true });
      await presenterPage.waitForTimeout(300);
    }

    // Wait for Viewer to sync to slide 1
    await expect(viewerPage.locator('text=El Futuro tiene')).toBeVisible({ timeout: 10000 });

    // Presenter clicks "Siguiente" → slide 2
    const nextButton = presenterPage.locator('#next-slide-btn');
    await nextButton.click({ force: true });

    // Viewer should receive broadcast → slide 2 content
    await expect(viewerPage.locator('text=Ingeniería')).toBeVisible({ timeout: 10000 });

    // Presenter clicks "Anterior" → back to slide 1
    await prevButton.click({ force: true });

    // Viewer syncs back to slide 1
    await expect(viewerPage.locator('text=El Futuro tiene')).toBeVisible({ timeout: 10000 });

    // Cleanup
    await presenterContext.close();
    await viewerContext.close();
  });

});
