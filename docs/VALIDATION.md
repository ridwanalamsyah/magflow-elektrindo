# Validation Guide

Use this checklist before merging changes.

## Automated checks

Run from the repository root:

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

## Local browser smoke test

Serve the site locally:

```bash
python3 -m http.server 4173
```

Open:

```text
http://127.0.0.1:4173/
```

Verify:

- hero loads with background image and logo
- navigation anchors scroll to the right sections
- services, projects, partner logos, contact, and footer render
- no obvious missing images or broken layout
- browser console has no runtime errors

## Language switching

1. Click **EN**.
2. Confirm hero becomes `ELECTRICAL ENGINEERING / & SOLAR ENERGY / SOLUTIONS`.
3. Confirm navigation includes `About`, `Services`, `Projects`, `Sectors`, `Contact`.
4. Confirm WhatsApp `text=` query becomes English.
5. Click **ID**.
6. Confirm Indonesian text returns.

## Mobile navigation

1. Resize viewport to a narrow mobile width, for example `390px`.
2. Confirm hamburger menu is visible.
3. Click hamburger.
4. Confirm mobile menu opens with nav labels.
5. Click close.
6. Confirm menu closes.

## PLTS calculator

Recommended smoke case:

1. Go to `/#kalkulator-plts`.
2. Click **On-Grid**.
3. Confirm `Harga/kWp` becomes `11`.
4. Enter monthly bill `3000000`.
5. Confirm `kWh/hari` becomes approximately `69.4` using tariff `1441`.
6. Confirm helper note says the PLN bill estimate is rough and may include non-energy charges.
7. Confirm capacity, panel count, investment, savings, ROI, and projection outputs update.
8. Click **Reset Kalkulator**.
9. Confirm defaults return:
   - `plts_kwh=60`
   - `plts_tagihan` empty
   - `plts_lokasi=5.0`
   - `plts_tarif=1441`
   - `plts_tarif_helper=1441`
   - `plts_wp=550`
   - `plts_eff=85`
   - `plts_buffer=25`
   - `plts_hargakwp=15`
   - `plts_eskalasi=5`

## Download and metadata paths

Confirm these paths return HTTP 200 locally and in deployment:

- `/assets/docs/company-profile-magflow-elektrindo-persada.pdf`
- `/robots.txt`
- `/sitemap.xml`
- `/site.webmanifest`
- `/assets/logo.png`
- `/assets/og-cover.jpg`

## PR evidence

For visual/UI changes, attach at least one of:

- screenshots of before/after state
- screen recording of primary flow
- Vercel preview link

If Vercel preview is protected by HTTP 401, say so clearly and include local validation evidence.
