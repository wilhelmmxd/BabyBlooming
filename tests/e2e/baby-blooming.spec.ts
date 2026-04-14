import { test, expect } from '@playwright/test';

/**
 * Single serial run: login flows on `/`, then mock logged-in app on `/?e2e=app`.
 * One browser, one tab context, headed by default (see playwright.config.ts).
 */
test.describe.configure({ mode: 'serial' });

test.describe('Login screen', () => {
    test('shows brand, sign-in subtitle, and primary actions', async ({ page }) => {
        await test.step('Open home', async () => {
            await page.goto('/');
        });

        await test.step('Hero and copy', async () => {
            await expect(page.getByRole('heading', { name: 'Baby Blooming' })).toBeVisible({
                timeout: 30_000,
            });
            await expect(page.getByText('Sign in to continue')).toBeVisible();
            await expect(page).toHaveTitle(/Baby Blooming/i);
        });

        await test.step('Form controls', async () => {
            await expect(page.getByLabel(/email/i)).toBeVisible();
            await expect(page.getByLabel(/^password$/i)).toBeVisible();
            await expect(page.getByRole('button', { name: 'Sign In', exact: true })).toBeVisible();
        });
    });

    test('switches to sign-up mode and back', async ({ page }) => {
        await page.goto('/');
        await expect(page.getByRole('heading', { name: 'Baby Blooming' })).toBeVisible({
            timeout: 30_000,
        });

        await expect(page.getByText('Sign in to continue')).toBeVisible();
        await page.getByRole('button', { name: /don't have an account/i }).click();
        await expect(page.getByText('Create an account')).toBeVisible();
        await expect(page.getByRole('button', { name: 'Sign Up', exact: true })).toBeVisible();
        await page.getByRole('button', { name: /already have an account/i }).click();
        await expect(page.getByText('Sign in to continue')).toBeVisible();
    });

    test('rejects password shorter than 6 characters', async ({ page }) => {
        await page.goto('/');
        await expect(page.getByRole('heading', { name: 'Baby Blooming' })).toBeVisible({
            timeout: 30_000,
        });
        await page.getByLabel(/email/i).fill('parent@example.com');
        await page.getByLabel(/^password$/i).fill('12345');
        await page.getByRole('button', { name: 'Sign In', exact: true }).click();
        await expect(
            page.locator('form').getByText('Password must be at least 6 characters'),
        ).toBeVisible();
    });

    test('shows Google sign-in button', async ({ page }) => {
        await page.goto('/');
        await expect(page.getByRole('heading', { name: 'Baby Blooming' })).toBeVisible({
            timeout: 30_000,
        });
        await expect(page.getByRole('button', { name: /sign in with google/i })).toBeVisible();
    });
});

test.describe('Logged-in app (?e2e=app mock)', () => {
    test('shows main dashboard, not login', async ({ page }) => {
        await page.goto('/?e2e=app');
        await expect(page.getByRole('heading', { name: 'Baby Blooming' })).not.toBeVisible({
            timeout: 15_000,
        });
        await expect(page.getByText('Test Child')).toBeVisible();
        await expect(page.getByText('e2e@playwright.local')).toBeVisible();
    });

    test('bottom navigation: Growth, Diary, Discover, Home', async ({ page }) => {
        await page.goto('/?e2e=app');
        await expect(page.getByText('Test Child')).toBeVisible({ timeout: 15_000 });

        const nav = page.locator('#bottom-nav');

        await nav.getByRole('button', { name: 'Growth' }).click();
        await expect(page.getByText('Growth Tracker')).toBeVisible();

        await nav.getByRole('button', { name: 'Diary' }).click();
        await expect(page.getByRole('heading', { name: 'Journal', exact: true })).toBeVisible();

        await nav.getByRole('button', { name: 'Discover' }).click();
        await expect(page.getByText('Tips for Today')).toBeVisible();

        await nav.getByRole('button', { name: 'Home' }).click();
        await expect(nav.getByRole('button', { name: 'Home' })).toBeVisible();
    });
});
