# Tests layout

| Path | Contents |
|------|----------|
| `tests/unit_tests/` | Jest unit tests |
| `tests/integration/` | Jest integration tests (React + mocks) |
| `tests/e2e/` | Playwright end-to-end specs |
| `tests/results/` | Generated only — Playwright HTML report, traces, screenshots, `jest.log` (gitignored) |

Run from repo root; see `TEST-REPORT-INSTRUCTIONS.local.md` (if present) or `package.json` scripts.

## GitHub

On push/PR to `main`/`master`, workflow **Tests & upload results** (`.github/workflows/test-results.yml`) runs Jest + Playwright and uploads a zip artifact **`test-results`** containing `tests/results/`.  
**Actions** → select the workflow run → **Artifacts** → download and unzip; open `playwright-report/index.html` in a browser.
