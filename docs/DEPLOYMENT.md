# Deployment Guide

The website is a static site designed for Vercel.

## Vercel project settings

| Setting | Recommended value |
| --- | --- |
| Framework Preset | Other |
| Root Directory | `/` |
| Install Command | Empty / None |
| Build Command | Empty / None |
| Output Directory | Empty / repository root |

No Node install or build step is required.

## Deployment flow

1. Push changes to GitHub.
2. Open a pull request.
3. Vercel creates a preview deployment.
4. Validate the preview.
5. Merge to `main`.
6. Vercel deploys production automatically.

## Preview protection

Some Vercel accounts protect preview deployments with SSO/login. If reviewers or automation need direct preview access, configure one of these:

- disable preview protection for this public company profile project
- use Vercel's approved bypass mechanism
- provide reviewers access to the Vercel team/project

If preview is protected, reviewers can still validate the branch locally with:

```bash
python3 -m http.server 4173
```

## Production domain checklist

Current canonical production domain in metadata:

```text
https://www.magflowelektrindopersada.com/
```

If adding a custom domain in Vercel:

1. Vercel Dashboard → Project → Settings → Domains.
2. Add the apex/root domain and `www` domain as needed.
3. Configure DNS at the registrar.
4. Wait for SSL certificate provisioning.
5. Verify canonical, hreflang, Open Graph, JSON-LD, sitemap, and robots URLs.

Common Vercel DNS values:

- Apex A record: `76.76.21.21`
- `www` CNAME: `cname.vercel-dns.com`

Always confirm current values in Vercel because platform recommendations may change.

## Cache policy

Configured in `vercel.json`:

- `/assets/(.*)` → immutable one-year cache
- `/index.html` → revalidate immediately
- global security headers → frame/content/referrer/permissions policies

Because generated media assets are cached aggressively, update filenames when replacing images or documents that must refresh immediately. Stable CSS and JavaScript files under `assets/css/` and `assets/js/` are configured to revalidate so returning visitors receive code updates. Stable SEO files such as `assets/logo.png` and `assets/og-cover.jpg` may require cache invalidation or a filename/version update if changed.
