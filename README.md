# PT. Magflow Elektrindo Persada — Official Website

[![Static Site](https://img.shields.io/badge/site-static-0B2D6B)](#architecture)
[![Deploy](https://img.shields.io/badge/deploy-Vercel-black)](#deployment)
[![Languages](https://img.shields.io/badge/language-ID%20%2F%20EN-red)](#content-and-features)

Website company profile resmi **PT. Magflow Elektrindo Persada** untuk layanan kelistrikan, Testing & Commissioning gardu induk, pemeliharaan sistem tenaga, dan instalasi Solar PV/PLTS.

Proyek ini sengaja dibuat sebagai **static website tanpa backend dan tanpa build step** agar cepat, mudah diaudit, murah dioperasikan, dan aman untuk company profile publik.

## Table of contents

- [Architecture](#architecture)
- [Content and features](#content-and-features)
- [Repository structure](#repository-structure)
- [Local preview](#local-preview)
- [Validation checklist](#validation-checklist)
- [Deployment](#deployment)
- [Content maintenance](#content-maintenance)
- [SEO, PWA, and metadata](#seo-pwa-and-metadata)
- [Security notes](#security-notes)
- [Contributing](#contributing)

## Architecture

| Area | Decision |
| --- | --- |
| Runtime | Static HTML/CSS/JS served by Vercel |
| Framework | None — pure browser-native HTML, CSS, and JavaScript |
| Build step | None |
| Backend/database | None |
| Styling | `assets/css/styles.css` |
| Client behavior | `assets/js/app.js` |
| Hosting | Vercel static deployment from GitHub |
| Language support | Indonesian/English via `data-i` translations and `setLang()` |

This architecture is appropriate for a professional company profile website. Add a backend only if the product later needs admin login, CRM lead storage, automated proposal PDFs, authenticated project dashboards, or server-side email delivery.

## Content and features

- Responsive corporate landing page with hero, services, projects, sectors, partners, contact, and footer sections.
- Bilingual ID/EN text switching.
- Solar PV / PLTS estimation calculator with system type, tariff, panel, PSH, efficiency, buffer, ROI, 10-year projection, and reset flow.
- WhatsApp consultation CTAs with language-aware messages.
- Downloadable company profile PDF.
- SEO metadata, Open Graph image, canonical/hreflang links, sitemap, robots file, and PWA manifest.
- Immutable caching for static assets via `vercel.json`.

## Repository structure

```text
.
├── index.html                         # Main HTML entrypoint and content
├── assets/
│   ├── css/styles.css                 # Site styles
│   ├── js/app.js                      # Site interactions and PLTS calculator
│   ├── docs/                          # Downloadable documents
│   │   └── company-profile-magflow-elektrindo-persada.pdf
│   ├── generated/                     # Extracted/generated image assets
│   ├── logo.png                       # Stable logo for manifest/schema
│   └── og-cover.jpg                   # 1200×630 social sharing image
├── docs/
│   ├── CONTENT_GUIDE.md               # Safe content editing guide
│   ├── DEPLOYMENT.md                  # Deployment and domain checklist
│   ├── VALIDATION.md                  # Manual and automated validation checklist
│   └── validate-assets.py             # Static asset/reference validation script
├── robots.txt                         # Search engine crawl rules
├── sitemap.xml                        # Canonical URL and hreflang sitemap
├── site.webmanifest                   # PWA/install metadata
├── vercel.json                        # Vercel headers and cache policy
├── .github/pull_request_template.md   # Pull request checklist
├── CHANGELOG.md                       # Change history
├── CONTRIBUTING.md                    # Contribution workflow
├── SECURITY.md                        # Security reporting and static-site notes
├── .editorconfig                      # Editor formatting defaults
└── .gitignore                         # Local/generated files excluded from Git
```

## Local preview

No package install is required.

```bash
python3 -m http.server 4173
```

Open:

```text
http://127.0.0.1:4173/
```

Why serve over HTTP instead of opening `index.html` directly? The site uses root-relative asset paths such as `/assets/js/app.js`, so a local HTTP server matches production behavior more closely.

## Validation checklist

Run these checks before merging changes:

```bash
node --check assets/js/app.js
python3 - <<'PY'
from html.parser import HTMLParser
from pathlib import Path
import json
HTMLParser().feed(Path('index.html').read_text())
json.loads(Path('site.webmanifest').read_text())
print('HTML and manifest parse OK')
PY
python3 docs/validate-assets.py
```

Manual smoke test:

1. Open the site locally or in a Vercel preview.
2. Confirm hero, navigation, services, calculator, projects, partners, contact, and footer render.
3. Switch ID → EN → ID and confirm text plus WhatsApp CTA messages update.
4. Test PLTS calculator:
   - Toggle On-Grid/Hybrid/Off-Grid.
   - Enter monthly bill and confirm kWh/day helper appears.
   - Click **Reset Kalkulator** and confirm defaults return.
5. Confirm Company Profile PDF opens/downloads from `/assets/docs/company-profile-magflow-elektrindo-persada.pdf`.
6. Confirm `robots.txt`, `sitemap.xml`, `site.webmanifest`, `/assets/logo.png`, and `/assets/og-cover.jpg` are reachable.

More detail: [`docs/VALIDATION.md`](docs/VALIDATION.md).

## Deployment

Vercel deploys automatically from GitHub.

Recommended Vercel settings:

| Setting | Value |
| --- | --- |
| Framework Preset | Other |
| Build Command | Empty / None |
| Output Directory | Empty / repository root |
| Install Command | Empty / None |
| Root Directory | `/` |

Production domains referenced by SEO metadata:

- `https://www.magflowelektrindopersada.com/`
- Optional business domain: `magflow.co.id` if configured in Vercel/DNS.

More detail: [`docs/DEPLOYMENT.md`](docs/DEPLOYMENT.md).

## Content maintenance

Most business copy lives in `index.html`; translatable UI strings live in `assets/js/app.js` inside the `T` dictionary.

Use [`docs/CONTENT_GUIDE.md`](docs/CONTENT_GUIDE.md) before editing:

- company profile PDF path
- project/partner images
- WhatsApp CTA messages
- PLTS calculator defaults
- SEO title/description/Open Graph data
- sitemap and canonical URLs

## SEO, PWA, and metadata

Current metadata files/assets:

- `robots.txt`
- `sitemap.xml`
- `site.webmanifest`
- `/assets/logo.png`
- `/assets/og-cover.jpg`
- schema.org `LocalBusiness` JSON-LD in `index.html`
- canonical and hreflang tags in `index.html`

If the production domain changes, update all canonical, hreflang, sitemap, Open Graph, Twitter card, and JSON-LD URLs together.

## Security notes

- Do not commit `.env`, API keys, credentials, private client data, or Vercel tokens.
- This repo is public-facing static content only; there is no server-side secret storage.
- External links that open in a new tab should use `rel="noopener noreferrer"`.
- Security headers are managed in `vercel.json`.

See [`SECURITY.md`](SECURITY.md).

## Contributing

Use focused pull requests, validate before merging, and keep changes consistent with the static no-build architecture.

See [`CONTRIBUTING.md`](CONTRIBUTING.md).
