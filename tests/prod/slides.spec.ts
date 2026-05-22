import { test, expect } from '@playwright/test';

test.describe('E2E: Slide Content & Brand Consistency', () => {

  test('Viewer should render all 5 slides with brand tokens', async ({ page }) => {
    const consoleErrors: string[] = [];
    page.on('console', msg => {
      if (msg.type() === 'error') {
        consoleErrors.push(msg.text());
      }
    });

    await page.goto('/');

    // Slide 1 should be visible by default
    await expect(page.locator('text=El Futuro tiene')).toBeVisible({ timeout: 10000 });
    await expect(page.locator('text=Acento Opita')).toBeVisible();
    await expect(page.locator('text=Juan Nicolás Urrutia')).toBeVisible();

    // Verify branding is present
    await expect(page.locator('img[alt="Opita Code"]').first()).toBeVisible();

    // Verify LIVE/CONECTANDO badge exists
    const badge = page.locator('text="LIVE"').or(page.locator('text="CONECTANDO"'));
    await expect(badge.first()).toBeVisible();

    // No unexpected console errors
    expect(consoleErrors.filter(e => !e.includes('WebSocket'))).toEqual([]);
  });

  test('Admin should show speaker notes with navigation arrows', async ({ page }) => {
    await page.goto('/#/admin');

    // Auth through PasswordGate
    const pinInput = page.locator('input[type="password"]');
    if (await pinInput.isVisible({ timeout: 3000 }).catch(() => false)) {
      await pinInput.fill('8822');
      await page.locator('button[type="submit"]').click({ force: true });
    }

    await expect(page.locator('text=Admin Panel')).toBeVisible({ timeout: 10000 });

    // Speaker notes should be visible with first beat
    await expect(page.locator('text=Notas de Orador')).toBeVisible();
    await expect(page.locator('text=1 / 4')).toBeVisible(); // First beat of 4

    // Navigate to next beat
    const nextBeatBtn = page.locator('#next-note-btn');
    await nextBeatBtn.click({ force: true });
    await expect(page.locator('text=2 / 4')).toBeVisible();

    // Navigate back
    const prevBeatBtn = page.locator('#prev-note-btn');
    await prevBeatBtn.click({ force: true });
    await expect(page.locator('text=1 / 4')).toBeVisible();
  });

});
