import { test, expect, type Page } from '@playwright/test';
import { readFileSync } from 'node:fs';
import { readContent } from './helpers/build';

const content = readContent();
const a = content.ui.card.actions;

const sheet = (page: Page) => page.getByRole('dialog', { name: a.sheetLabel });
const openSheet = async (page: Page) => {
  await page.goto('./');
  await page.getByRole('button', { name: a.openLabel }).click();
  await expect(sheet(page)).toBeVisible();
};

test('the "+" button opens the Actions sheet with a handle, backdrop and three actions', async ({ page }) => {
  await openSheet(page);
  await expect(page.locator('.sheet-backdrop')).toBeVisible();
  await expect(page.locator('.sheet-handle')).toBeVisible();
  for (const name of [a.viewDetails, a.downloadPdf, a.refresh]) {
    await expect(sheet(page).getByRole('button', { name })).toBeVisible();
  }
});

test('tapping the backdrop closes the sheet', async ({ page }) => {
  await openSheet(page);
  await page.mouse.click(190, 40);
  await expect(sheet(page)).toHaveCount(0);
});

test('swiping the sheet down closes it; a short drag does not', async ({ page }) => {
  await openSheet(page);
  const h = (await page.locator('.sheet-handle').boundingBox())!;
  const x = h.x + h.width / 2;
  const y = h.y + h.height / 2;
  await page.mouse.move(x, y);
  await page.mouse.down();
  await page.mouse.move(x, y + 20, { steps: 4 });
  await page.mouse.up();
  await expect(sheet(page)).toBeVisible();
  await page.mouse.move(x, y);
  await page.mouse.down();
  await page.mouse.move(x, y + 200, { steps: 8 });
  await page.mouse.up();
  await expect(sheet(page)).toHaveCount(0);
});

test('view details shows every Member field and a back control', async ({ page }) => {
  await openSheet(page);
  await sheet(page).getByRole('button', { name: a.viewDetails }).click();
  await expect(sheet(page)).toHaveCount(0);
  const m = content.member;
  const d = content.ui.details;
  const main = page.locator('#screen');
  await expect(main.getByRole('heading', { name: d.title })).toBeVisible();
  for (const [label, value] of [
    [d.fullNameLabel, m.fullName],
    [content.ui.card.birthDateLabel, m.birthDate],
    [content.ui.card.tierLabel, m.tier],
    [content.ui.card.numberLabel, m.membershipNumber],
  ]) {
    await expect(main.getByText(label, { exact: true })).toBeVisible();
    await expect(main.getByText(value, { exact: true })).toBeVisible();
  }
  await main.getByRole('link', { name: d.back }).click();
  await expect(page.getByRole('region', { name: content.ui.card.label })).toBeVisible();
});

test('download PDF saves the DEMO-stamped PDF without leaving the app origin', async ({ page }) => {
  const requests: string[] = [];
  page.on('request', (r) => requests.push(r.url()));
  await openSheet(page);
  const [download] = await Promise.all([
    page.waitForEvent('download'),
    sheet(page).getByRole('button', { name: a.downloadPdf }).click(),
  ]);
  expect(download.suggestedFilename()).toBe('orbit-pass-card-DEMO.pdf');
  const bytes = readFileSync((await download.path())!);
  expect(bytes.subarray(0, 5).toString()).toBe('%PDF-');
  expect(bytes.toString('latin1')).toContain('DEMO');
  const origin = new URL(page.url()).origin;
  expect(requests.filter((u) => !u.startsWith(origin))).toEqual([]);
});

test('refresh shows a spinner, then the Ribbon takes the refreshed timestamp, with no request', async ({ page }) => {
  await page.goto('./');
  const requests: string[] = [];
  page.on('request', (r) => requests.push(r.url()));
  const ribbon = page.locator('.ribbon-text');
  await expect(ribbon).toContainText(content.ribbon.updatedAt);
  await page.getByRole('button', { name: a.openLabel }).click();
  await sheet(page).getByRole('button', { name: a.refresh }).click();
  await expect(page.getByRole('status', { name: a.refreshing })).toBeVisible();
  await expect(ribbon).toContainText(content.ribbon.refreshedAt);
  await expect(page.getByRole('status', { name: a.refreshing })).toHaveCount(0);
  expect(requests.filter((u) => !/\.woff2($|\?)/.test(u))).toEqual([]);
});
