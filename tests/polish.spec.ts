import { test, expect } from '@playwright/test';

test('Inter is self-hosted: loads for Cyrillic text with no third-party requests', async ({ page, baseURL }) => {
  const origin = new URL(baseURL!).origin;
  const foreign: string[] = [];
  const fontFiles: string[] = [];
  page.on('request', (r) => {
    const u = r.url();
    if (/\.woff2?($|\?)/.test(u)) fontFiles.push(u);
    if (!u.startsWith(origin) && !u.startsWith('data:') && !u.startsWith('blob:')) foreign.push(u);
  });
  await page.goto('./');
  await expect(page.getByRole('region', { name: 'ID користувача' })).toBeVisible();
  const loaded = await page.evaluate(async () => {
    await document.fonts.ready;
    return [...document.fonts].filter((f) => f.status === 'loaded').map((f) => f.family);
  });
  expect(loaded.some((f) => f.includes('Inter'))).toBe(true);
  expect(fontFiles.length).toBeGreaterThan(0);
  for (const f of fontFiles) expect(f.startsWith(origin)).toBe(true);
  const family = await page.evaluate(() => getComputedStyle(document.body).fontFamily);
  expect(family).toContain('Inter');
  expect(foreign).toEqual([]);
});

test('iOS standalone meta tags are present', async ({ page }) => {
  await page.goto('./');
  await expect(page.locator('meta[name="apple-mobile-web-app-capable"]')).toHaveAttribute('content', 'yes');
  await expect(page.locator('meta[name="mobile-web-app-capable"]')).toHaveAttribute('content', 'yes');
  await expect(page.locator('meta[name="apple-mobile-web-app-status-bar-style"]')).toHaveAttribute('content', 'black-translucent');
  await expect(page.locator('meta[name="viewport"]')).toHaveAttribute('content', /viewport-fit=cover/);
});

test('tab bar and card buttons use SVG icons, not emoji', async ({ page }) => {
  await page.goto('./');
  await expect(page.locator('.tabbar .tab svg')).toHaveCount(4);
  await expect(page.locator('.card-bell svg')).toHaveCount(1);
  await expect(page.locator('.card-plus svg')).toHaveCount(1);
  expect(await page.locator('.card-plus').allTextContents()).toEqual(['']);
});

test('reduced motion leaves no running animation or transition', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('./');
  await page.locator('.card-plus').click();
  await page.locator('.sheet-action', { hasText: /онов/i }).click();
  const bad = await page.evaluate(() =>
    [...document.querySelectorAll('*')]
      .filter((e) => {
        const s = getComputedStyle(e);
        const dur = (v: string) => v.split(',').some((x) => parseFloat(x) > 0.001);
        return (s.animationName !== 'none' && dur(s.animationDuration)) || dur(s.transitionDuration);
      })
      .map((e) => String(e.className || e.tagName)),
  );
  expect(bad).toEqual([]);
});
