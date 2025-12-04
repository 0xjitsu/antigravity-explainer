// @ts-check
const { test, expect } = require('@playwright/test');

test.describe('Anti-Gravity Explainer Site', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test.describe('Page Load', () => {
    test('should load the page with correct title', async ({ page }) => {
      await expect(page).toHaveTitle(/Anti-Gravity/);
    });

    test('should display the navigation bar', async ({ page }) => {
      const nav = page.locator('.glass-nav');
      await expect(nav).toBeVisible();
      await expect(nav.locator('.logo')).toHaveText('ANTI-GRAVITY');
      await expect(nav.locator('.status-indicator')).toContainText('System Active');
    });

    test('should display the hero section', async ({ page }) => {
      const hero = page.locator('#hero');
      await expect(hero).toBeVisible();
      // Check data-text attribute since glitch animation may alter visible text
      await expect(page.locator('.glitch-text')).toHaveAttribute('data-text', 'AGENTIC CODING');
      await expect(page.locator('.subtitle')).toBeVisible();
    });
  });

  test.describe('Concept Cards', () => {
    test('should display all three concept cards', async ({ page }) => {
      const cards = page.locator('.glass-card');
      await expect(cards).toHaveCount(3);
    });

    test('should display The Inbox card', async ({ page }) => {
      const inboxCard = page.locator('.glass-card').first();
      await expect(inboxCard.locator('h3')).toHaveText('The Inbox');
      await expect(inboxCard.locator('.mono-text')).toHaveText('COMMAND CENTER');
    });

    test('should display The Playground card', async ({ page }) => {
      const playgroundCard = page.locator('.glass-card').nth(1);
      await expect(playgroundCard.locator('h3')).toHaveText('The Playground');
      await expect(playgroundCard.locator('.mono-text')).toHaveText('SANDBOX ENVIRONMENT');
    });

    test('should display Workspaces card', async ({ page }) => {
      const workspacesCard = page.locator('.glass-card').nth(2);
      await expect(workspacesCard.locator('h3')).toHaveText('Workspaces');
      await expect(workspacesCard.locator('.mono-text')).toHaveText('PRODUCTION ZONES');
    });
  });

  test.describe('Storage Section', () => {
    test('should display the storage model diagram', async ({ page }) => {
      const storageSection = page.locator('#storage');
      await expect(storageSection).toBeVisible();
      await expect(storageSection.locator('.node.local')).toBeVisible();
      await expect(storageSection.locator('.node.cloud')).toBeVisible();
    });

    test('should display the Git protocol panel', async ({ page }) => {
      const highlightPanel = page.locator('.highlight-panel');
      await expect(highlightPanel).toBeVisible();
      await expect(highlightPanel.locator('h2')).toHaveText('Go Quantum (Portable)');
      await expect(highlightPanel.locator('.action-btn')).toHaveText('INITIATE GIT PROTOCOL');
    });
  });

  test.describe('Canvas Animation', () => {
    test('should have canvas element present', async ({ page }) => {
      const canvas = page.locator('#bg-canvas');
      await expect(canvas).toBeVisible();
    });

    test('should initialize canvas with correct dimensions', async ({ page }) => {
      const canvas = page.locator('#bg-canvas');
      const viewportSize = page.viewportSize();

      const canvasWidth = await canvas.evaluate(el => el.width);
      const canvasHeight = await canvas.evaluate(el => el.height);

      expect(canvasWidth).toBe(viewportSize.width);
      expect(canvasHeight).toBe(viewportSize.height);
    });
  });

  test.describe('Card Interactions', () => {
    test('should apply 3D transform on card hover', async ({ page }) => {
      const card = page.locator('.tilt-card').first();

      // Get initial transform
      const initialTransform = await card.evaluate(el =>
        window.getComputedStyle(el).transform
      );

      // Hover over card center
      const box = await card.boundingBox();
      await page.mouse.move(
        box.x + box.width / 2 + 20,
        box.y + box.height / 2 + 20
      );

      // Wait for transform to apply
      await page.waitForTimeout(150);

      const hoverTransform = await card.evaluate(el =>
        window.getComputedStyle(el).transform
      );

      // Transform should change on hover
      expect(hoverTransform).not.toBe(initialTransform);
    });
  });

  test.describe('Responsive Design', () => {
    test('should adapt layout for mobile viewport', async ({ page }) => {
      await page.setViewportSize({ width: 375, height: 667 });

      // Check that split section stacks vertically
      const splitSection = page.locator('.split-section');
      const computedStyle = await splitSection.evaluate(el =>
        window.getComputedStyle(el).gridTemplateColumns
      );

      // Should be single column on mobile
      expect(computedStyle).toBe('1fr');
    });

    test('should resize hero title on mobile', async ({ page }) => {
      await page.setViewportSize({ width: 375, height: 667 });

      const heroTitle = page.locator('.glitch-text');
      const fontSize = await heroTitle.evaluate(el =>
        window.getComputedStyle(el).fontSize
      );

      // Should be smaller than desktop (5rem = 80px)
      expect(parseInt(fontSize)).toBeLessThan(80);
    });
  });

  test.describe('Footer', () => {
    test('should display footer with version', async ({ page }) => {
      const footer = page.locator('footer');
      await expect(footer).toBeVisible();
      await expect(footer).toContainText('ANTI-GRAVITY CONSOLE // V1.0');
    });
  });

  test.describe('Accessibility', () => {
    test('should have proper heading hierarchy', async ({ page }) => {
      const h1 = page.locator('h1');
      const h2s = page.locator('h2');

      await expect(h1).toHaveCount(1);
      expect(await h2s.count()).toBeGreaterThan(0);
    });

    test('should have lang attribute on html', async ({ page }) => {
      const html = page.locator('html');
      await expect(html).toHaveAttribute('lang', 'en');
    });
  });

  // Visual regression tests - skip on CI without baseline snapshots
  // Run locally with: npm test -- --update-snapshots to generate baselines
  test.describe.skip('Visual Regression', () => {
    test('hero section should match snapshot', async ({ page }) => {
      const hero = page.locator('#hero');
      await expect(hero).toHaveScreenshot('hero-section.png', {
        maxDiffPixels: 100,
      });
    });

    test('cards section should match snapshot', async ({ page }) => {
      const cards = page.locator('#concepts');
      await expect(cards).toHaveScreenshot('cards-section.png', {
        maxDiffPixels: 100,
      });
    });
  });
});
