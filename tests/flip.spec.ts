import { test, expect, type Page } from '@playwright/test';
import jsQR from 'jsqr';
import { QR_DEMO_MESSAGE } from '../qr-message';

const card = (page: Page) => page.getByRole('region', { name: 'ID користувача' });
const qrView = (page: Page) => page.getByRole('region', { name: 'QR-код' });

test('tapping the card shows the QR view and tapping again shows the card', async ({ page }) => {
  await page.goto('./');
  await expect(qrView(page)).toBeHidden();
  await card(page).click();
  await expect(qrView(page)).toBeVisible();
  await expect(card(page)).toBeHidden();
  await expect(qrView(page).getByText('QR-код дійсний до 8 жовтня 2027')).toBeVisible();
  await expect(qrView(page).getByText('Використовуйте QR-код лише за потреби та відповідально ставтеся до його поширення.')).toBeVisible();
  await qrView(page).click();
  await expect(card(page)).toBeVisible();
  await expect(qrView(page)).toBeHidden();
});

test('flip can be done from the keyboard', async ({ page }) => {
  await page.goto('./');
  await page.getByTestId('flip').focus();
  await page.keyboard.press('Enter');
  await expect(qrView(page)).toBeVisible();
  await page.keyboard.press('Space');
  await expect(card(page)).toBeVisible();
});

test('flip rotates in 3D by default', async ({ page }) => {
  await page.goto('./');
  await card(page).click();
  await expect(qrView(page)).toBeVisible();
  const t = await page.getByTestId('flip').evaluate((n) =>
    [n, ...n.querySelectorAll('*')].map((x) => getComputedStyle(x).transform),
  );
  expect(t.some((v) => v.startsWith('matrix3d') || v.startsWith('matrix'))).toBe(true);
});

test('reduced motion cross-fades instead of rotating', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('./');
  await card(page).click();
  await expect(qrView(page)).toBeVisible();
  const t = await page.getByTestId('flip').evaluate((n) =>
    [n, ...n.querySelectorAll('*')]
      .map((x) => getComputedStyle(x).transform)
      .filter((v) => v !== 'none'),
  );
  expect(t).toEqual([]);
});

test('the QR code decodes to only the demo message', async ({ page }) => {
  await page.goto('./');
  await card(page).click();
  const svg = qrView(page).locator('svg.qr');
  await expect(svg).toBeVisible();
  const img = await svg.evaluate(async (node) => {
    const xml = new XMLSerializer().serializeToString(node);
    const im = new Image();
    im.src = 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(xml);
    await im.decode();
    const s = 400;
    const c = document.createElement('canvas');
    c.width = c.height = s;
    const ctx = c.getContext('2d')!;
    ctx.fillStyle = '#fff';
    ctx.fillRect(0, 0, s, s);
    ctx.drawImage(im, 0, 0, s, s);
    return { s, data: Array.from(ctx.getImageData(0, 0, s, s).data) };
  });
  const res = jsQR(new Uint8ClampedArray(img.data), img.s, img.s);
  expect(res?.data).toBe(QR_DEMO_MESSAGE);
});
