import { test, expect, type Page } from '@playwright/test';

async function openMenu(page: Page) {
  await page.goto('./');
  await page.getByRole('navigation', { name: 'Головна навігація' }).getByRole('link', { name: 'Меню' }).click();
}

test('Menu shows the design rows and links to Settings, About, Privacy and Help', async ({ page }) => {
  await openMenu(page);
  for (const name of ['Копіювати номер пристрою', 'Сканувати документ', 'Вийти']) {
    await expect(page.getByRole('button', { name })).toBeVisible();
  }
  for (const name of ['Активні сесії', 'Налаштування', 'Питання та відповіді', 'Повідомлення про обробку персональних даних', 'Версія']) {
    await expect(page.getByRole('link', { name })).toBeVisible();
  }
});

test('About shows version and the permanent demo notice', async ({ page }) => {
  await openMenu(page);
  await page.getByRole('link', { name: /^Версія/ }).click();
  await expect(page.getByRole('heading', { name: 'Про застосунок' })).toBeVisible();
  await expect(page.getByText('Версія 0.1.0')).toBeVisible();
  await expect(page.getByText('Це демонстраційний застосунок з вигаданими даними.')).toBeVisible();
});

test('Privacy states what the app does and does not do', async ({ page }) => {
  await openMenu(page);
  await page.getByRole('link', { name: 'Повідомлення про обробку персональних даних' }).click();
  await expect(page.getByRole('main').getByRole('listitem')).toHaveCount(5);
  await expect(page.getByText('Застосунок не надсилає жодних мережевих запитів.')).toBeVisible();
  await expect(page.getByText('Немає облікових записів, аналітики, файлів cookie чи трекерів.')).toBeVisible();
  await expect(page.getByText('Зберігаються лише вибір теми, закриття підказки про встановлення та прапорець «Більше не показувати» на вкладці оголошень.')).toBeVisible();
  await expect(page.getByText('Усі дані вигадані.')).toBeVisible();
  await expect(page.getByText('Застосунок схований від пошукових систем.')).toBeVisible();
  await expect(page.locator('meta[name="robots"]')).toHaveAttribute('content', /noindex/);
});

test('Questions and answers screen lists the categories', async ({ page }) => {
  await openMenu(page);
  await page.getByRole('link', { name: 'Питання та відповіді' }).click();
  await expect(page.getByRole('heading', { name: 'Питання та відповіді', level: 1 })).toBeVisible();
  await expect(page.getByRole('button', { name: 'Електронна черга' })).toBeVisible();
});

test('Active sessions screen opens', async ({ page }) => {
  await openMenu(page);
  await page.getByRole('link', { name: 'Активні сесії' }).click();
  await expect(page.getByRole('heading', { name: 'Активні сесії', level: 1 })).toBeVisible();
  await expect(page.getByText('Поточна сесія')).toBeVisible();
});

test('only allowlisted keys are written to browser storage; no cookies, no external requests', async ({
  page,
  context,
}) => {
  await page.addInitScript(() => {
    const w = window as any;
    w.__writes = [];
    const orig = Storage.prototype.setItem;
    Storage.prototype.setItem = function (k: string, v: string) {
      w.__writes.push(k);
      return orig.call(this, k, v);
    };
  });
  const external: string[] = [];
  page.on('request', (r) => {
    if (!r.url().startsWith('http://localhost')) external.push(r.url());
  });

  await openMenu(page);
  for (const name of ['Налаштування', /^Версія/, 'Повідомлення про обробку персональних даних', 'Питання та відповіді']) {
    await page.getByRole('link', { name }).click();
    await page.goBack();
  }

  const stored = await page.evaluate(() => ({
    local: Object.keys(localStorage),
    session: Object.keys(sessionStorage),
    writes: (window as any).__writes as string[],
  }));
  const allowed = ['orbit.installHintDismissed', 'orbit.listingsIntroHidden'];
  for (const k of [...stored.local, ...stored.writes]) expect(allowed).toContain(k);
  expect(stored.local).toEqual([]);
  expect(stored.session).toEqual([]);
  expect(await context.cookies()).toEqual([]);
  expect(external).toEqual([]);
});
