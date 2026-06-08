# References

External documentation, APIs, and resources referenced by this project. Review this file at session start to stay current on available tools and integrations.

---

## DA.live Platform

**What it is:** Document Authoring — an Edge Delivery authoring interface from Adobe. Document-centric CMS designed for AEM Edge Delivery customers. Three components: storage API, authoring UIs, and content provider for EDS.

**Philosophy:** No markdown (DOM-native); 1000+ docs/min API; mobile-first; minimalist architecture ("server should be as dumb as possible"); 99.99% uptime; no extra licensing cost for EDS customers.

**Docs:** https://docs.da.live/

---

## DA Admin API

**Base URL:** `https://admin.da.live`
**Auth:** `Authorization: Bearer {IMS_TOKEN}` on all requests
**Docs:** https://docs.da.live/developers/api

### Source API — `/source/{org}/{repo}/{path}`

| Method | Purpose | Body | Response |
|--------|---------|------|----------|
| GET | Fetch raw file content (HTML, JSON, media) | — | 200 with content, 404 not found, 401 unauth |
| POST | Create folder (no extension) or file (with extension) | multipart/form-data, `data` field for files | 201 with JSON: edit URL, preview URL, live URL |
| DELETE | Remove file or folder (idempotent) | — | 204 always (even if not found), 401 unauth |

### List API — `/list/{org}/{repo}/{path}`

| Method | Purpose | Body | Response |
|--------|---------|------|----------|
| GET | List directory contents | — | 200 with JSON array, 401 unauth |

**Response shape:**
```json
[
  { "path": "/org/repo/folder/file.html", "name": "file", "ext": "html", "lastModified": 1717500000000 },
  { "path": "/org/repo/folder/subfolder", "name": "subfolder", "lastModified": 1717400000000 }
]
```

- Files have `ext` property; folders do NOT — this is how you distinguish them
- Empty folders and non-existent paths both return `[]` with HTTP 200

### Copy API — `/copy/{org}/{repo}/{sourcePath}`

| Method | Purpose | Body | Response |
|--------|---------|------|----------|
| POST | Duplicate file to new destination | multipart/form-data, `destination` field (target path) | 204 success, 401 unauth, 500 missing destination |

**Quirks:** Returns 204 even if source doesn't exist. Silently overwrites destination. Folder paths return 204 but do NOT copy folder contents.

### Move API — `/move/{org}/{repo}/{sourcePath}`

| Method | Purpose | Body | Response |
|--------|---------|------|----------|
| POST | Move/rename file (destructive — removes source) | multipart/form-data, `destination` field (target path) | 204 success, 400 missing destination, 401 unauth |

**Quirks:** Destructive — source file is removed. Silently overwrites destination. Returns 204 even if source doesn't exist.

---

## AEM Admin API (Preview & Publish)

**Base URL:** `https://admin.hlx.page`

| Method | Path | Purpose |
|--------|------|---------|
| POST | `/preview/{owner}/{repo}/{branch}/{path}` | Trigger content preview (makes page available on `.aem.page`) |
| POST | `/live/{owner}/{repo}/{branch}/{path}` | Publish content (makes page available on `.aem.live`) |
| DELETE | `/preview/{owner}/{repo}/{branch}/{path}` | Unpublish from preview |
| DELETE | `/live/{owner}/{repo}/{branch}/{path}` | Unpublish from live |

---

## AEM Config Service

**Docs:** https://docs.da.live/administrators/reference/aem-config-service
**Endpoint:** `https://admin.hlx.page/config/{ORG}/sites/{SITE}/[config-file]`

Centralized configuration management — replaces file-based setups. Enables "repoless" projects (decouple content from code).

**Managed configs:** Admin/preview/publish permissions, content indexing, sitemaps, robots.txt, sidekick config/plugins, fstab.yaml, headers.json

---

## DA Developer Guides

### Apps & Plugins SDK
**Docs:** https://docs.da.live/developers/guides/developing-apps-and-plugins

Build custom DA apps (fullscreen) or plugins (inline in editor). PostMessage-based auth for secure content access.

**Plugin actions:** `actions.sendText`, `actions.sendHTML`, `actions.closeLibrary`

**URL patterns:**
- Dev: `?ref=local` (localhost:3000)
- Production: `https://da.live/app/{ORG}/{SITE}/{PATH}`
- Staging: `?ref={branch-name}`

**UI Components (Super Lite):** https://docs.da.live/developers/reference/sdk-ui-components
- 4 components: `sl-input`, `sl-select`, `sl-button`, `sl-dialog`
- Load: `<script src="https://da.live/nx/public/sl/components.js" type="module"></script>`
- Adobe Spectrum 2 design baseline

**SDK Recipes:** https://docs.da.live/developers/reference/sdk-recipes
- Creating pages programmatically (browser + Node.js)
- Streaming page lists with crawl utility (throttling, cancellation)

### Bulk Operations / Update Tree
**Docs:** https://docs.da.live/developers/guides/update-tree

Programmatic bulk content modification. Import crawl utility from `https://da.live/nx/public/utils/tree.js`.

**Parameters:** `path` (parent dir), `callback` (async fn per item), `concurrent` (parallelism, e.g. 50)

**Workflow:** Fetch from `/source` → parse as DOM → transform → POST back as FormData blob

### Experimentation Setup
**Docs:** https://docs.da.live/developers/guides/setup-experimentation

3-step A/B testing setup:
1. Update `scripts.js` — check for `dapreview` and `daexperiment` URL params
2. Create `sidekick.js` — `toggleExp()` with module caching
3. Configure `sidekick.json` — experimentation plugin in dev/preview environments

### Structured Content
**Docs:** https://docs.da.live/developers/guides/structured-content

Schema-based JSON content editing — headless CMS mode for DA.

**Features:** JSON Schema definitions, form-based dual-panel editor, auto-save, JSON delivery endpoints

**Delivery endpoint:** `https://da-sc.adobeaem.workers.dev/{live|preview}/{org}/{site}/{path}`

**Supports:** Basic types, objects, arrays, `$ref`/`$defs`, validation (required, enum, pattern). Max 10-level depth. No oneOf/allOf/anyOf.

**Query indexing:** Configure `helix-query.yaml` in repo root for aggregating across documents.

### Universal Editor Integration
**Docs:** https://docs.da.live/developers/reference/universal-editor

Content stored in DA's Author Bus, edited via Universal Editor. Requires `da-block-collection` repo (pre-instrumented).

**Config files:** `component-models.json`, `component-definitions.json`, `component-filters.json`
**Recommended structure:** `ue/models/` directory per component, build script consolidates

**Block types:** Simple (linear fields), Container (repeatable children), Key-Value (config blocks)
**Selectors:** CSS `div:nth-child(x)` targeting source HTML before JS executes
**Branch testing:** `https://{branch}--{site}--{org}.ue.da.live/{path}`
**UE-specific JS:** `ue.js` loads conditionally on `.ue.da.live` hostnames

### Upgrading to DA
**Docs:** https://docs.da.live/developers/guides/upgrading

Migrating from SharePoint/Google Drive/XWalk to DA.

**Key points:**
- Content public by default — secure your sandbox
- Live preview needs `dapreview` script in scripts.js
- Content overlay: blend external sources (SharePoint/GDrive) with DA via Config Bus
- Query indexes now YAML-based (`helix-query.yaml`), not sheet-based
- Sheet editor caps at ~5,000 rows (use content overlay for larger)
- Dot folders (`.helix`, `.trash`, `.da`) hidden from list view

### Micro-Frontends Tutorial
**Docs:** https://docs.da.live/developers/tutorials/eds-micro-frontends/

Hands-on lab: GenAI tag plugin, fullscreen tag audit app, AEM Sidekick plugin. Supports Lit framework or vanilla JS.

---

## DA Administrator Guides

### Access Control & Permissions
**Docs:** https://docs.da.live/developers/reference/access-control | https://docs.da.live/administrators/guides/permissions

**Four permission layers:** Authoring (DA/IMS), Preview (EDS), Publishing (EDS), Origin viewing (EDS)

**ACL model:**
- Actions: `read`, `write` (implies read+delete), or none (deny)
- Identities: IMS Org ID, IMS Groups, email addresses
- Paths: specific files, folders, wildcards (`/**`), inclusive (`/+**`), `CONFIG`, `ACLTRACE`
- Resolution: longest matching path wins, all group memberships merged
- Write implies read and delete; no separate delete action
- Always include `CONFIG` permission first or you lock yourself out

**Response headers:** `x-da-actions`, `x-da-child-actions` (read/write indicators)
**Status codes:** 401 (anonymous, no access), 403 (authenticated, no access)

### Setup Universal Editor
**Docs:** https://docs.da.live/administrators/guides/setup-universal-editor

**Requirements:** DX Handle (@company), UE enabled on IMS Org (needs AEM Sites credits), Chrome/Safari only

**Config:** Add `editor.path` key in `da.live/config#/{org}/` mapping content paths to UE canvas URL

### Setup AEM Assets
**Docs:** https://docs.da.live/administrators/guides/setup-aem-assets

**Requirements:** AEMaaCS with publish instance or Dynamic Media, Cloud Manager access

**Setup:** Set `ADOBE_PROVIDED_CLIENT_ID=darkalley` in Cloud Manager → configure DA config keys (`aem.repositoryId`, optional origin/basepath/type overrides)

**Features:** Asset browser in DA toolbar, Smart Crop dialog, Dynamic Media delivery URLs, Media Bus optimization

### Setup Library
**Docs:** https://docs.da.live/administrators/guides/setup-library

Author-facing block/template/icon/placeholder discovery system.

**Components:**
- `/blocks/` folder with block documents (visual + content variants)
- Sheets: `blocks`, `templates`, `icons`, `placeholders`
- Library config tab at `da.live/config#/{org}/{site}/`
- Block Options: pipe-delimited key/value pairs, color swatch support

### Prepare Menu
**Docs:** https://docs.da.live/administrators/guides/prepare-menu

Pre-publish action menu for authors. Configured via `prepare` tab in DA config.

**Always-on plugins:** Preflight (SEO/accessibility/links), Unpublish
**Feature-flag plugins:** Schedule Publish, Send to Adobe Target
**Custom plugins:** Rollout, localization, snapshots, workflow routing (Workfront)

### Preflight
**Docs:** https://docs.da.live/administrators/guides/prepare-menu/preflight

Built-in QA validation before publish:
- **References:** Unpublished fragments, unreachable links
- **Content Quality:** Placeholder text (Lorem ipsum)
- **SEO:** Missing/duplicate titles & descriptions, H1 issues
- Severity levels: Error, Warning, Info, Success
- Customizable — orgs can provide own implementation

### Schedule Publish
**Docs:** https://docs.da.live/administrators/guides/prepare-menu/schedule-publish

Future-dated publishing via Prepare menu. Content publishes as it exists AT PUBLISH TIME (not schedule time). Authors can cancel/reschedule. Auto-previews content before scheduled publish.

### Send to Adobe Target
**Docs:** https://docs.da.live/administrators/guides/prepare-menu/send-to-adobe-target

Content personalization integration. Sends pages as immutable XF HTML Offers.

**Config:** `/.da/adobe-target` sheet with tenant, clientId, clientSecret (DO NOT preview/publish this file)

**Constraints:** Pages/fragments only (not sheets/media). Cannot delete Offers tied to Activities.

### Import Tool
**Docs:** https://docs.da.live/administrators/guides/import

Bulk content import at `da.live/apps/import`. Two methods: query-index.json or pasted URLs. Processes in batches of 50. Destructive — use drafts folder for safety.

### Upgrade Site (Admin)
**Docs:** https://docs.da.live/administrators/guides/upgrade-site

**Two approaches:** FStab Swap (change fstab, keep repo) vs Origin Swap (new repo, change CDN — recommended)

**Resource split:** 90% QA, 5% development, 5% operations

**Known limits:** 10MB max images, 100 images per document, extra `<p>` in lists, strongly-typed indexes

### Restore from AEM
**Docs:** https://docs.da.live/administrators/guides/restore-from-aem

Disaster recovery: POST to `admin.hlx.page` for content inventory → import via `da.live/apps/import`

### Disaster Recovery
**Docs:** https://docs.da.live/administrators/reference/disaster-recovery

- Auto-versioning on preview, publish, translation, rollout, snapshots
- `.trash` folder with timestamps (permanent delete only from trash)
- Restore from `aem.page`/`aem.live` via import tool anytime
- Self-service recovery model; live delivery uses EDS active/active redundancy

### Platform Limits
**Docs:** https://docs.da.live/administrators/reference/limits

- Sheet editor: ~10,000 cells (fuzzy, device-dependent)
- Media types: JPG, PNG, GIF, SVG, PDF, MP4
- Media sizes: subject to Edge Delivery limits
- For larger sheets: use Content Overlay with Google Drive/SharePoint

---

## Localization

### Translation Strategy
**Docs:** https://docs.da.live/administrators/guides/translation-strategy

**Four strategies:**
- **Language-based** — `/en`, `/fr`, `/de` (simplest)
- **Region-based** — `/ch/de`, `/ch/fr` (geography-first, ecommerce)
- **Locale-based** — `/en-us`, `/fr-ca` (direct pairing)
- **Hybrid** — `/en`, `/en/us` (language-first + optional regional)

**Key terms:** Sync, Translate, Transcreate, Localize, Rollout, Locale, Region

### Translation Setup
**Docs:** https://docs.da.live/administrators/guides/setup-translation

Config in `/.da/translate` sheet:
- `translate.behavior` — `overwrite` or `merge`
- `translate.staging` — `on` (staging folder) or `off` (direct)
- `rollout.behavior` — `overwrite` or `merge` for locale deployment

### Translation Service Connectors
**Docs:** https://docs.da.live/administrators/guides/setup-translation/translation-service-connection

**Built-in:** Google Translate (zero config)
**Custom connector interface:** 5 functions — `isConnected()`, `connect()`, `getItems()`, `sendAllLanguages()`, `getStatusAll()`
**Reference implementation:** Smartling connector

### Sample Configs
**Docs:** https://docs.da.live/administrators/reference/localization/sample-loc-configs

6 ready-made templates: language/locale/region × Google/Smartling/Trados. Download JSON → upload to `/.da` folder.

---

## DA Author Guides

### Live Preview
**Docs:** https://docs.da.live/authors/reference/live-preview

Real-time preview while editing. ~2% scenarios may differ from full preview. Requires `dapreview` script in scripts.js + CORS for `preview.da.live`.

### Page Versions & History
**Docs:** https://docs.da.live/authors/guides/page-versions-history

Timeline view (reverse chronological). Gray = edits, Green = formal versions. View/restore any version. Create manual versions with labels. Bulk version creation supported.

### Editing Documents
**Docs:** https://docs.da.live/authors/guides/editing-docs

Contextual edit menus. Blocks as tables with title rows. Cmd+Click navigation via breadcrumbs. Palettes stay open, menus close after use.

### Adding Media
**Docs:** https://docs.da.live/authors/guides/adding-media

6 types: JPG, PNG, GIF, SVG, PDF, MP4. Three methods: AEM Assets (curated), Drag & Drop (easiest, auto-creates folder), Media Folder (centralized). Media is referenced, not embedded.

### Browsing & Search
**Docs:** https://docs.da.live/authors/guides/browsing-content

Case-sensitive search. Recipes: `doc:`, `folder:`, `/`. Find & replace available (no auto-versioning — be careful). Action Bar for bulk selections.

### Editing Sheets
**Docs:** https://docs.da.live/authors/guides/editing-sheets

Public by default (`private-` prefix for private). No formulas. ~10K row limit. Export CSV. Manual preview saves changes. Right-click for row/column operations.

### Content Tree (Traverse)
**Docs:** https://docs.da.live/authors/guides/apps/content-tree

Discover all pages under a path. Copy URL lists for bulk ops. Shows crawl stats and duration. Toggle between paths and full URLs.

### Translation Projects
**Docs:** https://docs.da.live/authors/guides/apps/translation-projects

11-step workflow: collect URLs → validate → configure languages → translate → monitor status. Dashboard with search, date filters, archive, project copying.

### Snapshots (Content Staging)
**Docs:** https://docs.da.live/authors/guides/apps/snapshots

Coordinate time-sensitive updates. Review URLs (`.aem.reviews`). Lock on review request. Approve → auto-publish or Reject with feedback. Password protection. Scheduling (early access).

### Bulk Operations
**Docs:** https://docs.da.live/authors/guides/apps/bulk-operations

4 operations: Preview, Publish, Version (with labels), Index. Delete previews/publishes without removing source. Progress tracking (Remaining/Success/Error/Total). Processes URL lists from Traverse or manual paste.

---

## Early Access Features

### Quick Edit
**Docs:** https://docs.da.live/about/early-access/quick-edit

In-context visual editing on aem.page. Real-time sync with DA. Available via Sidekick or Author Kit (pre-built). Two implementation paths: Author Kit template or manual integration.

### Request Publish (Approval Workflows)
**Docs:** https://docs.da.live/about/early-access/request-publish

Author submits publish request → approver gets email → approve (auto-publishes) or reject (with feedback). Bulk approval supported. One pending request per page. Requires EDS roles (`basic_author`, `basic_publish`).

**Addresses governance gap.**

### Author Kit Variants
**Docs:** https://docs.da.live/about/early-access/author-kit

Template repo with best practices + early access features (Focal Point, Content Scheduling, Quick Edit).

**Variants:** AK Gov (structured content, external design systems, forms), AK Commerce (Adobe Commerce integration), AK Signals (full martech + A/B testing)

### DA MCP (Model Context Protocol)
**Docs:** https://docs.da.live/about/early-access/da-mcp

Connect AI assistants (Claude, ChatGPT) to DA projects via MCP standard.

**10 tools:** Browse, Read, Create, Edit, Delete, Copy, Move, Rename, Versions, Media lookup

**Setup:** Claude.ai (built-in connector), Claude Desktop (config JSON), VS Code/Cursor (.vscode/mcp.json), Server-to-Server (IMS token)

### Media Library
**Docs:** https://docs.da.live/about/early-access/media-library

Centralized asset management at `da.live/apps/media-library`. Browse images/videos/PDFs/SVGs/fragments. Search by `doc:`, `folder:`, `/`. Alt text, usage data, EXIF metadata. Pin folders. Usage reports. Works as DA Plugin for inline insertion.

**Addresses DAM gap (partially).**

### Multi-Site Manager (MSM)
**Docs:** https://docs.da.live/about/early-access/multi-site-manager

Base site → satellite inheritance. Satellites inherit content and optionally override individual pages.

**Sync modes:** Merge (preserve satellite changes) or Override (replace with base)
**Setup:** Edge Delivery Content Provider config + MSM tab in org DA config + Prepare menu entry

**Addresses MSM gap directly.**

### Experience Workspace
**Docs:** https://docs.da.live/about/early-access/experience-workspace

AI-powered authoring platform. Visual WYSIWYG editor + integrated AI Assistant. Author memory (learns over time). Multi-user + agent collaboration. MCP integration. REST API access.

**Setup:** Enable via DA.live guided setup → configure quick-edit → add `editor.path` in org config pointing to Experience Workspace editor.

---

## JSON2HTML (External Data → EDS Pages)

**Docs:** https://www.aem.live/developer/json2html

Worker service that transforms JSON API responses into Edge Delivery-compatible HTML using Mustache templates. Bridges external/headless CMS data into EDS without authoring in DA.

**How it works:** JSON endpoint → Mustache template → EDS-compatible HTML → served via overlay

**Config endpoint:** `https://json2html.adobeaem.workers.dev/config/{ORG}/{SITE}/{BRANCH}` (POST with AEM Admin API token)

**Required config:**
- `path` — URL pattern to match
- `endpoint` — API URL (supports `{{id}}` placeholders)

**Optional config:** `regex` (extract IDs from URLs), `template` (Mustache path), `headers`, `forwardHeaders`, `relativeURLPrefix`, `arrayKey`/`pathKey` (filter JSON arrays), `useAEMMapping`, `templateApiKey`

**Template:** Logic-less Mustache — `{{variable}}`, `{{#condition}}...{{/condition}}`, `{{{html}}}` (unescaped)

**Use cases:** Product catalogs, event listings, archived content, multi-tenant systems, any external JSON API → EDS pages.

---

## EDS Forms — Dynamic Options from URL

**Docs:** https://experienceleague.adobe.com/en/docs/experience-manager-cloud-service/content/edge-delivery/build-forms/getting-started-edge-delivery-services-forms/load-options-from-url

Populate form dropdowns from external spreadsheets (published as JSON) instead of hardcoding options.

**Setup:**
1. Create separate sheet with `Option` (display text) + `Value` (submitted value) columns
2. Publish sheet via Sidekick → generates JSON URL: `https://{branch}--{repo}--{owner}.aem.live/{sheet-name}.json?sheet={sheet-name}`
3. Paste URL into the `Options` column of dropdown field in form spreadsheet

**Use cases:** Country lists, product categories, plan types — any frequently-changing option set managed centrally by authors.

### EDS Forms — Component Reference
**Docs:** https://experienceleague.adobe.com/en/docs/experience-manager-cloud-service/content/edge-delivery/build-forms/getting-started-edge-delivery-services-forms/form-components

All available form components and their properties.

**Input types:** text, email, password, number, date, file, hidden, color, tel, url, range, time, textarea
**Selection:** checkbox groups, radio groups, dropdowns
**Containers:** panels/fieldsets for grouping, repeatable sections (Min/Max)

**Universal properties:** Type, Name, Label, Description, Visible, Visible Expression, Value Expression, Placeholder, Mandatory, Min/Max

**Key features:** Conditional visibility via spreadsheet formulas, repeatable sections, uniform HTML structure for consistent CSS styling.

---

## Adobe Commerce + EDS Integration

**Wiki:** https://github.com/hlxsites/aem-boilerplate-commerce/wiki/How-To:-Adobe-Commerce-with-Edge-Delivery-Services-Projects

Full lifecycle guide: discovery → setup → implementation → MarTech/SEO → go-live.

**Requirements:** Adobe Commerce 2.4.4+ (2.4.7 for transactional features), PHP 8.1+

**Architecture:**
- **SaaS Services:** Catalog Service (PDP data), Live Search (PLP/search), Product Recommendations (personalization)
- **Dropin Components:** PDP, PLP/Search (GA); Cart, Checkout, Account (VIP access)
- **Luma Bridge:** Side-by-side option for complex transactional pages not yet covered by dropins
- **CDN:** Proxy GraphQL + Catalog Service through CDN (eliminates CORS, enables caching)

**Framework strategy:** Buildless Preact + HTM for state-heavy commerce blocks. Vanilla JS for everything else. React only as last resort (performance cost).

**SEO requirements:** JSON-LD (WebSite, Product, AggregateRating, BreadcrumbList), server-side meta for social platforms, canonical URLs without redirects, hreflang for multi-locale, robots.txt blocking `/drafts`

**Performance:** Proxy APIs through CDN, eager-phase GraphQL, proper image sizing via Fastly Image Optimizer, progressive loading for non-LCP content

**Config:** `configs.xlsx` spreadsheet exposes environment-specific params to frontend blocks (Catalog Service headers, GraphQL endpoints, environment IDs)

### Commerce Prerender
**Repo:** https://github.com/adobe-rnd/aem-commerce-prerender

Generates static HTML product detail pages from Adobe Commerce data → publishes via EDS overlay.

**3-phase process:** Fetch products from Catalog Service → detect changes → generate static HTML with metadata + JSON-LD → store in Azure Blob Storage

**Solves:** SEO (crawlers can't execute JS), AI-readiness (structured data in source), performance (no client-side rendering for critical content)

**Integration:** Overlay config in AEM site settings merges prerendered content with original pages.

---

## EDS Forms

### Boilerplate Forms (XWalk)
**Repo:** https://github.com/adobe-rnd/aem-boilerplate-forms

Template for AEM Forms XWalk projects. Requires AEM Cloud Service 2024.8+, Node.js 18.3+.

**Includes:** Form blocks, custom component scaffolding, linting, Playwright testing, AEM Forms runtime libraries (bundled), styling/icons

**Key command:** `npm run create:custom-component` — interactive scaffolder generates all files for custom form components

---

## Dynamic Media with EDS

**Docs:** https://experienceleague.adobe.com/en/docs/experience-manager-learn/sites/document-authoring/how-to/using-dynamic-media

EDS has built-in image optimization (size, quality, format) — prefer this for performance (avoids extra SSL handshake impacting LCP).

**When to use Dynamic Media instead:** Smart crops, advanced asset management, governance over approved assets.

**Two integration methods:**
- **Domain Coalescing** — Merge DM domain with your CDN domain
- **Open API** — Access approved AEM Assets via `delivery-` prefix repos in asset selector

**Best practice:** Use native EDS optimization by default. Only add Dynamic Media when you need its specific capabilities.

---

## Edge Delivery Documentation

| Resource | URL | Purpose |
|----------|-----|---------|
| Main docs | https://www.aem.live/docs/ | Official EDS documentation |
| Developer tutorial | https://www.aem.live/developer/tutorial | Step-by-step EDS tutorial |
| Markup & Sections | https://www.aem.live/developer/markup-sections-blocks | How content maps to HTML |
| Markup Reference | https://www.aem.live/developer/markup-reference | Full markup spec |
| Project Anatomy | https://www.aem.live/developer/anatomy-of-a-project | Project structure guide |
| David's Model | https://www.aem.live/docs/davidsmodel | Content architecture principles |
| Performance | https://www.aem.live/developer/keeping-it-100 | Lighthouse 100 best practices |
| AI Agents guide | https://www.aem.live/developer/ai-coding-agents | Tips for AI coding agents on EDS |
| Full-text search | `curl -s https://www.aem.live/docpages-index.json \| jq ...` | Search all EDS docs by keyword |
| Indexing | https://www.aem.live/developer/indexing | Query indexes, property extraction, filtering |
| Spreadsheets | https://www.aem.live/developer/spreadsheets | Sheets → JSON endpoints, multi-sheet, pagination |
| Bulk Metadata | https://www.aem.live/docs/bulk-metadata | Apply metadata to multiple pages via URL patterns |
| Placeholders | https://www.aem.live/docs/placeholders | Centrally managed strings/variables for i18n |
| Redirects | https://www.aem.live/docs/redirects | Spreadsheet-based redirect management |
| Custom Headers | https://www.aem.live/docs/custom-headers | Custom HTTP response headers via config service |
| Go-Live Checklist | https://www.aem.live/docs/go-live-checklist | Official pre/post-launch checklist |
| Favicon | https://www.aem.live/developer/favicon | Favicon setup |
| Block Collection | https://www.aem.live/developer/block-collection | Official block collection reference |
| Dev Collaboration | https://www.aem.live/docs/dev-collab-and-good-practices | PR standards, code quality, team practices |
| FAQ | https://www.aem.live/docs/faq | Comprehensive FAQ: architecture, use cases, config, SEO, localization, authoring, integrations, legal |

### Indexing (Key Details)

**Setup:** Index Admin Tool or Admin API. Extracts metadata from published pages (title, image, description, author, date, category, tags, lastModified).

**Debugging:** `aem up --print-index`
**Filtering:** Pages with `noindex` in robots metadata filtered via `FILTER` expression in `helix-default` sheet.

### Spreadsheets → JSON

Sheets publish as JSON at `/{filename}.json`. Properties: `total`, `offset`, `limit`, `columns`, `data[]`.

**Multi-sheet:** Only `shared-` prefixed sheets exposed. `shared-default` delivers as single sheet. Query: `?sheet={name}` (without prefix).
**Pagination:** `?offset=0&limit=100`. Default limit: 1000 rows.
**Deprecated:** `helix-` prefix → use `shared-` instead.

### Bulk Metadata

Spreadsheet named `metadata` in root. Columns: URL pattern (wildcards `**`) + property columns.

**Priority:** Page-level metadata > folder metadata > bulk metadata.
**Rule:** Evaluated top-to-bottom; site-wide `**` must come BEFORE specific entries.
**Multiple files:** Configurable via Admin API; first file listed takes priority.

### Redirects

Spreadsheet named `redirects` in root. Columns: Source (relative path) + Destination (relative or absolute URL).

**Key rules:**
- Redirects override existing content (redirect takes precedence over live page)
- Multi-sheet workbooks need active sheet named `helix-default`
- Wildcard redirects are CDN-level only (avoid for complexity reasons)
- Prioritize high-traffic URLs for SEO preservation

### Custom Headers

Config service JSON format. Glob patterns for URL matching (`/fragments/**`).

**Security warning:** `access-control-allow-origin: *` exposes to CSRF against Sidekick authors — restrict to specific origins.

### Go-Live Checklist (Official)

1. Content & design QA on `.aem.live`
2. Lighthouse 100 (mobile + desktop) on staging
3. Analytics/martech validation
4. RUM instrumentation active
5. Redirects for retired URLs
6. Sitemap + robots.txt configured
7. Canonical URLs return 2xx
8. Favicon present
9. Auth/access controls configured
10. CDN pointed to `aem.live`, test redirects + www/APEX
11. Push invalidation configured and tested
12. **Email aemgolives@adobe.com** with: URLs, domain, go-live date/time, contacts, collaboration channel
13. Post-launch: re-validate lighthouse, monitor Search Console, verify analytics, track 404s

---

## Block Repositories

| Repo | URL | Purpose |
|------|-----|---------|
| Author-Kit | https://github.com/aemsites/author-kit | Our base project — DA-native, config-driven |
| DA Block Collection | https://github.com/aemsites/da-block-collection | Community blocks for DA projects (UE-instrumented) |
| AEM Boilerplate | https://github.com/adobe/aem-boilerplate | Adobe's official EDS starter |
| DA Blog Tools | https://github.com/aemsites/da-blog-tools | Plugins, workflows, and tooling for DA-based blogs |

---

## Reference Implementations (GitHub)

### Preflight Plugin (da-blog-tools)
**Repo:** https://github.com/aemsites/da-blog-tools/blob/main/tools/plugins/preflight/README.md

Comprehensive pre-publish QA plugin. Configurable via Site CONFIG > preflight section.

**Available checks:**
- **Accessibility** — WCAG 2.1: alt text, heading hierarchy, link text, form labels, ARIA, lang attribute
- **Lorem Ipsum** — 40+ placeholder phrases detected
- **Metadata** — Required fields exist and properly formatted
- **Special Characters** — Problematic Unicode that causes encoding issues
- **Terms** — Absolute language ("always", "guaranteed") and biased terminology ("blacklist", "mankind")
- **Spelling** — Dictionary-based validation (in development)
- **Remote tests** — Load custom checks via HTTPS URLs (GitHub repos, CDNs)

Interactive results UI with summary stats, collapsible groups, pass/fail, issue locations, and remediation steps.

### GitHub Actions Workflows (da-blog-tools)
**Repo:** https://github.com/aemsites/da-blog-tools/blob/main/.github/workflows/README.md

**publish-to-date.yaml** — Automated draft-to-publish workflow:
1. Authenticates with Adobe IMS
2. Unpublishes from Helix live/preview
3. Moves from `/drafts/` to `/blog/YYYY/MM/DD/` structure
4. Converts `.md` → `.html`
5. Publishes to preview then live

**Secrets:** `HELIX_TOKEN`, `IMS_CLIENT_SECRET`
**Variables:** `SITE_CONFIG` (JSON site→path mapping), `VALID_PREFIXES` (processable paths), `IMS_CLIENT_ID`
**Triggers:** Repository dispatch events or manual GitHub Actions UI

### Request for Publish Plugin (da-blog-tools)
**Repo:** https://github.com/aemsites/da-blog-tools/tree/main/tools/plugins/request-for-publish

Working implementation of the Request Publish approval workflow. Reference code for the early access feature documented at docs.da.live.

### Tags Plugin (da-blog-tools) — from Markus
**Repo:** https://github.com/aemsites/da-blog-tools/blob/main/tools/tags/README.md

Multi-select, searchable tag picker for DA and Universal Editor. Fetches tags from `/docs/library/tagging.json`. Search by value/key/comments. Bulk select/deselect. Keyboard accessible. Plain HTML/CSS/JS, no build step. Uses DA App SDK.

**Config:** Add `tagging.json` with `key`, `value`, `comments` fields. Register in library config with path to `/tools/tags/tags.html`.

### Locales Plugin (da-tools) — from Markus
**Repo:** https://github.com/mhaack/da-tools/tree/main/tools/locales

Multilingual content management plugin for DA. Reads language config from `/.da/translate-v2.json`.

**Features:**
- View all configured languages and locales
- Track publication status per language (red = published EDS, grey = unpublished DA)
- Bulk publishing across languages
- Create new language versions, edit, publish without leaving the interface
- Supports multi-site setups with central blueprint site

### Sidekick Library Generator
**Repo:** https://github.com/alexcarol/sidekick-library-generator

CLI tool to auto-generate Sidekick library blocks for EDS projects. Installs globally via npm. Auto-detects org/project from git remote. Requires `AEM_API_KEY` env var.

**Usage:** Generates `/blocks/` directory with library components. Options for force overwrite and block context preservation.

### AEM GitHub Copilot Extension
**Repo:** https://github.com/adobe/aem-github-copilot

VS Code extension — specialized `@aem` chat participant within GitHub Copilot Chat.

**6 capabilities:**
- **Create** — Auto-generate block folder/files via LLM
- **Collection** — Access standard AEM blocks directly
- **Docs** — Search aem.live documentation
- **Issues** — GitHub issue analysis with AI-suggested fixes
- **Vision** — Generate blocks from images (VS Code Insiders only)
- **Annotate** — Apply AEM best practices via editor context menus

### DA Library Plugin (da-blog-tools)
**Repo:** https://github.com/aemsites/da-blog-tools/tree/main/tools/plugins/da-library

Interim bridge for legacy `.da/config.json` plugins. Fetches JSON → renders selectable list → sends formatted value back to DA.

**Features:** Relative paths (DA Source API) or full URLs (external APIs). Custom formatting via `CONTENT` placeholder (e.g., `data-bi-bhvr = 'CONTENT'` or `:CONTENT:`).

**Note:** Interim solution — migrate to DA SDK-based plugins long-term.

### UE Attributes & Item Types (Experience League)
**Docs:** https://experienceleague.adobe.com/en/docs/experience-manager-cloud-service/content/implementing/developing/universal-editor/attributes-types

Universal Editor instrumentation reference — the 6 `data-aue-*` attributes required to make content editable:

| Attribute | Purpose |
|-----------|---------|
| `data-aue-resource` | URN to the resource (where changes are written) |
| `data-aue-prop` | Which property to update |
| `data-aue-type` | Item type: `text`, `richtext`, `media`, `container`, `component`, `reference` |
| `data-aue-filter` | Allowed functionalities (RTE features, allowed components, asset types) |
| `data-aue-label` | Custom label in editor interface |
| `data-aue-model` | Model for form-based properties panel editing |

### Extension Manager
**Docs:** https://developer.adobe.com/uix/docs/extension-manager/feature-highlights/
**Accenture instance:** https://experience.adobe.com/#/@accenture-partner/aem/extension-manager

Centralized management of UE extensions per-instance.

**Features:** Enable/disable per environment, configure params (Key/Value pairs accessible via UIX SDK), preview in preproduction, shareable preview links, BYO extensions (requires UIX SDK Guest library).

### UE Dynamic Dropdown Extension — from Rob
**Blog:** https://experience-aem.blogspot.com/2025/12/aem-edge-delivery-universal-editor-extension-custom-datatype-dynamic-dropdown.html

Custom data type for Universal Editor properties panel — dynamic dropdown populated from AEM Query Builder.

**Technique:**
1. Register custom data type (`eaem:dynamic-select-field`) via ExtensionRegistration
2. Route maps data type to React component
3. Component fetches values from AEM Query Builder (authenticated)
4. Uses React Spectrum ComboBox for rendering
5. Set `"component": "eaem:dynamic-select-field"` in block model JSON

**Use case:** Editable style systems — dropdown populated with available styles/options from AEM rather than hardcoded values. Enables author-controlled styling without code changes.

---

## Adobe Skills for AI Agents

**Repo:** https://github.com/adobe/skills

Official Adobe skill library for AI coding agents. Distributed via Claude Code Plugins, Vercel Skills, GitHub CLI, and Cursor.

### EDS-Relevant Skills

| Skill | Purpose |
|-------|---------|
| **Snowflake** | Static-to-EDS overlay conversion preserving original DOM — alternative to full migration for complex pages |
| **Content-Driven Development** | Full CDD workflow orchestration |
| **Building Blocks** | Block implementation and core functionality |
| **Testing Blocks** | Browser validation for blocks |
| **Content Modeling** | Author-friendly data structure design |
| **Block Inventory** | Survey available blocks in project |
| **Block Collection Search** | Reference implementation discovery |
| **Docs Search** | aem.live documentation searching |
| **Page Import** | Webpage-to-EDS block format conversion (orchestrator) |
| **Scrape Webpage** | Content extraction and analysis |
| **Generate Import HTML** | Structured HTML generation |
| **Preview Import** | Import content preview and verification |
| **Create Site** | Bootstrap new sites from boilerplate with GitHub integration |
| **AEM CLI** | Install, run, configure local dev server (TLS/proxy) |

### Design Skills (aem-design)

| Skill | Purpose |
|-------|---------|
| **Brand** | Extract brand profiles and visual boards from URLs/PDFs |
| **Briefings** | Capture page intent, audience, messaging, CTAs |
| **Wireframes** | Structural grey-box layouts |
| **Prototype** | High-fidelity branded static HTML prototypes |

### App Builder Skills

| Skill | Purpose |
|-------|---------|
| **Project Init** | Initialize new App Builder projects |
| **Action Scaffolder** | Scaffold and deploy Adobe Runtime actions |
| **UI Scaffolder** | Generate React Spectrum components for ExC Shell SPAs |
| **Testing** | Jest unit, integration, and contract tests |
| **E2E Testing** | Playwright browser tests for SPAs and extensions |
| **CI/CD Pipeline** | GitHub Actions, Azure DevOps, GitLab CI setup |

### Analytics Skills (Adobe Analytics + CJA)

| Skill | Purpose |
|-------|---------|
| **KPI Pulse** | Period-over-period performance digests with trend callouts |
| **Top Movers Watchlist** | Ranks dimension items by biggest gains/losses |
| **Conversion Funnel Analysis** | Step-by-step fallout tracking across multi-step funnels |
| **Segment Performance Comparator** | Side-by-side KPI comparison across audience segments |
| **Executive Briefing** | Narrative summaries for leadership/QBR presentations |

### Project Management Skills

| Skill | Purpose |
|-------|---------|
| **Handover** | Project documentation generation orchestration |
| **Authoring** | Comprehensive guides for content authors |
| **Development** | Technical documentation for developers |
| **Admin** | Administrator guides |
| **Whitepaper** | Professional PDF generation from Markdown |

### AEM Cloud Service Skills (not EDS — traditional AEM)

| Skill | Purpose |
|-------|---------|
| **Create Component** | AEM components with HTL, Sling Models, unit tests, clientlibs |
| **Workflow Management** | Design, develop, trigger, debug workflow models |
| **Dispatcher** | Config authoring, performance tuning, security hardening |
| **Replication** | Agent setup, content activation, troubleshooting |
| **RDE (Beta)** | Rapid Development Environment deploy/inspect/troubleshoot |

---

## Demo & Reference Sites

| Site | URL | What it shows |
|------|-----|---------------|
| bbird.live demo | https://demo.bbird.live/demo-docs/demo-features | Live showcase: DA authoring modes, advanced blocks (search, tabs, quizzes, journey maps), AEM Assets/DM integration, scheduled publishing, workflow/approval app, fragment picker, bulk search/replace |

---

## Tools & Utilities

| Tool | Purpose | Usage |
|------|---------|-------|
| AEM CLI | Local dev server | `npx @adobe/aem-cli up` or `aem up` |
| PageSpeed Insights | Performance testing | `https://developers.google.com/speed/pagespeed/insights/?url=YOUR_URL` |
| RUM Dashboard | Real User Monitoring | `https://www.aem.live/tools/rum/{domain}` |
| DA Token | Auth for DA APIs | DevTools → Application → Cookies → `auth_token` on da.live |
| DA Import Tool | Bulk content import | `https://da.live/apps/import` |
| DA Media Library | Asset management | `https://da.live/apps/media-library` |
| DA Config | Site/org configuration | `https://da.live/config#/{org}/{site}/` |

---

## Microsoft-Specific CDNs

| CDN | Pattern | Notes |
|-----|---------|-------|
| Dynamic Media | `cdn-dynmedia-1.microsoft.com/is/image/microsoftcorp/...` | Primary image CDN, supports resize/format params |
| Content Delivery | `img-prod-cms-rt-microsoft-com.akamaized.net/...` | Secondary CDN for some content images |

---

## FAQ Highlights

- **Cost:** DA is free for existing EDS customers (no additional licensing)
- **Migration:** No code changes needed from Google Drive/SharePoint — same content format
- **Approval workflows:** Snapshots + Request Publish (early access); Workfront integration planned
- **When to use XWalk instead:** Java stack preservation or MSM requirements (but MSM now in DA early access)
- **Translation providers:** Google Translate (built-in) + Smartling + custom connectors
- **Complex spreadsheets:** Use Content Overlay linking to external Google/SharePoint sheets
- **Bug reports:** GitHub ideas portal with optional PRs after team alignment

---

*Last updated: June 2026*
