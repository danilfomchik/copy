import { test, expect } from '@playwright/test';

// iOS Safari (WebKit) regression: the card overflowed the screen on first load.
test.use({ browserName: 'webkit' });

test('card and its buttons stay inside a phone-width viewport on first load', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('./');
  const card = page.getByRole('region', { name: 'ID користувача' });
  await expect(card).toBeVisible();
  const box = await card.boundingBox();
  expect(box!.x).toBeGreaterThanOrEqual(0);
  expect(box!.x + box!.width).toBeLessThanOrEqual(390);
  const noHorizontalScroll = await page.evaluate(
    () => document.documentElement.scrollWidth <= window.innerWidth,
  );
  expect(noHorizontalScroll).toBe(true);
});
