/**
 * Playwright can load `/?e2e=app` to use mock auth + child (no Firebase) for E2E.
 * Disabled in production. Do not rely on this for security — it's dev/E2E only.
 */

export const PLAYWRIGHT_E2E_UID = 'e2e-playwright-user'

export function isPlaywrightE2E(): boolean {
    if (typeof window === 'undefined') return false
    if (process.env.NODE_ENV === 'production') return false
    return new URLSearchParams(window.location.search).get('e2e') === 'app'
}
