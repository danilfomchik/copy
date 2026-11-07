import { test, expect } from '@playwright/test';

test('home screen is the Card with Member values from the Content file', async ({ page }) => {
  await page.goto('./');
  const card = page.getByRole('region', { name: 'ID користувача' });
  await expect(card).toBeVisible();
  await expect(card.getByText('ЛІСОВИЙ ОРЕСТ ВАСИЛЬОВИЧ')).toBeVisible();
  await expect(card.getByText('23.11.2001')).toBeVisible();
  // The design shows only the birth date next to the portrait.
  await expect(card.getByText('Срібний')).toHaveCount(0);
  await expect(card.getByText('OP-4821-7390')).toHaveCount(0);
  await expect(card.getByRole('img', { name: 'Аватар' })).toBeVisible();
  await expect(card.getByText('08.10.2026 • Документ оновлено о 09:10 | 08.10.2026').first()).toBeVisible();
});

test('home screen follows the design: notifications pill outside the card, holder label above the name', async ({ page }) => {
  await page.goto('./');
  const card = page.getByRole('region', { name: 'ID користувача' });
  const bell = page.getByRole('button', { name: 'Сповіщення' });
  await expect(bell).toHaveText('Сповіщення');
  await expect(bell.locator('svg')).toHaveCount(1);
  await expect(card.getByRole('button', { name: 'Сповіщення' })).toHaveCount(0);
  await expect(card.getByText('Користувач', { exact: true })).toBeVisible();
  const [nameBox, plusBox, cardBox] = await Promise.all([
    card.getByText('ЛІСОВИЙ ОРЕСТ ВАСИЛЬОВИЧ').boundingBox(),
    card.getByRole('button', { name: 'Дії' }).boundingBox(),
    card.boundingBox(),
  ]);
  // "+" sits in the bottom-right corner of the card, beside the name.
  expect(plusBox!.x + plusBox!.width).toBeGreaterThan(cardBox!.x + cardBox!.width - 40);
  expect(plusBox!.y + plusBox!.height).toBeGreaterThan(cardBox!.y + cardBox!.height - 40);
  expect(plusBox!.x).toBeGreaterThan(nameBox!.x);
});
