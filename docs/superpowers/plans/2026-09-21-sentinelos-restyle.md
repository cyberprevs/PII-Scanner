# SentinelOS Restyle Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Restyle PII Scanner's frontend to match the "SentinelOS" cyan/dark
aesthetic extracted from a downloaded Figma community template, by changing
design tokens and removing hardcoded colors — no page structure, routing, or
menu changes.

**Architecture:** All visual identity flows through one file,
`pii-scanner-ui/src/theme/designSystem.ts` (`tokens` object → `createAppTheme()`
→ MUI v7 theme, plus helpers `glassCardSx()`, `getRechartsTooltipStyle()`,
`chartColors`, `gradients`). Changing the values in that one file cascades
through every page automatically. The remaining work is finding and replacing
hardcoded hex colors that bypass the token system (15 files, ~49 occurrences of
the old accent `#00E599`), plus a small addition (JetBrains Mono font) and one
behavior change (`glassCardSx` switches from blur to a flat bordered style).

**Tech Stack:** React 19, TypeScript, MUI v7, Recharts. No new npm
dependencies — JetBrains Mono is loaded via a Google Fonts `<link>`, same
mechanism already used for Plus Jakarta Sans.

**Spec:** `docs/superpowers/specs/2026-09-21-cyber-sentinel-restyle-design.md`

## Global Constraints

- Accent color (dark mode): `#00D4FF`. Accent color (light mode): `#0092B8`
  (darkened for AA contrast on white — verified in the spec's risk section).
- Every hardcoded `#00E599` (and its gradient/opacity variants) must be
  replaced by a reference to a token (`tokens.colors.accentPrimary`,
  `gradients.primary`, or `chartColors`) — never by a new hardcoded hex.
- No page is added, removed, renamed, or moved between routes. No menu item
  changes. No new npm package is added.
- `npm run lint`, `npm run test:run`, and `npm run build` must stay green
  after every task that touches `pii-scanner-ui/`.
- `glassCardSx(darkMode)` changes from a blur/glassmorphism style to a flat
  bordered style (template has no `backdrop-filter`) — this is a deliberate
  behavior change documented in the spec's risks section, not a bug.

---

## Task 1: Update core design tokens

**Files:**
- Modify: `pii-scanner-ui/src/theme/designSystem.ts`

**Interfaces:**
- Produces: `tokens.colors.accentPrimary` = `'#00D4FF'` (dark) — same export
  name, new value. `tokens.colors.light.*` gains a light-mode cyan accent.
  `gradients.primary` and `chartColors[0]` automatically follow since they
  derive from `tokens.colors.accentPrimary`.

This task changes only values inside the existing `tokens` object and
`createAppTheme`/`glassCardSx`/`chartColors` functions — no new exports, no
renamed exports, so every file that already does
`import { tokens, gradients, chartColors, glassCardSx } from '../../theme/designSystem'`
keeps working unchanged.

- [ ] **Step 1: Replace the dark-mode color tokens**

In `pii-scanner-ui/src/theme/designSystem.ts`, replace the `colors` block
(lines 8–53) with:

```typescript
export const tokens = {
  colors: {
    // Backgrounds
    bgPrimary: '#07090D',
    bgSurface: '#0D1117',
    bgSurfaceRaised: '#111827',
    bgInput: '#111827',

    // Borders
    borderDefault: 'rgba(255, 255, 255, 0.07)',
    borderMuted: 'rgba(255, 255, 255, 0.04)',
    borderFocus: '#00D4FF',

    // Accent
    accentPrimary: '#00D4FF',
    accentPrimaryHover: '#33DDFF',
    accentPrimaryMuted: 'rgba(0, 212, 255, 0.12)',
    accentPrimaryText: '#07090D', // text on accent buttons

    // Text
    textPrimary: '#E2E8F0',
    textSecondary: '#94A3B8',
    textTertiary: '#64748B',

    // Semantic
    danger: '#FF3366',
    dangerMuted: 'rgba(255, 51, 102, 0.12)',
    warning: '#FB923C',
    warningMuted: 'rgba(251, 146, 60, 0.12)',
    success: '#00FF87',
    successMuted: 'rgba(0, 255, 135, 0.12)',
    info: '#A78BFA',
    infoMuted: 'rgba(167, 139, 250, 0.12)',

    // Light mode overrides
    light: {
      bgPrimary: '#F4F6FA',
      bgSurface: '#FFFFFF',
      bgSurfaceRaised: '#F8FAFC',
      bgInput: '#F4F6FA',
      borderDefault: '#E2E8F0',
      borderMuted: '#EEF2F6',
      textPrimary: '#0F172A',
      textSecondary: '#64748B',
      textTertiary: '#94A3B8',
    },
  },
```

Note: `accentPrimaryHover` is now a lighter cyan (`#33DDFF`) rather than a
darker shade, because `#00D4FF` is already near-maximum brightness — darkening
it (as the old `#00E599` → `#00CC88` pattern did) would move it toward a dull
teal instead of reading as "hover". `light.borderDefault`/`light.textPrimary`
use the exact values from the spec's light-mode table.

- [ ] **Step 2: Add a light-mode accent override**

The `light` sub-object doesn't currently carry its own accent color — code
that needs the light-mode accent must use a different value than
`accentPrimary` (`#00D4FF` fails AA contrast on white, per the spec). Add one
field to the `light` object from Step 1:

```typescript
    light: {
      bgPrimary: '#F4F6FA',
      bgSurface: '#FFFFFF',
      bgSurfaceRaised: '#F8FAFC',
      bgInput: '#F4F6FA',
      borderDefault: '#E2E8F0',
      borderMuted: '#EEF2F6',
      textPrimary: '#0F172A',
      textSecondary: '#64748B',
      textTertiary: '#94A3B8',
      accentPrimary: '#0092B8',
      accentPrimaryText: '#FFFFFF',
    },
```

- [ ] **Step 3: Fix `gradients.primary`'s hardcoded second stop**

`gradients.primary` currently is:

```typescript
export const gradients = {
  primary: `linear-gradient(135deg, ${tokens.colors.accentPrimary} 0%, #00B876 100%)`,
```

The `#00B876` second stop is the *old* dark-green hover shade, hardcoded
independently of `tokens.colors.accentPrimary` — Step 1 changed
`accentPrimary` to cyan, but this line wasn't touched by that edit and would
still produce a cyan-to-dark-green gradient if left as-is. Fix it to use the
new `accentPrimaryHover` token instead of a hardcoded hex:

```typescript
export const gradients = {
  primary: `linear-gradient(135deg, ${tokens.colors.accentPrimary} 0%, ${tokens.colors.accentPrimaryHover} 100%)`,
```

(`danger`, `info`, and `warning` below it already reference their tokens
correctly for both stops — no change needed there.)

- [ ] **Step 4: Update `createAppTheme` to use the light accent**

In the same file, find the `createAppTheme` function (around line 115). It
currently does:

```typescript
    palette: {
      mode: darkMode ? 'dark' : 'light',
      primary: {
        main: c.accentPrimary,
        contrastText: c.accentPrimaryText,
      },
```

Change it to pick the light-mode accent when `darkMode` is false:

```typescript
    palette: {
      mode: darkMode ? 'dark' : 'light',
      primary: {
        main: darkMode ? c.accentPrimary : light.accentPrimary,
        contrastText: darkMode ? c.accentPrimaryText : light.accentPrimaryText,
      },
```

(`light` is already destructured as `const light = c.light;` earlier in the
function — confirm this line exists before the `return createTheme(...)` call;
it does in the current file at the top of `createAppTheme`.)

Also find every other place inside `createAppTheme`'s `components` overrides
that references `c.accentPrimary` directly without a `darkMode ? ... : ...`
light/dark split (e.g. `MuiButton.styleOverrides.contained.backgroundColor`,
`MuiButton.styleOverrides.outlined['&:hover'].borderColor`,
`MuiTextField` focus border, `MuiSwitch` checked color). For each one, change
`c.accentPrimary` to `(darkMode ? c.accentPrimary : light.accentPrimary)` and
`c.accentPrimaryHover` to `(darkMode ? c.accentPrimaryHover : light.accentPrimary)`
so the light theme doesn't render an unreadable cyan-on-white primary button.

- [ ] **Step 5: Replace `glassCardSx` with the flat template style**

Currently:

```typescript
export function glassCardSx(darkMode: boolean): Record<string, unknown> {
  if (!darkMode) return {};
  return {
    backgroundColor: 'rgba(255, 255, 255, 0.03)',
    backdropFilter: 'blur(12px)',
    WebkitBackdropFilter: 'blur(12px)',
    border: '1px solid rgba(255, 255, 255, 0.08)',
  };
}
```

Replace with the template's flat bordered-card style (no blur), applied in
both modes so light mode also gets a defined border instead of the current
no-op:

```typescript
export function glassCardSx(darkMode: boolean): Record<string, unknown> {
  return {
    backgroundColor: darkMode ? tokens.colors.bgSurface : tokens.colors.light.bgSurface,
    border: `1px solid ${darkMode ? tokens.colors.borderDefault : tokens.colors.light.borderDefault}`,
  };
}
```

- [ ] **Step 6: Update `chartColors` to lead with the new accent**

Currently:

```typescript
export const chartColors = [
  '#00E599', '#3B82F6', '#F0A000', '#F45252',
  '#A78BFA', '#EC4899', '#06B6D4', '#84CC16',
];
```

Replace with:

```typescript
export const chartColors = [
  '#00D4FF', '#3B82F6', '#FB923C', '#FF3366',
  '#A78BFA', '#EC4899', '#00FF87', '#84CC16',
];
```

(First entry follows the new accent; second entry `danger` position swapped
to the template's `#FF3366` to match; other entries unchanged since the
template doesn't define a full 8-color chart palette.)

- [ ] **Step 7: Verify the file still builds**

Run: `cd pii-scanner-ui && npx tsc --noEmit`
Expected: no new TypeScript errors (the edits only changed string literal
values and added one field to an existing object shape).

- [ ] **Step 8: Commit**

```bash
cd pii-scanner-ui
git add src/theme/designSystem.ts
git commit -m "Restyle: update design tokens to SentinelOS cyan palette

Co-Authored-By: Claude Sonnet 5 <noreply@anthropic.com>"
```

---

## Task 2: Load JetBrains Mono font

**Files:**
- Modify: `pii-scanner-ui/index.html`

**Interfaces:**
- Consumes: nothing from Task 1.
- Produces: the CSS font-family name `'JetBrains Mono'` becomes available
  globally for Task 3+ to reference in `sx={{ fontFamily: ... }}`.

- [ ] **Step 1: Add the Google Fonts link**

In `pii-scanner-ui/index.html`, find:

```html
    <!-- Google Fonts - Plus Jakarta Sans -->
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@300;400;500;600;700;800&display=swap" rel="stylesheet">
```

Replace with (adds JetBrains Mono to the same request, avoiding a second
`preconnect` pair):

```html
    <!-- Google Fonts - Plus Jakarta Sans + JetBrains Mono (technical/badge text) -->
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@300;400;500;600;700;800&family=JetBrains+Mono:wght@400;500;600&display=swap" rel="stylesheet">
```

- [ ] **Step 2: Verify the dev server loads the font**

Run: `cd pii-scanner-ui && npm run dev` (in background, or note the port)
Then open `http://127.0.0.1:3000` in a browser, open DevTools → Network,
filter `font`, reload — confirm a request to `fonts.gstatic.com` for a
`jetbrainsmono` file succeeds (status 200). Stop the dev server after
confirming.

- [ ] **Step 3: Commit**

```bash
cd pii-scanner-ui
git add index.html
git commit -m "Restyle: load JetBrains Mono for technical/badge text

Co-Authored-By: Claude Sonnet 5 <noreply@anthropic.com>"
```

---

## Task 3: Replace hardcoded accent color in App.tsx and Results.tsx

**Files:**
- Modify: `pii-scanner-ui/src/App.tsx:510,527,547`
- Modify: `pii-scanner-ui/src/components/Results.tsx:48,162`

**Interfaces:**
- Consumes: `tokens.colors.accentPrimary`, `gradients.primary`, `chartColors`
  from Task 1's `designSystem.ts`.

- [ ] **Step 1: Check current imports in `App.tsx`**

Run: `grep -n "from '.*theme/designSystem'" pii-scanner-ui/src/App.tsx`

If no match, add near the top of `pii-scanner-ui/src/App.tsx` alongside the
other local imports:

```typescript
import { tokens, gradients } from './theme/designSystem';
```

(If the app uses a relative path other than `./theme/designSystem` for other
imports in this file, match that existing path instead.)

- [ ] **Step 2: Replace the three hardcoded values in `App.tsx`**

Line 510: `<LockIcon sx={{ color: '#00E599' }} />`
→ `<LockIcon sx={{ color: tokens.colors.accentPrimary }} />`

Line 527: `sx={{ flex: 1, fontFamily: 'monospace', letterSpacing: 2, color: '#00E599' }}`
→ `sx={{ flex: 1, fontFamily: 'monospace', letterSpacing: 2, color: tokens.colors.accentPrimary }}`

Line 547: `sx={{ background: 'linear-gradient(135deg, #00E599 0%, #00B876 100%)', fontWeight: 600 }}`
→ `sx={{ background: gradients.primary, fontWeight: 600 }}`

- [ ] **Step 3: Replace hardcoded values in `Results.tsx`**

Check current imports: `grep -n "from '.*theme/designSystem'" pii-scanner-ui/src/components/Results.tsx`

If no match, add near the top:

```typescript
import { chartColors } from '../theme/designSystem';
```

Line 48: `const COLORS = ['#00E599', '#3B82F6', '#F0A000', '#F45252', '#A78BFA', '#EC4899', '#06B6D4', '#84CC16'];`
→ `const COLORS = chartColors;`

Line 162: `<Bar dataKey="count" fill="#00E599" name="Nombre de PII" radius={[4, 4, 0, 0]} />`
→ `<Bar dataKey="count" fill={chartColors[0]} name="Nombre de PII" radius={[4, 4, 0, 0]} />`

- [ ] **Step 4: Verify no `#00E599` remains in these two files**

Run: `grep -n "#00E599" pii-scanner-ui/src/App.tsx pii-scanner-ui/src/components/Results.tsx`
Expected: no output (both files clean).

- [ ] **Step 5: Verify the app still builds and lints**

Run: `cd pii-scanner-ui && npx tsc --noEmit && npm run lint`
Expected: no new errors or warnings.

- [ ] **Step 6: Commit**

```bash
cd pii-scanner-ui
git add src/App.tsx src/components/Results.tsx
git commit -m "Restyle: replace hardcoded accent color in App.tsx and Results.tsx

Co-Authored-By: Claude Sonnet 5 <noreply@anthropic.com>"
```

---

## Task 4: Replace hardcoded accent color in ConsentModal, About, AuditTrail

**Files:**
- Modify: `pii-scanner-ui/src/components/common/ConsentModal.tsx:152`
- Modify: `pii-scanner-ui/src/components/pages/About.tsx:43,78`
- Modify: `pii-scanner-ui/src/components/pages/AuditTrail.tsx:65,341`

**Interfaces:**
- Consumes: `tokens.colors.accentPrimary`, `gradients.primary`, `chartColors`
  from Task 1's `designSystem.ts`.

- [ ] **Step 1: `ConsentModal.tsx`**

Check import: `grep -n "from '.*theme/designSystem'" pii-scanner-ui/src/components/common/ConsentModal.tsx`
Add if missing (path is two levels up from `components/common/`):

```typescript
import { gradients } from '../../theme/designSystem';
```

Line 152: `? 'linear-gradient(135deg, #00E599 0%, #00B876 100%)'`
→ `? gradients.primary`

- [ ] **Step 2: `About.tsx`**

Check import: `grep -n "from '.*theme/designSystem'" pii-scanner-ui/src/components/pages/About.tsx`
Add if missing:

```typescript
import { gradients } from '../../theme/designSystem';
```

Both occurrences (lines 43 and 78):
`background: 'linear-gradient(135deg, #00E599 0%, #00B876 100%)',`
→ `background: gradients.primary,`

- [ ] **Step 3: `AuditTrail.tsx`**

Check import: `grep -n "from '.*theme/designSystem'" pii-scanner-ui/src/components/pages/AuditTrail.tsx`
Add if missing:

```typescript
import { chartColors } from '../../theme/designSystem';
```

Line 65: `const COLORS = ['#00E599', '#3B82F6', '#F0A000', '#F45252', '#A78BFA', '#EC4899'];`
→ `const COLORS = chartColors;`

Line 341: `<Bar dataKey="count" fill="#00E599" />`
→ `<Bar dataKey="count" fill={chartColors[0]} />`

- [ ] **Step 4: Verify clean**

Run: `grep -n "#00E599" pii-scanner-ui/src/components/common/ConsentModal.tsx pii-scanner-ui/src/components/pages/About.tsx pii-scanner-ui/src/components/pages/AuditTrail.tsx`
Expected: no output.

- [ ] **Step 5: Verify build**

Run: `cd pii-scanner-ui && npx tsc --noEmit && npm run lint`
Expected: no new errors or warnings.

- [ ] **Step 6: Commit**

```bash
cd pii-scanner-ui
git add src/components/common/ConsentModal.tsx src/components/pages/About.tsx src/components/pages/AuditTrail.tsx
git commit -m "Restyle: replace hardcoded accent color in ConsentModal, About, AuditTrail

Co-Authored-By: Claude Sonnet 5 <noreply@anthropic.com>"
```

---

## Task 5: Replace hardcoded accent color in DataRetention, DecryptReport, PiiCategoryAnalysis

**Files:**
- Modify: `pii-scanner-ui/src/components/pages/DataRetention.tsx:53,271`
- Modify: `pii-scanner-ui/src/components/pages/DecryptReport.tsx:228`
- Modify: `pii-scanner-ui/src/components/pages/PiiCategoryAnalysis.tsx:241`

**Interfaces:**
- Consumes: `tokens.colors.accentPrimary`, `gradients.primary` from Task 1's
  `designSystem.ts`.

- [ ] **Step 1: `DataRetention.tsx`**

Check import: `grep -n "from '.*theme/designSystem'" pii-scanner-ui/src/components/pages/DataRetention.tsx`
Add if missing:

```typescript
import { tokens, gradients } from '../../theme/designSystem';
```

Line 53 (this is a category color, using `#00E599` as the "identity data"
category's swatch — keep it tied to the accent so the "signature" category
stays visually distinct):
```typescript
    { category: 'Données d\'identité (IFU, CNI, Passeport, RCCM)', description: 'Documents d\'identité et fiscaux', defaultPeriod: 3, currentPeriod: 3, color: '#00E599', icon: '•' },
```
→
```typescript
    { category: 'Données d\'identité (IFU, CNI, Passeport, RCCM)', description: 'Documents d\'identité et fiscaux', defaultPeriod: 3, currentPeriod: 3, color: tokens.colors.accentPrimary, icon: '•' },
```

Line 271: `background: 'linear-gradient(135deg, #00E599 0%, #00B876 100%)',`
→ `background: gradients.primary,`

- [ ] **Step 2: `DecryptReport.tsx`**

Check import: `grep -n "from '.*theme/designSystem'" pii-scanner-ui/src/components/pages/DecryptReport.tsx`
Add if missing:

```typescript
import { gradients } from '../../theme/designSystem';
```

Line 228: `background: 'linear-gradient(135deg, #00E599 0%, #00B876 100%)',`
→ `background: gradients.primary,`

- [ ] **Step 3: `PiiCategoryAnalysis.tsx`**

Check import: `grep -n "from '.*theme/designSystem'" pii-scanner-ui/src/components/pages/PiiCategoryAnalysis.tsx`
Add if missing:

```typescript
import { tokens } from '../../theme/designSystem';
```

Line 241: `<stop offset="0%" stopColor="#00E599" stopOpacity={0.9} />`
→ `<stop offset="0%" stopColor={tokens.colors.accentPrimary} stopOpacity={0.9} />`

- [ ] **Step 4: Verify clean**

Run: `grep -n "#00E599" pii-scanner-ui/src/components/pages/DataRetention.tsx pii-scanner-ui/src/components/pages/DecryptReport.tsx pii-scanner-ui/src/components/pages/PiiCategoryAnalysis.tsx`
Expected: no output.

- [ ] **Step 5: Verify build**

Run: `cd pii-scanner-ui && npx tsc --noEmit && npm run lint`
Expected: no new errors or warnings.

- [ ] **Step 6: Commit**

```bash
cd pii-scanner-ui
git add src/components/pages/DataRetention.tsx src/components/pages/DecryptReport.tsx src/components/pages/PiiCategoryAnalysis.tsx
git commit -m "Restyle: replace hardcoded accent color in DataRetention, DecryptReport, PiiCategoryAnalysis

Co-Authored-By: Claude Sonnet 5 <noreply@anthropic.com>"
```

---

## Task 6: Replace hardcoded accent color in Profile, Reports, ScanHistory

**Files:**
- Modify: `pii-scanner-ui/src/components/pages/Profile.tsx:184,300,419`
- Modify: `pii-scanner-ui/src/components/pages/Reports.tsx:177,212,244,386`
- Modify: `pii-scanner-ui/src/components/pages/ScanHistory.tsx:325,339,351`

**Interfaces:**
- Consumes: `tokens.colors.accentPrimary`, `gradients.primary` from Task 1's
  `designSystem.ts`.

- [ ] **Step 1: `Profile.tsx`**

Check import: `grep -n "from '.*theme/designSystem'" pii-scanner-ui/src/components/pages/Profile.tsx`
Add if missing:

```typescript
import { gradients } from '../../theme/designSystem';
```

All three occurrences (lines 184, 300, 419):
`background: 'linear-gradient(135deg, #00E599 0%, #00B876 100%)',`
→ `background: gradients.primary,`

- [ ] **Step 2: `Reports.tsx`**

Check import: `grep -n "from '.*theme/designSystem'" pii-scanner-ui/src/components/pages/Reports.tsx`
Add if missing:

```typescript
import { tokens } from '../../theme/designSystem';
```

Line 177: `icon: <DataObjectIcon sx={{ fontSize: 40, color: '#00E599' }} />,`
→ `icon: <DataObjectIcon sx={{ fontSize: 40, color: tokens.colors.accentPrimary }} />,`

Line 212: `<StatCard topBorderOnly accentColor="#00E599" value={statistics.totalFilesScanned.toLocaleString()} label="Fichiers analysés" />`
→ `<StatCard topBorderOnly accentColor={tokens.colors.accentPrimary} value={statistics.totalFilesScanned.toLocaleString()} label="Fichiers analysés" />`

Line 244: `<stop offset="0%" stopColor="#00E599" />`
→ `<stop offset="0%" stopColor={tokens.colors.accentPrimary} />`

Line 386: `backgroundColor: '#00E599',`
→ `backgroundColor: tokens.colors.accentPrimary,`

- [ ] **Step 3: `ScanHistory.tsx`**

Check import: `grep -n "from '.*theme/designSystem'" pii-scanner-ui/src/components/pages/ScanHistory.tsx`
Add if missing:

```typescript
import { tokens, gradients } from '../../theme/designSystem';
```

Line 325: `<LockIcon sx={{ color: '#00E599' }} />`
→ `<LockIcon sx={{ color: tokens.colors.accentPrimary }} />`

Line 339: `<Typography variant="h6" fontWeight={700} sx={{ flex: 1, fontFamily: 'monospace', letterSpacing: 2, color: '#00E599' }}>`
→ `<Typography variant="h6" fontWeight={700} sx={{ flex: 1, fontFamily: 'monospace', letterSpacing: 2, color: tokens.colors.accentPrimary }}>`

Line 351: `<Button variant="contained" onClick={() => setReportPassword(null)} sx={{ background: 'linear-gradient(135deg, #00E599 0%, #00B876 100%)', fontWeight: 600 }}>`
→ `<Button variant="contained" onClick={() => setReportPassword(null)} sx={{ background: gradients.primary, fontWeight: 600 }}>`

- [ ] **Step 4: Verify clean**

Run: `grep -n "#00E599" pii-scanner-ui/src/components/pages/Profile.tsx pii-scanner-ui/src/components/pages/Reports.tsx pii-scanner-ui/src/components/pages/ScanHistory.tsx`
Expected: no output.

- [ ] **Step 5: Verify build**

Run: `cd pii-scanner-ui && npx tsc --noEmit && npm run lint`
Expected: no new errors or warnings.

- [ ] **Step 6: Commit**

```bash
cd pii-scanner-ui
git add src/components/pages/Profile.tsx src/components/pages/Reports.tsx src/components/pages/ScanHistory.tsx
git commit -m "Restyle: replace hardcoded accent color in Profile, Reports, ScanHistory

Co-Authored-By: Claude Sonnet 5 <noreply@anthropic.com>"
```

---

## Task 7: Replace hardcoded accent color in Settings, Support, Dashboard, Scanner

**Files:**
- Modify: `pii-scanner-ui/src/components/pages/Settings.tsx:215,482`
- Modify: `pii-scanner-ui/src/components/pages/Support.tsx:147,181,208`
- Modify: `pii-scanner-ui/src/components/pages/Dashboard.tsx:65,154,256,471,472,486,664`
- Modify: `pii-scanner-ui/src/components/pages/Scanner.tsx:192,212,232,318,365`

**Interfaces:**
- Consumes: `tokens.colors.accentPrimary`, `tokens.colors.accentPrimaryHover`,
  `tokens.colors.accentPrimaryText`, `gradients.primary`, `chartColors` from
  Task 1's `designSystem.ts`.

- [ ] **Step 1: `Settings.tsx`**

Check import: `grep -n "from '.*theme/designSystem'" pii-scanner-ui/src/components/pages/Settings.tsx`
Add if missing:

```typescript
import { tokens } from '../../theme/designSystem';
```

Line 215 (inside `getCategoryColor`, a switch statement mapping PII category
names to swatch colors):
```typescript
      case 'Identité': return '#00E599';
```
→
```typescript
      case 'Identité': return tokens.colors.accentPrimary;
```

Line 482 area — this whole `sx` block:
```typescript
          sx={{
            backgroundColor: '#00E599',
            color: '#0A0A0A',
            '&:hover': {
              backgroundColor: '#00CC88',
            },
          }}
```
→
```typescript
          sx={{
            backgroundColor: tokens.colors.accentPrimary,
            color: tokens.colors.accentPrimaryText,
            '&:hover': {
              backgroundColor: tokens.colors.accentPrimaryHover,
            },
          }}
```

- [ ] **Step 2: `Support.tsx`**

Check import: `grep -n "from '.*theme/designSystem'" pii-scanner-ui/src/components/pages/Support.tsx`
Add if missing:

```typescript
import { tokens } from '../../theme/designSystem';
```

All three occurrences (lines 147, 181, 208) follow the same pattern, e.g.:
`<ArticleIcon sx={{ fontSize: 32, color: '#00E599', mr: 1.5 }} />`
→ `<ArticleIcon sx={{ fontSize: 32, color: tokens.colors.accentPrimary, mr: 1.5 }} />`

Apply the equivalent replacement (`color: '#00E599'` → `color: tokens.colors.accentPrimary`)
to the `EmailIcon` (line 181) and `HelpOutlineIcon` (line 208) instances,
keeping their other props (`fontSize`, `mr`) unchanged.

- [ ] **Step 3: `Dashboard.tsx`**

Check import (this file already imports from designSystem per the earlier
grep — confirm the current import line):
`grep -n "from '.*theme/designSystem'" pii-scanner-ui/src/components/pages/Dashboard.tsx`

It currently imports `glassCardSx, getRechartsTooltipStyle, tokens`. This
task needs two more names from that module (`chartColors` and `gradients`),
so replace that import line with:

```typescript
import { glassCardSx, getRechartsTooltipStyle, tokens, chartColors, gradients } from '../../theme/designSystem';
```

Line 65: `const DONUT_COLORS = ['#00E599', '#3B82F6', '#F0A000', '#F45252', '#A78BFA', '#EC4899', '#06B6D4', '#84CC16'];`
→ `const DONUT_COLORS = chartColors;`

Lines 154 and 256 and 664 (three separate `sx` blocks, same literal):
`background: 'linear-gradient(135deg, #00E599 0%, #00B876 100%)',`
→ `background: gradients.primary,`

Lines 471–472 (SVG gradient stops):
```typescript
                        <stop offset="5%" stopColor="#00E599" stopOpacity={0.8} />
                        <stop offset="95%" stopColor="#00E599" stopOpacity={0.05} />
```
→
```typescript
                        <stop offset="5%" stopColor={tokens.colors.accentPrimary} stopOpacity={0.8} />
                        <stop offset="95%" stopColor={tokens.colors.accentPrimary} stopOpacity={0.05} />
```

Line 486: `stroke="#00E599"`
→ `stroke={tokens.colors.accentPrimary}`

- [ ] **Step 4: `Scanner.tsx`**

Check import: `grep -n "from '.*theme/designSystem'" pii-scanner-ui/src/components/pages/Scanner.tsx`
This task needs both `tokens` and `gradients` from that module (see the 90deg
case below). Add if missing, or extend the existing import line to include
both names:

```typescript
import { tokens, gradients } from '../../theme/designSystem';
```

Lines 192, 212, 318 (135deg gradient, same literal):
`background: 'linear-gradient(135deg, #00E599 0%, #00B876 100%)',`
→ `background: gradients.primary,`

Line 232 (90deg gradient — a progress bar, different angle from the others):
`background: 'linear-gradient(90deg, #00E599 0%, #00B876 100%)',`
→ keep the 90deg angle but use the token colors directly since `gradients.primary`
is hardcoded to 135deg:
`` background: `linear-gradient(90deg, ${tokens.colors.accentPrimary} 0%, ${tokens.colors.accentPrimaryHover} 100%)`, ``

Line 365 (ternary):
```typescript
                ? 'linear-gradient(135deg, #00E599 0%, #00B876 100%)'
```
→
```typescript
                ? gradients.primary
```

- [ ] **Step 5: Verify clean across all four files**

Run: `grep -n "#00E599" pii-scanner-ui/src/components/pages/Settings.tsx pii-scanner-ui/src/components/pages/Support.tsx pii-scanner-ui/src/components/pages/Dashboard.tsx pii-scanner-ui/src/components/pages/Scanner.tsx`
Expected: no output.

- [ ] **Step 6: Verify build**

Run: `cd pii-scanner-ui && npx tsc --noEmit && npm run lint`
Expected: no new errors or warnings.

- [ ] **Step 7: Commit**

```bash
cd pii-scanner-ui
git add src/components/pages/Settings.tsx src/components/pages/Support.tsx src/components/pages/Dashboard.tsx src/components/pages/Scanner.tsx
git commit -m "Restyle: replace hardcoded accent color in Settings, Support, Dashboard, Scanner

Co-Authored-By: Claude Sonnet 5 <noreply@anthropic.com>"
```

---

## Task 8: Fix Sidebar's remaining hardcoded light-mode colors

**Files:**
- Modify: `pii-scanner-ui/src/components/Layout/Sidebar.tsx:180-183,410-412`

**Interfaces:**
- Consumes: `tokens.colors.light.accentPrimary` from Task 1's
  `designSystem.ts` (`tokens` is already imported in this file at line 51 —
  no new import needed).

`Sidebar.tsx` already routes almost everything through `tokens.colors`
(confirmed by reading the file — see plan context). Its only hardcodes are
four light-mode-specific `rgba(0, 229, 153, ...)` values that were manually
tuned as a *different shade* from the dark accent, rather than referencing
`tokens.colors.light`. These need updating to the new light-mode cyan.

- [ ] **Step 1: Update the sidebar color variables**

Find (around line 176-183):

```typescript
  // Colors for sidebar depending on mode
  const sidebarBg = darkMode ? c.bgSurface : c.light.bgSurface;
  const sidebarBorder = darkMode ? c.borderDefault : c.light.borderDefault;
  const iconInactive = darkMode ? c.textTertiary : c.light.textTertiary;
  const hoverBg = darkMode ? c.accentPrimaryMuted : 'rgba(0, 229, 153, 0.08)';
  const selectedBg = darkMode ? c.accentPrimaryMuted : 'rgba(0, 180, 110, 0.15)';
  const selectedColor = darkMode ? c.accentPrimary : '#007a4d';
  const selectedIndicator = darkMode ? c.accentPrimary : '#007a4d';
```

Replace the last four lines with:

```typescript
  const hoverBg = darkMode ? c.accentPrimaryMuted : 'rgba(0, 146, 184, 0.08)';
  const selectedBg = darkMode ? c.accentPrimaryMuted : 'rgba(0, 146, 184, 0.15)';
  const selectedColor = darkMode ? c.accentPrimary : c.light.accentPrimary;
  const selectedIndicator = darkMode ? c.accentPrimary : c.light.accentPrimary;
```

(`rgba(0, 146, 184, ...)` is `#0092B8` — the light-mode accent from Task 1 —
expressed as rgba so the existing opacity values, 0.08 and 0.15, carry over
unchanged.)

- [ ] **Step 2: Update the user-info card's light-mode background**

Find (around line 396-413):

```typescript
                  ...(darkMode ? {
                    backgroundColor: 'rgba(255,255,255,0.03)',
                    backdropFilter: 'blur(8px)',
                    WebkitBackdropFilter: 'blur(8px)',
                    border: '1px solid rgba(255,255,255,0.08)',
                  } : {
                    bgcolor: 'rgba(0, 229, 153, 0.06)',
                    border: '1px solid rgba(0, 229, 153, 0.1)',
                  }),
```

Replace with (dark mode also drops blur, consistent with Task 1's flat
`glassCardSx` change, and light mode picks up the new accent):

```typescript
                  ...(darkMode ? {
                    backgroundColor: c.bgSurfaceRaised,
                    border: `1px solid ${c.borderDefault}`,
                  } : {
                    bgcolor: 'rgba(0, 146, 184, 0.06)',
                    border: '1px solid rgba(0, 146, 184, 0.1)',
                  }),
```

- [ ] **Step 3: Verify no stale green remains**

Run: `grep -n "229, 153\|180, 110\|#007a4d" pii-scanner-ui/src/components/Layout/Sidebar.tsx`
Expected: no output.

- [ ] **Step 4: Verify build**

Run: `cd pii-scanner-ui && npx tsc --noEmit && npm run lint`
Expected: no new errors or warnings.

- [ ] **Step 5: Commit**

```bash
cd pii-scanner-ui
git add src/components/Layout/Sidebar.tsx
git commit -m "Restyle: update Sidebar's remaining light-mode accent hardcodes

Co-Authored-By: Claude Sonnet 5 <noreply@anthropic.com>"
```

---

## Task 9: Full-app verification pass

**Files:** none modified — this task only runs checks.

**Interfaces:** none — final verification of Tasks 1–8's combined output.

- [ ] **Step 1: Confirm zero remaining hardcoded old-accent references**

Run: `grep -rn "#00E599" pii-scanner-ui/src/`
Expected: no output. If any remain, they were missed by Tasks 3–8 — add a
fix-up commit following the same substitution pattern used in those tasks
before proceeding.

- [ ] **Step 2: Run the full lint and test suite**

Run: `cd pii-scanner-ui && npm run lint`
Expected: same warning count as before this plan started (one pre-existing
`react-hooks/incompatible-library` warning in `Detections.tsx`, per project
history) — zero new warnings or errors.

Run: `cd pii-scanner-ui && npm run test:run`
Expected: all existing tests pass (30/30 per project history) — this plan
changes no component logic, only style values, so no test should need
updating.

- [ ] **Step 3: Run a production build**

Run: `cd pii-scanner-ui && npm run build`
Expected: build succeeds, no new warnings beyond the pre-existing chunk-size
notice already mitigated by `vite.config.ts`'s `codeSplitting` groups.

- [ ] **Step 4: Manual visual pass**

Run: `cd pii-scanner-ui && npm run dev`
Open `http://127.0.0.1:3000`, log in (or use `npm run dev:mock` in a second
terminal instead if no backend is running), and check at minimum:
- Dashboard: stat cards, charts, sidebar — cyan accent visible, no green
- Scanner: start-scan button gradient, progress bar
- Settings: category color swatches, save button
- Toggle dark → light mode: accent becomes the darker `#0092B8`, text stays
  readable on white backgrounds, sidebar selected-item highlight uses the
  same darker cyan

Report any visual issue found (e.g., a low-contrast text/background pairing)
before proceeding — do not silently patch it as part of this task; treat it
as a new finding to fix in a follow-up commit using the same token-based
approach as the rest of this plan.

- [ ] **Step 5: Final commit if Step 4 required fixes**

If Step 4 found no issues, this task requires no commit (Steps 1-3 are
read-only verification). If Step 4 required a fix, commit it:

```bash
cd pii-scanner-ui
git add -A
git commit -m "Restyle: fix visual issue found in manual verification pass

Co-Authored-By: Claude Sonnet 5 <noreply@anthropic.com>"
```

---

## Task 10: Push branch and open PR

**Files:** none modified.

- [ ] **Step 1: Push the feature branch**

```bash
git push -u origin feature/sentinelos-restyle
```

- [ ] **Step 2: Open a pull request**

```bash
gh pr create --title "Restyle UI to SentinelOS cyan/dark theme" --body "$(cat <<'EOF'
## Summary
- Replaces the neon-green accent (#00E599) with a cyan accent (#00D4FF dark / #0092B8 light) matching a downloaded Figma community template ("Cyber Security Web App UI")
- Adds JetBrains Mono for technical/badge text (IDs, timestamps, stat values), alongside the existing Inter/Plus Jakarta Sans body font
- Switches card styling from glassmorphism (blur) to the template's flat bordered style
- No page, route, or menu changes — pure design-token substitution

## Test plan
- [x] `npx tsc --noEmit` clean
- [x] `npm run lint` — no new warnings
- [x] `npm run test:run` — 30/30 passing
- [x] `npm run build` — clean, no new warnings
- [x] Manual pass: Dashboard, Scanner, Settings in both dark and light mode

Spec: docs/superpowers/specs/2026-09-21-cyber-sentinel-restyle-design.md
Plan: docs/superpowers/plans/2026-09-21-sentinelos-restyle.md

🤖 Generated with [Claude Code](https://claude.com/claude-code)
EOF
)"
```

- [ ] **Step 3: Report the PR URL to the user**

Share the URL returned by `gh pr create` so the user can review before
merging to `main`.
