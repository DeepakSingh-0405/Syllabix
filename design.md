# Syllabix — Design System & UI/UX Specification (`design.md`)

## 1. Context, Design Intent, and Architecture

**Design Intent:** Syllabix must deliver a dark-first, token-driven interface modeled on the [Toolfolio](https://toolfolio.com/) visual and interaction system, enabling students, educators, and knowledge seekers to browse, filter, and inspect structured syllabi, learning modules, and academic resources with [WCAG 2.2 Level AA](https://www.w3.org/TR/WCAG22/) accessibility, keyboard-first navigation, and zero visual drift.

### Brand & Surface Scope
* **Product / Brand:** Syllabix
* **Reference Aesthetic & UX Architecture:** [Toolfolio](https://toolfolio.com/) (pitch-black `#000000` canvas, `#080808` elevated cards, `#2e2e2e` hairlines, light-weight `Inter` typography, high-density filterable card grid).
* **Target Audience:** Students, learners, and knowledge seekers scanning high-density course directories, syllabus modules, topic tags, and resource collections.
* **Product Surface:** Marketing and resource discovery web application.
* **Visual Style:** Clean, functional, dark-surface, high-contrast, implementation-oriented.
* **System Consistency Mandate:** Engineering and design teams must reference semantic tokens exclusively in component stylesheets and should prefer system consistency over local visual exceptions.

### Baseline Page Component Density & DOM Budget
Syllabix mirrors [Toolfolio](https://toolfolio.com/)'s high-density discovery layout. Component implementation, focus management, and rendering performance must support the following per-page density profile:

| Component Category | Target Density Profile | Architectural & UX Mandate |
| :--- | :--- | :--- |
| **Links** | ~353 per page | High tab-stop density; requires strict `:focus-visible` rings, a top-of-DOM skip link, and single-anchor card patterns. |
| **Buttons** | ~208 per page | High interactive density across subject/semester filter pills and actions; requires roving `tabindex` and clear toggle states (`aria-pressed`). |
| **Cards** | ~131 per page | Primary syllabus/module directory unit; requires uniform line-clamping, lazy-loaded media, and 1 primary tab stop per card. |
| **Lists** | 4 per page | Semantic `<ul role="list">` / `<ol role="list">` wrappers for the filter rail, syllabus card grid, featured collection, and footer links. |
| **Navigation** | 2 per page | Primary sticky header `<nav aria-label="Primary">` and secondary footer `<nav aria-label="Footer directory">`. |

## 2. Design Tokens and Foundations

All Syllabix UI components must consume semantic tokens via CSS custom properties (or Tailwind theme mappings bound to these variables). Engineers must not hardcode raw hex, RGB, OKLab, or pixel literals inside component files.

### Production CSS Custom Properties (`tokens.css`)

```css
:root {
  /* Typography — Font Families */
  --font-family-primary: 'Inter';
  --font-family-stack: 'Inter', system-ui, arial;

  /* Typography — Sizes & Base Line Height */
  --font-size-base: 14px;
  --font-lineHeight-base: 20px;
  --font-size-xs: 12px;
  --font-size-sm: 14px;
  --font-size-md: 16px;
  --font-size-lg: 18px;
  --font-size-xl: 20px;
  --font-size-2xl: 44px;

  /* Typography — Weights */
  --font-weight-base: 300;
  --font-weight-medium: 500;
  --font-weight-semibold: 600;

  /* Color — Surfaces */
  --color-surface-base: #000000;
  --color-surface-muted: #080808;
  --color-surface-interactive: #141414;

  /* Color — Text */
  --color-text-primary: oklab(0.724347 0.0000329912 0.0000144839 / 0.7);
  --color-text-secondary: #ffffff;
  --color-text-tertiary: #a6a6a6;
  --color-text-inverse: oklab(0.999994 0.0000455678 0.0000200868 / 0.65);
  --color-text-disabled: #666666;

  /* Color — Borders & Focus */
  --color-border-default: #2e2e2e;
  --color-border-interactive: #767676;
  --color-border-focus: #ffffff;

  /* Color — Semantic Status */
  --color-status-error: #ff6b6b;
  --color-status-errorSurface: #2a0f12;

  /* Spacing Scale */
  --space-1: 8px;
  --space-2: 12px;
  --space-3: 16px;
  --space-4: 20px;

  /* Shape / Radius */
  --radius-none: 0px;
  --radius-sm: 6px;
  --radius-md: 8px;
  --radius-lg: 12px;
  --radius-full: 9999px;

  /* Elevation / Shadows */
  --shadow-none: none;
  --shadow-sm: 0 1px 2px 0 rgba(0, 0, 0, 0.6), 0 0 0 1px var(--color-border-default);
  --shadow-md: 0 8px 24px -4px rgba(0, 0, 0, 0.85), 0 0 0 1px var(--color-border-interactive);
  --shadow-focus: 0 0 0 2px var(--color-surface-base), 0 0 0 4px var(--color-border-focus);

  /* Motion */
  --motion-duration-fast: 120ms;
  --motion-duration-base: 200ms;
  --motion-duration-slow: 320ms;
  --motion-easing-standard: cubic-bezier(0.2, 0, 0, 1);
}

@media (prefers-reduced-motion: reduce) {
  :root {
    --motion-duration-fast: 0.01ms;
    --motion-duration-base: 0.01ms;
    --motion-duration-slow: 0.01ms;
  }
}
```

### Typography Token Specification
Root `<body>` styling must apply `font.family.stack`, `font.size.base`, `font.weight.base`, `font.lineHeight.base`, `background-color: var(--color-surface-base)`, `color: var(--color-text-primary)`, and `-webkit-font-smoothing: antialiased`.

| Semantic Token | Value | Line Height | Usage Rule in Syllabix |
| :--- | :--- | :--- | :--- |
| `font.family.primary` | `Inter` | — | Primary webfont face; must load with `font-display: swap`. |
| `font.family.stack` | `Inter, system-ui, arial` | — | Mandatory fallback stack across all UI text, buttons, and inputs. |
| `font.size.base` | `14px` | `20px` | Root document font size. |
| `font.weight.base` | `300` | — | Default body weight; must never be used below `font.size.sm` (`14px`). |
| `font.weight.medium` | `500` | — | Recommended weight for buttons, active filter pills, and active nav items. |
| `font.weight.semibold` | `600` | — | Recommended weight for syllabus card titles, section headings, and hero display copy. |
| `font.lineHeight.base` | `20px` | `20px` | Base line height (`1.43` ratio at `14px`). |
| `font.size.xs` | `12px` | `16px` | Course codes, credit badges, topic counts, and keyboard shortcut hints (`⌘K`). |
| `font.size.sm` | `14px` | `20px` | Standard syllabus card descriptions, filter pill labels, and navigation links. |
| `font.size.md` | `16px` | `24px` | Hero subtitle copy, search input text (prevents iOS auto-zoom), and lead paragraphs. |
| `font.size.lg` | `18px` | `26px` | Syllabus card titles (`<h3>`) and empty-state headings. |
| `font.size.xl` | `20px` | `28px` | Department/category section headers (`<h2>`) and modal/drawer titles. |
| `font.size.2xl` | `44px` | `52px` | Hero display headline (`<h1>`, `letter-spacing: -0.02em`). |

### Color Token Specification & Contrast Matrix
| Semantic Token | Value | Contrast vs. `color.surface.base` | Implementation & Accessibility Rule |
| :--- | :--- | :--- | :--- |
| `color.surface.base` | `#000000` | — | Primary page background and root canvas fill. |
| `color.surface.muted` | `#080808` | `1.05:1` | Elevated syllabus card, sticky header, and footer container surface. |
| `color.surface.interactive` | `#141414` | `1.15:1` | Hover and active surface fill for cards, filter pills, and secondary buttons. |
| `color.text.primary` | `oklab(0.724347 0.0000329912 0.0000144839 / 0.7)` | `~4.60:1` | Primary body copy on `color.surface.base`. Must not be placed over surfaces lighter than `#050505` where contrast drops below `4.5:1`. |
| `color.text.secondary` | `#ffffff` | `21.0:1` | High-emphasis headings, syllabus card titles, primary button fills, and active states. |
| `color.text.tertiary` | `#a6a6a6` | `8.59:1` | Card descriptions on `color.surface.muted`, metadata tags, subject badges, and timestamps. |
| `color.text.inverse` | `oklab(0.999994 0.0000455678 0.0000200868 / 0.65)` | `~10.8:1` | Muted text on dark translucent overlays; on solid white surfaces (`color.text.secondary`), use `color.surface.base` (`#000000`) text for `21:1` contrast. |
| `color.text.disabled` | `#666666` | `3.68:1` | Disabled interactive controls only (`disabled` or `aria-disabled="true"`). |
| `color.border.default` | `#2e2e2e` | `1.54:1` | Decorative structural dividers, card borders, and section hairlines. |
| `color.border.interactive` | `#767676` | `4.54:1` | Required border token for search inputs, outlined buttons, and active cards to satisfy WCAG 1.4.11 (`>= 3.0:1`). |
| `color.border.focus` | `#ffffff` | `21.0:1` | Outer ring color for `:focus-visible` (`shadow.focus`). |
| `color.status.error` | `#ff6b6b` | `7.12:1` | Error text, invalid input borders, and failed state indicators. |
| `color.status.errorSurface` | `#2a0f12` | `1.22:1` | Background fill for error banners and failed directory fetch states. |

### Spacing Scale Specification
All padding, margin, and grid/flex `gap` values must use the 4-step spacing scale. Macro layout spacing (such as hero vertical padding or section margins) must use exact integer multiples of `space.4` (`calc(var(--space-4) * 2)` = `40px`, `calc(var(--space-4) * 3)` = `60px`).

| Semantic Token | Value | Permitted Usage in Syllabix |
| :--- | :--- | :--- |
| `space.1` | `8px` | Icon-to-label gaps, compact tag padding, filter pill row gaps, and focus ring offsets (`calc(var(--space-1) / 4)` = `2px`). |
| `space.2` | `12px` | Button vertical padding, compact card padding, vertical footer list spacing, and nav link padding. |
| `space.3` | `16px` | Mobile card padding, mobile/tablet grid gaps, button horizontal padding, and subsection header margins. |
| `space.4` | `20px` | Desktop syllabus card padding, desktop card grid gaps, container horizontal padding, and list group separation. |

### Shape, Shadow, and Motion Specification
| Category | Semantic Token | Value | Usage Rule in Syllabix |
| :--- | :--- | :--- | :--- |
| **Radius** | `radius.none` | `0px` | Full-bleed sticky header bar and flush structural dividers. |
| **Radius** | `radius.sm` | `6px` | Course code badges, credit pills, inline link focus rings, and keyboard shortcut hints. |
| **Radius** | `radius.md` | `8px` | Primary/Secondary buttons, search inputs, and nav item hover pills. |
| **Radius** | `radius.lg` | `12px` | Syllabus directory cards, empty-state containers, error banners, and modals. |
| **Radius** | `radius.full` | `9999px` | Subject/semester filter pills and status counters. |
| **Shadow** | `shadow.none` | `none` | Default resting elevation for dark surfaces. |
| **Shadow** | `shadow.sm` | `0 1px 2px 0 rgba(0, 0, 0, 0.6), 0 0 0 1px var(--color-border-default)` | Resting card surface and sticky header separation. |
| **Shadow** | `shadow.md` | `0 8px 24px -4px rgba(0, 0, 0, 0.85), 0 0 0 1px var(--color-border-interactive)` | Hovered syllabus card elevation and dropdown menus. |
| **Shadow** | `shadow.focus` | `0 0 0 2px var(--color-surface-base), 0 0 0 4px var(--color-border-focus)` | Mandatory `:focus-visible` ring across all interactive elements. |
| **Motion** | `motion.duration.fast` | `120ms` | Button, link, and filter pill color/border transitions. |
| **Motion** | `motion.duration.base` | `200ms` | Syllabus card hover elevation and mobile drawer transitions. |
| **Motion** | `motion.duration.slow` | `320ms` | Skeleton loading pulse cycles and layout transitions. |
| **Motion** | `motion.easing.standard` | `cubic-bezier(0.2, 0, 0, 1)` | Standard easing curve for all UI transitions. |

## 3. Page Layout & UX Structure

Syllabix replicates the streamlined, zero-clutter layout architecture of [Toolfolio](https://toolfolio.com/):

1. **Skip Navigation Anchor:** First DOM element (`<a href="#main-content" class="skip-link">Skip to syllabus directory</a>`).
2. **Primary Sticky Header (`<nav aria-label="Primary">`):** Height `calc(var(--space-4) * 3)` (`60px`), background `color.surface.base` (`#000000`), bottom border `1px solid var(--color-border-default)`, horizontal padding `space.4` (`20px`). Left: Syllabix brand wordmark (`font.size.lg`, `font.weight.semibold`, `color.text.secondary`). Right: top-level links (`Subjects`, `Semesters`, `Resources`) and primary CTA (`Submit syllabus`).
3. **Hero & Discovery Header (`<header>`):** Centered or left-aligned minimal masthead (`padding: calc(var(--space-4) * 3) var(--space-4) calc(var(--space-4) * 2)`), display title in `font.size.2xl` (`44px`, `color.text.secondary`), concise lead copy in `font.size.md` (`16px`, `color.text.primary`), and an optional instant search input (`border: 1px solid var(--color-border-interactive)`).
4. **High-Density Category Filter Rail (`<section aria-label="Subject filters">`):** Horizontal wrapping or scrollable pill bar (`<ul role="list">`) housing up to ~208 subject/topic filter buttons (`All`, `Computer Science`, `Data Structures`, `Operating Systems`, `Machine Learning`, etc.) with item count badges.
5. **Main Syllabus Directory Grid (`<main id="main-content">`):** Semantic `<ul role="list">` CSS Grid containing ~131 syllabus/resource cards.
   * **Desktop (`>= 1280px`):** `grid-template-columns: repeat(3, minmax(0, 1fr))` (or 4 columns on ultra-wide `>= 1440px`), `gap: var(--space-4)` (`20px`), `max-width: 1440px`, centered with `padding-inline: var(--space-4)`.
   * **Tablet (`768px – 1279px`):** `grid-template-columns: repeat(2, minmax(0, 1fr))`, `gap: var(--space-3)` (`16px`).
   * **Mobile (`< 768px`):** `grid-template-columns: minmax(0, 1fr)`, `gap: var(--space-3)` (`16px`), `padding-inline: var(--space-3)`.
6. **Footer Directory (`<footer>` + `<nav aria-label="Footer directory">`):** Top border `1px solid var(--color-border-default)`, background `color.surface.muted` (`#080808`), padding `calc(var(--space-4) * 2) var(--space-4)`.

## 4. Component-Level Rules

Every component must bind strictly to semantic tokens and implement all seven interactive states (`default`, `hover`, `focus-visible`, `active`, `disabled`, `loading`, `error`).

### 4.1 Links (Target Density: ~353 per page)

#### Anatomy
1. **Anchor Root (`<a href="...">`):** Valid semantic anchor element.
2. **Label Text:** Self-descriptive course, syllabus, or resource destination name.
3. **Trailing Indicator (Optional):** External arrow (`↗`) or internal chevron (`→`) in `font.size.xs`, separated by `space.1` (`8px`), with `aria-hidden="true"`.

#### Variants
* **Inline Editorial Link:** Inside syllabus notes or descriptions (`font.size.sm`, `color.text.secondary`, `text-decoration: underline`, `text-underline-offset: 4px`).
* **Standalone Directory / Nav Link:** In headers, footers, and resource lists (`font.size.sm`, `color.text.primary`, no default underline).
* **Card Primary Stretched Link:** Applied to the syllabus title `<a>` inside a Card using `::after { content: ""; position: absolute; inset: 0; z-index: 1; }` so the entire card is clickable as a single tab stop.

#### State Matrix
| State | Visual & Token Specification |
| :--- | :--- |
| **Default** | Inline: `color.text.secondary` with `1px solid var(--color-border-interactive)` underline. Standalone: `color.text.primary`, transparent fill. |
| **Hover** | Text shifts to `color.text.secondary`; underline shifts to `color.text.secondary` over `motion.duration.fast`. |
| **Focus-Visible** | Displays `shadow.focus` with `radius.sm` and `outline: 2px solid transparent`; text shifts to `color.text.secondary`. |
| **Active** | Text shifts to `color.text.tertiary`; trailing arrow translates `2px` along reading axis (`motion.duration.fast`). |
| **Disabled** | Rendered as `<span role="link" aria-disabled="true">` (no `href`), `color.text.disabled`, `cursor: not-allowed`. |
| **Loading** | Preserves width; replaces trailing arrow with a `12px` spinner in `color.text.tertiary` and sets `aria-busy="true"`. |
| **Error** | Shifts text and underline to `color.status.error` with an inline warning glyph (`aria-label="Resource link unavailable"`). |

#### Interaction, Spacing, Typography, and Edge Cases
* **Keyboard:** Reached via `Tab`, activated via `Enter`. Consolidating card links into 1 stretched link per card eliminates 260+ redundant tab stops across 131 cards.
* **Pointer & Touch:** `cursor: pointer`; standalone links must maintain a minimum `24px × 24px` hit target (`44px` height recommended in mobile menus via `space.2` vertical padding) with `space.1` (`8px`) minimum separation.
* **Overflow & Empty State:** Single-line directory links must truncate (`overflow: hidden; text-overflow: ellipsis; white-space: nowrap`). Links missing a valid `href` or label must not render.

### 4.2 Buttons & Filter Pills (Target Density: ~208 per page)

#### Anatomy
1. **Button Root (`<button type="button">`):** Native button element.
2. **Leading / Trailing Icon (Optional):** `16px × 16px` SVG with `aria-hidden="true"`.
3. **Label (`<span>`):** Action verb + object (e.g., `"Download syllabus"`) or subject filter name (e.g., `"Algorithms"`).
4. **Count Badge (Optional):** Item count in `font.size.xs` and `color.text.tertiary` separated by `space.1` (`8px`).

#### Variants
* **Primary Solid CTA:** High-emphasis action (`background: var(--color-text-secondary)`, `color: var(--color-surface-base)`, `font.weight.medium`, `radius.md`).
* **Secondary Outlined:** Standard utility action (`background: var(--color-surface-muted)`, `color: var(--color-text-secondary)`, `border: 1px solid var(--color-border-interactive)`, `radius.md`).
* **Filter Pill (Ghost Toggle):** High-density subject/semester toggle (`background: transparent`, `color: var(--color-text-primary)`, `border: 1px solid var(--color-border-default)`, `radius.full`, `aria-pressed="false|true"`).

#### State Matrix
| State | Visual & Token Specification |
| :--- | :--- |
| **Default** | Padding `space.1` (`8px`) vertical, `space.3` (`16px`) horizontal. Primary: fill `color.text.secondary`, text `color.surface.base`. Secondary: fill `color.surface.muted`, text `color.text.secondary`, border `color.border.interactive`. Filter Pill: fill transparent, text `color.text.primary`, border `color.border.default`. |
| **Hover** | Primary: opacity `0.9`. Secondary & Filter Pill: fill shifts to `color.surface.interactive`, text shifts to `color.text.secondary`, border shifts to `color.text.tertiary` over `motion.duration.fast`. |
| **Focus-Visible** | Applies `shadow.focus` and `outline: 2px solid transparent`; border shifts to `color.border.focus`. |
| **Active / Selected** | Press applies `transform: scale(0.98)` (disabled under reduced motion). Selected Filter Pill (`aria-pressed="true"`): fill `color.surface.interactive`, text `color.text.secondary`, border `1px solid var(--color-text-secondary)`, `font.weight.medium`. |
| **Disabled** | Native `disabled` attribute; fill `color.surface.muted`, text `color.text.disabled`, border `color.border.default`, `cursor: not-allowed`. |
| **Loading** | Sets `aria-busy="true"` and `disabled`; renders a `14px` spinner while locking button width to prevent layout shift. |
| **Error** | Border `color.status.error`, fill `color.status.errorSurface`, text `color.status.error`; announces error in an `aria-live="polite"` region. |

#### Interaction, Spacing, Typography, and Edge Cases
* **Keyboard:** Activated via `Space` or `Enter`. The 208-button subject filter bar should implement a roving `tabindex` (`ArrowLeft`/`ArrowRight` moves focus between pills; `Home`/`End` jumps to first/last pill) so keyboard users can tab past the entire filter bar in a single `Tab` keystroke.
* **Pointer & Touch:** Minimum `36px` height (`space.1` top/bottom padding + `font.lineHeight.base` `20px`), with `space.1` (`8px`) gap between pills.
* **Responsive & Overflow:** On `< 640px` viewports, the filter pill bar must either scroll horizontally with `scroll-padding-inline: var(--space-3)` or collapse overflow pills behind a `"Show all subjects"` disclosure button. Labels exceeding `24ch` must truncate with an ellipsis.

### 4.3 Syllabus / Resource Cards (Target Density: ~131 per page)

#### Anatomy
1. **Card Container (`<article>` inside `<li role="listitem">`):** Relative flex-column container (`position: relative; display: flex; flex-direction: column; justify-content: space-between; background: var(--color-surface-muted); border: 1px solid var(--color-border-default); border-radius: var(--radius-lg); padding: var(--space-4);`).
2. **Preview Thumbnail / Course Banner (Optional):** `aspect-ratio: 16 / 9`, `radius.md`, `background: var(--color-surface-base)`, `margin-bottom: var(--space-3)`, `overflow: hidden`.
3. **Header Row:** Subject icon/monogram (`20px × 20px`), Title (`<h3>` in `font.size.lg`, `font.weight.semibold`, `color.text.secondary`) containing the primary stretched `<a class="card-link">`, and trailing arrow (`↗` or `→`).
4. **Description Body:** Syllabus summary (`<p>` in `font.size.sm`, `font.weight.base`, `color.text.tertiary` to guarantee `8.59:1` contrast on `color.surface.muted`).
5. **Footer Metadata Row:** Course code, semester/unit count, and up to 3 topic tags (`font.size.xs`, `color.text.tertiary`, `gap: var(--space-1)`, `margin-top: var(--space-3)`).

#### Variants
* **Standard Syllabus Card:** Thumbnail + Header + 2-line description + footer metadata tags.
* **Compact Module Card:** Header + 2-line description + footer metadata tags (no thumbnail; ideal for high-density text syllabi).
* **Featured / Core Curriculum Card:** Standard anatomy with `border-color: var(--color-border-interactive)` and a `"Core"` badge in `color.text.secondary`.

#### State Matrix
| State | Visual & Token Specification |
| :--- | :--- |
| **Default** | Background `color.surface.muted`, border `1px solid var(--color-border-default)`, `shadow.none`. |
| **Hover** | Background shifts to `color.surface.interactive`, border shifts to `color.border.interactive`, elevation shifts to `shadow.md` over `motion.duration.base`. |
| **Focus-Visible** | When the child `.card-link` receives `:focus-visible`, the parent card (`article:has(.card-link:focus-visible)`) displays `shadow.focus` and border `color.border.focus`. |
| **Active** | Background `color.surface.muted`, border `color.text.secondary`. |
| **Disabled** | Archived/unavailable course card renders with `aria-disabled="true"`, text tokens set to `color.text.disabled`, and `border: 1px solid var(--color-border-default)`. |
| **Loading** | Skeleton card matching exact grid cell height (`aria-busy="true"`, `aria-label="Loading syllabus card"`) pulsing between `color.surface.muted` and `color.surface.interactive` over `motion.duration.slow`. |
| **Error** | Broken thumbnail swaps to a monogram badge on `color.surface.interactive` (`border: 1px solid var(--color-border-default)`); failed card payload displays `color.status.error` border and retry button. |

#### Interaction, Spacing, Typography, and Edge Cases
* **Keyboard:** Strictly 1 tab stop per card via the stretched title link. Any secondary interactive action inside a card (such as a `"Bookmark"` button) must set `position: relative; z-index: 2` and appear after the title link in DOM order.
* **Long-Content & Overflow:**
  * Card title (`<h3>`) must clamp to 1 line (`display: -webkit-box; -webkit-line-clamp: 1; -webkit-box-orient: vertical; overflow: hidden;`).
  * Card description (`<p>`) must clamp to 2 lines (`display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; min-height: calc(var(--font-lineHeight-base) * 2);`).
  * Topic tags exceeding 3 items must collapse into a `+N` badge (`font.size.xs`, `color.text.tertiary`).

### 4.4 Lists (Target Density: 4 per page)

#### Anatomy & Variants
1. **Subject Filter List (`<ul role="list" aria-label="Filter by subject">`):** Flex-wrap or horizontal scroll list of filter pills (`gap: var(--space-1)`).
2. **Featured Syllabus List (`<ul role="list" aria-label="Featured syllabi">`):** Highlighted 3-column row (`gap: var(--space-4)`).
3. **Main Directory Card Grid List (`<ul role="list" aria-label="All syllabi">`):** Primary 131-card CSS Grid (`gap: var(--space-4)` desktop, `var(--space-3)` mobile).
4. **Footer Resource List (`<ul role="list" aria-label="Footer links">`):** Vertical link stack (`gap: var(--space-2)`).

#### State Matrix
| State | Visual & Token Specification |
| :--- | :--- |
| **Default** | `list-style: none; margin: 0; padding: 0;` with explicit `role="list"` so Safari/VoiceOver preserves list semantics. |
| **Hover / Focus-Visible / Active** | Handled on child items; list container must never use `overflow: hidden` without `padding: var(--space-1)` clearance so child `shadow.focus` rings are never clipped. |
| **Disabled** | List container sets `inert` when obscured by a modal drawer, applying `color.text.disabled` to children. |
| **Loading** | Sets `aria-busy="true"` on the `<ul>` and renders 6 or 12 skeleton `<li>` cards matching exact grid dimensions to prevent layout shift. |
| **Error** | Replaces grid items with an error panel (`background: var(--color-status-errorSurface)`, `border: 1px solid var(--color-status-error)`, `border-radius: var(--radius-lg)`, `padding: var(--space-4)`) and a `"Retry loading syllabi"` Secondary Button. |

#### Empty-State Specification
When a search query or subject filter returns `0` matching syllabi, the directory list must render an accessible status container (`role="status"`, `aria-live="polite"`, `padding: calc(var(--space-4) * 2)`, `border: 1px dashed var(--color-border-default)`, `border-radius: var(--radius-lg)`, `text-align: center`):
* **Heading (`font.size.lg`, `color.text.secondary`):** `"No syllabi match [Subject / Query]"`
* **Body (`font.size.sm`, `color.text.tertiary`):** `"Clear active subject filters or try a broader course keyword."`
* **Action:** Secondary Outlined Button labeled `"Reset filters"`.

### 4.5 Navigation (Target Density: 2 per page)

#### Anatomy & Variants
1. **Primary Header Navigation (`<nav aria-label="Primary">`):** Sticky top landmark containing the skip link (`Skip to syllabus directory`), Syllabix brand link, primary `<ul role="list">` links, and mobile menu disclosure `<button>`.
2. **Secondary Footer Navigation (`<nav aria-label="Footer directory">`):** Bottom landmark housing categorized academic and platform links.

#### State Matrix
| State | Visual & Token Specification |
| :--- | :--- |
| **Default** | Primary: `background: var(--color-surface-base)`, `border-bottom: 1px solid var(--color-border-default)`. Secondary: `background: var(--color-surface-muted)`, `border-top: 1px solid var(--color-border-default)`. Links in `color.text.primary` (`font.size.sm`). |
| **Hover** | Link text shifts to `color.text.secondary`; background shifts to `color.surface.interactive` (`radius.md`, `padding: var(--space-1) var(--space-2)`). |
| **Focus-Visible** | Skip link slides into view at `top: var(--space-2); left: var(--space-2)` with `background: var(--color-text-secondary)`, `color: var(--color-surface-base)`, and `shadow.focus`. Nav items show `shadow.focus`. |
| **Active (Current Route)** | Sets `aria-current="page"`, `color: var(--color-text-secondary)`, `font.weight.medium`, and a `2px` bottom indicator bar in `color.text.secondary`. |
| **Disabled** | Sets `aria-disabled="true"` and `color: var(--color-text-disabled)`. |
| **Loading** | Dynamic syllabus counters inside nav items show a `16px` (`space.3`) shimmer pill in `color.surface.interactive`. |
| **Error** | Falls back to static core navigation routes (`All Syllabi`, `Subjects`, `Submit Syllabus`) if dynamic category metadata fails. |

#### Interaction & Responsive Behavior
* **Keyboard:** `Tab` reveals the skip link first; on viewports `< 768px`, opening the mobile menu drawer traps focus inside `<nav>` and closes on `Escape`, returning focus to the menu toggle button.
* **Touch:** All mobile navigation links and the menu toggle button must enforce a `>= 44px × 44px` touch target.
* **Overflow:** On desktop viewports (`>= 768px`), excess navigation links must collapse into a `"More"` disclosure `<button aria-expanded="false">` rather than wrapping the sticky header to a second line.

## 5. Accessibility Requirements and Testable Acceptance Criteria

Syllabix must conform to [WCAG 2.2 Level AA](https://www.w3.org/TR/WCAG22/). Every rule below is mandatory (`must`) and directly testable in CI and manual QA.

| ID | Criterion | Syllabix Implementation Rule | Testable Pass / Fail Check |
| :--- | :--- | :--- | :--- |
| **A11Y-01** | **Contrast Minimum** ([WCAG 1.4.3](https://www.google.com/search?q=https://www.w3.org/TR/WCAG22/%23contrast-minimum)) | Normal text must achieve `>= 4.5:1` contrast; large text (`>= 18px` bold or `>= 24px`) must achieve `>= 3.0:1`. Because `color.text.primary` (`oklab(... / 0.7)`) yields `~4.60:1` on `color.surface.base` (`#000000`) and drops to `~4.40:1` on `color.surface.muted` (`#080808`), card body copy on `color.surface.muted` must use `color.text.tertiary` (`#a6a6a6`, `8.59:1`) or `color.text.secondary` (`#ffffff`, `20.0:1`). | **Pass:** axe-core reports `0` color-contrast errors across all 131 cards and 208 buttons.<br>**Fail:** Rendering `color.text.primary` on surfaces lighter than `#050505` or using `color.border.default` (`#2e2e2e`) for readable text. |
| **A11Y-02** | **Non-Text Contrast** ([WCAG 1.4.11](https://www.google.com/search?q=https://www.w3.org/TR/WCAG22/%23non-text-contrast)) | Standalone inputs, outlined buttons, and focus indicators must maintain `>= 3.0:1` contrast against adjacent surfaces. | **Pass:** Search inputs and outlined buttons use `color.border.interactive` (`#767676`, `4.54:1`), and focus rings use `color.border.focus` (`#ffffff`, `21:1`).<br>**Fail:** Using `color.border.default` (`#2e2e2e`, `1.54:1`) as the sole boundary of an unlabeled input or icon button. |
| **A11Y-03** | **Keyboard Operation** ([WCAG 2.1.1](https://www.google.com/search?q=https://www.w3.org/TR/WCAG22/%23keyboard), [2.1.2](https://www.google.com/search?q=https://www.w3.org/TR/WCAG22/%23no-keyboard-trap)) | All 353 links, 208 buttons, 131 cards, and 2 navbars must be operable via keyboard alone with zero focus traps. | **Pass:** Full user journey (skip link → filter selection → syllabus card activation → mobile menu close via `Escape`) succeeds without a mouse.<br>**Fail:** Click handlers bound to non-interactive `<div>` or `<span>` nodes. |
| **A11Y-04** | **Focus Visible & Not Obscured** ([WCAG 2.4.7](https://www.google.com/search?q=https://www.w3.org/TR/WCAG22/%23focus-visible), [2.4.11](https://www.google.com/search?q=https://www.w3.org/TR/WCAG22/%23focus-not-obscured-minimum)) | Every focused control must render `shadow.focus` and remain uncovered by the `60px` sticky header (`scroll-padding-top: 80px` on `<html>`). | **Pass:** Keyboard tabbing highlights every control with the double-ring focus indicator and scrolls cards clear of the sticky navbar.<br>**Fail:** `outline: none` without `shadow.focus`, or focused cards hidden under the sticky header. |
| **A11Y-05** | **Bypass Blocks** ([WCAG 2.4.1](https://www.google.com/search?q=https://www.w3.org/TR/WCAG22/%23bypass-blocks)) | The page must provide `"Skip to syllabus directory"` as the first tab stop and roving `tabindex` on the 208-button filter bar. | **Pass:** Reaching the first syllabus card from page load requires `<= 4` `Tab` presses.<br>**Fail:** Forcing keyboard users to tab through 208 filter pills sequentially to reach `#main-content`. |
| **A11Y-06** | **Target Size Minimum** ([WCAG 2.5.8](https://www.google.com/search?q=https://www.w3.org/TR/WCAG22/%23target-size-minimum)) | All interactive controls outside body prose must measure `>= 24px × 24px` CSS pixels with at least `space.1` (`8px`) spacing. | **Pass:** Automated DOM bounding-box audit confirms `width >= 24 && height >= 24` on all buttons and standalone links.<br>**Fail:** Filter pills or icon buttons smaller than `24px × 24px` with `< 8px` gap. |
| **A11Y-07** | **Semantic Name, Role, Value** ([WCAG 1.3.1](https://www.google.com/search?q=https://www.w3.org/TR/WCAG22/%23info-and-relationships), [4.1.2](https://www.google.com/search?q=https://www.w3.org/TR/WCAG22/%23name-role-value)) | Both `<nav>` landmarks must have unique `aria-label` values, all 4 unstyled lists must set `role="list"`, and filter pills must toggle `aria-pressed`. | **Pass:** VoiceOver/NVDA announces distinct landmarks, accurate list counts, and `"pressed"` state on active subject filters.<br>**Fail:** Unlabeled `<nav>` tags, missing `role="list"`, or visual-only filter selection. |

## 6. Content and Tone Standards

Syllabix UI copy must be **concise, confident, and implementation-focused**. Every label must communicate exact academic or functional utility without filler or vague actions.

### Copywriting Rules
1. **Verb + Object Action Labels:** Buttons must state the exact operation (`"Download syllabus"`, `"Reset filters"`, `"Submit syllabus"`).
2. **Specific Destination Link Labels:** Links must name the target course or syllabus (`"Open CS-201 Data Structures syllabus"`), never `"Click here"`, `"View"`, or `"Read more"`.
3. **Information-Dense Card Summaries:** Card descriptions must state course scope, prerequisites, or core modules within `90–120` characters so the 2-line clamp remains complete and scannable.
4. **Strict Sentence Case:** Apply sentence case across all navigation links, buttons, filter pills, and section headers (capitalize only the first word and proper nouns/acronyms like `"CS"`, `"AI"`, `"DBMS"`, or `"IEEE"`).

### Syllabix Copy Examples (Do vs. Don't)
| UI Element | Do (Compliant) | Don't (Prohibited) | Rationale |
| :--- | :--- | :--- | :--- |
| **Card Stretched Link** | `Data Structures & Algorithms (CS-201)` | `View syllabus` / `Click here` / `→` | Prevents 131 identical `"View syllabus"` links in screen-reader link rotors. |
| **Subject Filter Pill** | `Operating systems (18)` *(with `aria-pressed="true"`)* | `Browse Operating Systems Syllabi!` | Sentence case, concise noun + deterministic count. |
| **Empty Filter State** | `No syllabi match "Quantum Computing". Reset filters to view all 131 syllabi.` | `Whoops! We couldn't find anything 😢` | Objective, direct, and pairs with the `"Reset filters"` recovery button. |
| **Fetch Error Banner** | `Unable to load syllabus directory. Retry connection.` | `Error 500: Internal Server Error.` | Human-readable failure state with immediate recovery action. |
| **Header Primary CTA** | `Submit syllabus` | `Upload Your Course Now!` | Clean, confident, sentence-case action verb + object. |

## 7. Anti-Patterns, Migration Notes, and Edge-Case Handling

### Prohibited Anti-Patterns
1. **Hardcoded Styling Values:** Do not use raw hex codes (`#000000`, `#080808`, `#2e2e2e`, `#ffffff`, `#a6a6a6`), raw `oklab()` strings, or arbitrary pixel values (`13px`, `15px`, `18px` padding, `24px` gap) inside component CSS/JSX.
2. **Low-Contrast Body Text on Elevated Surfaces:** Do not apply `color.text.primary` (`oklab(... / 0.7)`) to text inside `color.surface.muted` (`#080808`) or `color.surface.interactive` (`#141414`) containers; use `color.text.tertiary` (`#a6a6a6`) for card body copy and `color.text.secondary` (`#ffffff`) for card headings.
3. **Multi-Anchor Card Bloat:** Do not place separate `<a>` tags on the card thumbnail, card title, card description, and footer badge for the same syllabus URL.
4. **Removed Focus Indicators:** Never declare `outline: none` without pairing `:focus-visible` with `box-shadow: var(--shadow-focus)` and `outline: 2px solid transparent`.
5. **Non-Semantic Interactive Elements:** Never bind `onClick` handlers to `<div>`, `<span>`, or `<li>` elements for filtering or navigation.

### Migration & Scaffolding Checklist for Syllabix
1. **Load `Inter` & Root Tokens:** Import `Inter` (`300`, `500`, `600`) with `font-display: swap` and load `tokens.css` before all component stylesheets.
2. **Map Utility Classes to Semantic Tokens:** If using Tailwind CSS, map `bg-surface-base`, `bg-surface-muted`, `bg-surface-interactive`, `text-primary`, `text-secondary`, `text-tertiary`, `border-default`, `border-interactive`, and spacing tokens (`p-1` = `8px`, `p-2` = `12px`, `p-3` = `16px`, `p-4` = `20px`) directly to the `:root` CSS variables in `tailwind.config.js`.
3. **Enforce Single-Stop Card Architecture:** Build `<SyllabusCard />` with a single `<a className="card-link">` inside `<h3>` and stretch its hit target across the `<article>` container via `after:absolute after:inset-0`.

### Edge-Case Handling Rules
| Edge Case | Required Implementation Behavior |
| :--- | :--- |
| **Long Course Titles (> 50 chars) or Unbroken Course Codes** | Apply `-webkit-line-clamp: 1; overflow: hidden; text-overflow: ellipsis;` on `<h3>` and `min-width: 0` on flex/grid children to prevent horizontal layout blowout. |
| **200+ Subject Filter Pills on `320px` Mobile Viewport** | Render the top 8 subjects inline and collapse remaining filters into a `"More subjects (200)"` disclosure drawer or a horizontally scrollable rail with `scroll-padding-inline: var(--space-3)`. |
| **Missing or Broken Syllabus Preview Images** | Render a deterministic monogram/course-code graphic on `color.surface.interactive` with `1px solid var(--color-border-default)` and `aspect-ratio: 16 / 9` so card heights never collapse. |
| **400% Browser Zoom (`320px` CSS Viewport Width)** | Collapse grid to 1 column (`grid-template-columns: minmax(0, 1fr)`), wrap header controls into the mobile disclosure drawer, and keep sticky `<nav>` height `<= 60px`. |
| **Windows High Contrast (`forced-colors: active`)** | Include `outline: 2px solid transparent; outline-offset: 2px;` alongside `box-shadow: var(--shadow-focus)` so Forced Colors Mode preserves visible focus rings. |

## 8. Pre-Release QA Checklist

* [ ] **Token Purity:** Component stylesheets and JSX contain `0` raw hex/OKLab literals or off-scale pixel spacings (`8px`, `12px`, `16px`, `20px` only).
* [ ] **Typography Scale Lock:** Only `12px`, `14px`, `16px`, `18px`, `20px`, and `44px` font sizes are used, with `Inter, system-ui, arial` and base weight `300`.
* [ ] **7-State Component Coverage:** Links, Buttons/Filter Pills, Syllabus Cards, Lists, and Navigation components all implement `default`, `hover`, `focus-visible`, `active`, `disabled`, `loading`, and `error` states.
* [ ] **WCAG 2.2 AA Contrast Pass:** `color.text.primary` is restricted to `#000000` canvas backgrounds (`~4.6:1`); card descriptions on `#080808` use `color.text.tertiary` (`#a6a6a6`, `8.59:1`); standalone input/button borders use `color.border.interactive` (`#767676`, `4.54:1`).
* [ ] **High-Density Keyboard Flow:** `"Skip to syllabus directory"` is the first tab stop, the 208-button filter bar supports roving `tabindex` or bypass, and each of the 131 syllabus cards has exactly 1 primary tab stop.
* [ ] **Focus Not Obscured:** Root `<html>` sets `scroll-padding-top: 80px` so focused cards never hide behind the `60px` sticky header.
* [ ] **Target Size & Touch Spacing:** Every button, filter pill, and standalone link measures at least `24px × 24px` (`>= 44px` on mobile nav controls) with `>= 8px` (`space.1`) gap.
* [ ] **List & Landmark Semantics:** Both `<nav>` elements have unique `aria-label` attributes, and all 4 unstyled `<ul>` containers include `role="list"`.
* [ ] **Reflow & Empty States:** Layout reflows cleanly at `320px` width without horizontal scrollbars, and zero-match filter states render the `"Reset filters"` status block.
* [ ] **Reduced Motion Compliance:** Activating `prefers-reduced-motion: reduce` collapses transition durations to `0.01ms` and disables card hover scale/elevation transforms.
