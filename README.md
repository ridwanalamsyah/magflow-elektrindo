# PT. Magflow Elektrindo Persada — Company Profile Website

Website company profile single-file HTML dengan bilingual ID/EN.

## Stack
- Pure HTML/CSS/JS — tidak ada framework atau build step
- Deploy via Vercel (connect ke repo ini)
- Domain: magflow.co.id / magflowelektrindopersada.com

## Struktur
```
index.html                 # Website utama (single-file)
assets/
  og-cover.jpg             # OG image untuk link preview (1200×630px)
  company-profile-2026.pdf # Company profile untuk download
vercel.json                # Security headers & cache rules
```

## Deploy
1. Push ke GitHub
2. Import repo di vercel.com
3. Framework Preset: **Other** (bukan Next.js)
4. Root Directory: `/` (default)
5. Klik Deploy

## Update website
1. Edit `index.html`
2. `git add . && git commit -m "update: deskripsi perubahan"`
3. `git push`
4. Vercel otomatis redeploy dalam ~30 detik

## Custom domain
Di Vercel dashboard → Settings → Domains → tambah `magflow.co.id`
Lalu update DNS di registrar:
- A record: `76.76.21.21`
- CNAME www: `cname.vercel-dns.com`

## Checklist sebelum live
- [ ] Upload `assets/og-cover.jpg` (1200×630px)
- [ ] Upload `assets/company-profile-2026.pdf`
- [ ] Update href di tombol Download Company Profile
- [ ] Ganti Google Analytics ID (cari `G-XXXXXXXXXX` jika masih ada)
- [ ] Verifikasi domain di Vercel
