import { test, expect } from "@playwright/test";
import path from "node:path";
import {
  buildWith,
  readContent,
  servePreview,
  writeTempContent,
} from "./helpers/build";

test("a Content file that is not valid JSON fails the build clearly", () => {
  test.setTimeout(120_000);
  const { dir, file } = writeTempContent("{ not json");
  const result = buildWith(file, path.join(dir, "dist"));
  expect(result.ok).toBe(false);
  expect(result.output).toContain("Не вдалося прочитати");
});
