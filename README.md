# My Blog

Blog pribadi dengan Next.js 15, Decap CMS, dan deploy ke Cloudflare Pages.

## Tech Stack

- **Framework**: Next.js 15 (Static Export)
- **CMS**: Decap CMS (nulis artikel dari browser)
- **Hosting**: Cloudflare Pages
- **Source**: GitHub

---

## Cara Setup (Step by Step)

### 1. Clone & Install

```bash
git clone https://github.com/YOUR_USERNAME/YOUR_REPO_NAME
cd YOUR_REPO_NAME
npm install
npm run dev
```

Buka http://localhost:3000 — blog lo udah jalan.

---

### 2. Deploy ke Cloudflare Pages

1. Push repo ke GitHub
2. Buka [Cloudflare Pages](https://pages.cloudflare.com/)
3. **Create a project** → Connect to Git → Pilih repo lo
4. Build settings:
   - **Framework preset**: Next.js (Static HTML Export)
   - **Build command**: `npm run build`
   - **Build output directory**: `out`
5. Deploy → tunggu ~2 menit → live!

---

### 3. Setup Decap CMS (buat nulis dari browser)

Decap CMS butuh OAuth buat login via GitHub. Ada 2 cara:

#### Opsi A — Local Dev (gratis, instant)

Buat nulis di laptop lo sendiri tanpa setup OAuth:

```bash
# Terminal 1: jalanin blog
npm run dev

# Terminal 2: jalanin CMS proxy
npx decap-server
```

Di `public/admin/config.yml`, uncomment baris ini:
```yaml
local_backend: true
```

Buka http://localhost:3000/admin — langsung bisa nulis!

> ⚠️ Jangan commit `local_backend: true` ke production. Ini cuma buat local.

---

#### Opsi B — Production CMS (nulis dari mana aja)

Butuh OAuth Worker biar CMS bisa login via GitHub saat live di Cloudflare Pages.

**Step 1: Buat GitHub OAuth App**

1. Buka https://github.com/settings/developers → **OAuth Apps** → **New OAuth App**
2. Isi:
   - Application name: `My Blog CMS`
   - Homepage URL: `https://YOUR_BLOG.pages.dev`
   - Authorization callback URL: `https://YOUR_OAUTH_WORKER.workers.dev/callback`
3. Catat **Client ID** dan **Client Secret**

**Step 2: Deploy OAuth Worker**

Pakai [sveltia-cms-auth](https://github.com/nickvdyck/sveltia-cms-auth) — Cloudflare Worker gratis:

```bash
npm install -g wrangler
git clone https://github.com/nickvdyck/sveltia-cms-auth
cd sveltia-cms-auth
npm install

# Set secrets
wrangler secret put GITHUB_CLIENT_ID
wrangler secret put GITHUB_CLIENT_SECRET

# Deploy
wrangler deploy
```

Worker lo akan live di: `https://sveltia-cms-auth.YOUR_SUBDOMAIN.workers.dev`

**Step 3: Update config.yml**

```yaml
backend:
  name: github
  repo: YOUR_USERNAME/YOUR_REPO_NAME
  branch: main
  base_url: https://sveltia-cms-auth.YOUR_SUBDOMAIN.workers.dev
```

**Step 4: Done!**

Buka `https://YOUR_BLOG.pages.dev/admin` → Login with GitHub → Nulis artikel!

---

## Cara Nulis Artikel

### Via CMS (recommended)

1. Buka `/admin` di blog lo
2. Klik **New Artikel**
3. Isi judul, tanggal, deskripsi, tags, dan konten
4. Klik **Publish**
5. CMS otomatis commit ke GitHub → Cloudflare Pages auto-deploy → **live dalam ~1-2 menit**

### Via VSCode/Terminal

1. Buat file baru di `content/posts/nama-artikel.md`
2. Isi frontmatter:

```markdown
---
title: "Judul Artikel Lo"
date: "2026-04-02"
description: "Deskripsi singkat artikel"
tags: ["tag1", "tag2"]
---

Isi artikel lo di sini...
```

3. `git add . && git commit -m "new post: judul artikel" && git push`
4. Cloudflare Pages auto-deploy → live!

---

## Kustomisasi

### Ganti nama blog
Edit `src/app/layout.tsx` → ubah `"My Blog"` dan metadata.

### Ganti tagline homepage
Edit `src/app/page.tsx` → ubah teks hero.

### Ganti warna / font
Edit `src/app/globals.css` → CSS variables di bagian `:root`.

---

## Struktur Project

```
├── content/
│   └── posts/          ← File artikel (.md) ada di sini
├── public/
│   └── admin/          ← Decap CMS
│       ├── index.html
│       └── config.yml  ← Konfigurasi CMS (ganti repo & oauth URL)
├── src/
│   ├── app/
│   │   ├── blog/[slug]/page.tsx   ← Halaman artikel
│   │   ├── layout.tsx             ← Layout global + header
│   │   ├── page.tsx               ← Homepage (list artikel)
│   │   └── globals.css            ← Semua styling
│   └── lib/
│       ├── posts.ts    ← Utility baca file .md
│       └── markdown.ts ← Convert markdown ke HTML
└── next.config.ts      ← Static export config
```
