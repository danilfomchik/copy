import { test, expect } from "@playwright/test";

test("iOS standalone meta tags are present", async ({ page }) => {
  await page.goto("./");
  await expect(
    page.locator('meta[name="apple-mobile-web-app-capable"]'),
  ).toHaveAttribute("content", "yes");
  await expect(
    page.locator('meta[name="mobile-web-app-capable"]'),
  ).toHaveAttribute("content", "yes");
  await expect(
    page.locator('meta[name="apple-mobile-web-app-status-bar-style"]'),
  ).toHaveAttribute("content", "default");
  await expect(page.locator('meta[name="viewport"]')).toHaveAttribute(
    "content",
    /viewport-fit=cover/,
  );
});
