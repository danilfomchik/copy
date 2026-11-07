import { test, expect } from '@playwright/test';
import path from 'node:path';
import { buildWith, readContent, servePreview, writeTempContent } from './helpers/build';

test('editing the Content file and rebuilding changes what the app shows', async ({ page }) => {
  test.setTimeout(120_000);
  const content = readContent();
  content.member.fullName = 'ІРИНА ВЕСНЯНА';
  content.ui.tabs.services = 'Сервіси';
  const { dir, file } = writeTempContent(content);
  const outDir = path.join(dir, 'dist');

  expect(buildWith(file, outDir).ok).toBe(true);
  const server = await servePreview(outDir, 4180);
  try {
    await page.goto(server.url);
    const card = page.getByRole('region', { name: 'ID користувача' });
    await expect(card.getByText('ІРИНА ВЕСНЯНА')).toBeVisible();
    await expect(page.getByRole('link', { name: 'Сервіси' })).toBeVisible();
    await expect(page.getByText('ЛІСОВИЙ ОРЕСТ ВАСИЛЬОВИЧ')).toHaveCount(0);
  } finally {
    server.stop();
  }
});

test('a broken Content file makes the build fail with a clear error', () => {
  test.setTimeout(120_000);
  const content = readContent();
  content.member.fullName = 42;
  content.membr = {};
  const { dir, file } = writeTempContent(content);

  const result = buildWith(file, path.join(dir, 'dist'));
  expect(result.ok).toBe(false);
  expect(result.output).toContain('Файл контенту некоректний');
  expect(result.output).toContain('content.member.fullName: очікується рядок');
  expect(result.output).toContain('content.membr: невідоме поле');
});

test('a Content file that is not valid JSON fails the build clearly', () => {
  test.setTimeout(120_000);
  const { dir, file } = writeTempContent('{ not json');
  const result = buildWith(file, path.join(dir, 'dist'));
  expect(result.ok).toBe(false);
  expect(result.output).toContain('Не вдалося прочитати');
});
