/**
 * Runs Playwright, then serves the HTML report on a public shareable URL (localtunnel).
 * In CI (CI=true), only runs tests — no tunnel.
 */
import { spawnSync, spawn } from 'node:child_process';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, '..');
const shareScript = path.join(__dirname, 'share-playwright-report.cjs');

const r = spawnSync('pnpm', ['exec', 'playwright', 'test'], {
    stdio: 'inherit',
    shell: true,
    cwd: root,
    env: { ...process.env },
});

const exitCode = r.status ?? 0;

if (process.env.CI) {
    process.exit(exitCode);
}

if (exitCode !== 0) {
    console.log('\n  Note: Some tests failed — shareable link still appears if a report was generated.\n');
}

const child = spawn(process.execPath, [shareScript], {
    stdio: 'inherit',
    cwd: root,
    env: { ...process.env },
});

child.on('exit', () => {
    process.exit(exitCode);
});

child.on('error', (err) => {
    console.error(err);
    process.exit(exitCode || 1);
});
