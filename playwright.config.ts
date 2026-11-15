import { defineConfig, type PlaywrightTestConfig } from '@playwright/test';
import { kitBasePath } from '#libraries/base-path/base-path';

const basePath = kitBasePath(process.env['BASE_PATH'] ?? '');

const config: PlaywrightTestConfig = defineConfig({
  testDir: 'tests/e2e',
  testMatch: '**/*.e2e.ts',
  forbidOnly: process.env['CI'] !== undefined,
  retries: 0,
  webServer: { command: 'pnpm build && pnpm preview', port: 4173, reuseExistingServer: !process.env['CI'] },
  use: { baseURL: `http://localhost:4173${basePath}/`, trace: 'retain-on-failure' }
});

export default config;
