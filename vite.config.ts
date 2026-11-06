import { createHash } from 'node:crypto';
import { readdirSync, readFileSync, statSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import { defineConfig, type Plugin } from 'vite';
import { contentSchema } from './content/schema.ts';
import { validate } from './content/validate.ts';

const VIRTUAL = 'virtual:content';
const RESOLVED = '\0' + VIRTUAL;

// Loads the Content file (CONTENT_FILE env var overrides the default, used by
// tests), validates it against the schema and exposes it as `virtual:content`.
// A bad file fails the build with every problem listed.
function contentPlugin(): Plugin {
  const file = path.resolve(process.env.CONTENT_FILE ?? 'content/content.json');
  const load = () => {
    let data: unknown;
    try {
      data = JSON.parse(readFileSync(file, 'utf8'));
    } catch (e) {
      throw new Error(`[content] Не вдалося прочитати ${file}: ${(e as Error).message}`);
    }
    const problems = validate(contentSchema, data);
    if (problems.length) {
      throw new Error(
        `[content] Файл контенту некоректний (${file}):\n  - ${problems.join('\n  - ')}`,
      );
    }
    return data;
  };
  return {
    name: 'orbit-content',
    buildStart() {
      this.addWatchFile(file);
      load();
    },
    resolveId: (id) => (id === VIRTUAL ? RESOLVED : undefined),
    load(id) {
      if (id === RESOLVED) return `export default ${JSON.stringify(load())};`;
    },
  };
}

// Writes the hand-written service worker (src/sw.js) into the build output with
// the list of every built file to precache and a version hash of that list.
function serviceWorkerPlugin(): Plugin {
  let outDir = '';
  const walk = (dir: string, prefix = ''): string[] =>
    readdirSync(dir).flatMap((name) => {
      const full = path.join(dir, name);
      return statSync(full).isDirectory() ? walk(full, `${prefix}${name}/`) : [prefix + name];
    });
  return {
    name: 'orbit-service-worker',
    apply: 'build',
    configResolved(config) {
      outDir = path.resolve(config.root, config.build.outDir);
    },
    writeBundle() {
      const files = walk(outDir).filter((f) => f !== 'sw.js').sort();
      const hash = createHash('sha256');
      for (const f of files) hash.update(f).update(readFileSync(path.join(outDir, f)));
      const list = ['./', ...files.map((f) => (f === 'index.html' ? './index.html' : f))];
      const source = readFileSync('src/sw.js', 'utf8')
        .replace('__VERSION__', hash.digest('hex').slice(0, 12))
        .replace('/*__PRECACHE__*/ []', JSON.stringify(list, null, 2));
      writeFileSync(path.join(outDir, 'sw.js'), source);
    },
  };
}

export default defineConfig({
  base: '/copy/',
  plugins: [contentPlugin(), serviceWorkerPlugin()],
  build: { outDir: process.env.OUT_DIR ?? 'dist' },
});
