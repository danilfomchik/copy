import { test, expect } from '@playwright/test';

test('home screen is the Card with Member values from the Content file', async ({ page }) => {
  await page.goto('./');
  const card = page.getByRole('region', { name: 'Картка учасника' });
  await expect(card).toBeVisible();
  await expect(card.getByText('ОРЕСТ ЛІСОВИЙ')).toBeVisible();
  await expect(card.getByText('14.03.1992')).toBeVisible();
  await expect(card.getByText('Срібний')).toBeVisible();
  await expect(card.getByText('OP-4821-7390')).toBeVisible();
  await expect(card.getByRole('img', { name: 'Аватар' })).toBeVisible();
  await expect(card.getByText('Дані оновлено 06.11.2026, 09:30').first()).toBeVisible();
});
