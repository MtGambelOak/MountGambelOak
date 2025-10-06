# Mount Gambel Oak Website

A small personal website hosted on GitHub Pages. Technically, also hosted on a home server using FastAPI for quick local
development, this is mostly just a relic of when I was planning to self host before I discovered how bad of an idea that is.

## Tech Stack
- Python 3.12 with FastAPI + Starlette for the HTTP layer
- Jinja2 templates for server-side rendering inside `app/templates`
- Vanilla JavaScript widgets for client customisation (theme picker, holiday footer, favicon rotation/cache busting)
- Plain CSS with custom properties for light/dark modes and accent colours

## Project Layout
```
app/
  main.py            # FastAPI application and static mount
  api.py             # Router returning the main page
  templates/         # Jinja templates (header, footer, index)
  static/            # CSS, JS, and images used by the templates
build.py              # Static export script that writes rendered templates to dist/
dist/                 # Generated static site (output of build.py)
```

## Application Flow
- `app/main.py` creates the FastAPI instance, mounts `/static`, and includes routes from `app/api.py`.
- `app/api.py` exposes `GET /` and renders `index.html`, passing the current year into the template context.
- `index.html` assembles the layout from shared `header.html` and `footer.html` partials and pulls in CSS/JS from the static directory.
- Client-side scripts handle user-facing enhancements:
  - `theme-widget.js` opens a theme dialog, persists mode/accent using `localStorage`, and toggles CSS classes on `<body>`.
  - `holiday.js` selects the appropriate seasonal emoji for the footer or falls back to a month-based default.
  - `favicon-version.js` appends a daily cache-busting query parameter to the favicon link so browsers pick up icon updates.

## Styling & Theming
- Base layout rules live in `static/css/base.css` and `static/css/layout.css`; accent palettes sit in `static/css/theme.css` so the theme widget can swap colours without repainting the entire stylesheet.
- `static/css/theme-widget.css` scopes the theme picker popup and button styling.
- `static/css/holiday.css` provides layout rules for the footer when the holiday widget is active.
- Dark/light mode and accent classes are toggled on `<body>` and cascade through the palette variables.

## Holiday Features
- Holiday and astronomical events are defined in JavaScript with helpers for fixed dates, nth-weekday calculations, and dynamic events like Easter.
- When the page loads, the script injects the matching emoji into `#holiday-footer-image`. If no special event is active, it chooses a month-themed fallback.
- Running `node app/static/js/icon-update.js` rewrites `app/static/images/favicon.svg` with the same emoji so bookmark favicons stay in sync with the footer. This is run via a scheduled github action (Midnight MDT), meaning the favicon does not depend on the client's timezone.


## Building the Static Site
- GitHub actions are used to build the site after each push. View .github/workflows for more

## Deployment Notes
- Due to originally planning on local hosting as discussed above, the website is dockerized on the home server, but this is mostly not necessary since it's in reality actually hosted on GitHub pages for the outside world.

## Contributing & Maintenance
- Keep template partials (`header.html`, `footer.html`) minimal; shared content should live there to avoid drift across pages.
- Add new static pages by creating a template and updating `build.py`’s `pages` list so it gets exported during the build step. Pull shared CSS/JS into the page with `{% include 'includes/head-assets.html' %}` in the `<head>` and `{% include 'includes/footer-scripts.html' %}` before `</body>` to keep imports consistent.
- If you tweak the colour palette, update the accent classes in `static/css/theme.css` and any matching button highlights in `theme-widget.js` (the script outlines the currently selected accent via inline styles).
