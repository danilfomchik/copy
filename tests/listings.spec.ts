import { test, expect } from '@playwright/test';
import path from 'node:path';
import { buildWith, readContent, servePreview, writeTempContent } from './helpers/build';

test('Listings tab shows 5 rows; each opens its detail page and back returns to the list', async ({ page }) => {
  await page.goto('./#/listings');
  const list = page.getByRole('list', { name: 'Оголошення' });
  const rows = list.getByRole('link');
  await expect(rows).toHaveCount(5);

  const content = readContent();
  for (const [i, l] of content.listings.entries()) {
    await rows.nth(i).click();
    await expect(page.getByRole('heading', { level: 1, name: l.title })).toBeVisible();
    await expect(page.getByText(l.description, { exact: true })).toBeVisible();
    for (const p of l.paragraphs) await expect(page.getByText(p, { exact: true })).toBeVisible();
    await expect(
      page.getByRole('navigation', { name: 'Головна навігація' }).getByRole('link', { name: 'Оголошення' }),
    ).toHaveAttribute('aria-current', 'page');
    await page.getByRole('link', { name: 'Назад' }).click();
    await expect(list.getByRole('link')).toHaveCount(5);
  }
});

test('Listings render as stacked rows, unlike the two-column Services grid', async ({ page }) => {
  await page.goto('./#/listings');
  const rows = page.getByRole('list', { name: 'Оголошення' }).getByRole('link');
  const a = await rows.nth(0).boundingBox();
  const b = await rows.nth(1).boundingBox();
  expect(Math.abs(a!.x - b!.x)).toBeLessThan(2);
  expect(b!.y).toBeGreaterThan(a!.y);
});

test('adding a listing to the Content file adds a row', async ({ page }) => {
  test.setTimeout(120_000);
  const content = readContent();
  content.listings.push({
    id: 'extra',
    title: 'Нове оголошення',
    description: 'Короткий опис нового оголошення.',
    paragraphs: ['Перший абзац.', 'Другий абзац.'],
  });
  const { dir, file } = writeTempContent(content);
  const outDir = path.join(dir, 'dist');
  expect(buildWith(file, outDir).ok).toBe(true);
  const server = await servePreview(outDir, 4290);
  try {
    await page.goto(`${server.url}#/listings`);
    const rows = page.getByRole('list', { name: 'Оголошення' }).getByRole('link');
    await expect(rows).toHaveCount(6);
    await rows.nth(5).click();
    await expect(page.getByRole('heading', { level: 1, name: 'Нове оголошення' })).toBeVisible();
  } finally {
    server.stop();
  }
});
