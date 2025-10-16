# Mount Gambel Oak

A personal website. The project renders a static bundle with Jinja templates and markdown-driven blog content, then publishes the bundle to GitHub Pages. The site is tested locally before pushing to GitHub Pages, where workflows automate its build and deployment live at https://mountgambeloak.dev.

The goal of this website is to document its layout and workflows for its owner, NOT to document a method by which other random people can pull and contribute to the website. There are some local development workflows that are briefly outlined below, but are already set up and working.

---

## Overview
- `python build.py` compiles templates in `app/templates/` and markdown posts in `app/blog/posts/` into the static `dist/` directory.
- Static assets (CSS, JS, images, resume PDF, favicon) live under `app/static/`; the build copies them verbatim.
- Local preview uses the same static build served out of `dist/`; a local helper script (ignored from git) runs the rebuild watcher plus static server during development.
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
1. `build.py` clears `dist/`, copies everything from `app/static/`, and renders page templates to HTML.
2. Blog metadata lives in `app/blog/blog_posts.json`, referencing markdown files in `app/blog/posts/`.
3. During the build, markdown posts are converted to HTML, headings are harvested for anchor links, and reading-time estimates are calculated.
4. Output pages land in `dist/` (e.g., `dist/index.html`, `dist/blog/<slug>/index.html`).

---

## Repository layout

```text
.
├── app/
│   ├── blog/
│   │   ├── blog_posts.json    # Blog metadata (slug, tags, markdown path, etc.)
│   │   └── posts/             # Markdown sources for each blog entry
│   ├── static/                # CSS, JS, images, resume PDF, favicon script
│   └── templates/             # Jinja templates and includes
├── build.py                   # Static site builder
├── dist/                      # Build output (target for GitHub Pages)
├── requirements.txt           # Python dependencies for the build
└── .github/workflows/         # CI that rebuilds and deploys to GitHub Pages
```

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

### Add or update pages
1. Create or edit a template in `app/templates/` (shared fragments live in `app/templates/includes/`).
2. Register new output paths in the `pages` list inside `build.py` if the template should render to `dist/`.
3. Add page-specific CSS/JS under `app/static/` and reference it from the template (usually via `includes/head-assets.html` or `includes/footer-scripts.html`).

### Publish a new blog post
1. Draft the post in markdown under `app/blog/posts/<slug>.md`.
2. Add an entry to `app/blog/blog_posts.json` with `slug`, `title`, `date`, `summary`, `content`, `tags`, and optional `updated`.
3. Run `python build.py` to regenerate metadata and HTML.
4. Confirm the post appears at `/blog/<slug>/` and in the blog index card grid.

### Manage tags
- Tags are free-form strings in the blog JSON. The build aggregates them to populate filters on `/blog`.
- To retire a tag, remove it from every post and rebuild.

### Tweak themes and colors
1. Color definitions live in `app/static/js/theme-config.js`.
2. Holiday accent mappings are in `app/static/js/holiday-shared.js`.
3. Update component/page styles in `app/static/css/` to take advantage of new accents.
4. `app/static/js/theme-init.js` applies the chosen accent/mode at runtime; adjust it if additional logic is needed.

### Holiday & seasonal flourishes
- `HolidaySchedule` (in `holiday-shared.js`) drives emoji, accent, and trivia schedules. Extend `HOLIDAY_RANGES` or `HOLIDAY_FACTS` to add celebrations.
- `icon-update.js` regenerates the favicon and writes `app/static/data/holiday-details.json`, which `build.py` uses to render the footer emoji, trivia snippet, and default accent statically.
- `build.py` stamps favicon links with a daily version derived from `holiday-details.json` so browsers refresh the emoji without extra scripts.
- `scripts/generate-theme-css.js` emits `static/css/generated/theme-accents.css` so accent classes stay in sync with the theme palette.
- The GitHub Action runs nightly to refresh those generated artifacts automatically; run the script locally to stay in sync during development.

---

## Deployment
- Commits to `main` trigger the “Build and Deploy” GitHub Actions workflow.
- The job refreshes the favicon, installs Python dependencies, runs `python build.py`, and publishes `dist/` via `actions/deploy-pages`.
- A scheduled run (`cron: 0 7 * * *`) keeps the public favicon in sync with the current holiday without manual intervention.
- Rebuild `dist/` before committing to ensure GitHub Pages serves the latest HTML.

---

## Support scripts & notes
- `build.py` is the single source of truth for derived blog metadata. Keep it updated if you introduce new fields shared between the blog index and individual posts.
- `scripts/generate-theme-css.js` - Builds the accent class stylesheet from the shared palette during `python build.py`.

---
