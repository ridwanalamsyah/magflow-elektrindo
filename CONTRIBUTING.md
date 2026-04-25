# Contributing Guide

Thank you for helping maintain the PT. Magflow Elektrindo Persada website.

## Project principles

- Keep the site static unless a real backend requirement exists.
- Prefer small, reviewable pull requests.
- Preserve bilingual ID/EN behavior.
- Preserve SEO URLs and metadata unless intentionally changing domains.
- Do not commit secrets, private client data, or generated local artifacts.

## Branch and commit workflow

1. Create a branch from `main`.
2. Make focused changes.
3. Run validation checks from `README.md` and `docs/VALIDATION.md`.
4. Commit with a clear message, for example:
   - `docs: improve repository documentation`
   - `fix: update company profile link`
   - `refactor: simplify calculator validation`
5. Open a pull request and include:
   - summary of changes
   - screenshots or recording for UI changes
   - validation performed
   - any known limitations

## Editing guidelines

### HTML

- Keep element IDs used by JavaScript stable.
- Avoid inline base64 images or PDFs.
- Use semantic alt text for images.
- Keep canonical/hreflang/Open Graph metadata aligned with production domain.

### CSS

- Put site styles in `assets/css/styles.css`.
- Keep responsive behavior tested on mobile and desktop widths.
- Prefer existing CSS variables and visual patterns before adding new ones.

### JavaScript

- Put site behavior in `assets/js/app.js`.
- Preserve global functions called from HTML attributes, such as `setLang`, `openMM`, `resetKalkulator`, and calculator handlers.
- Validate calculator changes with realistic values and reset behavior.
- Avoid external dependencies unless there is a strong reason.

### Assets

- Store downloadable documents under `assets/docs/`.
- Store optimized images under `assets/generated/` or stable top-level asset names such as `assets/logo.png` and `assets/og-cover.jpg`.
- Avoid changing hashed/generated asset filenames unless references are updated.

## Required validation

Run:

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

For UI changes, also run a browser smoke test using `python3 -m http.server 4173` and open `http://127.0.0.1:4173/`.
