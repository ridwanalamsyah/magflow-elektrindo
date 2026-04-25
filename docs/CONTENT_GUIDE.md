# Content Guide

This guide explains where to update common website content safely.

## Company and service copy

Most visible HTML copy is in `index.html`.

Important sections:

- `#hero` — headline and primary CTA
- `#tentang` — company overview
- `#layanan` — services
- `#kalkulator-plts` — PLTS calculator UI
- `#proyek` — project portfolio
- `#pasar` — market sectors
- `#contact-sec` — contact and company profile CTA

## Bilingual text

The site uses the `T` translation dictionary in `assets/js/app.js`.

When changing user-facing text:

1. Update the Indonesian string under `id`.
2. Update the matching English string under `en`.
3. Confirm the HTML element uses the correct `data-i` key.
4. Test ID → EN → ID language switching in the browser.

## WhatsApp messages

Language-aware WhatsApp text is managed in `assets/js/app.js` inside `setLang()`.

Current message keys:

- `wa1` — floating/top CTA
- `wa4` — PLTS calculator CTA
- `wa5` — contact section CTA

After editing, inspect the link URL and confirm the `text=` query parameter changes between ID and EN.

## PLTS calculator defaults

Calculator logic is in `assets/js/app.js`.

Common defaults:

| Field | Default |
| --- | --- |
| Daily consumption | `60` kWh/day |
| Location/PSH | `5.0` |
| PLN tariff | `1441` Rp/kWh |
| Panel size | `550` Wp |
| Efficiency | `85` % |
| Buffer | `25` % |
| Hybrid price | `15` juta/kWp |
| Escalation | `5` %/year |

If changing defaults, update:

- initial HTML values in `index.html`
- `resetKalkulator()` in `assets/js/app.js`
- README/docs if the default is documented

## Company Profile PDF

Current path:

```text
/assets/docs/company-profile-magflow-elektrindo-persada.pdf
```

When replacing the PDF:

1. Keep the same filename if possible to avoid changing links.
2. Verify the file opens locally and in Vercel preview/production.
3. Keep the PDF public-safe; do not include private pricing or confidential client documents unless approved.

## Images

- Stable SEO images:
  - `assets/logo.png`
  - `assets/og-cover.jpg`
- Extracted page images:
  - `assets/generated/`

When changing images:

1. Optimize file size before committing.
2. Update `src`, `alt`, `width`, and `height` where relevant.
3. Use descriptive alt text.
4. Validate all `/assets/...` references with `docs/validate-assets.py`.

## SEO fields to keep aligned

If the domain, company positioning, or primary services change, update together:

- `<title>` in `index.html`
- meta description and keywords
- canonical URL
- hreflang URLs
- Open Graph tags
- Twitter card tags
- schema.org JSON-LD
- `sitemap.xml`
- `robots.txt`
- `site.webmanifest`
