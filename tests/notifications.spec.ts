import { test, expect, type Page } from '@playwright/test';
import { readContent } from './helpers/build';

const n = readContent().notifications;
const screen = (page: Page) => page.getByRole('region', { name: n.sheetLabel });
const openScreen = async (page: Page) => {
  await page.goto('./');
  await page.getByRole('button', { name: n.openLabel }).click();
  await expect(screen(page)).toBeVisible();
};

test('the bell opens a screen listing every Notification from the Content file', async ({ page }) => {
  await openScreen(page);
  expect(n.items.length).toBeGreaterThan(0);
  for (const item of n.items) {
    await expect(screen(page).getByText(item.title, { exact: true })).toBeVisible();
    await expect(screen(page).getByText(item.body, { exact: true })).toBeVisible();
    await expect(screen(page).getByText(item.date, { exact: true })).toBeVisible();
  }
});

test('tapping the bell does not flip the card', async ({ page }) => {
  await page.goto('./');
  await page.getByRole('button', { name: n.openLabel }).click();
  await page.goBack();
  await expect(page.getByTestId('flip')).not.toHaveClass(/flipped/);
});

test('the back button returns to the home screen', async ({ page }) => {
  await openScreen(page);
  await page.getByRole('link', { name: readContent().ui.back }).click();
  await expect(screen(page)).toHaveCount(0);
  await expect(page.getByTestId('flip')).toBeVisible();
});
