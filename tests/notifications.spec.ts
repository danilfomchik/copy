import { test, expect, type Page } from '@playwright/test';
import { readContent } from './helpers/build';

const n = readContent().notifications;
const sheet = (page: Page) => page.getByRole('dialog', { name: n.sheetLabel });
const openSheet = async (page: Page) => {
  await page.goto('./');
  await page.getByRole('button', { name: n.openLabel }).click();
  await expect(sheet(page)).toBeVisible();
};

test('the bell opens a sheet listing every Notification from the Content file', async ({ page }) => {
  await openSheet(page);
  expect(n.items.length).toBeGreaterThan(0);
  for (const item of n.items) {
    await expect(sheet(page).getByText(item.title, { exact: true })).toBeVisible();
    await expect(sheet(page).getByText(item.body, { exact: true })).toBeVisible();
  }
});

test('tapping the bell does not flip the card', async ({ page }) => {
  await openSheet(page);
  await expect(page.getByTestId('flip')).not.toHaveClass(/flipped/);
});

test('tapping the backdrop closes the sheet', async ({ page }) => {
  await openSheet(page);
  await page.mouse.click(190, 40);
  await expect(sheet(page)).toHaveCount(0);
});

test('swiping the sheet down closes it', async ({ page }) => {
  await openSheet(page);
  const h = (await page.locator('.sheet-handle').boundingBox())!;
  const x = h.x + h.width / 2;
  const y = h.y + h.height / 2;
  await page.mouse.move(x, y);
  await page.mouse.down();
  await page.mouse.move(x, y + 200, { steps: 8 });
  await page.mouse.up();
  await expect(sheet(page)).toHaveCount(0);
});
