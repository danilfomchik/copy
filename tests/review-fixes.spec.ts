import { test, expect, type Page } from "@playwright/test";
import path from "node:path";
import { buildWith, readContent, writeTempContent } from "./helpers/build";

const content = readContent();
const a = content.ui.card.actions;
const dialog = (page: Page) => page.getByRole("dialog", { name: a.sheetLabel });
const focusInDialog = (page: Page) =>
  page.evaluate(() => !!document.activeElement?.closest("[role=dialog]"));

test("the validator rejects duplicate ids and empty paragraphs", () => {
  test.setTimeout(120_000);
  const c = readContent();
  c.services.push({ ...c.services[0] });
  c.listings[0].paragraphs = [];
  const { dir, file } = writeTempContent(c);
  const r = buildWith(file, path.join(dir, "dist"));
  expect(r.ok).toBe(false);
  expect(r.output).toContain("повторюється");
  expect(r.output).toContain("content.listings[0].paragraphs");
});
