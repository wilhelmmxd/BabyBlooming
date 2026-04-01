# Copilot Instructions for Parenting App

Purpose: Help AI coding agents work productively in this Next.js + Firebase project by capturing real patterns, workflows, data flow conventions, and UI standards.

## Overview
- Stack: Next.js 16 App Router, React 19, TypeScript, Tailwind CSS v4, shadcn/radix UI, lucide-react, Recharts, Framer Motion, Firebase (Auth + Firestore).
- Architecture: Single-page dashboard (`app/page.tsx`) with three interconnected React Context providers managing auth, children data (profiles), and activity logs.
- Entry: `app/layout.tsx` wraps providers (`AuthProvider` → `ChildrenProvider` → `LogsProvider`) and renders with dark theme forced via `<html class="dark">`.
- Data: Real-time Firestore collections (users auto-created by Firebase Auth, `children` collection, `logs` subcollections per child) synced via `onSnapshot` listeners.
- Forms: React Hook Form + Zod for schema-validated input handling (`@hookform/resolvers`).
- Aliases: Use `@/*` imports (see `tsconfig.json`); all paths relative to workspace root.

## Provider Architecture & Data Flow
1. **AuthProvider** (`lib/auth-context.tsx`): Firebase Auth state (login/signup/logout/Google OAuth). Wraps entire app; triggers auth listener on init.
2. **ChildrenProvider** (`lib/children-context.tsx`): Loads Firestore `children` collection (scoped by `userId == auth.user.uid`). Real-time `onSnapshot` listener. Exposes `children[]`, `activeChild`, `addChild()`, `deleteChild()`.
3. **LogsProvider** (`lib/logs-context.tsx`): Loads Firestore `logs` subcollection for active child (scoped by userId + childId). Derives `TimelineEntry[]`, `DiaryEntry[]`, `GrowthDataPoint[]`, and progress metrics (sleep/feeding/presence counts & goals). Exposes `addLog(type, data)`.

**Critical**: Providers must wrap in order (`AuthProvider` → `ChildrenProvider` → `LogsProvider` in `layout.tsx`). Auth initializes first; children queries depend on user; logs queries depend on activeChild.

**Data flow**: User logs in → Auth context updates → Children load → activeChild auto-set → Logs stream starts → Domain components re-render from context hooks.

## Firestore Data Model
- **Collections**:
  - `users`: Implicit, created by Firebase Auth per login.
  - `children`: User-scoped documents with `{ userId, name, birthDate?, sex?, createdAt }`.
  - `logs`: Subcollection under each child with `{ userId, childId, type, createdAt, data }`.
- **Log types & shapes**: `type` is discriminated union (`"feeding" | "sleep" | "play" | "growth" | "diary"`). Each has type-specific fields in nested `data` object (e.g., sleep: `{ startTime, endTime }`).
- **Multi-child isolation**: ChildrenProvider sets `activeChild` on first load; LogsProvider filters by userId + childId, ensuring no cross-child data leakage.

## UI Architecture
- **Domain components** (`components/*.tsx`): ParentingRings, DailyTimeline, GrowthChart, DiaryJournal, AgesStages, PresenceMode, FloatingActionMenu, ErrorBoundary. Consume context hooks, compose UI primitives, render business logic.
- **UI primitives** (`components/ui/*`): button, card, drawer, switch, dialog, dropdown-menu, input, label, textarea, separator, spinner, toaster, etc. Follow shadcn/radix patterns. Use `cva` for variants, `cn()` (from `lib/utils.ts`) for class merging.
- **Custom hooks** (`hooks/`): `use-toast.ts` (toast notifications), `use-mobile.ts` (mobile viewport detection). Place new hooks here.
- **Page orchestration** (`app/page.tsx`): Conditional render—LoginForm (if no user) or main dashboard with bottom nav tabs + LogDrawer overlay. Manages `activeTab` state locally.
- **Navigation**: Sticky header (greeting, child selector, settings), fixed bottom nav bar (Home, Growth, Diary, Discover tabs), floating action menu for quick log entry.
- **Styling**: Tailwind v4 CSS tokens in `app/globals.css` (OKLCH palette). Design tokens: `--ring-sleep`, `--ring-feeding`, `--ring-presence`, `--chart-*`. Always use semantic Tailwind classes (`text-foreground`, `bg-card`, `border-border`) for theme consistency.

## Log Drawer Pattern
- **Location**: `components/log-drawer.tsx`
- **Icon/color mapping**: Define in `logOptions[]` array; each entry has `type`, `label`, `icon`, `color` (text), `bgColor` (background).
- **Form state**: Separate local state per log type (e.g., `feedingAmount`, `sleepStart`/`sleepEnd`, `weight`/`height`).
- **Normalization**: `handleSave()` switch statement normalizes form state to flat `data: Record<string, unknown>` payload, calls `addLog(type, data)`.
- **Extension**: To add new log type, extend `LogType`, add to `logOptions[]`, add form UI section, add case in switch.

## Charts & Transforms
- **GrowthChart** (`components/growth-chart.tsx`): Uses Recharts `ComposedChart` inside `ResponsiveContainer`. Expects `GrowthDataPoint[]` (date, weight?, height?, percentile?). Preserve responsive wrapper and custom gradients.
- **DailyTimeline** (`components/daily-timeline.tsx`): Expects `TimelineEntry[]` (id, type, timestamp, label, icon, color, data). Sorted by timestamp descending. LogsProvider derives this from raw Firestore logs.
- **ParentingRings** (`components/parenting-rings.tsx`): Displays progress rings using `sleepProgress`, `feedingProgress`, `presenceProgress` (0–100) and goals from LogsProvider.

## Build & Dev Workflow
- **Package manager**: pnpm (lockfile: `pnpm-lock.yaml`).
- **Commands**:
  - `pnpm dev`: Start Next.js dev server (http://localhost:3000).
  - `pnpm build`: Compile (ignores TS errors, see config).
  - `pnpm lint`: Run ESLint.
  - `pnpm start`: Run production build.
  - `pnpm audit` / `pnpm audit:fix`: Check and fix dependency vulnerabilities.
  - `pnpm security:gitleaks`: Scan for leaked secrets/credentials.
- **Node version**: LTS 20+ recommended (Cloud Functions target Node 24).
- **Environment**: Set `.env.local` with Firebase credentials (config object for `initializeApp`). Never commit `.env` files.
- **Firebase emulators**: Auth (port 9099) and Firestore (port 8080) emulators configured. Run `firebase emulators:start` for local development without hitting production.
- **CI/CD**: GitHub Actions (`.github/workflows/firebase-hosting-merge.yml`) auto-deploys to Firebase Hosting on push to `main`.

## Config & Notable Behaviors
- **TypeScript**: `tsconfig.json` has path alias `@/*` and `moduleResolution: bundler` (Next 13+ style).
- **Next.js**: `next.config.mjs` sets `typescript.ignoreBuildErrors = true` and `eslint.ignoreDuringBuilds = true` (fix locally, not in CI).
- **CSS**: Tailwind v4 via `postcss.config.mjs` (`@tailwindcss/postcss`). Theme tokens in `app/globals.css` (active). A second `styles/globals.css` exists but is not imported.
- **Metadata**: Set in `app/layout.tsx` (title: "Nurture - Parenting Tracker", icons, viewport settings).

## Common Patterns & Examples
- **Consuming context**:
  ```tsx
  const { user } = useAuth()
  const { children, activeChild, addChild } = useChildren()
  const { timelineEntries, growthData, addLog } = useLogs()
  ```
- **Adding a new log type**:
  1. Extend `LogType` in context.
  2. Add entry to `logOptions[]` in LogDrawer.
  3. Add form UI section (inputs, state) in LogDrawer.
  4. Add case in `handleSave()` switch to normalize data.
- **Creating a UI primitive**:
  1. Create file in `components/ui/*`.
  2. Use `cva` for variants; export interface for props.
  3. Use `cn()` to merge classes.
  4. Compose into domain component and pass props.
- **Styling with tokens**:
  ```tsx
  <div className="bg-card text-foreground border border-border">
    <Moon className="text-ring-sleep" />
  </div>
  ```

## Gotchas & Critical Assumptions
- **Context hooks require `"use client"`**: Any file using `useAuth()`, `useChildren()`, `useLogs()` must have `"use client"` at top.
- **Provider ordering matters**: Auth → Children → Logs. Children queries fail if auth not ready; Logs queries fail if activeChild not set.
- **Real-time listeners persist**: `onSnapshot` unsubscribes in useEffect cleanup. Don't manually refetch logs; rely on listener updates.
- **activeChild is central**: Always check `activeChild !== null` before rendering logs. Null means no child selected (e.g., first load, or all children deleted).
- **Semantic over raw classes**: Never hardcode colors like `#ff0000`; use `--ring-sleep` tokens or Tailwind semantic classes for light/dark compatibility.
- **Firebase auth state matters**: Some UI (LogDrawer, AddChildDialog) checks `user` and `user?.email`. Form actions require authenticated context.

## UI Performance Guidelines
- **Memoization**: Use `useMemo` for expensive derived data (growth percentile calculations, timeline transforms). Use `useCallback` for functions passed as props to prevent child re-renders. Context providers already apply this pattern—follow it in new components.
- **Component lazy loading**: For heavy components (GrowthChart with Recharts, AgesStages), consider `React.lazy()` + `Suspense` for code splitting by tab.
- **Real-time listener efficiency**: `onSnapshot` listeners auto-update state. Never add manual `getDocs()` refetch calls alongside listeners—this causes double renders and wasted reads.
- **List virtualization**: The DailyTimeline and DiaryJournal currently render all entries. For users with large datasets, implement windowed rendering (e.g., `react-window` or `@tanstack/virtual`) when list sizes exceed ~100 items.
- **Image optimization**: `next.config.mjs` currently has `images.unoptimized: true`. If images are added (e.g., diary photos), enable Next.js Image optimization or use Firebase Storage with CDN.
- **Bundle awareness**: Recharts, Framer Motion, and date-fns are the heaviest dependencies. Import only needed modules (e.g., `import { format } from "date-fns"` not `import * as dateFns`).

## Animation Patterns (Framer Motion)
- **Installed**: `framer-motion` v12.23 is available project-wide.
- **Current usage**: Ring progress transitions (CSS, 1s duration), breathing pulse on presence mode, gentle icon pulses, backdrop blur on overlays.
- **Conventions**: Use Framer Motion for entrance/exit animations, layout transitions, and gesture-based interactions. Keep durations under 300ms for micro-interactions, 500ms max for page transitions. Respect `prefers-reduced-motion` media query.
- **Pattern**:
  ```tsx
  import { motion, AnimatePresence } from "framer-motion"

  <AnimatePresence>
    {isVisible && (
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -8 }}
        transition={{ duration: 0.2 }}
      />
    )}
  </AnimatePresence>
  ```

## Form Validation Patterns
- **Libraries**: React Hook Form (`useForm`) + Zod schemas (`z.object(...)`) + `@hookform/resolvers/zod`.
- **Convention**: Define Zod schemas alongside or above the component that uses them. Use `zodResolver(schema)` in `useForm({ resolver })`. Display errors via `formState.errors`.
- **Sanitization**: Always trim string inputs. Validate numeric ranges (e.g., weight 0.1–50 kg, height 20–150 cm). Validate dates are not in the future.
- **Pattern**:
  ```tsx
  const schema = z.object({
    name: z.string().min(1, "Required").max(50),
    birthDate: z.string().optional(),
  })
  const form = useForm({ resolver: zodResolver(schema) })
  ```

## UI Security Standards
- **Auth guards**: Always check `user` from `useAuth()` before rendering protected UI or calling mutations. The main page already gates on auth state—maintain this pattern for any new routes or modals.
- **Input sanitization**: All user inputs that render back to the DOM must be passed through React's JSX (which auto-escapes). Never use `dangerouslySetInnerHTML` unless absolutely necessary and with sanitized content.
- **XSS prevention**: Rely on React's built-in escaping. Never construct HTML strings from user data. Never eval() or Function() user input.
- **Firestore rules**: Security rules in `firestore.rules` enforce `request.auth.uid == resource.data.userId` on all operations. Any new collections or subcollections must follow this pattern.
- **Storage rules**: Firebase Storage is currently locked (`allow read, write: if false`). Update rules with proper auth checks before enabling uploads.
- **Secrets management**: Firebase config keys are public by design (restricted by Firestore rules). Never commit API secrets, service account keys, or `.env` files. Use `pnpm security:gitleaks` to scan before pushing.
- **Dependency hygiene**: Run `pnpm audit` regularly. Address critical and high severity vulnerabilities before deploying.

## Accessibility Standards
- **Semantic HTML**: Use `<button>` for actions, `<a>` for navigation, `<input>` with associated `<label>`. Never use `<div onClick>` for interactive elements.
- **ARIA attributes**: Add `aria-label` to icon-only buttons (e.g., close, delete). Use `role="status"` for live-updating content (ring progress, timer). Use `aria-live="polite"` for toast notifications.
- **Keyboard navigation**: All interactive elements must be focusable and operable via keyboard. Tab order should follow visual layout. Drawers and dialogs must trap focus when open.
- **Color contrast**: OKLCH tokens are tuned for dark theme. Verify contrast ratios meet WCAG 2.1 AA (4.5:1 for normal text, 3:1 for large text) when modifying theme colors.
- **Touch targets**: Minimum 44x44px touch targets for mobile. Bottom nav icons and FAB buttons must meet this requirement.
- **Motion sensitivity**: Wrap non-essential animations in `@media (prefers-reduced-motion: reduce)` checks. Framer Motion supports `useReducedMotion()` hook.

## Responsive & Mobile-First Design
- **Viewport**: Mobile-first design with main content area capped at `max-w-md` (28rem / 448px) centered horizontally.
- **Mobile detection**: Use `useMobile()` hook (`hooks/use-mobile.ts`) for conditional rendering based on viewport width.
- **Touch interactions**: Bottom nav and drawer are designed for thumb-reach zones. Keep primary actions in the bottom half of the screen.
- **Layout conventions**: Sticky header at top, scrollable content area in middle, fixed bottom nav. Content should never be obscured by fixed elements (use proper padding/margin offsets).
- **Breakpoints**: Design for mobile first (< 448px), then tablet/desktop as progressive enhancement. Most users will be on mobile.

