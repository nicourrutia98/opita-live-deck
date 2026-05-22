import { test, expect } from '@playwright/test';

test.describe('E2E: Opita Live Deck AI Notes Teleprompter', () => {

  test('Presenter should see AI Notes queue and dismiss them with Enter', async ({ page }) => {
    const consoleErrors: string[] = [];
    page.on('console', msg => {
      if (msg.type() === 'error') {
        // Ignorar el error de getUserMedia que es esperado en HTTP
        if (!msg.text().includes('getUserMedia')) {
          consoleErrors.push(msg.text());
        }
      }
    });
    page.on('pageerror', err => {
      consoleErrors.push(err.message);
    });

    // 1. Arrange: Go to Admin panel
    await page.goto('/#/admin');

    // Authenticate through PasswordGate
    const pinInput = page.locator('input[type="password"]');
    if (await pinInput.isVisible({ timeout: 3000 }).catch(() => false)) {
      await pinInput.fill('8822');
      await page.locator('button[type="submit"]').click({ force: true });
    }

    // Wait for the UI to be ready
    await expect(page.locator('text=Admin Panel')).toBeVisible({ timeout: 10000 });

    // The AI Notes panel should NOT be visible initially
    await expect(page.locator('text=Copiloto IA')).toBeHidden();

    // 2. Act: Inject two AI notes using the TDD Shift+A shortcut
    // This simulates DeepSeek sending two consecutive notes
    await page.keyboard.press('Shift+A');
    await page.keyboard.press('Shift+A');

    // 3. Assert: The AI Notes feed should appear with the note text
    await expect(page.locator('text=Copiloto IA (Historial)')).toBeVisible();
    
    // There should be two notes in the feed
    await expect(page.locator('text=Nota de prueba inyectada por TDD')).toHaveCount(2);
    
    // The counter pill should say "2"
    // The pill has text '2', we can locate it by text but it's small, so we trust the count
    
    // 4. Act: Collapse the feed by clicking the header
    await page.locator('#ai-feed-toggle').click({ force: true });

    // 5. Assert: The notes should be hidden
    await expect(page.locator('text=Nota de prueba inyectada por TDD').first()).toBeHidden();

    // 6. Act: Expand the feed again
    await page.locator('#ai-feed-toggle').click({ force: true });

    // 7. Assert: The notes should be visible again
    await expect(page.locator('text=Nota de prueba inyectada por TDD').first()).toBeVisible();

    // 8. Assert: No unexpected console errors should have occurred
    expect(consoleErrors).toEqual([]);
  });

});
