# Changelog

All notable changes to this static website are documented here.

## Unreleased

- Professionalized repository documentation: README, contribution guide, security policy, deployment guide, content guide, and validation guide.
- Added static asset validation script for extracted `/assets/...` references and image alt text.
- Added repository hygiene files: `.editorconfig`, expanded `.gitignore`, and pull request template.

## 2026-04 — Static asset and SEO restructure

- Split the previous large inline HTML bundle into `index.html`, `assets/css/styles.css`, `assets/js/app.js`, and real image/PDF assets.
- Added `robots.txt`, `site.webmanifest`, stable `assets/logo.png`, and `assets/og-cover.jpg`.
- Moved the downloadable company profile PDF to `assets/docs/company-profile-magflow-elektrindo-persada.pdf`.
- Added Vercel cache and security headers.

## 2026-04 — Solar PV calculator refactor

- Consolidated duplicated calculator JavaScript.
- Added `resetKalkulator()`.
- Improved PLTS sizing, financial projections, validation, helper notes, ROI display, and reset behavior.
