import { defineConfig, devices } from '@playwright/test'

const standardUse = {
  baseURL: 'http://127.0.0.1:4173',
  screenshot: 'only-on-failure' as const,
  trace: 'retain-on-failure' as const,
  video: 'retain-on-failure' as const,
}

export default defineConfig({
  testDir: './e2e',
  fullyParallel: false,
  forbidOnly: Boolean(process.env.CI),
  retries: process.env.CI ? 1 : 0,
  workers: 1,
  reporter: [['list'], ['html', { open: 'never' }]],
  use: standardUse,
  webServer: [
    {
      command: 'pnpm dev --host 127.0.0.1 --port 4173',
      url: 'http://127.0.0.1:4173',
      reuseExistingServer: !process.env.CI,
    },
    {
      command: 'pnpm preview --host 127.0.0.1 --port 4174',
      url: 'http://127.0.0.1:4174',
      reuseExistingServer: !process.env.CI,
    },
  ],
  projects: [
    {
      name: 'chromium',
      grepInvert: /@visual|@production/,
      use: { ...devices['Desktop Chrome'], ...standardUse, viewport: { width: 1440, height: 900 } },
    },
    {
      name: 'desktop-1440',
      grep: /@visual/,
      use: { ...devices['Desktop Chrome'], ...standardUse, viewport: { width: 1440, height: 900 } },
    },
    {
      name: 'laptop-1280',
      grep: /@visual/,
      use: { ...devices['Desktop Chrome'], ...standardUse, viewport: { width: 1280, height: 800 } },
    },
    {
      name: 'tablet-768',
      grep: /@visual/,
      use: { ...devices['iPad (gen 7)'], ...standardUse, browserName: 'chromium', viewport: { width: 768, height: 1024 } },
    },
    {
      name: 'mobile-390',
      grep: /@visual/,
      use: { ...devices['iPhone 13'], ...standardUse, browserName: 'chromium', viewport: { width: 390, height: 844 } },
    },
    {
      name: 'mobile-360',
      grep: /@visual/,
      use: { ...devices['Galaxy S9+'], ...standardUse, browserName: 'chromium', viewport: { width: 360, height: 800 } },
    },
    {
      name: 'landscape-844',
      grep: /@visual/,
      use: { ...devices['iPhone 13 landscape'], ...standardUse, browserName: 'chromium', viewport: { width: 844, height: 390 } },
    },
    {
      name: 'production-preview',
      grep: /@production/,
      use: { ...devices['Desktop Chrome'], ...standardUse, baseURL: 'http://127.0.0.1:4174', viewport: { width: 1440, height: 900 } },
    },
  ],
})
