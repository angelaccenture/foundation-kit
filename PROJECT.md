# Microsoft — EDS Project Reference

**Source site**: https://www.microsoft.com/en-us
**Content path prefix**: `/en-us/`
**Content directory**: `/content/`

---

## Brand Identity

| Property | Value |
|----------|-------|
| Primary color | `#0078d4` (Microsoft blue) |
| Accent hover | `#0067b8` (darker blue) |
| Text color | `#000` (body), `#0e1726` (headings) |
| Muted text | `#616161` |
| Body font | Segoe UI Variable Text / Segoe UI (system font, no web font loading) |
| Display font | Segoe UI Variable Display (system font) |
| Base body size | 16px (`--body-font-size-m`) |
| Breakpoint — tablet | 768px |
| Breakpoint — large desktop | 1440px |
| Content max-width | 1600px |

---

## Design Tokens

All defined in `/styles/styles.css` as CSS custom properties on `:root`.

### Core Colors

| Token | Value |
|-------|-------|
| `--color-text` | `#000` |
| `--color-text-dark` | `#0e1726` |
| `--color-text-muted` | `#616161` |
| `--color-text-light` | `#f4fafd` |
| `--color-link` | `#0078d4` |
| `--color-link-hover` | `#0067b8` |
| `--color-background` | `#fff` |
| `--color-background-card` | `#fff` |
| `--color-accent` | `#0078d4` |
| `--color-accent-hover` | `#0067b8` |
| `--color-accent-dark` | `#0072c6` |
| `--color-border` | `#e3e3e3` |
| `--color-badge-blue` | `#dceef8` |
| `--color-badge-yellow` | `#ffb900` |
| `--color-section-light-grey` | `#dceef8` |
| `--color-footer-bg` | `#f2f2f2` |

### Semantic Aliases

| Token | Maps to |
|-------|---------|
| `--color-background` | `#fff` |
| `--color-text` | `#000` (body text) |
| `--color-text-dark` | `#0e1726` (headings) |
| `--color-link` | `#0078d4` (Microsoft blue) |
| `--color-link-hover` | `#0067b8` |
| `--color-border` | `#e3e3e3` |

### Spacing

| Token | Value |
|-------|-------|
| `--spacing-xxl` | `48px` |
| `--spacing-xl` | `32px` |
| `--spacing-l` | `24px` |
| `--spacing-m` | `16px` |
| `--spacing-s` | `8px` |
| `--spacing-xs` | `4px` |

> **Note**: This project uses `xs/s/m/l/xl/xxl` suffix convention.

### Typography

| Token | Mobile | Desktop (≥768px) |
|-------|--------|-------------------|
| `--heading-font-size-xxl` | 32px | 40px |
| `--heading-font-size-xl` | 28px | 32px |
| `--heading-font-size-l` | 24px | — |
| `--heading-font-size-m` | 20px | — |
| `--heading-font-size-s` | 18px | — |
| `--heading-font-size-xs` | 16px | — |
| `--body-font-size-xl` | 20px | — |
| `--body-font-size-l` | 18px | — |
| `--body-font-size-m` | 16px | — |
| `--body-font-size-s` | 15px | — |
| `--body-font-size-xs` | 14px | — |

### Radius, Shadows, Transitions

| Token | Value |
|-------|-------|
| `--card-border-radius` | `16px` |
| `--card-shadow` | `0 0 2px 0 rgb(0 0 0 / 12%), 0 2px 4px 0 rgb(0 0 0 / 14%)` |
| `--button-border-radius` | `8px` |
| `--transition-base` | `0.2s ease` |
| `--heading-letter-spacing` | `-0.8px` |
| `--body-letter-spacing` | `-0.48px` |
| `--button-letter-spacing` | `-0.3px` |

### Component Tokens

| Token | Value |
|-------|-------|
| `--button-border-radius` | `8px` |
| `--button-padding` | `8px 12px` |
| `--button-padding-large` | `12px 13px` |
| `--button-font-size` | `15px` |
| `--button-min-height` | `40px` |
| `--button-min-width` | `40px` |
| `--card-border-radius` | `16px` |
| `--card-shadow` | level1 card shadow |
| `--content-max-width` | `1600px` |
| `--section-padding` | `0 24px` |
| `--header-height` | `0px` |

---

## Button Variants

Defined in `/styles/styles.css`. Authoring pattern in `/scripts/scripts.js`:

| Variant | Authoring | Appearance |
|---------|-----------|------------|
| **Primary** | `**[link text](url)**` (`<strong>` wraps link) | Blue bg (#0078d4), white text |
| **Secondary** | `*[link text](url)*` (`<em>` wraps link) | White bg, dark text, hover #f0f0f0 |

All buttons: 15px font, 600 weight, 8px border-radius, -0.3px letter-spacing, 40px min-height.

---

## Section Styles

Applied via `section-metadata` block with `Style: <name>`. Defined in `/styles/styles.css`.

| Style | Class | Background | Text color |
|-------|-------|------------|------------|
| `dark` | `.section.dark` | Dark | Inverse white |
| `light-grey` | `.section.light-grey` | `--color-section-light-grey` (#dceef8) | Default |
| `announcement-bar` | `.section.announcement-bar` | Announcement styling | Default |

---

## Block Reference

### advanced-carousel

**Location**: `/blocks/advanced-carousel/`

| Variant | Class | Purpose |
|---------|-------|---------|
| Default | `.advanced-carousel` | Carousel container with navigation dots and auto-play |

**Authoring**: Wraps child slide blocks (hero-carousel-slide, teaser, etc.) in a scrollable carousel with dot indicators.

**Features**: Scroll-snap carousel, dot navigation, auto-play with pause on hover, keyboard navigation.

**Responsive**: Full-width at all breakpoints.

---

### hero-carousel-slide

**Location**: `/blocks/hero-carousel-slide/`

| Variant | Class | Purpose |
|---------|-------|---------|
| Default | `.hero-carousel-slide` | Full-width hero slide with background image, heading, description, CTA |

**Authoring**:
| Hero Carousel Slide |
|---|
| Image \| h2 heading, description, CTA link |

**Features**: Full-bleed background image with gradient overlay. Text overlay at bottom-left. CTA button styled as primary blue.

**Responsive**: Min-height 400px (mobile) → 480px (tablet) → 540px (desktop). Heading 28px → 36px → 40px.

---

### teaser

**Location**: `/blocks/teaser/`

| Variant | Class | Purpose |
|---------|-------|---------|
| Default | `.teaser` | Horizontal card with image + content + CTA (Microsoft card-banner style) |

**Authoring**:
| Teaser |
|---|
| Image |
| h2/h3 heading, description, CTA link |

**Features**: Card with border-radius, box-shadow, hover lift effect. Image with 4:3 aspect ratio. CTA button inside content container. Row-reverse layout at desktop (image right, content left).

**Responsive**: Column layout (mobile) → row-reverse (≥768px). Border-radius 16px → 24px. Image border-radius 8px → 16px. Content padding 16px → 24px.

---

### card

**Location**: `/blocks/card/`

| Variant | Class | Purpose |
|---------|-------|---------|
| Default | `.card` | Individual feature card (Microsoft reimagine-card-feature style) |

**Authoring**:
| Card |
|---|
| Image \| h3 heading, description, CTA link |

**Features**: Vertical card with image, heading, description, and link. Card shadow and border. Hover lift effect.

**Responsive**: Stacks vertically at all widths, used inside grid layouts.

---

### cards

**Location**: `/blocks/cards/`

| Variant | Class | Purpose |
|---------|-------|---------|
| Default | `.cards` | Auto-fill card grid (author-kit) |

**Authoring**:
| Cards |
|---|
| Image \| Body content |

**Features**: `auto-fill` grid with `minmax(257px, 1fr)`. Image optimization via `createOptimizedPicture`.

**Responsive**: Auto-fills based on available width.

---

### cards-blog

**Location**: `/blocks/cards-blog/`

| Variant | Class | Purpose |
|---------|-------|---------|
| Default | `.cards-blog` | Blog article card grid (Microsoft Blog style) |

**Authoring**:
| Cards Blog |
|---|
| Image \| Category tag, h3 linked title, description, date |

**Features**: Blog-specific card layout with category badges, date metadata.

**Responsive**: Auto-fill grid layout.

**Parser**: `parsers/cards-blog.js` — Targets `article.m-preview` selectors.

---

### ai-chat

**Location**: `/blocks/ai-chat/`

| Variant | Class | Purpose |
|---------|-------|---------|
| Default | `.ai-chat` | AI assistant / Copilot chat prompt placeholder |

**Authoring**:
| AI Chat |
|---|
| Heading, description, prompt input placeholder |

**Features**: Chat interface placeholder with prompt styling.

**Responsive**: Full-width, responsive padding.

**Parser**: `parsers/ai-chat.js` — Targets `div.msstore-chatonpage.contained`.

---

### quick-links

**Location**: `/blocks/quick-links/`

| Variant | Class | Purpose |
|---------|-------|---------|
| Default | `.quick-links` | Horizontal pill-style navigation for product categories |

**Authoring**:
| Quick Links |
|---|
| Link 1 \| Link 2 \| Link 3 ... |

**Features**: Horizontal scrollable pill links. Icon support. Active state styling.

**Responsive**: Horizontal scroll at all widths.

**Parser**: `parsers/quick-links.js` — Targets `reimagine-secondary-nav[configuration='quicklinks']`.

---

### hero

**Location**: `/blocks/hero/`

| Variant | Class | Purpose |
|---------|-------|---------|
| Default | `.hero` | Full-width promotional banner (Microsoft banner-featured style) |
| Center | `.hero.center` | Centered text hero (M365 product landing page style) |

**Authoring**:
| Hero |
|---|
| Image \| h2 heading, description, CTA link |

**Features**: Full-bleed background image with text overlay.

**Responsive**: Adjusts padding and heading size at breakpoints.

**Parsers**:
- `parsers/hero.js` — Targets `reimagine-banner-featured reimagine-card-banner` (homepage).
- `parsers/hero-m365.js` — Targets `div.section-master--bg-image` (M365). Emits `hero (center)` variant.

---

### banner-carousel-slide

**Location**: `/blocks/banner-carousel-slide/`

| Variant | Class | Purpose |
|---------|-------|---------|
| Default | `.banner-carousel-slide` | Full-bleed background image slide with dark gradient overlay |

**Authoring**:
| Banner Carousel Slide |
|---|
| Image \| h2 heading, description, CTA link |

**Features**: Absolute-positioned background image. Dark gradient overlay from bottom. White text. CTA button with white background.

**Responsive**: Min-height 400px → 480px → 540px. Heading 28px → 36px → 40px.

**Parser**: `parsers/banner-carousel-slide.js` — Targets `reimagine-carousel-item reimagine-card-banner`.

> **Note**: In the homepage content, the bottom carousel slides have been converted to use the `teaser` block instead for the card-style layout.

---

### social-follow

**Location**: `/blocks/social-follow/`

| Variant | Class | Purpose |
|---------|-------|---------|
| Default | `.social-follow` | Social media follow links (Follow Microsoft section) |

**Authoring**:
| Social Follow |
|---|
| h2 heading, social media links |

**Features**: Social media icon links in a horizontal layout.

**Responsive**: Centered, wraps at smaller widths.

**Parser**: `parsers/social-follow.js` — Targets `reimagine-logo-footer`.

---

### advanced-accordion

**Location**: `/blocks/advanced-accordion/`

| Variant | Class | Purpose |
|---------|-------|---------|
| Default | `.advanced-accordion` | Collapsible accordion sections (container block) |

**Authoring**: Container block — collects sibling sections as collapsible panels. `<ul>` list provides item titles.

**Features**: Native `<details>`/`<summary>` elements. Chevron arrows. Animated expand/collapse. Hover and open state backgrounds. Border-radius cards.

**Responsive**: Full-width at all breakpoints. 16px padding on summary and body.

---

### advanced-tabs

**Location**: `/blocks/advanced-tabs/`

| Variant | Class | Purpose |
|---------|-------|---------|
| Default | `.advanced-tabs` | Tabbed content panels |

**Features**: Tab navigation with panel switching. Keyboard accessible.

---

### advanced-text

**Location**: `/blocks/advanced-text/`

| Variant | Class | Purpose |
|---------|-------|---------|
| Default | `.advanced-text` | Rich text content with enhanced styling |

---

### columns

**Location**: `/blocks/columns/`

| Variant | Class | Purpose |
|---------|-------|---------|
| Default | `.columns` | Generic multi-column layout (author-kit) |

**Authoring**:
| Columns |
|---|
| Col 1 \| Col 2 \| ... |

**Features**: Image column detection (`.columns-img-col`). Column count class (`.columns-N-cols`).

**Responsive**: Stacked (mobile) → side-by-side (desktop).

---

### table

**Location**: `/blocks/table/`

| Variant | Class | Purpose |
|---------|-------|---------|
| Default | `.table` | Data table with header row |

**Features**: Responsive table with horizontal scroll. Header row styling.

---

### modal

**Location**: `/blocks/modal/`

| Variant | Class | Purpose |
|---------|-------|---------|
| Default | `.modal` | Modal dialog overlay |

**Features**: Overlay with backdrop. Close button. Focus trapping. Escape key close.

---

### youtube

**Location**: `/blocks/youtube/`

| Variant | Class | Purpose |
|---------|-------|---------|
| Default | `.youtube` | YouTube video embed |

**Features**: Responsive iframe embed. Lazy-loaded. Privacy-enhanced mode.

---

### form

**Location**: `/blocks/form/`

| Variant | Class | Purpose |
|---------|-------|---------|
| Default | `.form` | AEM Forms integration |

**Features**: JSON-driven form rendering. Multiple field types.

---

### header

**Location**: `/blocks/header/`

| Variant | Class | Purpose |
|---------|-------|---------|
| Default | `.header` | Site navigation |

**Features**: Fragment-loaded from `/nav`. Three nav zones: brand, sections, tools. Hamburger toggle on mobile.

---

### footer

**Location**: `/blocks/footer/`

| Variant | Class | Purpose |
|---------|-------|---------|
| Default | `.footer` | Site footer |

**Features**: Fragment-loaded from `/footer`.

---

### fragment

**Location**: `/blocks/fragment/`

| Variant | Class | Purpose |
|---------|-------|---------|
| Default | `.fragment` | Generic fragment loader utility |

**Features**: Fetches `.plain.html`, decorates content (sections, blocks, buttons, icons), loads sections.

---

### section-metadata

**Location**: `/blocks/section-metadata/`

| Variant | Class | Purpose |
|---------|-------|---------|
| Default | `.section-metadata` | Section configuration (style, layout metadata) |

---

### button

**Location**: `/blocks/button/`

| Variant | Class | Purpose |
|---------|-------|---------|
| Default | `.button` | Standalone button component |

---

### tags

**Location**: `/blocks/tags/`

| Variant | Class | Purpose |
|---------|-------|---------|
| Default | `.tags` | Tag/category badges |

---

### schedule

**Location**: `/blocks/schedule/`

| Variant | Class | Purpose |
|---------|-------|---------|
| Default | `.schedule` | Event schedule display |

---

### card-app

**Location**: `/blocks/card-app/`

| Variant | Class | Purpose |
|---------|-------|---------|
| Default | `.card-app` | App/product card grid (Microsoft "What's Included" style) |

**Authoring**:
| Card App |
|---|
| Icon image \| h3 app name, description, Learn more link |

**Features**: Responsive grid layout. White cards with border-radius and subtle shadow. Hover lift effect. 48x48 icon with light grey rounded background. "Learn more" link with underline.

**Responsive**: 1-column (mobile) → 2-column (≥600px) → 3-column (≥900px).

**Parser**: `parsers/card-app.js` — Targets `div.card-grid__cards .card` (M365 What's Included section).

---

### pricing-cards

**Location**: `/blocks/pricing-cards/`

| Variant | Class | Purpose |
|---------|-------|---------|
| Default | `.pricing-cards` | Pricing plan comparison cards (Microsoft M365 plans style) |

**Authoring**:
| Pricing Cards |
|---|
| h3 plan name, **price** (bold), CTA links, h4 feature heading, feature list (ul), badge text |

**Features**: Horizontal scrollable card layout. Plan name, bold price, primary + secondary CTA buttons, checkmark feature list with blue SVG icons. App badge text at bottom.

**Responsive**: Horizontal scroll with snap (85% card width mobile, 45% tablet), 5-column equal-width at ≥900px.

**Parser**: `parsers/pricing-cards.js` — Targets `div.carousel.carousel--card-grid` (M365 yearly plans).

---

## Import Infrastructure

Located in `/tools/importer/`.

### Template: msft-homepage

Defined in `page-templates.json`. Source: Microsoft corporate homepage (https://www.microsoft.com/en-us).

**10 Sections**:

| # | Section | Block(s) | Default Content | Style |
|---|---------|----------|-----------------|-------|
| 1 | Announcement Bar | — | announcement text + link | `announcement-bar` |
| 2 | Hero Carousel | advanced-carousel, hero-carousel-slide | — | — |
| 3 | AI Assistant / Chat | ai-chat | — | — |
| 4 | Product Category Navigation | quick-links | — | — |
| 5 | Content Promotion Cards | cards | — | — |
| 6 | Full-Width Promotional Banner | hero | — | `dark` |
| 7 | For Business Section | cards | h2 heading | `light-grey` |
| 8 | Get to Know AI and Copilot | cards | h2 heading | `light-grey` |
| 9 | Bottom Carousel | advanced-carousel, banner-carousel-slide (teaser) | — | — |
| 10 | Follow Microsoft | social-follow | — | — |

### Template: ms-blog-homepage

Defined in `page-templates.json`. Source: Microsoft Blog homepage (https://blogs.microsoft.com/).

**3 Sections**:

| # | Section | Block(s) | Default Content | Style |
|---|---------|----------|-----------------|-------|
| 1 | Featured Posts | cards-blog | h2 heading | — |
| 2 | More News | cards-blog | h2 heading, view more link | — |
| 3 | Social Footer | — | social links | — |

### Template: microsoft-365

Defined in `page-templates.json`. Source: Microsoft 365 product page (https://www.microsoft.com/en-us/microsoft-365).

**10 Sections**:

| # | Section | Block(s) | Default Content | Style |
|---|---------|----------|-----------------|-------|
| 1 | Announcement Bar | — | announcement text + link | `announcement-bar` |
| 2 | Hero | hero (center) | — | — |
| 3 | Copilot Features | — | eyebrow, h2, features (h3+p ×4), image, learn more link | — |
| 4 | News / Discover | teaser, card | h2 heading | — |
| 5 | What's Included | card-app | eyebrow, h2, explore apps link | `light-grey` |
| 6 | Plans / Pricing | pricing-cards | eyebrow, h2 | — |
| 7 | Get Started | card | eyebrow, h2 | — |
| 8 | FAQ | advanced-accordion | h2 heading | — |
| 9 | Legal Disclaimers | — | footnotes | — |
| 10 | Follow Microsoft 365 | social-follow | — | — |

### Parsers (16)

| Parser | File | Source Selectors |
|--------|------|------------------|
| advanced-accordion | `parsers/advanced-accordion.js` | `div.ocr-faq` (M365 FAQ) |
| advanced-carousel | `parsers/advanced-carousel.js` | `reimagine-carousel` |
| ai-chat | `parsers/ai-chat.js` | `div.msstore-chatonpage.contained` |
| banner-carousel-slide | `parsers/banner-carousel-slide.js` | `reimagine-carousel-item reimagine-card-banner` |
| card | `parsers/card.js` | `div.cta-stacked--vertical-cards .card`, `div.three-up-cards .card` (M365) |
| card-app | `parsers/card-app.js` | `div.card-grid__cards .card` (M365 What's Included) |
| cards | `parsers/cards.js` | `reimagine-card-feature` |
| cards-blog | `parsers/cards-blog.js` | `article.m-preview` |
| columns | `parsers/columns.js` | `div.ocr-accordion.accordion--vertical-product` (M365) → emits default content (no block) |
| hero | `parsers/hero.js` | `reimagine-banner-featured reimagine-card-banner` |
| hero-carousel-slide | `parsers/hero-carousel-slide.js` | `reimagine-carousel-item reimagine-hero-featured-slider-item` |
| hero-m365 | `parsers/hero-m365.js` | `div.section-master--bg-image.section-master--blade-hero-slim` (M365 hero) → emits `hero (center)` |
| pricing-cards | `parsers/pricing-cards.js` | `div.carousel.carousel--card-grid` (M365 yearly plans) |
| quick-links | `parsers/quick-links.js` | `reimagine-secondary-nav[configuration='quicklinks']` |
| social-follow | `parsers/social-follow.js` | `reimagine-logo-footer` (homepage), `div.socialfollow` (M365) |
| teaser | `parsers/teaser.js` | `div.card-horizontal-container` (M365 featured card) |

### Transformers (4)

| Transformer | File | Purpose |
|-------------|------|---------|
| msft-cleanup | `transformers/msft-cleanup.js` | Microsoft homepage DOM cleanup: web component shadow DOM extraction, lazy-load activation, tracking removal |
| msft-sections | `transformers/msft-sections.js` | Section boundary detection for Microsoft homepage |
| ms-blog-cleanup | `transformers/ms-blog-cleanup.js` | Microsoft Blog DOM cleanup |
| ms-blog-sections | `transformers/ms-blog-sections.js` | Section boundary detection for Microsoft Blog |

### Bundling

**Microsoft homepage**:
```bash
npx esbuild tools/importer/import-msft-homepage.js --bundle --format=iife --global-name=CustomImportScript --outfile=tools/importer/import-msft-homepage.bundle.js
```

**Microsoft Blog homepage**:
```bash
npx esbuild tools/importer/import-ms-blog-homepage.js --bundle --format=iife --global-name=CustomImportScript --outfile=tools/importer/import-ms-blog-homepage.bundle.js
```

**Microsoft 365**:
```bash
npx esbuild tools/importer/import-microsoft-365.js --bundle --format=iife --global-name=CustomImportScript --outfile=tools/importer/import-microsoft-365.bundle.js
```

---

## Image CDN Sources

| CDN | URL Pattern | Notes |
|-----|-------------|-------|
| Microsoft Dynamic Media | `cdn-dynmedia-1.microsoft.com/is/image/microsoftcorp/...` | Primary image CDN for Microsoft.com. Dynamic Media with resize/format params. |
| Microsoft Content Delivery | `img-prod-cms-rt-microsoft-com.akamaized.net/...` | Secondary CDN for some content images. |

---

## Migration Status

### Imported Pages

| Page | Content File | Source URL |
|------|-------------|------------|
| Microsoft Homepage | `content/msft-homepage.plain.html` | https://www.microsoft.com/en-us |
| Microsoft Blog Homepage | `content/index.plain.html` | https://blogs.microsoft.com/ |
| Microsoft 365 | `content/en-us/microsoft-365.plain.html` | https://www.microsoft.com/en-us/microsoft-365 |

---

## Fonts

| Font | Source | Usage |
|------|--------|-------|
| **Segoe UI Variable Text** | System font (Windows 11+) | Body text (`--font-family`) |
| **Segoe UI Variable Display** | System font (Windows 11+) | Headings (`--heading-font-family`) |
| **Segoe UI** | System font (Windows) | Fallback for older Windows |
| **segoe-ui-fallback** | Local fallback (`/styles/fonts.css`) | Cross-platform fallback (Helvetica Neue → Helvetica → Arial) |

> **Note**: No web fonts need to be loaded. Segoe UI is a system font on Windows. Non-Windows users get Helvetica Neue / Arial fallback.
