import { defineConfig, devices } from '@playwright/test';

const isCI = !!process.env.CI;

/** All Playwright specs and generated artifacts live under `tests/`. */
export default defineConfig({
    testDir: './tests/e2e',
    outputDir: 'tests/results/playwright-artifacts',
    fullyParallel: false,
    workers: 1,
    forbidOnly: isCI,
    retries: isCI ? 2 : 0,
    reporter: [
        ['list'],
        ['html', { open: 'never', outputFolder: 'tests/results/playwright-report' }],
    ],
    use: {
        baseURL: 'http://127.0.0.1:3000',
        headless: isCI,
        screenshot: {
            mode: 'on',
            fullPage: true,
        },
        trace: 'retain-on-failure',
        video: 'retain-on-failure',
    },
    projects: [{ name: 'chromium', use: { ...devices['Desktop Chrome'] } }],
    webServer: {
        command: 'pnpm dev',
        url: 'http://127.0.0.1:3000',
        reuseExistingServer: !isCI,
        timeout: 120_000,
        env: { ...process.env },
    },
});
