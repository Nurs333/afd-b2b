# B2B Meeting Zone — Astana Finance Days 2026

Mobile-first static landing page for the AFD B2B Meeting Zone. The page preserves the original B2B content and interaction flow while using a visual system designed to feel like a direct continuation of the official Astana Finance Days website: a shrinking pill-based header, a photo-led opening screen, cream navigation surfaces, deep AFD purple, pale lavender sections, editorial typography, an automatic event-photo carousel, and restrained liquid-glass effects.

## Run locally

From this folder:

```bash
python3 -m http.server 8080
```

Open `http://localhost:8080`.

## Deploy

The project has no build step or runtime dependencies. Upload the repository as a static project to Vercel, Netlify, GitHub Pages, or another static host. On Vercel, use **Framework Preset: Other** and leave the build command empty.

## Project structure

- `index.html` — page structure, metadata, official AFD links, semantic sections, and translation hooks
- `css/styles.css` — responsive layout and component foundations
- `css/afd-refresh.css` — AFD-continuation visual layer, animated header, section themes, navigation, and responsive overrides
- `js/app.js` — header scroll state, navigation, language switching, store detection, autoplay photo carousel, sticky CTA, reveal motion, map dialog, and interactive glass highlights
- `js/i18n.js` — Russian, Kazakh, and English content
- `assets/afd-logo-white.png` — white AFD mark shown over the hero at the top of the page
- `assets/afd-logo-color.png` — official-colour AFD mark shown inside the compact cream pill after scrolling
- `assets/afd-b2b-*.webp` — optimized B2B Meeting Zone photography supplied for the event
- `assets/app-*.webp` — optimized screenshots for the three-step app walkthrough
- `assets/venue-map.webp` — route from КПП 7 to B2B Meeting Zone C3.4

## Content updates

- Edit all translations in `js/i18n.js`.
- Edit App Store and Google Play URLs in `js/app.js` and the matching links in `index.html`.
- Edit the official AFD website URL on the `.afd-brand`, `data-afd-link`, and footer links in `index.html`.
- Replace files in `assets/` while preserving filenames to update visuals without changing markup.
- The event-photo carousel advances automatically, pauses during interaction, supports arrows, dots and swipe gestures, and respects reduced-motion preferences.
- Clicking the venue plan opens an accessible enlarged map dialog.
- The footer uses the official AFD contact addresses: `afd@aifc.kz` and `partnership@aifc.kz`.

## Verification

Validate JavaScript syntax:

```bash
node --check js/app.js
node --check js/i18n.js
```
