# Personal site

Next.js + React, run with bun.

```sh
bun install
bun dev        # http://localhost:3000
bun run build
```

## Docker

Locally:

```sh
docker build -t portfolio-dither .
docker run -p 3000:3000 portfolio-dither   # http://localhost:3000
```

On Dokploy it deploys as a Compose service from `compose.yml`. In its Domains tab, attach the domain to service `web`, port 3000, with HTTPS and Let's Encrypt.

The image builds Next's standalone server with bun and runs it with bun on port 3000 (set `PORT` to change it).

## Editing content

- `src/data/site.json`: your name, the about paragraphs on the home page, and social links.
- `src/data/projects.json`: the projects list. They show in the order they appear in the file.

Each project:

```json
{
  "name": "Bayer",
  "description": "One or two sentences.",
  "status": "any text, or \"\" to hide",
  "platforms": ["iOS", "macOS"],
  "icon": "/icons/bayer.avif",
  "iconDark": "/icons/bayer-dark.avif",
  "links": [
    { "label": "GitHub", "url": "https://github.com/..." },
    { "label": "App Store", "url": "https://apps.apple.com/..." }
  ]
}
```

Icons live in `public/icons/`. Leave `icon` empty to show the first letter instead; `iconDark` is optional.

To export an icon from an Icon Composer `.icon` file (light + dark 128px AVIFs, about 3 KB each):

```sh
scripts/export-icon.sh ~/Documents/Xcode_App_Library/Bayer/Bayer/Special/Bayer.icon bayer
```

## Look

- Colours are Bayer's Newsprint palette: paper-first in light mode, ink-first in dark mode (`src/app/globals.css`).
- The dithered band at the top is a WebGL port of Bayer's wave field (`src/components/DitherField.tsx`).
- Titles use Bayer's 5×7 font (`font-pixel`); use sizes in multiples of 10px so cells land on whole pixels. Everything else is Geist Mono.

To rebuild the font after changing glyphs in Bayer's `PixelFont.swift`:

```sh
bun scripts/build-pixel-font.ts
```
