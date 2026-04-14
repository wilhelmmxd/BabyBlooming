/**
 * Serves the Playwright HTML report and exposes it on a public HTTPS URL (localtunnel).
 * No GitHub account, no email — copy the printed URL and share it.
 * Stops when you press Ctrl+C (link stops working).
 */

const { spawn, execSync } = require('child_process');
const fs = require('fs');
const path = require('path');
const localtunnel = require('localtunnel');

const REPORT_DIR = path.join(process.cwd(), 'tests', 'results', 'playwright-report');
const PORT = 9323;

function copyToClipboard(text) {
    try {
        if (process.platform === 'darwin') {
            execSync('pbcopy', { input: text });
            return true;
        }
        if (process.platform === 'linux') {
            execSync('xclip -selection clipboard', { input: text });
            return true;
        }
        if (process.platform === 'win32') {
            execSync('clip', { input: text, shell: true });
            return true;
        }
    } catch {
        /* ignore */
    }
    return false;
}

async function main() {
    if (!fs.existsSync(path.join(REPORT_DIR, 'index.html'))) {
        console.error(
            '\n  No HTML report yet. Run tests first:\n\n    pnpm test:e2e\n\n  Report path: tests/results/playwright-report/\n',
        );
        process.exit(1);
    }

    const server = spawn(
        process.platform === 'win32' ? 'pnpm.cmd' : 'pnpm',
        ['exec', 'playwright', 'show-report', REPORT_DIR, '--host', '0.0.0.0', '--port', String(PORT)],
        { cwd: process.cwd(), stdio: 'ignore', shell: process.platform === 'win32' },
    );

    await new Promise((r) => setTimeout(r, 3000));

    let tunnel;
    try {
        tunnel = await localtunnel({ port: PORT });
    } catch (e) {
        server.kill('SIGTERM');
        throw e;
    }

    const url = tunnel.url;
    const copied = copyToClipboard(url);

    console.log('');
    console.log('  ╔══════════════════════════════════════════════════════════════╗');
    console.log('  ║  PUBLIC REPORT LINK — copy and share (works while this runs) ║');
    console.log('  ╠══════════════════════════════════════════════════════════════╣');
    console.log('  ║                                                              ║');
    console.log(`  ║  ${url.padEnd(60)}  ║`);
    console.log('  ║                                                              ║');
    console.log('  ╚══════════════════════════════════════════════════════════════╝');
    console.log('');
    if (copied) {
        console.log('  (Also copied to your clipboard.)\n');
    } else {
        console.log('  (Copy the URL above manually.)\n');
    }
    console.log('  Press Ctrl+C here to stop the server and revoke the link.\n');

    const shutdown = () => {
        if (tunnel) tunnel.close();
        server.kill('SIGTERM');
        process.exit(0);
    };

    process.on('SIGINT', shutdown);
    process.on('SIGTERM', shutdown);
    server.on('exit', (code) => {
        if (code && code !== 0) console.error('Report server exited with', code);
    });
}

main().catch((err) => {
    console.error(err);
    process.exit(1);
});
