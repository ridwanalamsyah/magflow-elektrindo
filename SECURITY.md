# Security Policy

## Supported scope

This repository contains a static public website for PT. Magflow Elektrindo Persada.

There is currently:

- no backend application
- no database
- no authentication system
- no server-side secret storage
- no package manager dependency tree

## Reporting security issues

If you find a security issue, please contact the repository owner privately instead of opening a public issue that exposes details.

Include:

- affected file or URL
- steps to reproduce
- expected impact
- suggested fix, if known

## Static-site security rules

- Never commit credentials, API keys, `.env` files, private client documents, or Vercel tokens.
- Keep downloadable files intentional and public-safe.
- External links opened with `target="_blank"` should include `rel="noopener noreferrer"`.
- Keep `vercel.json` security headers enabled.
- Avoid adding third-party scripts unless business value and privacy impact are clear.
- If analytics is added, document provider, purpose, and data collected.

## Deployment protection

Preview deployments may be protected by Vercel depending on account settings. If a reviewer needs public access, configure Vercel preview protection or provide an approved bypass mechanism.
