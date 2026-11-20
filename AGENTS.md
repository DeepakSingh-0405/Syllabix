# Syllabix Agent Instructions (`AGENTS.md`)

## Mandatory UI/UX Design System Rule (`design.md`)

All UI/UX design decisions, styling, layouts, color palettes, typography, spacing, component states, animations, accessibility rules, and copywriting across Syllabix **MUST strictly derive from `design.md`** (`d:\syllabix\design.md`).

Every developer and agent working on Syllabix must reference `design.md` for **EVERY** design decision until the user specifically instructs otherwise.

### Summary of Non-Negotiable Design Directives:
1. **Design Token Purity:** All styling must consume semantic tokens from `tokens.css` or Tailwind theme variables bound to them. Zero raw hex codes or off-scale pixels allowed in component files.
2. **Toolfolio Visual Aesthetic:** Pitch-black `#000000` canvas (`--color-surface-base`), elevated `#080808` surfaces (`--color-surface-muted`), interactive `#141414` hover states, `#2e2e2e` default borders, `#767676` interactive borders.
3. **Typography Stack:** `'Inter', system-ui, arial` with weights `300` (body), `500` (buttons/active pills), `600` (headings). Sizes: `12px`, `14px`, `16px`, `18px`, `20px`, `44px`.
4. **4-Step Spacing Scale:** `8px` (`--space-1`), `12px` (`--space-2`), `16px` (`--space-3`), `20px` (`--space-4`). Macro layouts use multiples of `20px` (`40px`, `60px`, `80px`).
5. **Component 7-State Architecture:** Every interactive component must implement: `default`, `hover`, `focus-visible` (with `--shadow-focus`), `active`, `disabled`, `loading`, and `error`.
6. **WCAG 2.2 Level AA Compliance:**
   - Card descriptions on `#080808` must use `--color-text-tertiary` (`#a6a6a6`) for `>= 4.5:1` contrast.
   - Interactive inputs/button borders must use `--color-border-interactive` (`#767676`) for `>= 3:1` non-text contrast.
   - 1 stretched link per card (`::after { inset: 0; }`) to prevent tab stop bloat across 131+ cards.
   - Skip link (`Skip to syllabus directory`) at top of DOM.
   - Roving `tabindex` on subject filter pill bar.
   - `scroll-padding-top: 80px` on `<html>` to keep focus visible below the 60px sticky header.
7. **Copywriting Standards:** Sentence case everywhere; verb + object labels; descriptive link targets; zero vague filler.
