import { test, expect } from '@playwright/test';

test('tab bar switches between the four tabs', async ({ page }) => {
  await page.goto('./');
  const nav = page.getByRole('navigation', { name: 'Головна навігація' });
  await expect(nav.getByRole('link')).toHaveText(['Картка', 'Послуги', 'Оголошення', 'Меню']);
  await expect(nav.getByRole('link', { name: 'Картка' })).toHaveAttribute('aria-current', 'page');

  for (const name of ['Послуги', 'Оголошення', 'Меню']) {
    await nav.getByRole('link', { name }).click();
    await expect(nav.getByRole('link', { name })).toHaveAttribute('aria-current', 'page');
    await expect(page.getByRole('heading', { name })).toBeVisible();
    if (name === 'Меню') {
      await expect(page.getByText('Цей розділ буде доступний пізніше.')).toBeVisible();
    }
  }

  await nav.getByRole('link', { name: 'Картка' }).click();
  await expect(page.getByRole('region', { name: 'Картка учасника' })).toBeVisible();
});
