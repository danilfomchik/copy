import { defineConfig } from '@playwright/test';
import { BASE_PATH, MAIN_PORT } from './tests/helpers/paths';

// Tests run against the production build (dist/) served by `vite preview`
// under the /copy/ base, exactly as GitHub Pages will serve it.
export default defineConfig({
  testDir: './tests',
  testMatch: '**/*.spec.ts',
  fullyParallel: true,
  reporter: 'list',
  use: {
    baseURL: `http://localhost:${MAIN_PORT}${BASE_PATH}`,
  },
  webServer: {
    command: `npx vite preview --port ${MAIN_PORT} --strictPort`,
    url: `http://localhost:${MAIN_PORT}${BASE_PATH}`,
    reuseExistingServer: false,
  },
});
