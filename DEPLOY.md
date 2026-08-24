# aMenuVerse — CyberPanel VPS Deployment Guide

> Run all commands as **root** or with `sudo` on your VPS.
> Replace `menuverse.com` with your actual domain throughout.

---

## Architecture Overview

```text
Internet
   │
   ▼
[Cloudflare DNS]  *.menuverse.com  →  VPS IP
   │
   ▼
[CyberPanel / OpenLiteSpeed :443]  (wildcard SSL)
   │
   ▼
[Node.js / Nitro Server :3000]  ←  PM2 cluster
   │
   ├── MySQL  (CyberPanel managed, localhost:3306)
   └── Redis  (localhost:6379)
```

### URL Routing

```text
burgercraft.menuverse.com  →  OLS  →  Node :3000
                                          │
                                     getSubdomain()
                                     returns "burgercraft"
                                          │
                                     Restaurant Menu View
```

---

## Step 1 — Install Node.js 20 & PM2

```bash
curl -fsSL https://deb.nodesource.com/setup_20.x | bash -
apt install -y nodejs git
node -v   # v20.x.x
npm install -g pm2
```

---

## Step 2 — Upload Project to VPS

### Option A — Git

```bash
cd /home/menuverse.com/public_html
git clone https://github.com/your-username/aMenuVerse.git .
```

### Option B — Manual (CyberPanel File Manager)

Zip the project (exclude `node_modules` and `.output`), upload and extract via CyberPanel File Manager.

---

## Step 3 — Configure Environment Variables

```bash
cd /home/menuverse.com/public_html
cp .env.docker .env
nano .env
```

Fill in your production values:

```env
# ImgBB
VITE_IMGBB_API_KEY=61035b18442b2c9815d6945f6f7bccd2

# MySQL — use CyberPanel DB credentials
MYSQL_HOST=localhost
MYSQL_PORT=3306
MYSQL_USER=amenuverse_user
MYSQL_PASSWORD=YOUR_STRONG_DB_PASSWORD
MYSQL_DATABASE=amenuverse

# Redis
REDIS_URL=redis://localhost:6379

# JWT — generate a strong 64-char random secret
JWT_SECRET=REPLACE_WITH_STRONG_SECRET
VITE_JWT_SECRET=REPLACE_WITH_STRONG_SECRET
```

Generate a strong JWT secret:

```bash
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
```

---

## Step 4a — Create MySQL Database (CyberPanel)

1. CyberPanel → **Databases → Create Database**
   - Database: `amenuverse`
   - User: `amenuverse_user`
   - Password: `YOUR_STRONG_DB_PASSWORD`

2. Run DB init scripts:

```bash
node create-db.js
node create-users-db.js
node create-branches-db.js
```

---

## Step 4b — Install Redis

```bash
apt install -y redis-server
systemctl enable redis-server
systemctl start redis-server
redis-cli ping   # should reply: PONG
```

---

## Step 5 — Build & Start App

```bash
cd /home/menuverse.com/public_html
npm ci
npm run build
pm2 start ecosystem.config.cjs
pm2 save
pm2 startup   # run the printed command to enable auto-start on reboot
```

Verify:

```bash
pm2 list
pm2 logs amenuverse --lines 50
curl -I http://localhost:3000
```

---

## Step 6 — CyberPanel: Create Website

CyberPanel → **Websites → Create Website**

- Domain: `menuverse.com`
- PHP: any (won't be used)
- SSL: ✅ enable

---

## Step 7 — OpenLiteSpeed Reverse Proxy

### 7a. Add External App

CyberPanel → **Websites → menuverse.com → Open LiteSpeed Config → External Apps → Add**

```text
Type:            Web Server
Name:            nodejs_app
Address:         127.0.0.1:3000
Max Connections: 100
```

### 7b. Proxy All Traffic

CyberPanel → **Websites → menuverse.com → Rewrite Rules**

```apache
RewriteEngine On
RewriteRule ^(.*)$ http://127.0.0.1:3000/$1 [P,L]
```

---

## Step 8 — Wildcard Subdomain

### 8a. DNS Records (Cloudflare / your provider)

| Type | Name | Value         |
| ---- | ---- | ------------- |
| A    | `@`  | `YOUR_VPS_IP` |
| A    | `*`  | `YOUR_VPS_IP` |

The `*` wildcard means `burgercraft.menuverse.com`, `saffron.menuverse.com` etc. all point to your VPS.

### 8b. CyberPanel Child Website

CyberPanel → **Websites → Create Child Website**

- Domain: `*.menuverse.com`
- Parent: `menuverse.com`

Apply the same reverse proxy rewrite rules from Step 7b.

---

## Step 9 — Wildcard SSL (Let's Encrypt)

> Wildcard SSL requires a **DNS API challenge** — HTTP challenge does not work for `*.domain.com`.
> Cloudflare is the easiest provider for this.

1. Cloudflare Dashboard → Profile → **API Tokens → Create Token** → "Edit zone DNS"
2. CyberPanel → **SSL → Manage SSL → Issue Wildcard SSL**
   - Domain: `menuverse.com`
   - Method: **DNS API (Cloudflare)**
   - Paste your API token

This issues SSL for both `menuverse.com` **and** `*.menuverse.com`. ✅

---

## Step 10 — Verify

```bash
# Check process
pm2 list

# Live logs
pm2 logs amenuverse --lines 100

# Test locally
curl -I http://localhost:3000
```

Open in browser:

- `https://menuverse.com` → Landing page ✅
- `https://burgercraft.menuverse.com` → Restaurant menu ✅

---

## Update / Redeploy Workflow

```bash
cd /home/menuverse.com/public_html
git pull origin main
npm ci
npm run build
pm2 restart amenuverse
```

---

## Troubleshooting

| Problem                | Fix                                                           |
| ---------------------- | ------------------------------------------------------------- |
| MySQL connection error | Check `.env` credentials; run `node create-db.js`             |
| Subdomain shows 404    | Verify DNS wildcard A record + CyberPanel child website       |
| SSL error on subdomain | Re-issue wildcard SSL in CyberPanel SSL panel                 |
| `.output` missing      | Run `npm run build` again                                     |
| Port 3000 in use       | `pm2 delete amenuverse` then `pm2 start ecosystem.config.cjs` |
| App crashes on startup | `pm2 logs amenuverse` — check for `.env` missing keys         |
