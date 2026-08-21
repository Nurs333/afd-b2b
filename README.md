# B2B Meeting Zone — Astana Finance Days 2026

Mobile-first static landing page for the AFD B2B Meeting Zone. The visual system follows the official Astana Finance Days direction: high-contrast editorial typography, bright blue-violet gradients, clean alternating sections, compact pill actions, circular brand motifs, and liquid glass reserved for interactive UI.

## Run locally

From this folder:

```bash
python3 -m http.server 8080
```

Open `http://localhost:8080`.

## Deploy

The project has no build step or runtime dependencies. Upload the folder as a static project to Vercel, Netlify, GitHub Pages, or another static host. On Vercel, use **Framework Preset: Other** and leave the build command empty.

## Project structure

- `index.html` — page structure, metadata, official AFD links, and translation hooks
- `css/styles.css` — original responsive layout and component foundations
- `css/afd-refresh.css` — AFD-inspired visual refresh, alternating section themes, menu, actions, and responsive overrides
- `js/app.js` — menu, language switching, store detection, sticky CTA, reveal motion, venue-map dialog, and interactive glass highlights
- `js/i18n.js` — Russian, Kazakh, and English content
- `assets/afd-logo-white.png` — transparent AFD logo used in the header, menu, and footer
- `assets/app-*.webp` — optimized screenshots for the three-step app walkthrough
- `assets/venue-map.webp` — route from КПП 7 to B2B Meeting Zone C3.4
- `assets/hero-networking.webp`, `assets/meeting-conversation.webp` — optimized event photography

## Content updates

- Edit all translations in `js/i18n.js`.
- Edit App Store and Google Play URLs in `js/app.js` and the matching links in `index.html`.
- Edit the official AFD website URL on elements marked `data-afd-link` in `index.html`.
- Replace files in `assets/` while preserving filenames to update visuals without changing markup.
- The `Блок C3.4` action in the hero scrolls to `#venue`.
- Clicking the venue plan opens an accessible enlarged map dialog.

## Verification

Run the structural and visual-system tests:

```bash
python3 -m unittest discover -s tests -v
```

Validate JavaScript syntax:

```bash
node --check js/app.js
node --check js/i18n.js
```
