# UI Lead To-Do List

Actionable items from a full codebase audit, organized by priority within each category. Every item includes the file and line reference so you can jump straight to the code.

---

## 1. Accessibility

### HIGH - Icon-only buttons missing `aria-label`

Over 20 icon-only buttons have no accessible name. Screen readers announce these as blank.

| Button | File | Line(s) |
|--------|------|---------|
| Scroll left/right chevrons | `components/ages-stages.tsx` | 72-87 |
| Edit entry (pencil) | `components/daily-timeline.tsx` | 90-92 |
| Delete entry (trash) | `components/daily-timeline.tsx` | 100-107 |
| Edit diary (pencil) | `components/diary-journal.tsx` | 79-81 |
| Delete diary (trash) | `components/diary-journal.tsx` | 89-96 |
| Close presence mode (X) | `components/presence-mode.tsx` | 55-65 |
| Reset timer | `components/presence-mode.tsx` | 107-114 |
| Play/pause timer | `components/presence-mode.tsx` | 115-121 |
| Decrease feeding (minus) | `components/log-drawer.tsx` | 217-224 |
| Increase feeding (plus) | `components/log-drawer.tsx` | 228-235 |
| Back / close (X) | `components/log-drawer.tsx` | 396-402 |
| DrawerClose (X) | `components/log-drawer.tsx` | 404-406 |
| Notifications bell | `app/page.tsx` | 475-477 |
| Logout | `app/page.tsx` | 478-486 |
| Child settings gear | `app/page.tsx` | 430-437 |
| Edit measurement (pencil) | `app/page.tsx` | 335-337 |
| Delete measurement (trash) | `app/page.tsx` | 346-354 |

**Fix pattern:** Add `aria-label="Descriptive action"` to each button.

---

### HIGH - Form inputs missing label associations

Login form inputs have `<label>` elements without `htmlFor`, and inputs lack `id` attributes.

| Input | File | Line(s) |
|-------|------|---------|
| Email input | `app/page.tsx` | 141-149 |
| Password input | `app/page.tsx` | 152-162 |

Log drawer labels (Amount, Start Time, End Time, Weight, Height, Note, Tags) also lack proper `htmlFor`/`id` association:
- `components/log-drawer.tsx` lines 215, 244, 253, 282, 293, 310, 319

**Fix:** Add matching `id` to inputs and `htmlFor` to labels.

---

### HIGH - Touch targets too small (28x28px)

All `h-7 w-7` buttons are 28px, well below the 44px minimum. These appear across every component listed in the aria-label table above.

**Fix:** Increase to `h-9 w-9` minimum, or add padding so the tap area is at least 44x44px while keeping the icon visually small.

---

### MEDIUM - Interactive elements without keyboard support

Cards with `cursor-pointer` and/or `onClick` but missing `role="button"`, `tabIndex={0}`, and `onKeyDown` handler:

| Element | File | Line(s) |
|---------|------|---------|
| Stage cards (cursor-pointer, no handler) | `components/ages-stages.tsx` | 91-116 |
| Diary cards (cursor-pointer, no handler) | `components/diary-journal.tsx` | 51-100 |
| Presence card (onClick, no keyboard) | `components/presence-mode.tsx` | 137-151 |

**Fix:** Either remove `cursor-pointer` if not interactive, or add `role="button"`, `tabIndex={0}`, and keyboard handler.

---

### MEDIUM - Missing `aria-live` regions for dynamic content

| Content | File | Line(s) |
|---------|------|---------|
| Presence timer countdown | `components/presence-mode.tsx` | 99-103 |
| Session complete message | `components/presence-mode.tsx` | 125-130 |
| Progress ring percentages | `components/parenting-rings.tsx` | 59-94 |

**Fix:** Add `aria-live="polite"` to containers with dynamically updating text.

---

### MEDIUM - Active tab not announced

Bottom nav has no `aria-current="page"` on the active tab. Active state is indicated only by a tiny visual dot.

- `components/bottom-nav.tsx` lines 38-40

**Fix:** Add `aria-current="page"` to the active tab's button element.

---

## 2. Visual Polish

### HIGH - Hardcoded OKLCH colors instead of CSS variables

These files use raw `oklch(...)` strings instead of referencing the design tokens defined in `app/globals.css`:

| File | Line(s) | Color |
|------|---------|-------|
| `components/growth-chart.tsx` | 67, 68, 161-171 | Chart colors |
| `components/parenting-rings.tsx` | 67, 78, 89 | Ring colors |
| `components/presence-mode.tsx` | 83, 91 | SVG strokes |

**Fix:** Replace with `var(--chart-1)`, `var(--ring-sleep)`, etc. For Recharts/SVG contexts where CSS vars don't work directly, use a helper to resolve computed values, or keep a single source-of-truth constants file.

---

### HIGH - Missing empty state UI

When there's no data, the user sees a blank void with no guidance:

| Component | File | What's missing |
|-----------|------|----------------|
| Daily timeline (no entries today) | `components/daily-timeline.tsx` | ~line 69 |
| Diary journal (no entries) | `components/diary-journal.tsx` | ~line 50 |
| Growth chart (no measurements) | `components/growth-chart.tsx` | No check |

**Fix:** Add friendly empty state with icon + message + CTA (e.g., "No entries yet. Tap + to log your first activity.").

---

### MEDIUM - Hardcoded Tailwind color

`components/edit-child-dialog.tsx` line 130 uses `text-red-500` instead of `text-destructive`.

**Fix:** Change to `text-destructive` for theme consistency.

---

### MEDIUM - Broken timeline stagger animation

`components/daily-timeline.tsx` line 77-78 sets `animationDelay` in the style prop, but the Card element has no animation class to delay. The delay does nothing.

**Fix:** Add an entrance animation class (e.g., Tailwind `animate-in fade-in slide-in-from-bottom-2`) to the Card, or use Framer Motion stagger.

---

### LOW - Border-radius inconsistency

Five or more different radius values used with no clear system:

| Value | Used in |
|-------|---------|
| `rounded-xs` | dialog close button |
| `rounded-md` | buttons, inputs |
| `rounded-lg` | error messages |
| `rounded-xl` | cards |
| `rounded-2xl` | log drawer save button |
| `rounded-full` | circular icon buttons |

**Consider:** Standardizing to 3 tiers: `rounded-md` (small elements), `rounded-xl` (cards/panels), `rounded-full` (circular).

---

## 3. Animations

### HIGH - Zero `prefers-reduced-motion` support

No component or CSS file checks for reduced motion. Users who set this OS preference still see all animations.

**Fix for CSS animations** in `app/globals.css`:
```css
@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after {
    animation-duration: 0.01ms !important;
    transition-duration: 0.01ms !important;
  }
}
```

**Fix for Framer Motion** in `components/floating-action-menu.tsx`:
```tsx
import { useReducedMotion } from "framer-motion"
const shouldReduce = useReducedMotion()
```

---

### MEDIUM - Tab switching has no transition

`app/page.tsx` line 257 uses a `switch` statement that instantly swaps tab content with no animation.

**Fix:** Wrap tab content in `AnimatePresence` + `motion.div` with a fade or slide transition keyed by `activeTab`.

---

### MEDIUM - Inconsistent animation durations

| Component | Duration | Easing |
|-----------|----------|--------|
| FAB menu | 250ms | easeOut |
| Ring progress | 1000ms | ease-out |
| Presence circle | 1000ms | ease-linear |
| Pulse gentle | 3000ms | ease-in-out |
| Breathe | 4000ms | ease-in-out |

**Consider:** Defining duration tokens (e.g., `--duration-fast: 200ms`, `--duration-normal: 300ms`, `--duration-slow: 500ms`) in globals.css and referencing them consistently.

---

## 4. Performance

### MEDIUM - Components missing `React.memo`

These components receive props and re-render when parent context updates, even if their own props haven't changed:

| Component | File |
|-----------|------|
| DailyTimeline | `components/daily-timeline.tsx` |
| DiaryJournal | `components/diary-journal.tsx` |
| GrowthChart | `components/growth-chart.tsx` |

**Fix:** Wrap each export in `React.memo()`.

---

### MEDIUM - Missing `useCallback` on handlers

Event handlers recreated on every render in:

| Handler | File | Line(s) |
|---------|------|---------|
| `handleDelete` | `components/daily-timeline.tsx` | 59-63 |
| `handleDelete` | `components/diary-journal.tsx` | 34-38 |
| `renderTooltip` | `components/growth-chart.tsx` | 58-83 |
| Multiple onClick handlers | `components/log-drawer.tsx` | 221, 232, 248, 257 |

**Fix:** Wrap in `useCallback` with appropriate deps.

---

### MEDIUM - Missing `useMemo` for derived data

| Data | File | Line(s) |
|------|------|---------|
| `rings` config array | `components/parenting-rings.tsx` | 60-94 |

**Fix:** Wrap in `useMemo` with progress/goal values as deps.

---

### LOW - Heavy imports not code-split

| Library | Size | File | Recommendation |
|---------|------|------|----------------|
| Recharts | ~150KB | `components/growth-chart.tsx` | Lazy-load GrowthChart with `React.lazy()` + `Suspense` |
| Framer Motion | ~40KB | `components/floating-action-menu.tsx` | Lazy-load FloatingActionMenu |

---

### LOW - List virtualization (future)

DailyTimeline and DiaryJournal render all entries via `.map()`. Not a problem now, but will degrade as data grows. Plan to add `@tanstack/virtual` or `react-window` when lists exceed ~100 items.

---

## 5. Forms - Migrate to React Hook Form + Zod

React Hook Form and Zod are installed but unused. All 5 forms use raw `useState` with manual validation:

| Form | File | State vars | Priority |
|------|------|-----------|----------|
| LoginForm | `app/page.tsx` | 5 | Medium |
| AddChildDialog | `components/add-child-dialog.tsx` | 5 | Medium |
| EditChildDialog | `components/edit-child-dialog.tsx` | 5 | Low |
| FirstChildSetup | `components/first-child-setup.tsx` | 5 | Low |
| LogDrawer | `components/log-drawer.tsx` | 13 | Medium (most complex) |

**Benefits of migrating:** Fewer re-renders, cleaner code, reusable Zod schemas, better type safety, consistent error display.

---

## 6. Security

### MEDIUM - Console.error leaks full error objects in production

7 locations log full error objects which may contain stack traces, internal paths, or Firebase details:

| File | Line(s) |
|------|---------|
| `lib/children-context.tsx` | 82, 115, 131, 145 |
| `lib/logs-context.tsx` | 115, 122, 147, 165, 181 |
| `app/page.tsx` | 92, 115 |
| `components/log-drawer.tsx` | 198 |
| `components/first-child-setup.tsx` | 97 |
| `components/add-child-dialog.tsx` | 85 |
| `components/error-boundary.tsx` | 27 |

**Fix:** Gate verbose logging behind `process.env.NODE_ENV === 'development'`. In production, log only the error message string.

---

### LOW - Dependency audit

Run `pnpm audit` and address any critical/high vulnerabilities. Set up a recurring cadence (e.g., before each deploy).

---

## 7. Responsive

### MEDIUM - Inconsistent input heights

Default `Input` component is `h-9` (36px) but form inputs in dialogs use `h-10` (40px). Pick one and standardize.

- `components/ui/input.tsx` line 11: `h-9`
- `components/first-child-setup.tsx`, `components/add-child-dialog.tsx`: `h-10`

---

### LOW - Sticky header doesn't account for mobile browser chrome

`app/page.tsx` line 401 uses `sticky top-0` but doesn't account for iOS Safari/Android Chrome dynamic toolbars.

**Consider:** Adding `env(safe-area-inset-top)` padding or using `viewport-fit=cover` in the meta viewport tag.
