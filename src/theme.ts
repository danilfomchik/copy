import { readStored, writeStored } from './storage';

export type Theme = 'light' | 'dark' | 'system';
export const THEMES: Theme[] = ['light', 'dark', 'system'];

export function getTheme(): Theme {
  const v = readStored('orbit.theme');
  return v === 'light' || v === 'dark' ? v : 'system';
}

// "system" removes the attribute so the prefers-color-scheme CSS applies.
export function applyTheme(theme: Theme): void {
  const root = document.documentElement;
  if (theme === 'system') root.removeAttribute('data-theme');
  else root.setAttribute('data-theme', theme);
}

export function setTheme(theme: Theme): void {
  writeStored('orbit.theme', theme);
  applyTheme(theme);
}
