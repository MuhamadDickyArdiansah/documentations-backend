import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

test('homepage, theme persistence, search and article navigation', async ({ page }) => {
  const errors: string[] = [];
  page.on('pageerror', e => errors.push(e.message));
  await page.setViewportSize({ width: 1440, height: 1000 });
  await page.goto('/');
  await expect(page.getByRole('heading', { name: 'Dari konsep ke production.' })).toBeVisible();
  await expect(page.locator('.category-card')).toHaveCount(15);
  await page.screenshot({ path: 'test-results/home-desktop.png' });
  await page.getByRole('button', { name: 'Ganti tema terang atau gelap' }).click();
  await expect(page.locator('html')).toHaveClass(/dark/);
  await page.reload();
  await expect(page.locator('html')).toHaveClass(/dark/);
  await page.screenshot({ path: 'test-results/home-dark.png' });
  await page.getByRole('button', { name: 'Ganti tema terang atau gelap' }).click();
  await page.keyboard.press('Control+k');
  const input = page.getByRole('dialog').getByRole('combobox');
  await expect(input).toBeVisible();
  await input.fill('refresh token');
  await expect(page.getByRole('dialog').getByRole('option').filter({ hasText: /refresh/i }).first()).toBeVisible({ timeout: 20000 });
  await page.keyboard.press('ArrowDown');
  await page.keyboard.press('Enter');
  await expect(page).toHaveURL(/\/docs\//);
  await page.goto('/docs/getting-started/first-backend-application');
  await expect(page.getByRole('heading', { name: 'First Backend Application', exact: true })).toBeVisible();
  await expect(page.locator('h2#referensi')).toBeVisible();
  await expect(page.locator('.prose a[href="https://expressjs.com/en/guide/routing/"]')).toHaveCount(1);
  await page.locator('h2#referensi').scrollIntoViewIfNeeded();
  await page.screenshot({ path: 'test-results/references-desktop.png' });
  const tabs = page.getByRole('tab', { name: 'TypeScript', exact: true });
  await tabs.first().click();
  await expect(page.locator('[role="tabpanel"][data-state="active"]').first()).toContainText('type Request');
  await page.screenshot({ path: 'test-results/article-desktop.png' });
  expect(errors).toEqual([]);
});

test('copy command uses the selected package manager', async ({ page, context }) => {
  await context.grantPermissions(['clipboard-read', 'clipboard-write']);
  await page.goto('/');
  await page.getByRole('tab', { name: 'pnpm', exact: true }).click();
  await page.getByRole('button', { name: 'Salin perintah instalasi' }).click();
  await expect.poll(() => page.evaluate(() => navigator.clipboard.readText())).toBe('pnpm add express');
  await page.goto('/docs/getting-started/first-backend-application');
  await page.getByRole('button', { name: 'Salin kode', exact: true }).first().click();
  await expect.poll(() => page.evaluate(() => navigator.clipboard.readText())).toContain('npm install express@5');
});

test('mobile navigation, article TOC and horizontal overflow', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/');
  await expect(page.getByRole('heading', { name: 'Dari konsep ke production.' })).toBeVisible();
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
  await page.screenshot({ path: 'test-results/home-mobile.png', fullPage: true });
  await page.locator('#nd-subnav button').last().click();
  await expect(page.getByRole('complementary')).toBeVisible();
  await expect(page.getByRole('complementary').getByText('Getting Started', { exact: true })).toBeVisible();
  await page.getByRole('complementary').getByRole('button', { name: /Close Sidebar|Tutup navigasi/ }).first().click();
  await page.goto('/docs/authentication/jwt-authentication');
  await expect(page.getByRole('heading', { name: 'JWT Authentication', exact: true })).toBeVisible();
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
  await page.screenshot({ path: 'test-results/article-mobile.png' });
});

test('core pages meet automated WCAG AA checks', async ({ page }) => {
  for (const route of ['/', '/docs/getting-started/first-backend-application']) {
    await page.goto(route);
    const results = await new AxeBuilder({ page }).withTags(['wcag2a','wcag2aa','wcag21aa','wcag22aa']).analyze();
    expect(results.violations.map(v => ({ id: v.id, nodes: v.nodes.map(n => n.target) }))).toEqual([]);
  }
});

test('SEO routes and invalid article', async ({ request }) => {
  expect((await request.get('/sitemap.xml')).status()).toBe(200);
  expect((await request.get('/robots.txt')).status()).toBe(200);
  expect((await request.get('/opengraph-image')).status()).toBe(200);
  expect((await request.get('/docs/does-not-exist')).status()).toBe(404);
  const search = await request.get('/api/search?query=JWT');
  expect(search.status()).toBe(200);
  expect(await search.json()).not.toEqual([]);
});
