import { test, expect, type Page } from '@playwright/test';

async function openMenu(page: Page) {
  await page.goto('./');
  await page.getByRole('navigation', { name: 'Головна навігація' }).getByRole('link', { name: 'Меню' }).click();
}

test('Menu lists Settings, About, Privacy and Help', async ({ page }) => {
  await openMenu(page);
  for (const name of ['Налаштування', 'Про застосунок', 'Конфіденційність', 'Допомога']) {
    await expect(page.getByRole('link', { name })).toBeVisible();
  }
});

test('theme choice applies immediately and survives a reload', async ({ page }) => {
  await openMenu(page);
  await page.getByRole('link', { name: 'Налаштування' }).click();
  const bg = () => page.evaluate(() => getComputedStyle(document.body).backgroundColor);

  await page.getByRole('radio', { name: 'Темна', exact: true }).check();
  const dark = await bg();
  await page.getByRole('radio', { name: 'Світла', exact: true }).check();
  const light = await bg();
  expect(dark).not.toBe(light);

  await page.getByRole('radio', { name: 'Темна', exact: true }).check();
  expect(await bg()).toBe(dark);
  await page.reload();
  expect(await bg()).toBe(dark);
  await expect(page.getByRole('radio', { name: 'Темна', exact: true })).toBeChecked();
});

test('system theme follows the OS preference', async ({ page }) => {
  await page.emulateMedia({ colorScheme: 'dark' });
  await openMenu(page);
  await page.getByRole('link', { name: 'Налаштування' }).click();
  await expect(page.getByRole('radio', { name: 'Системна' })).toBeChecked();
  const dark = await page.evaluate(() => getComputedStyle(document.body).backgroundColor);
  await page.emulateMedia({ colorScheme: 'light' });
  const light = await page.evaluate(() => getComputedStyle(document.body).backgroundColor);
  expect(dark).not.toBe(light);
});

test('About shows version and the permanent demo notice', async ({ page }) => {
  await openMenu(page);
  await page.getByRole('link', { name: 'Про застосунок' }).click();
  await expect(page.getByRole('heading', { name: 'Про застосунок' })).toBeVisible();
  await expect(page.getByText('Версія 0.1.0')).toBeVisible();
  await expect(page.getByText('Це демонстраційний застосунок з вигаданими даними.')).toBeVisible();
});

test('Privacy states what the app does and does not do', async ({ page }) => {
  await openMenu(page);
  await page.getByRole('link', { name: 'Конфіденційність' }).click();
  await expect(page.getByRole('main').getByRole('listitem')).toHaveCount(5);
  await expect(page.getByText('Застосунок не надсилає жодних мережевих запитів.')).toBeVisible();
  await expect(page.getByText('Немає облікових записів, аналітики, файлів cookie чи трекерів.')).toBeVisible();
  await expect(page.getByText('Зберігаються лише вибір теми та закриття підказки про встановлення.')).toBeVisible();
  await expect(page.getByText('Усі дані вигадані.')).toBeVisible();
  await expect(page.getByText('Застосунок схований від пошукових систем.')).toBeVisible();
  await expect(page.locator('meta[name="robots"]')).toHaveAttribute('content', /noindex/);
});

test('Help screen opens', async ({ page }) => {
  await openMenu(page);
  await page.getByRole('link', { name: 'Допомога' }).click();
  await expect(page.getByRole('heading', { name: 'Допомога', level: 1 })).toBeVisible();
  await expect(page.getByRole('heading', { level: 2 }).first()).toBeVisible();
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
  for (const name of ['Налаштування', 'Про застосунок', 'Конфіденційність', 'Допомога']) {
    await page.getByRole('link', { name }).click();
    if (name === 'Налаштування') await page.getByRole('radio', { name: 'Темна', exact: true }).check();
    await page.goBack();
  }

  const stored = await page.evaluate(() => ({
    local: Object.keys(localStorage),
    session: Object.keys(sessionStorage),
    writes: (window as any).__writes as string[],
  }));
  const allowed = ['orbit.theme', 'orbit.installHintDismissed'];
  for (const k of [...stored.local, ...stored.writes]) expect(allowed).toContain(k);
  expect(stored.local).toEqual(['orbit.theme']);
  expect(stored.session).toEqual([]);
  expect(await context.cookies()).toEqual([]);
  expect(external).toEqual([]);
});
