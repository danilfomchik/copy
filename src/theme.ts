import { readStored, writeStored } from './storage';

export type Theme = 'light' | 'dark' | 'system';
export const THEMES: Theme[] = ['light', 'dark', 'system'];

// Browser-chrome colours: light is the brand teal, dark matches the dark --bg.
const CHROME = { light: '#0f766e', dark: '#0c1315' } as const;

export function getTheme(): Theme {
  const v = readStored('orbit.theme');
  return v === 'light' || v === 'dark' ? v : 'system';
}

// An explicit choice makes both theme-color metas unconditional; "system"
// restores the prefers-color-scheme pair from index.html.
function syncThemeColor(theme: Theme): void {
  const metas = document.querySelectorAll<HTMLMetaElement>('meta[name="theme-color"][data-scheme]');
  for (const meta of metas) {
    const scheme = meta.dataset.scheme === 'dark' ? 'dark' : 'light';
    if (theme === 'system') {
      meta.content = CHROME[scheme];
      meta.media = `(prefers-color-scheme: ${scheme})`;
    } else {
      meta.content = CHROME[theme];
      meta.removeAttribute('media');
    }
  }
}

// "system" removes the attribute so the prefers-color-scheme CSS applies.
export function applyTheme(theme: Theme): void {
  const root = document.documentElement;
  if (theme === 'system') root.removeAttribute('data-theme');
  else root.setAttribute('data-theme', theme);
  syncThemeColor(theme);
}

export function setTheme(theme: Theme): void {
  writeStored('orbit.theme', theme);
  applyTheme(theme);
}
