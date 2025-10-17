# Mount Gambel Oak

A personal website. The project renders a static bundle with Jinja templates and markdown-driven blog content, then publishes the bundle to GitHub Pages. The site is tested locally before pushing to GitHub Pages, where workflows automate its build and deployment live at https://mountgambeloak.dev.

The goal of this website is to document its layout and workflows for its owner, NOT to document a method by which other random people can pull and contribute to the website. There are some local development workflows that are briefly outlined below, but are already set up and working.

---

## Quick Ops
- **Ship updates:** A systemd on the host machine automatically runs `scripts/local-dev.sh` to kick off the watchfiles-based rebuild + static server. Commit and push to `main`; the GitHub Actions workflow rebuilds `dist/` and deploys to Pages automatically. Manual `python build.py` runs are only needed if the watcher/CI fails and you want to debug locally.
- **Add a blog post:** Draft markdown under `app/blog/posts/<slug>.md`, register the entry in `app/blog/blog_posts.json`, and let the watcher regenerate. Push to `main` when satisfied.
- **Tweak seasonal theming:** Update schedules or facts in `app/static/js/holiday-shared.js`, then run `node app/static/js/icon-update.js` to refresh the emoji favicon and `app/static/data/holiday-details.json`. Accent coolors can be updated via `app/static/js/theme-config.js`

---

## Overview
- `python build.py` compiles templates in `app/templates/` and markdown posts in `app/blog/posts/` into the static `dist/` directory.
- Static assets (CSS, JS, images, resume PDF, favicon) live under `app/static/`; the build copies them verbatim.
- Local preview uses the same static build served out of `dist/`; `scripts/local-dev.sh` wraps the rebuild watcher plus static server during development.
- A GitHub Actions workflow rebuilds `dist/` on pushes to `main` (and nightly for favicon refresh) and deploys it to Pages.

---

## Goals
- Present a personal introduction, resume, and portfolio.
- Host a markdown-authored blog with tag filters and derived metadata (reading time, TOCs).
- Add seasonal touches (emoji favicon, accent colors, trivia) without a heavyweight frontend framework.
- Keep the workflow simple: edit templates/content, rebuild, preview statically, ship.

---

## Architecture

### Build pipeline
1. `build.py` clears `dist/`, copies everything from `app/static/`, and renders page templates to HTML. It is invoked automatically by the watcher (`scripts/local-dev.sh`) and by CI.
2. Blog metadata lives in `app/blog/blog_posts.json`, referencing markdown files in `app/blog/posts/`.
3. During the build, markdown posts are converted to HTML, headings are harvested for anchor links, and reading-time estimates are calculated.
4. Output pages land in `dist/` (e.g., `dist/index.html`, `dist/blog/<slug>/index.html`).

---

## File reference

### Templates
- `app/templates/index.html` - Home page layout with intro, FAQ, and latest blog teaser.
- `app/templates/projects.html` - Projects page template for portfolio entries.
- `app/templates/resume.html` - Resume landing page linking to the PDF.
- `app/templates/404.html` - Not-found page shown for missing routes.
- `app/templates/blog.html` - Blog index page with tag filtering UI.
- `app/templates/blog/post.html` - Individual blog post content template.
- `app/templates/blog/post_layout.html` - Shared wrapper for blog post pages.
- `app/templates/includes/head-assets.html` - Common `<head>` scripts, styles, and favicons.
- `app/templates/includes/header.html` - Site header and navigation bar include.
- `app/templates/includes/footer.html` - Footer markup with contact links and holiday icon slot.
- `app/templates/includes/footer-scripts.html` - Script bundle loaded at the end of each page.

### CSS
- `app/static/css/base.css` - Global resets, typography, and layout primitives.
- `app/static/css/theme.css` - Theme variables and light/dark surface rules.
- `app/static/css/theme-widget.css` - Styles for the theme switcher popup.
- `app/static/css/components/header.css` - Header and navigation component styling.
- `app/static/css/components/footer.css` - Footer layout, seasonal emoji, and trivia styles.
- `app/static/css/components/blog-card.css` - Blog card list styles used on the home and blog pages.
- `app/static/css/components/tag-chip.css` - Pill styles for blog tag chips.
- `app/static/css/pages/home.css` - Home page specific sections and responsive tweaks.
- `app/static/css/pages/projects.css` - Project grid and timeline styling.
- `app/static/css/pages/resume.css` - Resume download section layout.
- `app/static/css/pages/blog.css` - Blog index layout and tag filter styles.
- `app/static/css/pages/blog-post.css` - Article layout, outline, and prose formatting.
- `app/static/css/pages/not-found.css` - 404 page styling.
- `app/static/css/giscus-light.css` - Light mode overrides for the Giscus comments widget.
- `app/static/css/giscus-dark.css` - Dark mode overrides for the Giscus comments widget.

### JavaScript
- `app/static/js/theme-config.js` - Defines theme storage keys and available accent palette.
- `app/static/js/theme-preload.js` - Applies stored theme preferences before styles load to avoid flashes.
- `app/static/js/theme-init.js` - Loads stored theme preferences and exposes the ThemeManager API.
- `app/static/js/theme-widget.js` - Handles the on-page theme picker controls and interactions.
- `app/static/js/header-menu.js` - Manages the responsive header menu toggle and accessibility states.
- `app/static/js/blog-tags.js` - Enables filtering blog cards by tag and syncs the URL query.
- `app/static/js/post-sections.js` - Builds the blog post outline indicator and scroll syncing.
- `app/static/js/holiday-shared.js` - Determines the active holiday emoji, accent, and trivia metadata.
- `app/static/js/icon-update.js` - Node script that regenerates the favicon SVG with the holiday emoji.
- `scripts/convert-images-to-webp.py` - Utility for resizing key assets and generating WebP variants under `static/images/` (use `--overwrite-source` to update the original PNG/JPEG files).


### Blog content
- `app/blog/blog_posts.json` - Blog metadata registry (slug, tags, dates, and source paths).

---

## Content & theming workflows

- `app/blog/blog_posts.json` controls post metadata, tags, summaries, and optional social images.
- `app/static/js/theme-config.js` defines light/dark palettes and accent options.
- `app/static/js/holiday-shared.js` (paired with `icon-update.js`) stores the holiday schedule and trivia rendered into the site.

### Add or update pages
1. Create or edit a template in `app/templates/` (shared fragments live in `app/templates/includes/`).
2. Register new output paths in the `pages` list inside `build.py` if the template should render to `dist/`.
3. Add page-specific CSS/JS under `app/static/` and reference it from the template (usually via `includes/head-assets.html` or `includes/footer-scripts.html`).

### Publish a new blog post
1. Draft the post in markdown under `app/blog/posts/<slug>.md`.
2. Add an entry to `app/blog/blog_posts.json` with `slug`, `title`, `date`, `summary`, `content`, `tags`, and optional `updated`.
3. Keep the watcher running so the build regenerates automatically (`python build.py` is only necessary for ad-hoc manual runs).
4. Confirm the post appears at `/blog/<slug>/` and in the blog index card grid.

### Manage tags
- Tags are free-form strings in the blog JSON. The build aggregates them to populate filters on `/blog`.
- To retire a tag, remove it from every post and let the watcher/CI regenerate the site.

### Tweak themes and colors
1. Update accent palettes and mode defaults in `app/static/js/theme-config.js`.
2. Refresh component/page styles in `app/static/css/` to take advantage of new accents.
3. `app/static/js/theme-init.js` applies the chosen accent/mode at runtime; adjust it if additional logic is needed.

### Holiday & seasonal flourishes
- Extend `HOLIDAY_RANGES` or `HOLIDAY_FACTS` in `app/static/js/holiday-shared.js` to add celebrations.
- After editing the schedule, run `node app/static/js/icon-update.js` to regenerate the emoji favicon and `app/static/data/holiday-details.json`.
- `build.py` consumes `holiday-details.json` to render the footer emoji, trivia snippet, and default accent statically.

---

## Generated assets & cache busting
- `build.py` stamps favicon links with a daily version derived from `holiday-details.json` so browsers refresh the emoji without extra scripts.
- Every build emits a `static_version` token so CSS/JS/image URLs carry `?v=...` query strings, letting browsers cache assets aggressively between deployments.
- `scripts/generate-theme-css.js` emits `static/css/generated/theme-accents.css` so accent classes stay in sync with the theme palette.
- Run `python scripts/convert-images-to-webp.py --overwrite-source` after adding or updating images so PNG/JPEG fallbacks are resized and WebP variants stay in sync.

---

## Performance checklist
- Reference images with `<picture>` elements and include explicit `width`/`height` attributes to avoid CLS; use `/static/...` URLs suffixed with `?v={{ static_version }}`.
- Keep shared CSS/JS references inside `includes/head-assets.html` and `includes/footer-scripts.html` so they automatically receive the cache-busting query string.
- Spot-check key pages (`index`, `blog`, `projects`, `resume`) with Lighthouse or PageSpeed after major layout or asset changes to ensure no regressions.
- The GitHub Action runs nightly to refresh generated artifacts automatically; mirror those updates locally (see “Generated assets & cache busting”) before pushing sizeable static changes.

---

## SEO checklist
- Page templates (`index`, `projects`, `resume`, `blog`) and the blog post layout emit `<title>`, descriptions, canonical URLs, Open Graph/Twitter cards, and JSON-LD structured data; update the copy near the top of each template if you change positioning or hero assets.
- `build.py` writes `dist/sitemap.xml` and `dist/robots.txt` on every build (base URL comes from `SITE_BASE_URL`, defaulting to `https://mountgambeloak.dev`). Deploy the fresh `dist/` and submit/resubmit the sitemap in Google Search Console after major changes.
- Blog post metadata lives in `app/blog/blog_posts.json`; adding or updating a post automatically refreshes the sitemap entry, schema, tags, and modified timestamp. Set `summary`, `updated`, and optional `social_image` there.

---

## Responsive design notes
- Layouts are mobile-first: base styles assume a single-column flow and scale up via `@media (min-width: …)` rules in each page/component stylesheet (e.g., `home.css`, `projects.css`).
- The site header collapses into a toggleable menu when space runs out; `header-menu.js` measures the layout with `ResizeObserver`/`requestAnimationFrame` so the nav only collapses when necessary.
- Blog/project grids rely on CSS Grid `auto-fit` patterns so cards wrap cleanly across breakpoints without extra scripting.
- Typography and spacing make use of `clamp()` and responsive units where needed to keep text comfortable on phones and widescreens.

---

## Deployment
- Commits to `main` trigger the “Build and Deploy” GitHub Actions workflow.
- The job refreshes the favicon, installs Python dependencies, runs `python build.py`, and publishes `dist/` via `actions/deploy-pages`.
- A scheduled run (`cron: 0 7 * * *`) keeps the public favicon in sync with the current holiday without manual intervention.
- Ensure the watcher has produced a fresh build in `dist/` before committing; manual rebuilds are only needed for debugging.
- GitHub Pages serves `dist/404.html` for any unknown route (including `/holiday-trivia`); local static previews typically return the file directly instead of a 404 response, so open `dist/404.html` in a browser to test the not-found experience.

---

## Support scripts & notes
- `build.py` is the single source of truth for derived blog metadata. Keep it updated if you introduce new fields shared between the blog index and individual posts.
- `scripts/generate-theme-css.js` - Builds the accent class stylesheet from the shared palette whenever the build runs (watcher or CI).

---
