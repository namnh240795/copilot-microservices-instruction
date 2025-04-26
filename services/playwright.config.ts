import { defineConfig, devices } from '@playwright/test';
import { startPostgres } from './tests/oauth2/start-postgres';

export default defineConfig({
  testDir: './tests',
  timeout: 30000,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: 'html',
  use: {
    baseURL: 'http://localhost:3000',
    trace: 'on-first-retry',
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ],
  webServer: [
    {
      command: 'node -e "import(\'./tests/oauth2/start-postgres.ts\').then(m => m.startPostgres())"',
      port: 5432,
      reuseExistingServer: true,
      stdout: 'pipe',
      stderr: 'pipe',
    },
    {
      command: 'cd /Users/taichi/Documents/GitHub/copilot-microservices-instruction/services && NODE_ENV=test pnpm start:dev oauth2',
      port: 3000,
      timeout: 120 * 1000,
      reuseExistingServer: !process.env.CI,
    },
  ],
});