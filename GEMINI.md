# Syllabix Agent Rules & Engineering Constraints (`GEMINI.md`)

## 1. Absolute UI/UX Design System Mandate (`design.md`)

> **MANDATORY DIRECTIVE:**  
> All UI/UX design decisions, styling, layouts, color palettes, typography, spacing, component states, animations, accessibility rules, and copywriting across Syllabix **MUST strictly derive from `design.md`**.  
> Every agent, developer, and automated workflow must reference `design.md` for **EVERY** design decision until the user specifically instructs otherwise. Zero visual drift is tolerated.

---

### Core Design Rules & Principles to Enforce:

1. **Single Source of Truth (`design.md`):**
   - Before writing, modifying, or reviewing any frontend component, style, page layout, or Tailwind configuration, inspect and adhere strictly to `design.md`.
   - Never improvise styles, introduce custom color hexes, or apply arbitrary margins/paddings.

2. **Visual Aesthetic & Reference System:**
   - Modeled strictly on the [Toolfolio](https://toolfolio.com/) dark-first design architecture.
   - Canvas: Pitch-black root surface (`--color-surface-base: #000000`).
   - Elevated Cards & Containers: High-density dark surface (`--color-surface-muted: #080808`).
   - Interactive & Hover Surfaces: Subtle dark lift (`--color-surface-interactive: #141414`).
   - Structural Hairlines & Dividers: Clean dark border (`--color-border-default: #2e2e2e`).
   - Interactive Borders (Inputs, Buttons, Cards): High-contrast border (`--color-border-interactive: #767676`) achieving `>= 3:1` non-text contrast.

3. **Design Token Purity & Zero Raw Literals:**
   - Component files (`.tsx`, `.jsx`, `.css`) must consume semantic tokens exclusively via CSS variables (`var(--...)`) or mapped Tailwind utility classes (`bg-surface-base`, `text-secondary`, etc.).
   - **Prohibited:** Never hardcode raw hex values (`#000000`, `#ffffff`), raw RGB/OKLab strings, or unmapped pixel values.

4. **Typography Scale & Font Weights:**
   - Font Family Stack: `'Inter', system-ui, arial` with `font-display: swap`.
   - Weights: Light `300` (body copy), Medium `500` (buttons, active pills, nav items), Semibold `600` (titles, display headings).
   - Strict Size Scale: `12px` (xs), `14px` (sm / base), `16px` (md), `18px` (lg), `20px` (xl), `44px` (2xl).

5. **4-Step Spacing Scale:**
   - Only `8px` (`--space-1`), `12px` (`--space-2`), `16px` (`--space-3`), and `20px` (`--space-4`) are permitted.
   - Macro layout spacing must use exact integer multiples of `space.4` (`40px`, `60px`, `80px`).

6. **Component 7-State Architecture:**
   - All interactive components (Links, Buttons, Filter Pills, Syllabus Cards, Lists, Navigation) must explicitly define and handle:
     1. `default`
     2. `hover`
     3. `focus-visible` (must display `var(--shadow-focus)` with double-ring indicator)
     4. `active`
     5. `disabled` (with `aria-disabled="true"` or `disabled`)
     6. `loading` (with `aria-busy="true"` and locked bounding box)
     7. `error` (with `var(--color-status-error)` and accessible feedback)

7. **High-Density Discovery & Accessibility (WCAG 2.2 AA):**
   - **Contrast Compliance (A11Y-01):** Primary text on `#000000` requires `>= 4.5:1`. Elevated card descriptions on `#080808` must use `--color-text-tertiary` (`#a6a6a6`, `8.59:1`) to prevent contrast failure.
   - **Single-Anchor Card Architecture (A11Y-03, A11Y-05):** Each syllabus card has strictly 1 primary tab stop using a stretched link (`::after { inset: 0; }`). Eliminates redundant tab stops across 131+ cards.
   - **Bypass Blocks & Roving Tabindex (A11Y-05):** Always provide `<a href="#main-content" class="skip-link">Skip to syllabus directory</a>` as the first tab stop. Implement roving `tabindex` on the subject filter pill bar.
   - **Focus Preservation (A11Y-04):** Set `scroll-padding-top: 80px` on `<html>` so focused items are never obscured by the 60px sticky header.
   - **Touch Target Minimums (A11Y-06):** Minimum `24px × 24px` hit target with `>= 8px` spacing; minimum `44px × 44px` on mobile nav controls.

8. **Content & Tone Standards:**
   - Strict **sentence case** across all UI copy, navigation links, and button labels.
   - Action verbs + objects (`"Download syllabus"`, `"Reset filters"`, `"Submit syllabus"`).
   - Specific descriptive links (`"Data Structures & Algorithms (CS-201)"`), never `"Click here"`, `"View"`, or `"Read more"`.
