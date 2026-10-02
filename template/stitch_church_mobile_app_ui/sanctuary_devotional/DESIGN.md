---
name: Sanctuary Devotional
colors:
  surface: '#fbf9f4'
  surface-dim: '#dbdad5'
  surface-bright: '#fbf9f4'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#f5f3ee'
  surface-container: '#f0eee9'
  surface-container-high: '#eae8e3'
  surface-container-highest: '#e4e2dd'
  on-surface: '#1b1c19'
  on-surface-variant: '#4e4637'
  inverse-surface: '#30312e'
  inverse-on-surface: '#f2f1ec'
  outline: '#807665'
  outline-variant: '#d2c5b1'
  surface-tint: '#7b5900'
  primary: '#7b5900'
  on-primary: '#ffffff'
  primary-container: '#c89b3c'
  on-primary-container: '#4b3500'
  inverse-primary: '#f0bf5c'
  secondary: '#486458'
  on-secondary: '#ffffff'
  secondary-container: '#caeada'
  on-secondary-container: '#4e6a5e'
  tertiary: '#8f485b'
  on-tertiary: '#ffffff'
  tertiary-container: '#de899e'
  on-tertiary-container: '#612336'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#ffdea4'
  primary-fixed-dim: '#f0bf5c'
  on-primary-fixed: '#261900'
  on-primary-fixed-variant: '#5d4200'
  secondary-fixed: '#caeada'
  secondary-fixed-dim: '#afcdbe'
  on-secondary-fixed: '#042017'
  on-secondary-fixed-variant: '#314c41'
  tertiary-fixed: '#ffd9e0'
  tertiary-fixed-dim: '#ffb1c3'
  on-tertiary-fixed: '#3c0519'
  on-tertiary-fixed-variant: '#733144'
  background: '#fbf9f4'
  on-background: '#1b1c19'
  surface-variant: '#e4e2dd'
  altar-gold: '#C89B3C'
  cathedral-evergreen: '#0E2A20'
  sacred-maroon: '#5B1E31'
  vellum-base: '#FBF9F5'
  vellum-card: '#FFFFFF'
  scripture-ink: '#1A1A18'
  ink-muted: '#636058'
typography:
  display:
    fontFamily: EB Garamond
    fontSize: 36px
    fontWeight: '500'
    lineHeight: 44px
    letterSpacing: -0.01em
  headline-lg:
    fontFamily: EB Garamond
    fontSize: 30px
    fontWeight: '600'
    lineHeight: 38px
  headline-md:
    fontFamily: EB Garamond
    fontSize: 24px
    fontWeight: '600'
    lineHeight: 32px
  headline-sm:
    fontFamily: EB Garamond
    fontSize: 20px
    fontWeight: '600'
    lineHeight: 28px
  scripture-reading:
    fontFamily: EB Garamond
    fontSize: 21px
    fontWeight: '400'
    lineHeight: 34px
    letterSpacing: 0.01em
  title-md:
    fontFamily: Plus Jakarta Sans
    fontSize: 16px
    fontWeight: '600'
    lineHeight: 24px
  title-sm:
    fontFamily: Plus Jakarta Sans
    fontSize: 14px
    fontWeight: '600'
    lineHeight: 20px
  body-lg:
    fontFamily: Plus Jakarta Sans
    fontSize: 16px
    fontWeight: '400'
    lineHeight: 26px
  body-md:
    fontFamily: Plus Jakarta Sans
    fontSize: 14px
    fontWeight: '400'
    lineHeight: 22px
  label-md:
    fontFamily: Plus Jakarta Sans
    fontSize: 12px
    fontWeight: '600'
    lineHeight: 16px
    letterSpacing: 0.04em
  label-sm:
    fontFamily: Plus Jakarta Sans
    fontSize: 11px
    fontWeight: '500'
    lineHeight: 14px
    letterSpacing: 0.02em
rounded:
  sm: 0.125rem
  DEFAULT: 0.25rem
  md: 0.375rem
  lg: 0.5rem
  xl: 0.75rem
  full: 9999px
spacing:
  gutter: 1rem
  margin: 1rem
  margin-tablet: 1.5rem
  space-xs: 0.25rem
  space-sm: 0.5rem
  space-md: 1rem
  space-lg: 1.5rem
  space-xl: 2.25rem
---

## Brand & Style

The design system establishes a reverent, contemplative, and luminous digital sanctuary designed for mobile church congregations, daily scripture meditation, and liturgical community engagement. It caters to modern believers seeking a focused, distraction-free environment that balances sacred tradition with contemporary clarity.

The visual style embraces an elevated editorial aesthetic rooted in classical ecclesiastical publishing, framed by restrained modern card geometry. It avoids excessive ornamentation, relying instead on deliberate typographic scale, warm natural parchment surfaces, and radiant metallic gold accents. The atmosphere evokes the quiet warmth of morning prayer, stained-glass luminescence, and architectural order, fostering serenity, contemplation, and communal belonging.

## Colors

The palette is anchored by `#C89B3C`, an ecclesiastical gold conveying warmth, illumination, and spiritual elevation. This primary hue is balanced by deep architectural and liturgical supporting tones:

- **Primary (`#C89B3C`):** Used deliberately for key devotional highlights, active liturgical indicators, active bottom navigation accents, and primary action surfaces.
- **Secondary (`#0E2A20`):** A deep sanctuary pine-green serving as high-contrast structural framing, prominent headers, banner cards, and deep night-prayer surfaces.
- **Tertiary (`#5B1E31`):** A rich liturgical maroon employed sparingly for sacrificial offering callouts, special holy-day badges, and scriptural section demarcations.
- **Neutral (`#F9F7F2`):** A warm vellum-tinted off-white background that removes digital glare while preserving readability during prolonged scripture reading sessions.
- **Ink and Legibility:** Body copy utilizes `#1A1A18` to maintain contrast ratios exceeding WCAG AAA standards against warm backgrounds.

## Typography

The typographical hierarchy bridges classical liturgy with modern digital product ergonomics:

- **EB Garamond (Display & Headlines):** Infuses titles, sermon themes, and scripture passages with dignity, historical gravitas, and natural literary rhythm. The specialized `scripture-reading` token features generous leading (`34px`) on a `21px` body to facilitate unbroken, fatigue-free contemplation.
- **Plus Jakarta Sans (Interface & Functional Text):** Deployed across all application controls, metadata, lists, navigation labels, and secondary descriptive copy. Its rounded, open letterforms balance the classical serifs with contemporary warmth and immediate mobile legibility.
- **Liturgical Verse Treatment:** Scripture quotes always pair Garamond italics with small caps verse references in Plus Jakarta Sans.

## Layout & Spacing

The layout is optimized for single-handed mobile navigation with an eye toward focused content consumption:

- **Grid & Margins:** A fluid mobile-first canvas with a standard `1rem` (16px) margin on phones, expanding to `1.5rem` (24px) on tablets. Structural gutters between list grids remain at `1rem`.
- **Bottom Navigation Clearance:** All scrollable views incorporate an automatic bottom content clearance of `5.5rem` (88px) to guarantee that daily verses, sermon audio bars, and navigation tabs never obscure actionable content.
- **Devotional Breathing Room:** Content-heavy views (scripture, guided prayers) mandate `space-lg` (24px) between narrative blocks, providing sacred pause and visual quietness.

## Elevation & Depth

Elevation eschews stark drop shadows in favor of ambient warmth and delicate structural borders:

- **Base Layer:** The vellum canvas sits at ground level (`#FBF9F5`).
- **Cards and Containers:** Standard cards sit on an ultra-subtle ambient lift (`0 2px 8px -2px rgba(14, 42, 32, 0.04), 0 1px 3px 0 rgba(14, 42, 32, 0.02)`) paired with a fine border (`1px solid rgba(200, 155, 60, 0.15)`).
- **Sticky Sanctuary Elements (Audio Player / Bottom Bar):** Elevated elements utilize an ultra-sheer parchment backdrop blur (`backdrop-filter: blur(12px); background: rgba(251, 249, 245, 0.92);`) anchored by a soft upper rim shadow (`0 -2px 12px rgba(14, 42, 32, 0.05)`).
- **Featured / Holy Day Cards:** Highlighted containers utilize deep cathedral evergreen backgrounds (`#0E2A20`) with gold accent borders, conveying physical weight similar to a cloth-bound prayer book.

## Shapes

The interface adheres to a refined, soft curvature (`roundedness: 1`):

- **Standard Elements (`0.25rem` / 4px):** Form inputs, devotional scripture chips, and checkboxes feature crisp, disciplined corners that recall bound liturgical folios.
- **Cards & Modal Sheets (`0.5rem` / 8px):** Primary sermon cards, prayer request containers, and notification banners utilize `rounded-lg` for approachable softness without feeling overly casual or playful.
- **Pill Exception for Micro-Interactions:** Scripture chapter selector badges and the audio scrubber thumbnail use full pill shapes to denote swipeable tactile affordances.

## Components

### Buttons
- **Primary:** Filled with `#C89B3C` featuring high-contrast `#FFFFFF` or `#0E2A20` bold typography, height 48px, radius 4px. Used for "Give", "Join Prayer", and primary devotion confirmations.
- **Secondary / Liturgical:** Deep `#0E2A20` fill with subtle gold typography for major sermon playbacks and event registrations.
- **Ghost / Outlined:** Transparent surface with `1px solid rgba(200, 155, 60, 0.5)` and gold text for scripture chapter browsing and sharing verses.

### Bottom Navigation Bar
- Fixed 64px container with frosted vellum backing.
- 4 to 5 core destinations: Today (Devotional), Sermons, Scripture, Community, Giving.
- Inactive icons render in `#636058`; active items feature a subtle `#C89B3C` halo and a top 2px gold indicator bar.

### Scripture & Devotional Cards
- Crisp white or cream background with 1px gold hairline borders.
- Top meta row contains book/chapter reference in small caps, followed by devotional passage in `EB Garamond`.
- Subtle right-aligned quick actions for audio listen, bookmark, and reflection notes.

### Audio Sermon Player Bar
- A persistent mini-player docking directly above the bottom navigation bar.
- Displays current sermon title, speaker, and progress indicator styled in thin liturgical gold.

### Chips & Filters
- Compact 32px height, 4px corner radius.
- Inactive: `#F0EDE6` background with `#636058` text.
- Active: `#0E2A20` fill with `#C89B3C` label and subtle border.

### Input Fields
- Single-line and multiline prayer requests use a warm white fill, 1px border (`#D8D3C8`), 4px corner radius, and transition to `#C89B3C` on focus with no harsh outer glow.