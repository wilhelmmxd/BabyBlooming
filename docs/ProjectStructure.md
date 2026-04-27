# Project Structure: BabyBlooming

A map of the repository to assist with navigation and development.

## 📂 Core Directories
| Folder | Purpose |
|:---|:---|
| `.firebase/` | Local Firebase cache and hosting configurations. |
| `.github/` | GitHub Action workflows for automated testing and deployment. |
| `app/` | Next.js App Router: Contains all application pages and layouts. |
| `components/` | Reusable UI elements (Buttons, Navbars, Forms). |
| `functions/` | Firebase Cloud Functions for backend logic. |
| `hooks/` | Custom React hooks for state and Auth logic. |
| `lib/` | Library configurations (Firebase setup, API clients). |
| `public/` | Static assets like logos, images, and manifest files. |
| `scripts/` | Build and maintenance scripts. |
| `tests/` | Full test suite: Unit (Jest), Integration, and E2E (Playwright). |

## ⚙️ Key Configuration Files
- `firestore.rules`: Security logic for the database.
- `next.config.mjs`: Next.js framework settings.
- `package.json`: Script definitions and project dependencies.
- `tsconfig.json`: TypeScript compiler settings.
- `vercel.json`: Deployment settings for Vercel.

## 🧪 Testing Layout
- `tests/unit_tests/`: Logic-specific unit tests.
- `tests/integration/`: Component interaction tests.
- `tests/e2e/`: Full browser flow specs using Playwright.
