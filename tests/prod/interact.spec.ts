import { test, expect } from '@playwright/test';

test.describe('E2E: Opita Live Deck Audience Interaction', () => {
  
  test('Audience interaction syncs chat and demo roles across Presenter, Mobile Companion and Viewer', async ({ browser }) => {
    // 1. Arrange: Create three independent contexts to simulate Presenter, Viewer, and Mobile Companion
    const presenterContext = await browser.newContext();
    const viewerContext = await browser.newContext();
    const interactContext = await browser.newContext();

    const presenterPage = await presenterContext.newPage();
    const viewerPage = await viewerContext.newPage();
    const interactPage = await interactContext.newPage();

    presenterPage.on('console', msg => console.log('PRESENTER:', msg.text()));
    presenterPage.on('pageerror', err => console.log('PRESENTER ERROR:', err));
    viewerPage.on('console', msg => console.log('VIEWER:', msg.text()));
    viewerPage.on('pageerror', err => console.log('VIEWER ERROR:', err));
    interactPage.on('console', msg => console.log('INTERACT:', msg.text()));
    interactPage.on('pageerror', err => console.log('INTERACT ERROR:', err));

    // 2. Act: Navigate to their respective endpoints
    await Promise.all([
      presenterPage.goto('/#/admin'),
      viewerPage.goto('/#/'),
      interactPage.goto('/#/interact')
    ]);

    // Authenticate presenter through PasswordGate
    const pinInput = presenterPage.locator('input[type="password"]');
    if (await pinInput.isVisible({ timeout: 3000 }).catch(() => false)) {
      await pinInput.fill('8822');
      await presenterPage.locator('button[type="submit"]').click({ force: true });
    }

    // Wait for the admin panel layout to load
    await expect(presenterPage.locator('text=Admin Panel')).toBeVisible({ timeout: 10000 });

    // Login in Mobile Companion
    const usernameInput = interactPage.locator('input[placeholder="Tu apodo o iniciales"]');
    await expect(usernameInput).toBeVisible({ timeout: 10000 });
    await usernameInput.fill('TestUser');
    await interactPage.locator('button:has-text("Conectarse")').click({ force: true });

    // Wait for connection to establish on all pages (LIVE badge)
    await expect(presenterPage.locator('text="LIVE"')).toBeVisible({ timeout: 15000 });
    await expect(viewerPage.locator('text="LIVE"')).toBeVisible({ timeout: 15000 });
    await expect(interactPage.locator('text="LIVE"')).toBeVisible({ timeout: 15000 });

    // Reset presenter to slide 1
    const prevButton = presenterPage.locator('button:has-text("Anterior")').first();
    while (await prevButton.isEnabled()) {
      await prevButton.click({ force: true });
      await presenterPage.waitForTimeout(300);
    }

    // --- Part 1: Chat Message Sychronization ---
    const chatMsg = 'Hola desde el movil e2e!';
    await interactPage.locator('input[placeholder="Haz una pregunta o reacciona..."]').fill(chatMsg);
    await interactPage.locator('input[placeholder="Haz una pregunta o reacciona..."]').press('Enter');

    // Message should be visible in Mobile Companion list
    await expect(interactPage.locator(`text=${chatMsg}`)).toBeVisible({ timeout: 10000 });

    // Message should be visible in Presenter's sidebar monitor
    await expect(presenterPage.locator(`text=${chatMsg}`)).toBeVisible({ timeout: 10000 });

    // Message should be visible in Viewer's ticker overlay
    await expect(viewerPage.locator(`text=${chatMsg}`)).toBeVisible({ timeout: 10000 });

    // --- Part 2: Demo Role Input Grid ---
    // Navigate presenter to slide 7
    const nextButton = presenterPage.locator('button:has-text("Siguiente")').first();
    for (let i = 1; i <= 8; i++) {
      const slideText = await presenterPage.locator('text=Diapositiva').textContent();
      if (slideText?.includes('7')) {
        break;
      }
      if (await nextButton.isEnabled()) {
        await nextButton.click({ force: true });
        await presenterPage.waitForTimeout(300);
      }
    }

    // Verify Mobile Companion shows the contextual form for Slide 7
    await expect(interactPage.locator('text=¿Cuál es tu rol ideal en tecnología?')).toBeVisible({ timeout: 10000 });

    // Toggle demo mode in Presenter
    const demoModeBtn = presenterPage.locator('button:has-text("Lanzar Input Interactivo")');
    await demoModeBtn.click({ force: true });

    // Verify Viewer page displays "Conexiones en Vivo" or "Esperando respuestas"
    await expect(viewerPage.locator('text=¿Qué sabes hacer?')).toBeVisible({ timeout: 10000 });

    // Input dev role in Mobile Companion
    const roleInput = interactPage.locator('input[placeholder="Ej: DevOps Lead, Fullstack, Frontend Jr"]');
    await roleInput.fill('Fullstack Wizard E2E');
    await interactPage.locator('button:has-text("Enviar a la Demo")').click({ force: true });

    // Confirm success message in Mobile
    await expect(interactPage.locator('text=¡Enviado con éxito! Revisa la pantalla principal.')).toBeVisible({ timeout: 10000 });

    // Verify role appears in Viewer grid
    await expect(viewerPage.locator('text=Fullstack Wizard E2E')).toBeVisible({ timeout: 10000 });

    // --- Part 3: Data Wipe / Limpiar Todo ---
    // Click "Limpiar Todo" in Presenter panel
    await presenterPage.locator('button:has-text("Limpiar Todo")').click({ force: true });

    // Verify chat messages and roles are cleared
    // In Presenter, the sidebar shows "No hay mensajes aún."
    await expect(presenterPage.locator('text=No hay mensajes aún.')).toBeVisible({ timeout: 10000 });

    // In Mobile, the chat shows "¡Sé el primero en enviar un mensaje en el Live!"
    await expect(interactPage.locator('text=¡Sé el primero en enviar un mensaje en el Live!')).toBeVisible({ timeout: 10000 });

    // In Viewer, the demo roles show "Esperando respuestas de la audiencia..."
    await expect(viewerPage.locator('text=Esperando respuestas de la audiencia...')).toBeVisible({ timeout: 10000 });

    // Cleanup
    await presenterContext.close();
    await viewerContext.close();
    await interactContext.close();
  });

});
