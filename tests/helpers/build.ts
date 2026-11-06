// Shared helpers for tests that need their own build (edited / broken Content
// file) and their own preview server, isolated from the main dist/.
import { spawn, spawnSync, type ChildProcess } from 'node:child_process';
import { mkdtempSync, readFileSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { BASE_PATH, CONTENT_FILE, ROOT } from './paths';

const npx = process.platform === 'win32' ? 'npx.cmd' : 'npx';

export function readContent(): any {
  return JSON.parse(readFileSync(CONTENT_FILE, 'utf8'));
}

/** Writes `content` (object or raw string) to a temp dir; returns the file path and dir. */
export function writeTempContent(content: unknown) {
  const dir = mkdtempSync(path.join(tmpdir(), 'orbit-'));
  const file = path.join(dir, 'content.json');
  writeFileSync(file, typeof content === 'string' ? content : JSON.stringify(content, null, 2));
  return { dir, file };
}

/** Runs `vite build` with a custom Content file into a custom outDir. */
export function buildWith(contentFile: string, outDir: string) {
  const r = spawnSync(`${npx} vite build`, {
    cwd: ROOT,
    shell: true,
    encoding: 'utf8',
    env: { ...process.env, CONTENT_FILE: contentFile, OUT_DIR: outDir },
  });
  return { ok: r.status === 0, output: `${r.stdout}\n${r.stderr}` };
}

/** Starts `vite preview` for an outDir on `port`; resolves with the page URL and a stop function. */
export async function servePreview(outDir: string, port: number) {
  const child: ChildProcess = spawn(
    `${npx} vite preview --outDir "${outDir}" --port ${port} --strictPort`,
    { cwd: ROOT, shell: true, stdio: 'ignore' },
  );
  const url = `http://localhost:${port}${BASE_PATH}`;
  for (let i = 0; i < 100; i++) {
    try {
      if ((await fetch(url)).ok) break;
    } catch {}
    await new Promise((r) => setTimeout(r, 100));
  }
  return {
    url,
    stop: () => {
      if (process.platform === 'win32' && child.pid) {
        spawnSync('taskkill', ['/pid', String(child.pid), '/T', '/F']);
      } else child.kill();
    },
  };
}
