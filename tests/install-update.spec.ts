import { test, expect } from "@playwright/test";
import { appendFileSync, cpSync, mkdtempSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import { ROOT } from "./helpers/paths";
import { servePreview } from "./helpers/build";

const IOS_UA =
  "Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1";
const HINT = /Поділитися/;

test("the Android install prompt is offered through an in-app control", async ({
  page,
}) => {
  await page.goto("./");
  const button = page.getByRole("button", { name: "Встановити застосунок" });
  await expect(button).toBeHidden();
  await page.evaluate(() => {
    const e = new Event("beforeinstallprompt", { cancelable: true });
    (e as any).prompt = () => {
      (window as any).__prompted = true;
      return Promise.resolve();
    };
    (e as any).userChoice = Promise.resolve({ outcome: "accepted" });
    window.dispatchEvent(e);
  });
  await expect(button).toBeVisible();
  await button.click();
  expect(await page.evaluate(() => (window as any).__prompted)).toBe(true);
  await expect(button).toBeHidden();
});
