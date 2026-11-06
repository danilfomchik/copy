import { test, expect } from '@playwright/test';
import { spawnSync } from 'node:child_process';
import { mkdtempSync, readFileSync, writeFileSync, readdirSync } from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { ROOT } from './helpers/paths';
import { servePreview } from './helpers/build';

test('the app reloads and works offline after the first load', async ({ page }) => {
  // a dedicated server we can really shut down, so nothing but the worker can answer
  const server = await servePreview(path.join(ROOT, 'dist'), 4230);
  try {
    await page.goto(server.url);
    await page.evaluate(() => navigator.serviceWorker.ready);
    // the worker claims the page, so it controls it without a second load
    await expect.poll(() => page.evaluate(() => !!navigator.serviceWorker.controller)).toBe(true);
    server.stop();
    await page.reload();
    await expect(page.getByRole('region', { name: 'Картка учасника' })).toBeVisible();
    await page.getByRole('link', { name: 'Меню' }).click();
    await expect(page.getByRole('link', { name: 'Меню' })).toHaveAttribute('aria-current', 'page');
    // a fresh navigation to a deep hash route also works offline
    await page.goto(server.url + '#/services');
    await expect(page.getByRole('link', { name: 'Послуги' })).toHaveAttribute('aria-current', 'page');
  } finally {
    server.stop();
  }
});

test('no request leaves the apps own origin', async ({ page, baseURL }) => {
  const origin = new URL(baseURL!).origin;
  const foreign: string[] = [];
  page.on('request', (r) => {
    const u = r.url();
    if (!u.startsWith(origin) && !u.startsWith('data:') && !u.startsWith('blob:')) foreign.push(u);
  });
  const violations: string[] = [];
  page.on('console', (m) => {
    if (/Content Security Policy/i.test(m.text())) violations.push(m.text());
  });
  await page.goto('./');
  await page.evaluate(() => navigator.serviceWorker.ready);
  for (const tab of ['Послуги', 'Оголошення', 'Меню', 'Картка']) {
    await page.getByRole('link', { name: tab }).click();
  }
  await page.reload();
  expect(foreign).toEqual([]);
  expect(violations).toEqual([]);
});

test('the CSP blocks network connections from the page', async ({ page }) => {
  await page.goto('./');
  const blocked = await page.evaluate(() =>
    fetch('https://example.com/').then(
      () => false,
      () => true,
    ),
  );
  expect(blocked).toBe(true);
});

test('privacy meta tags are present and robots.txt is served', async ({ page, request }) => {
  await page.goto('./');
  const csp = await page.locator('meta[http-equiv="Content-Security-Policy"]').getAttribute('content');
  expect(csp).toContain("connect-src 'none'");
  expect(csp).toContain("default-src 'none'");
  await expect(page.locator('meta[name="referrer"]')).toHaveAttribute('content', 'no-referrer');
  await expect(page.locator('meta[name="robots"]')).toHaveAttribute('content', /noindex/);
  const robots = await request.get('robots.txt');
  expect(robots.ok()).toBe(true);
  expect(await robots.text()).toMatch(/Disallow:\s*\//);
});

test('manifest and all icons are served and valid', async ({ page, request }) => {
  await page.goto('./');
  const href = await page.locator('link[rel="manifest"]').getAttribute('href');
  const res = await request.get(href!);
  expect(res.ok()).toBe(true);
  const manifest = await res.json();
  expect(manifest).toMatchObject({ name: 'Orbit Pass', display: 'standalone' });
  expect(manifest.start_url).toBeTruthy();
  expect(manifest.theme_color).toMatch(/^#[0-9a-f]{6}$/i);
  const purposes = manifest.icons.map((i: any) => `${i.sizes}/${i.purpose ?? 'any'}`);
  expect(purposes).toEqual(
    expect.arrayContaining(['192x192/any', '512x512/any', '512x512/maskable']),
  );

  const hrefs = [
    ...manifest.icons.map((i: any) => new URL(i.src, res.url()).href),
    ...(await page
      .locator('link[rel~="icon"], link[rel="apple-touch-icon"]')
      .evaluateAll((ls) => ls.map((l) => (l as HTMLLinkElement).href))),
  ];
  expect(await page.locator('link[rel="apple-touch-icon"]').count()).toBe(1);
  expect(hrefs.length).toBeGreaterThanOrEqual(5);
  for (const h of hrefs) {
    const r = await request.get(h);
    expect(r.ok(), h).toBe(true);
    expect(r.headers()['content-type'], h).toMatch(/image\//);
  }
  // declared PNG sizes match the real pixels
  for (const i of manifest.icons) {
    const body = await (await request.get(new URL(i.src, res.url()).href)).body();
    const [w, h] = i.sizes.split('x').map(Number);
    expect(body.readUInt32BE(16)).toBe(w);
    expect(body.readUInt32BE(20)).toBe(h);
  }
});

test('changing the logo SVG and rerunning the script regenerates every icon', () => {
  const logo = readFileSync(path.join(ROOT, 'assets', 'logo.svg'), 'utf8');
  const run = (svg: string) => {
    const dir = mkdtempSync(path.join(tmpdir(), 'orbit-icons-'));
    const file = path.join(dir, 'logo.svg');
    writeFileSync(file, svg);
    const out = path.join(dir, 'out');
    const r = spawnSync(process.execPath, ['scripts/generate-icons.mjs', file, out], {
      cwd: ROOT,
      encoding: 'utf8',
    });
    expect(r.status, r.stderr).toBe(0);
    return Object.fromEntries(readdirSync(out).map((f) => [f, readFileSync(path.join(out, f))]));
  };
  const a = run(logo);
  const b = run(logo.replace(/#[0-9a-fA-F]{6}/, '#ff00ff'));
  expect(Object.keys(a).length).toBeGreaterThanOrEqual(5);
  expect(Object.keys(b).sort()).toEqual(Object.keys(a).sort());
  for (const f of Object.keys(a)) expect(b[f].equals(a[f]), f).toBe(false);
});
