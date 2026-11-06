import { fileURLToPath } from 'node:url';
import path from 'node:path';

export const BASE_PATH = '/copy/';
export const MAIN_PORT = 4173;
export const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', '..');
export const CONTENT_FILE = path.join(ROOT, 'content', 'content.json');
