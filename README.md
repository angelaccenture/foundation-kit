# Foundation Kit - Expansion Pack for Author Kit
For projects that want a LOT MORE more batteries. Original Author Kit was built by the team who brought you da.live and adobe.com. Expansion Pack built by Accenture & Clients.

## Getting started

### 1. Github
1. Use this template to make a new repo.
1. Install [AEM Code Sync](https://da.live/bot).

### 2. DA content
1. Browse to https://da.live/start.
2. Follow the steps.

### 3. Local development
1. Clone your new repo to your computer.
1. Install the AEM CLI using your terminal: `sudo npm install -g @adobe/aem-cli`
1. Start the AEM CLI: `aem up`.
1. Open the `{repo}` folder in your favorite code editor and buil something.
1. **Recommended:** Install common npm packages like linting and testing: `npm i`.

## ANGEL -- figure out features and how to document
- Templates -- put templates in there for sheets too, give more details about using the template like a page block
- Advanced Blocks and "core blocks" -- find soluiton for default text (to center, etc.)
- UE, Quick Edit/Layout Mode - Angel to fix QE/LM Cors Issue
- MSM vs. Translation Roll Out Tool -- Use MSM for multi content sources, trans tool for language-masters within
- Use MSM for multi content sources  (QA vs Prod)
- Create Arch diagram for multi envionments, where/why use workers
- Find/build solution for persistent metadata (example: brand, etc.)
- Solution for working better with the DAM -- I want to update the alt tag for the image and push that change to the DAM, etc. overwrite of metadata
- Tagging solution
- Confirm integrations (Target, Analytics, etc.)

### Template Support
* Add template to the metadata
* TBD - More Details

### Localization & globalization
* Language only support - Ex: en, de, hi, ja, Region only support - Ex: en-us, en-ca, de-de, de-ch, Hybrid support - Ex: en, en-us, de, de-ch, de-at
* Fragment-based localized 404s
* Localized Header & Footer
* Do not translate support (#_dnt)
* MSM: https://docs.da.live/about/early-access/multi-site-manager

### Flexible section authoring
* Optional containers to constrain content
* Grids: 1-6
* Columns: 1-12
* Color scheme: light, dark
* Gap: xs, s, m, l, xl, xxl
* Spacing: xs, s, m, l, xl, xxl
* Background: token / image / color / gradient

### Base content
* Universal buttons w/ extensive styles
* Images w/ retina breakpoint
* Color scheme support: light, dark
* Modern favicon support
* New window support
* Deep link support
* Modal support

### Header and footer content
* Brand - First link in header
* Main Menu - First list in header
* Actions - Last section of header
* Menu & mega menu support
* Disable header/footer via meta props

### Scheduled content
* Schedule content using spreadsheets

### Sidekick & pre-production
* Quick Edit
* Extensible plumbing for plugins
* Schedule simulator
* Convert production links to relative

### Performance
* Extensible LCP detection

### Developer tools
* Environment detection
* Extensible logging (console, coralogix, splunk, etc.)
* Buildless reactive framework support (Lit)
* Hash utils patterns (#_blank, #_dnt, etc)
* Modern CSS scoping & nesting
* AEM Operational Telemetry

### Operations
* Cloudflare Worker reference implementation

## Patterns
### Page
A page is what holds your content. It can be styled using a metadata property called `template` which will load styles that apply to the entire page.

### Section
A section is a sub-section of your page. It can be styled using a `section-metadata` block. A section will control the layout of blocks.

### Block
Blocks are children of sections. A block adds visual context to parts of a page.

### Auto Block
An auto block is a block generated from a pre-defined piece of content. Often times from a link that matches a particular pattern. Link-based auto blocks can be helpful when additional nesting of content is required.

### Default content
Default content is content that lives outside a block.

## Design System

### Spacing & Gap
XS, S, M, L, XL, XXL

### Emphasis
quiet, default, strong, negative

### Buttons
accent, primary, secondary, negative
(w/ outline variations)

### Columns
1 - 12

### Grid
1 - 6

### Color tokens
blue, gray, green, magenta, organge, red, purple, yellow
(w/ 100-900 variations)

### Color schemes
light, dark
