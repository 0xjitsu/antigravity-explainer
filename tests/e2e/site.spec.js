// @ts-check
const { test, expect } = require('@playwright/test');

test.describe('Anti-Gravity Explainer Site', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    // Wait for page to be fully loaded
    await page.waitForLoadState('networkidle');
  });

  test('should load the page with correct title', async ({ page }) => {
    await expect(page).toHaveTitle(/Anti-Gravity/);
  });

  test('should display the navigation bar', async ({ page }) => {
    const nav = page.locator('.glass-nav');
    await expect(nav).toBeVisible();
    await expect(nav.locator('.logo')).toHaveText('ANTI-GRAVITY');
  });

  test('should display the hero section', async ({ page }) => {
    const hero = page.locator('#hero');
    await expect(hero).toBeVisible();
    await expect(page.locator('.glitch-text')).toHaveAttribute('data-text', 'AGENTIC CODING');
  });

  test('should display all three concept cards', async ({ page }) => {
    const cards = page.locator('.glass-card');
    await expect(cards).toHaveCount(3);
  });

  test('should display The Inbox card', async ({ page }) => {
    const inboxCard = page.locator('.glass-card').first();
    await expect(inboxCard.locator('h3')).toHaveText('The Inbox');
  });

  test('should display The Playground card', async ({ page }) => {
    const playgroundCard = page.locator('.glass-card').nth(1);
    await expect(playgroundCard.locator('h3')).toHaveText('The Playground');
  });

  test('should display Workspaces card', async ({ page }) => {
    const workspacesCard = page.locator('.glass-card').nth(2);
    await expect(workspacesCard.locator('h3')).toHaveText('Workspaces');
  });

  test('should display the storage section', async ({ page }) => {
    const storageSection = page.locator('#storage');
    await expect(storageSection).toBeVisible();
  });

  test('should display the Git protocol button', async ({ page }) => {
    const btn = page.locator('.action-btn');
    await expect(btn).toHaveText('INITIATE GIT PROTOCOL');
  });

  test('should have canvas element', async ({ page }) => {
    const canvas = page.locator('#bg-canvas');
    await expect(canvas).toBeAttached();
  });

  test('should display footer', async ({ page }) => {
    const footer = page.locator('footer');
    await expect(footer).toContainText('ANTI-GRAVITY CONSOLE');
  });

  test('should have proper HTML structure', async ({ page }) => {
    const h1 = page.locator('h1');
    await expect(h1).toHaveCount(1);
    await expect(page.locator('html')).toHaveAttribute('lang', 'en');
  });
});
