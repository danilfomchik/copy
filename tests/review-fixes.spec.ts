import { test, expect, type Page } from '@playwright/test';
import path from 'node:path';
import { buildWith, readContent, writeTempContent } from './helpers/build';

const content = readContent();
const a = content.ui.card.actions;
const dialog = (page: Page) => page.getByRole('dialog', { name: a.sheetLabel });
const focusInDialog = (page: Page) => page.evaluate(() => !!document.activeElement?.closest('[role=dialog]'));

test.describe('light theme sheet backdrop', () => {
  test.use({ colorScheme: 'light' });
  test('the sheet backdrop is dimmed', async ({ page }) => {
    await page.goto('./');
    await page.getByRole('button', { name: a.openLabel }).click();
    const bg = await page.locator('.sheet-backdrop').evaluate((e) => getComputedStyle(e).backgroundColor);
    expect(bg).toBe('rgba(0, 0, 0, 0.45)');
  });
});

test('a malformed URL escape falls back to the card instead of throwing', async ({ page }) => {
  const errors: string[] = [];
  page.on('pageerror', (e) => errors.push(e.message));
  await page.goto('./#/services/%');
  await expect(page.getByRole('region', { name: 'Картка учасника' })).toBeVisible();
  expect(errors).toEqual([]);
});

test.describe('sheet focus management', () => {
  test('focus moves in, Tab is trapped, focus returns to the opener on close', async ({ page }) => {
    await page.goto('./');
    const opener = page.getByRole('button', { name: a.openLabel });
    await opener.focus();
    await opener.click();
    await expect(dialog(page)).toBeVisible();
    expect(await focusInDialog(page)).toBe(true);
    for (let i = 0; i < 8; i++) {
      await page.keyboard.press('Tab');
      expect(await focusInDialog(page)).toBe(true);
    }
    for (let i = 0; i < 8; i++) {
      await page.keyboard.press('Shift+Tab');
      expect(await focusInDialog(page)).toBe(true);
    }
    await page.keyboard.press('Escape');
    await expect(dialog(page)).toHaveCount(0);
    await expect(opener).toBeFocused();
  });
  test('a route change closes the sheet', async ({ page }) => {
    await page.goto('./');
    await page.getByRole('button', { name: a.openLabel }).click();
    await expect(dialog(page)).toBeVisible();
    await page.evaluate(() => {
      location.hash = '#/services';
    });
    await expect(dialog(page)).toHaveCount(0);
  });
});

test('route change resets scroll and moves focus to the screen heading', async ({ page }) => {
  await page.goto('./#/services');
  await page.evaluate(() => {
    document.body.style.minHeight = '3000px';
    window.scrollTo(0, 500);
  });
  await page.getByRole('link', { name: content.ui.tabs.listings }).click();
  await expect(page.locator('#screen h1')).toBeFocused();
  expect(await page.evaluate(() => window.scrollY)).toBe(0);
});

test('theme-color meta follows the in-app theme', async ({ page }) => {
  await page.goto('./#/menu/settings');
  const metas = () =>
    page.evaluate(() => [...document.querySelectorAll('meta[name=theme-color]')].map((m) => m.getAttribute('content')));
  await page.getByRole('radio', { name: content.menu.settings.dark, exact: true }).check();
  expect(await metas()).toEqual(['#0c1315', '#0c1315']);
  await page.getByRole('radio', { name: content.menu.settings.light, exact: true }).check();
  expect(await metas()).toEqual(['#0f766e', '#0f766e']);
});

test('the validator rejects duplicate ids and empty paragraphs', () => {
  test.setTimeout(120_000);
  const c = readContent();
  c.services.push({ ...c.services[0] });
  c.listings[0].paragraphs = [];
  const { dir, file } = writeTempContent(c);
  const r = buildWith(file, path.join(dir, 'dist'));
  expect(r.ok).toBe(false);
  expect(r.output).toContain('повторюється');
  expect(r.output).toContain('content.listings[0].paragraphs');
});
