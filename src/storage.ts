// The only place the app touches browser storage. Only allowlisted keys may
// be written; anything else throws, so the Privacy promise stays true.
export const STORAGE_KEYS = ['orbit.theme', 'orbit.installHintDismissed'] as const;
export type StorageKey = (typeof STORAGE_KEYS)[number];

function check(key: string): asserts key is StorageKey {
  if (!(STORAGE_KEYS as readonly string[]).includes(key)) {
    throw new Error(`Storage key not allowed: ${key}`);
  }
}

export function readStored(key: StorageKey): string | null {
  check(key);
  try {
    return localStorage.getItem(key);
  } catch {
    return null;
  }
}

export function writeStored(key: StorageKey, value: string): void {
  check(key);
  try {
    localStorage.setItem(key, value);
  } catch {
    // storage unavailable: the setting just won't persist
  }
}
