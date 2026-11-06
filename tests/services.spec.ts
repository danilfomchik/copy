import { test, expect } from '@playwright/test';
import path from 'node:path';
import { buildWith, readContent, servePreview, writeTempContent } from './helpers/build';

test('Services tab shows 6 tiles; each opens its detail page and back returns to the grid', async ({ page }) => {
  await page.goto('./#/services');
  const grid = page.getByRole('list', { name: 'Послуги' });
  const tiles = grid.getByRole('link');
  await expect(tiles).toHaveCount(6);

  const content = readContent();
  for (const [i, s] of content.services.entries()) {
    await tiles.nth(i).click();
    await expect(page.getByRole('heading', { level: 1, name: s.title })).toBeVisible();
    await expect(page.getByText(s.description, { exact: true })).toBeVisible();
    for (const p of s.paragraphs) await expect(page.getByText(p, { exact: true })).toBeVisible();
    // Services stays the highlighted tab on a detail page.
    await expect(
      page.getByRole('navigation', { name: 'Головна навігація' }).getByRole('link', { name: 'Послуги' }),
    ).toHaveAttribute('aria-current', 'page');
    await page.getByRole('link', { name: 'Назад' }).click();
    await expect(grid.getByRole('link')).toHaveCount(6);
  }
});

test('a detail page opens directly from its URL', async ({ page }) => {
  const first = readContent().services[0];
  await page.goto(`./#/services/${first.id}`);
  await expect(page.getByRole('heading', { level: 1, name: first.title })).toBeVisible();
});

test('adding a service to the Content file adds a tile', async ({ page }) => {
  test.setTimeout(120_000);
  const content = readContent();
  content.services.push({
    id: 'extra',
    title: 'Нова послуга',
    description: 'Короткий опис нової послуги.',
    paragraphs: ['Перший абзац.', 'Другий абзац.'],
  });
  const { dir, file } = writeTempContent(content);
  const outDir = path.join(dir, 'dist');
  expect(buildWith(file, outDir).ok).toBe(true);
  const server = await servePreview(outDir, 4270);
  try {
    await page.goto(`${server.url}#/services`);
    const tiles = page.getByRole('list', { name: 'Послуги' }).getByRole('link');
    await expect(tiles).toHaveCount(7);
    await tiles.nth(6).click();
    await expect(page.getByRole('heading', { level: 1, name: 'Нова послуга' })).toBeVisible();
    await expect(page.getByText('Другий абзац.')).toBeVisible();
  } finally {
    server.stop();
  }
});
