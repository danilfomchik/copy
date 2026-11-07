import { test, expect } from '@playwright/test';
import { appendFileSync, cpSync, mkdtempSync } from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { ROOT } from './helpers/paths';
import { servePreview } from './helpers/build';

const IOS_UA =
  'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1';
const HINT = /Поділитися/;

test.describe('iOS install hint', () => {
  test.use({ userAgent: IOS_UA });

  test('shows once, can be dismissed, and stays dismissed', async ({ page }) => {
    await page.goto('./');
    await expect(page.getByText(HINT)).toBeVisible();
    await page.getByRole('button', { name: 'Зрозуміло' }).click();
    await expect(page.getByText(HINT)).toBeHidden();
    await page.reload();
    await expect(page.getByRole('region', { name: 'ID користувача' })).toBeVisible();
    await expect(page.getByText(HINT)).toBeHidden();
    expect(await page.evaluate(() => localStorage.getItem('orbit.installHintDismissed'))).toBeTruthy();
  });

  test('is not shown when already installed (standalone)', async ({ page }) => {
    await page.addInitScript(() => {
      Object.defineProperty(navigator, 'standalone', { value: true });
    });
    await page.goto('./');
    await expect(page.getByRole('region', { name: 'ID користувача' })).toBeVisible();
    await expect(page.getByText(HINT)).toBeHidden();
  });
});

test('the iOS hint is not shown on other platforms', async ({ page }) => {
  await page.goto('./');
  await expect(page.getByRole('region', { name: 'ID користувача' })).toBeVisible();
  await expect(page.getByText(HINT)).toBeHidden();
});

test('the Android install prompt is offered through an in-app control', async ({ page }) => {
  await page.goto('./');
  const button = page.getByRole('button', { name: 'Встановити застосунок' });
  await expect(button).toBeHidden();
  await page.evaluate(() => {
    const e = new Event('beforeinstallprompt', { cancelable: true });
    (e as any).prompt = () => {
      (window as any).__prompted = true;
      return Promise.resolve();
    };
    (e as any).userChoice = Promise.resolve({ outcome: 'accepted' });
    window.dispatchEvent(e);
  });
  await expect(button).toBeVisible();
  await button.click();
  expect(await page.evaluate(() => (window as any).__prompted)).toBe(true);
  await expect(button).toBeHidden();
});

test('update banner appears for a waiting worker and reloads only when the user chooses', async ({
  page,
}) => {
  const dir = mkdtempSync(path.join(tmpdir(), 'orbit-update-'));
  cpSync(path.join(ROOT, 'dist'), dir, { recursive: true });
  const server = await servePreview(dir, 4310);
  try {
    await page.goto(server.url);
    await page.evaluate(() => navigator.serviceWorker.ready);
    await expect.poll(() => page.evaluate(() => !!navigator.serviceWorker.controller)).toBe(true);
    await expect(page.getByText('Доступне оновлення')).toBeHidden();
    await page.evaluate(() => ((window as any).__marker = 'same-page'));

    // publish a new version: the worker file changes
    appendFileSync(path.join(dir, 'sw.js'), '\n// v2\n');
    await page.evaluate(() => navigator.serviceWorker.getRegistration().then((r) => r!.update()));

    await expect(page.getByText('Доступне оновлення')).toBeVisible();
    // never reloads on its own
    await page.waitForTimeout(1000);
    expect(await page.evaluate(() => (window as any).__marker)).toBe('same-page');

    await page.getByRole('button', { name: 'Перезавантажити' }).click();
    await expect(page.getByRole('region', { name: 'ID користувача' })).toBeVisible();
    await expect.poll(() => page.evaluate(() => (window as any).__marker).catch(() => 'busy')).toBeUndefined();
    await expect(page.getByText('Доступне оновлення')).toBeHidden();
  } finally {
    server.stop();
  }
});
